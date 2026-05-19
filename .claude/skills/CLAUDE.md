# Habit Tracker — AI Instructions

## Project
Трекер привычек для личного использования. Пользователь отмечает выполненные привычки каждый день и видит статистику за неделю.

## Stack
- Next.js 16 + TypeScript + Tailwind CSS
- Supabase (auth + database)
- Vercel (deploy)

## Architecture
- App Router (Next.js)
- Server Components для чтения данных
- Server Actions для записи данных
- Supabase Auth для авторизации

## Rules
- Стили только через Tailwind классы, никаких inline style
- Все компоненты в components/, страницы в app/
- Никаких хардкод цветов — только из Tailwind палитры
- Каждый компонент — отдельный файл

## Database
- Таблица habits: id, user_id, name, emoji, created_at
- Таблица completions: id, habit_id, user_id, completed_at (date)

## Key flows
- /login — страница входа через Supabase Auth
- / (dashboard) — список привычек + отметить выполнено
- Каждый пользователь видит только свои привычки (RLS)