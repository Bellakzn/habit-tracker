# Self-Review — habit-tracker

## Что сделано
- CLAUDE.md с описанием проекта и 3 skills (supabase, components, deploy)
- design.md — дизайн-система (тёмно-синяя тема, компоненты)
- api.md — описание всех API routes и таблиц Supabase
- Supabase: таблицы habits и completions с RLS политиками
- Next.js приложение с авторизацией, трекером привычек и weekly stats
- Деплой на Vercel через GitHub Actions
- Biome — 0 ошибок
- Playwright — 6/6 тестов прошли
- Security audit — P1 (security headers в `next.config.ts`) закрыт, P0 (RLS-политики на `habits`/`completions`) ждёт ручной проверки в Supabase dashboard

## Стек
Next.js 16, TypeScript, Tailwind CSS, Supabase Auth + DB, Vercel, Biome, Playwright

## Что узнала нового
- Server Actions заменяют API routes для мутаций — `auth.getUser()` + `revalidatePath` без отдельных HTTP-эндпоинтов и без CSRF-токенов
- `@supabase/ssr` с куками через `getAll/setAll` — корректная SSR-авторизация без хранения сессии в `localStorage`
- Defense in depth: RLS на стороне БД + явная фильтрация по `user_id` в Server Actions — две независимые линии защиты
- Next.js 16 использует `proxy.ts` вместо `middleware.ts` — конвенции v16 отличаются от того, что есть в публичных туториалах
- CSP с whitelist для Supabase REST + Realtime: `connect-src https://*.supabase.co wss://*.supabase.co` — без этого браузерный клиент перестаёт работать

## Что можно улучшить
- Добавить SQL-миграции в `supabase/migrations/` для версионирования схемы
- Добавить больше Playwright тестов (проверка добавления/удаления привычек)
- Настроить уведомления (push или email) при пропуске привычки

## Ссылки
- GitHub: https://github.com/Bellakzn/habit-tracker
- Vercel: https://habit-tracker-pi-one.vercel.app
