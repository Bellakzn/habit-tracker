# API Contract — Habit Tracker

## Endpoints

### GET /api/habits
Возвращает список привычек текущего пользователя.
Response: { habits: [{ id, name, emoji, created_at }] }
Auth: required

### POST /api/habits
Создаёт новую привычку.
Body: { name: string, emoji: string }
Response: { habit: { id, name, emoji, created_at } }
Auth: required

### POST /api/completions
Отмечает привычку как выполненную сегодня (или снимает отметку).
Body: { habit_id: string }
Response: { completed: boolean }
Auth: required

## Database Schema

### habits
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- name: text
- emoji: text
- created_at: timestamptz

### completions
- id: uuid (PK)
- habit_id: uuid (FK → habits)
- user_id: uuid (FK → auth.users)
- completed_at: date (уникально с habit_id)