from datetime import date
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.clock import utcnow
from app.database import get_db
from app.main import app
from app.models import Course, Exercise, ExerciseType, Lesson, Skill, User
from app.seed import seed_database


@pytest.fixture
def client_with_db():
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
    test_client = TestClient(app)
    yield test_client, TestingSessionLocal
    app.dependency_overrides.clear()


def test_api_course_path_states(client_with_db):
    client, _ = client_with_db
    response = client.get("/course/path")
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "Spanish"
    assert len(data["units"]) == 2

    # Check seeded user states: Basics completed, Greetings available, Food available, Animals locked
    unit1_skills = data["units"][0]["skills"]
    assert unit1_skills[0]["title"] == "Basics"
    assert unit1_skills[0]["status"] == "completed"
    assert unit1_skills[1]["title"] == "Greetings"
    assert unit1_skills[1]["status"] == "available"
    assert unit1_skills[2]["title"] == "Food"
    assert unit1_skills[2]["status"] == "available"

    unit2_skills = data["units"][1]["skills"]
    assert unit2_skills[0]["title"] == "Animals"
    assert unit2_skills[0]["status"] == "locked"


def test_api_locked_skill_403(client_with_db):
    client, session_factory = client_with_db
    with session_factory() as db:
        # Animals is locked for seeded user
        animals_skill = db.scalar(select(Skill).where(Skill.title == "Animals"))
        locked_lesson = animals_skill.lessons[0]
        locked_lesson_id = locked_lesson.id
        locked_exercise_id = locked_lesson.exercises[0].id

    # 1. GET /lessons/{id} for locked skill returns 403
    r_get = client.get(f"/lessons/{locked_lesson_id}")
    assert r_get.status_code == 403
    assert r_get.json()["code"] == "skill_locked"

    # 2. POST /lessons/{id}/answer for locked skill returns 403
    r_ans = client.post(
        f"/lessons/{locked_lesson_id}/answer",
        json={"exercise_id": locked_exercise_id, "answer": 0},
    )
    assert r_ans.status_code == 403
    assert r_ans.json()["code"] == "skill_locked"

    # 3. POST /lessons/{id}/complete for locked skill returns 403
    r_comp = client.post(
        f"/lessons/{locked_lesson_id}/complete",
        json={"mistakes": 0},
    )
    assert r_comp.status_code == 403
    assert r_comp.json()["code"] == "skill_locked"


def test_api_full_lesson_flow(client_with_db):
    client, session_factory = client_with_db
    with session_factory() as db:
        greetings_skill = db.scalar(select(Skill).where(Skill.title == "Greetings"))
        # Greetings level 2 lesson is available
        greetings_lesson = [l for l in greetings_skill.lessons if l.level == 2][0]
        lesson_id = greetings_lesson.id
        mc_exercise = [e for e in greetings_lesson.exercises if e.type == ExerciseType.MULTIPLE_CHOICE][0]
        ex_id = mc_exercise.id
        correct_idx = mc_exercise.payload["correct_index"]
        wrong_idx = (correct_idx + 1) % 4

    # 1. GET lesson -> solutions stripped
    r_lesson = client.get(f"/lessons/{lesson_id}")
    assert r_lesson.status_code == 200
    lesson_data = r_lesson.json()
    assert len(lesson_data["exercises"]) == 8
    for ex in lesson_data["exercises"]:
        assert "correct_index" not in ex["payload"]
        assert "correct_answer" not in ex["payload"]

    # 2. Wrong answer -> hearts 5 -> 4
    r_wrong = client.post(
        f"/lessons/{lesson_id}/answer",
        json={"exercise_id": ex_id, "answer": wrong_idx},
    )
    assert r_wrong.status_code == 200
    wrong_data = r_wrong.json()
    assert wrong_data["correct"] is False
    assert wrong_data["hearts"] == 4

    # 3. Correct answer -> hearts remain 4
    r_corr = client.post(
        f"/lessons/{lesson_id}/answer",
        json={"exercise_id": ex_id, "answer": correct_idx},
    )
    assert r_corr.status_code == 200
    corr_data = r_corr.json()
    assert corr_data["correct"] is True
    assert corr_data["hearts"] == 4

    # 4. Complete lesson -> awards XP and returns streak
    r_comp = client.post(
        f"/lessons/{lesson_id}/complete",
        json={"mistakes": 1},
    )
    assert r_comp.status_code == 200
    comp_data = r_comp.json()
    assert comp_data["xp_earned"] == 10  # 1 mistake = 10 XP (no perfect bonus)
    assert comp_data["streak"] >= 1
    assert comp_data["level_completed"] == 2


def test_api_out_of_hearts_403(client_with_db):
    client, session_factory = client_with_db
    with session_factory() as db:
        user = db.scalar(select(User).where(User.username == "learner"))
        user.hearts = 0
        user.hearts_updated_at = utcnow()
        db.commit()

        lesson = db.query(Lesson).first()
        ex = lesson.exercises[0]
        lesson_id = lesson.id
        ex_id = ex.id

    r_ans = client.post(
        f"/lessons/{lesson_id}/answer",
        json={"exercise_id": ex_id, "answer": 0},
    )
    assert r_ans.status_code == 403
    assert r_ans.json()["code"] == "out_of_hearts"


def test_api_patch_me_persists_daily_goal(client_with_db):
    client, _ = client_with_db
    r_patch = client.patch("/me", json={"daily_goal_xp": 50})
    assert r_patch.status_code == 200
    assert r_patch.json()["daily_goal_xp"] == 50

    r_get = client.get("/me")
    assert r_get.status_code == 200
    assert r_get.json()["daily_goal_xp"] == 50


def test_api_post_dev_reset(client_with_db):
    client, _ = client_with_db
    # Modify state first
    client.patch("/me", json={"daily_goal_xp": 100})
    r_mod = client.get("/me")
    assert r_mod.json()["daily_goal_xp"] == 100

    # Call POST /dev/reset
    r_reset = client.post("/dev/reset")
    assert r_reset.status_code == 200
    reset_data = r_reset.json()
    assert reset_data["username"] == "learner"
    assert reset_data["daily_goal_xp"] == 20
    assert reset_data["total_xp"] == 120
    assert reset_data["streak"] == 3


def test_api_leaderboard_ordering(client_with_db):
    client, _ = client_with_db
    r_lb = client.get("/leaderboard")
    assert r_lb.status_code == 200
    leaderboard = r_lb.json()
    assert len(leaderboard) >= 5

    # Assert sorted descending by total_xp
    xp_list = [u["total_xp"] for u in leaderboard]
    assert xp_list == sorted(xp_list, reverse=True)

    # Assert ranks are 1..N
    ranks = [u["rank"] for u in leaderboard]
    assert ranks == list(range(1, len(leaderboard) + 1))
