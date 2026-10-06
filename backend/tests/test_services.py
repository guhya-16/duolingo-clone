from datetime import date, datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.clock import utcnow
from app.database import Base, get_db
from app.main import app
from app.models import Course, Exercise, ExerciseType, Lesson, Skill, Unit, User, UserSkillProgress
from app.seed import seed_database
from app.services.hearts_service import HeartsService
from app.services.lesson_service import LessonService
from app.services.path_service import PathService
from app.services.streak_service import StreakService


@pytest.fixture
def test_db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    seed_database(target_engine=engine, target_session_factory=TestingSessionLocal, reset=True)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    session = TestingSessionLocal()
    yield session
    session.close()
    app.dependency_overrides.clear()


def test_streak_service_logic():
    user = User(username="streak_tester", streak=3, last_active_date=date(2026, 10, 5))

    # 1. Same day practice: no change
    s1 = StreakService.update_streak(user, date(2026, 10, 5))
    assert s1 == 3
    assert user.streak == 3

    # 2. Consecutive day (yesterday was active): +1
    s2 = StreakService.update_streak(user, date(2026, 10, 6))
    assert s2 == 4
    assert user.streak == 4

    # 3. Gap day (missed 2026-10-07, practiced on 2026-10-08): reset to 1
    s3 = StreakService.update_streak(user, date(2026, 10, 8))
    assert s3 == 1
    assert user.streak == 1


def test_hearts_fake_clock_rules(test_db_session):
    """Tests fake-clock hearts scenarios (a), (b), and (c)."""
    service = HeartsService(test_db_session)
    user = test_db_session.scalar(select(User).where(User.username == "learner"))
    t0 = datetime(2026, 10, 7, 12, 0, 0)

    # (c) Full hearts (5/5) then loss starts the timer at now
    user.hearts = 5
    user.hearts_updated_at = t0 - timedelta(hours=20)
    test_db_session.commit()

    service.lose_heart(user, now=t0)
    assert user.hearts == 4
    assert user.hearts_updated_at == t0
    h, _, secs_left = service.get_current_hearts(user, now=t0)
    assert h == 4
    assert secs_left == 4 * 3600

    # (a) Lose a heart at 3/5 does NOT reset the countdown
    user.hearts = 3
    user.hearts_updated_at = t0
    test_db_session.commit()

    # 2 hours later, lose a heart
    t_plus_2h = t0 + timedelta(hours=2)
    service.lose_heart(user, now=t_plus_2h)
    assert user.hearts == 2
    # Timer was NOT reset to t_plus_2h; it remains t0
    assert user.hearts_updated_at == t0
    _, _, secs_left = service.get_current_hearts(user, now=t_plus_2h)
    # 4h - 2h = 2h left (7200s)
    assert secs_left == 2 * 3600

    # (b) 5h elapsed gives +1 heart and 1h of progress is kept (3h until next heart)
    user.hearts = 3
    user.hearts_updated_at = t0
    test_db_session.commit()

    t_plus_5h = t0 + timedelta(hours=5)
    h, _, secs_left = service.get_current_hearts(user, now=t_plus_5h)
    assert h == 4
    # Progress of 1h kept: 4h - 1h = 3h left (10800s)
    assert secs_left == 3 * 3600
    assert user.hearts_updated_at == t0 + timedelta(hours=4)


def test_answer_checking_all_five_types(test_db_session):
    user = test_db_session.scalar(select(User).where(User.username == "learner"))
    service = LessonService(test_db_session)

    # 1. Multiple choice
    mc_ex = test_db_session.query(Exercise).filter(Exercise.type == ExerciseType.MULTIPLE_CHOICE).first()
    correct_idx = mc_ex.payload["correct_index"]
    res_mc = service.check_answer(user, mc_ex.lesson_id, mc_ex.id, correct_idx)
    assert res_mc.correct is True

    # 2. Translate word bank
    wb_ex = test_db_session.query(Exercise).filter(Exercise.type == ExerciseType.TRANSLATE_WORD_BANK).first()
    correct_words = wb_ex.payload["correct_answer"]
    res_wb = service.check_answer(user, wb_ex.lesson_id, wb_ex.id, correct_words)
    assert res_wb.correct is True

    # 3. Match pairs
    mp_ex = test_db_session.query(Exercise).filter(Exercise.type == ExerciseType.MATCH_PAIRS).first()
    res_mp = service.check_answer(user, mp_ex.lesson_id, mp_ex.id, mp_ex.payload["pairs"])
    assert res_mp.correct is True

    # 4. Fill blank
    fb_ex = test_db_session.query(Exercise).filter(Exercise.type == ExerciseType.FILL_BLANK).first()
    res_fb = service.check_answer(user, fb_ex.lesson_id, fb_ex.id, fb_ex.payload["correct_option"])
    assert res_fb.correct is True

    # 5. Type answer (accent and case tolerant)
    ta_ex = test_db_session.query(Exercise).filter(Exercise.type == ExerciseType.TYPE_ANSWER).first()
    accepted_sample = ta_ex.payload["accepted_answers"][0]
    res_ta = service.check_answer(user, ta_ex.lesson_id, ta_ex.id, accepted_sample.upper() + "!!!")
    assert res_ta.correct is True


def test_lesson_completion_transaction(test_db_session):
    user = test_db_session.scalar(select(User).where(User.username == "learner"))
    init_xp = user.total_xp
    service = LessonService(test_db_session)
    lesson = test_db_session.query(Lesson).first()

    today = date(2026, 10, 7)
    res = service.complete_lesson(user, lesson.id, mistakes=0, today=today)

    assert res.xp_earned == 15
    assert res.total_xp == init_xp + 15
    assert res.streak >= 1


def test_path_service_unlock_rules(test_db_session):
    """Unit test for PathService unlock rule across units and skills."""
    service = PathService(test_db_session)
    user = test_db_session.scalar(select(User).where(User.username == "learner"))
    
    # In seed data:
    # Basics (skill 1) has level_completed = 2 -> completed
    # Greetings (skill 2) has level_completed = 1 -> completed level 1
    # Food (skill 3) is available because Greetings has level >= 1
    # Animals (skill 4, Unit 2) is locked because Food has level 0
    path = service.get_user_path(user.id)
    unit1 = path.units[0]
    unit2 = path.units[1]

    # Basics: completed
    assert unit1.skills[0].status == "completed"
    # Greetings: completed or available (max_level is 2, level 1 done -> available)
    assert unit1.skills[1].status == "available"
    # Food: available
    assert unit1.skills[2].status == "available"
    # Animals (Unit 2 Skill 1): locked because Food has level 0
    assert unit2.skills[0].status == "locked"
