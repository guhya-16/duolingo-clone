import pytest
from sqlalchemy import create_engine, event, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Course, Unit, Skill, Lesson, Exercise, ExerciseType, User, DailyActivity, XpEvent


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def test_models_cascade_delete():
    # 1. In-memory SQLite engine
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    # 2. Insert one full hierarchy: course -> unit -> skill -> lesson -> exercise
    course = Course(title="Spanish", code="es", language="Spanish")
    unit = Unit(course=course, title="Unit 1: Basics", position=1)
    skill = Skill(unit=unit, title="Greetings", position=1, max_level=2)
    lesson = Lesson(skill=skill, position=1, level=1)
    exercise = Exercise(
        lesson=lesson,
        type=ExerciseType.MULTIPLE_CHOICE,
        payload={"prompt": "Select Hello", "options": ["Hola", "Adiós"], "answer": "Hola"},
        position=1,
    )

    session.add(course)
    session.commit()

    # 3. Assert all entities exist
    assert session.scalar(select(Course).where(Course.code == "es")) is not None
    assert session.scalar(select(Unit).where(Unit.title == "Unit 1: Basics")) is not None
    assert session.scalar(select(Skill).where(Skill.title == "Greetings")) is not None
    assert session.scalar(select(Lesson).where(Lesson.level == 1)) is not None
    assert session.scalar(select(Exercise).where(Exercise.position == 1)) is not None

    # 4. Delete the course and assert cascade deletion
    session.delete(course)
    session.commit()

    assert session.scalar(select(Course)) is None
    assert session.scalar(select(Unit)) is None
    assert session.scalar(select(Skill)) is None
    assert session.scalar(select(Lesson)) is None
    assert session.scalar(select(Exercise)) is None

    session.close()


def test_user_and_activity_models():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    user = User(username="duo_tester")
    session.add(user)
    session.commit()

    assert user.id is not None
    assert user.hearts == 5
    assert user.created_at is not None

    activity = DailyActivity(
        user_id=user.id,
        activity_date=user.created_at.date(),
        lessons_completed=1,
        xp_earned=15,
    )
    session.add(activity)
    session.commit()

    assert activity.id is not None
    assert activity.xp_earned == 15

    session.close()
