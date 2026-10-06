from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.course_repo import CourseRepository
from app.schemas.course import CoursePathResponse, SkillPathRead, UnitPathRead


class PathService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)

    def is_skill_locked(self, user_id: int, skill_id: int) -> bool:
        """Determines if a skill is locked for a given user.
        
        A skill is locked if any preceding skill in path order has not completed level 1.
        """
        course = self.course_repo.get_default_course()
        if not course:
            return False

        user_progress_map = self.course_repo.get_all_user_skill_progress(user_id)
        all_skills_flat = []
        for unit in sorted(course.units, key=lambda u: u.position):
            for skill in sorted(unit.skills, key=lambda s: s.position):
                all_skills_flat.append(skill)

        for idx, skill in enumerate(all_skills_flat):
            if skill.id == skill_id:
                if idx == 0:
                    return False
                prev_skill = all_skills_flat[idx - 1]
                prev_level_done = user_progress_map.get(prev_skill.id, 0)
                return prev_level_done < 1

        return False

    def get_user_path(self, user_id: int) -> CoursePathResponse:
        course = self.course_repo.get_default_course()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found. Please run database seed.")

        user_progress_map = self.course_repo.get_all_user_skill_progress(user_id)

        # Collect all skills in sequential path order
        all_skills_flat = []
        for unit in sorted(course.units, key=lambda u: u.position):
            for skill in sorted(unit.skills, key=lambda s: s.position):
                all_skills_flat.append(skill)

        # Compute lock/available/completed status
        skill_status_map = {}
        for idx, skill in enumerate(all_skills_flat):
            level_done = user_progress_map.get(skill.id, 0)
            if idx == 0:
                # First skill is available or completed
                status = "completed" if level_done >= skill.max_level else "available"
            else:
                prev_skill = all_skills_flat[idx - 1]
                prev_level_done = user_progress_map.get(prev_skill.id, 0)
                # Unlocks when previous skill has at least level 1 done
                if prev_level_done >= 1:
                    status = "completed" if level_done >= skill.max_level else "available"
                else:
                    status = "locked"
            skill_status_map[skill.id] = status

        # Build output structure
        units_out: list[UnitPathRead] = []
        for unit in sorted(course.units, key=lambda u: u.position):
            skills_out: list[SkillPathRead] = []
            for skill in sorted(unit.skills, key=lambda s: s.position):
                level_done = user_progress_map.get(skill.id, 0)
                status = skill_status_map[skill.id]

                # Determine which lesson to launch for this skill
                current_lesson_id = None
                sorted_lessons = sorted(skill.lessons, key=lambda l: l.level)
                if sorted_lessons:
                    target_level = min(level_done + 1, skill.max_level)
                    matching_lessons = [l for l in sorted_lessons if l.level == target_level]
                    if matching_lessons:
                        current_lesson_id = matching_lessons[0].id
                    else:
                        current_lesson_id = sorted_lessons[-1].id

                skills_out.append(
                    SkillPathRead(
                        id=skill.id,
                        title=skill.title,
                        position=skill.position,
                        max_level=skill.max_level,
                        level_completed=level_done,
                        status=status,
                        current_lesson_id=current_lesson_id,
                    )
                )

            units_out.append(
                UnitPathRead(
                    id=unit.id,
                    title=unit.title,
                    position=unit.position,
                    skills=skills_out,
                )
            )

        return CoursePathResponse(
            course_id=course.id,
            title=course.title,
            code=course.code,
            language=course.language,
            units=units_out,
        )
