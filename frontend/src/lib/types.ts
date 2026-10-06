export interface User {
  id: number;
  username: string;
  total_xp: number;
  hearts: number;
  hearts_updated_at: string;
  streak: number;
  last_active_date: string | null;
  daily_goal_xp: number;
  gems: number;
  created_at: string;
}

export interface HeartStatus {
  hearts: number;
  max_hearts: number;
  next_heart_in_seconds: number | null;
  gems: number;
}

export interface Achievement {
  id: number;
  key: string;
  title: string;
  description: string | null;
  threshold: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface LeaderboardUser {
  id: number;
  username: string;
  total_xp: number;
  streak: number;
  gems: number;
  rank: number;
  is_current_user: boolean;
}

export type SkillStatus = "locked" | "available" | "completed";

export interface SkillPath {
  id: number;
  title: string;
  position: number;
  max_level: number;
  level_completed: number;
  status: SkillStatus;
  current_lesson_id: number | null;
}

export interface UnitPath {
  id: number;
  title: string;
  position: number;
  skills: SkillPath[];
}

export interface CoursePath {
  course_id: number;
  title: string;
  code: string;
  language: string;
  units: UnitPath[];
}

export type ExerciseType =
  | "multiple_choice"
  | "translate_word_bank"
  | "match_pairs"
  | "fill_blank"
  | "type_answer";

export interface ExerciseClient {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  payload: Record<string, any>;
  position: number;
}

export interface LessonClient {
  id: number;
  skill_id: number;
  skill_title: string;
  position: number;
  level: number;
  exercises: ExerciseClient[];
}

export interface AnswerCheckResponse {
  correct: boolean;
  correct_answer: any;
  hearts: number;
  message: string | null;
}

export interface LessonCompleteResponse {
  xp_earned: number;
  total_xp: number;
  streak: number;
  daily_xp: number;
  daily_goal: number;
  level_completed: number;
  new_achievements: string[];
}
