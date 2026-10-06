# Duolingo Clone - Backend

FastAPI + SQLAlchemy 2.0 backend with SQLite database and layered architecture.

## Database Schema

- **`courses`**: `id`, `title`, `code` (unique), `language`
- **`units`**: `id`, `course_id` (FK), `title`, `position`
- **`skills`**: `id`, `unit_id` (FK), `title`, `position`, `max_level` (default 2)
- **`lessons`**: `id`, `skill_id` (FK), `position`, `level`, unique `(skill_id, level)`
- **`exercises`**: `id`, `lesson_id` (FK), `type` (Enum: `multiple_choice`, `translate_word_bank`, `match_pairs`, `fill_blank`, `type_answer`), `payload` (JSON), `position`
- **`users`**: `id`, `username` (unique), `total_xp`, `hearts` (max 5), `hearts_updated_at`, `streak`, `last_active_date`, `daily_goal_xp`, `gems`, `created_at`
- **`user_skill_progress`**: `id`, `user_id` (FK), `skill_id` (FK), `level_completed`, unique `(user_id, skill_id)`
- **`xp_events`**: `id`, `user_id` (FK), `lesson_id` (nullable FK), `xp_amount`, `created_at`
- **`daily_activity`**: `id`, `user_id` (FK), `activity_date`, `lessons_completed`, `xp_earned`, unique `(user_id, activity_date)`
- **`achievements`**: `id`, `key` (unique), `title`, `description`, `threshold`
- **`user_achievements`**: `id`, `user_id` (FK), `achievement_id` (FK), `unlocked_at`, unique `(user_id, achievement_id)`

Cascading deletes are configured across the hierarchy: `Course -> Unit -> Skill -> Lesson -> Exercise`.

## Backend setup

### 1. Create and activate a virtual environment

Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

macOS / Linux:
```bash
python -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the development server

```bash
uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

### 4. Verify endpoints

- Health check: `http://127.0.0.1:8000/health`
- Interactive API Docs: `http://127.0.0.1:8000/docs`

### 5. Run tests

```bash
pytest
```
