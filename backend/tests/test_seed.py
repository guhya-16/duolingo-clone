import re
import pytest
from sqlalchemy import create_engine, delete, select, text
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Course, Exercise, ExerciseType, Lesson, Skill, Unit, User, XpEvent
from app.seed import seed_database


def test_seed_database_in_memory():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # 1. Run seed first time
    counts1 = seed_database(target_engine=engine, target_session_factory=TestingSessionLocal)

    # 2. Run seed second time to verify idempotence
    counts2 = seed_database(target_engine=engine, target_session_factory=TestingSessionLocal)
    assert counts1 == counts2

    session = TestingSessionLocal()

    # 3. Assert counts
    skills = session.scalars(select(Skill)).all()
    assert len(skills) == 6

    lessons = session.scalars(select(Lesson)).all()
    assert len(lessons) == 12

    exercises = session.scalars(select(Exercise)).all()
    assert len(exercises) == 96

    # 4. Assert every lesson has all 5 exercise types and exactly 8 exercises
    for lesson in lessons:
        lesson_exercises = session.scalars(
            select(Exercise).where(Exercise.lesson_id == lesson.id)
        ).all()
        assert len(lesson_exercises) == 8

        types_in_lesson = {ex.type for ex in lesson_exercises}
        assert ExerciseType.MULTIPLE_CHOICE in types_in_lesson
        assert ExerciseType.TRANSLATE_WORD_BANK in types_in_lesson
        assert ExerciseType.MATCH_PAIRS in types_in_lesson
        assert ExerciseType.FILL_BLANK in types_in_lesson
        assert ExerciseType.TYPE_ANSWER in types_in_lesson

    # 5. Assert multiple_choice correct_index distribution is spread across 0-3
    mc_exercises = [ex for ex in exercises if ex.type == ExerciseType.MULTIPLE_CHOICE]
    correct_indices = [ex.payload["correct_index"] for ex in mc_exercises]
    unique_indices = set(correct_indices)
    assert len(unique_indices) > 1
    assert unique_indices == {0, 1, 2, 3}

    # 6. Assert translate_word_bank word banks are shuffled, lowercase, and without punctuation
    word_bank_exercises = [ex for ex in exercises if ex.type == ExerciseType.TRANSLATE_WORD_BANK]
    for ex in word_bank_exercises:
        payload = ex.payload
        word_bank = payload["word_bank"]
        correct_answer = payload["correct_answer"]

        # Assert not already in correct order
        assert word_bank[:len(correct_answer)] != correct_answer

        # Assert lowercase and no punctuation
        for w in word_bank + correct_answer:
            assert w == w.lower()
            assert not re.search(r"[¿?¡!.,;:\"'()\-]", w)

    # 7. Verify default user stats and progress
    default_user = session.scalar(select(User).where(User.username == "learner"))
    assert default_user is not None
    assert default_user.total_xp == 120
    assert default_user.streak == 3
    assert default_user.hearts == 5
    assert default_user.gems == 500

    session.close()


def test_lesson_delete_sets_xpevent_lesson_id_null():
    """Verify that deleting a lesson sets XpEvent.lesson_id to NULL (ON DELETE SET NULL)."""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    seed_database(target_engine=engine, target_session_factory=TestingSessionLocal)

    session = TestingSessionLocal()
    # Find an XP event with a linked lesson
    xp_event = session.scalar(select(XpEvent).where(XpEvent.lesson_id.isnot(None)))
    assert xp_event is not None
    target_lesson_id = xp_event.lesson_id

    # Delete the lesson via raw SQL with foreign keys enabled
    session.execute(text("DELETE FROM lessons WHERE id = :id"), {"id": target_lesson_id})
    session.commit()

    # Verify XP event still exists but lesson_id is now NULL
    session.refresh(xp_event)
    assert xp_event.lesson_id is None
    session.close()


def test_cascade_delete_raw_sql():
    """Verify that cascade deletion works at the database level via raw SQL DELETE."""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    seed_database(target_engine=engine, target_session_factory=TestingSessionLocal)

    session = TestingSessionLocal()
    course = session.scalar(select(Course).where(Course.code == "es"))
    assert course is not None
    course_id = course.id

    # Execute raw SQL delete on courses table
    session.execute(text("DELETE FROM courses WHERE id = :id"), {"id": course_id})
    session.commit()

    # Assert that all related units, skills, lessons, and exercises were cascaded away
    assert session.scalar(select(Unit).where(Unit.course_id == course_id)) is None
    assert session.scalar(select(Skill)) is None
    assert session.scalar(select(Lesson)) is None
    assert session.scalar(select(Exercise)) is None

    session.close()
