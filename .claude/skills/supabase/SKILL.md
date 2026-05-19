# Supabase Skill

## Triggers
- "подключи supabase"
- "добавь авторизацию"
- "создай таблицу"
- "supabase auth"
- "connect supabase"

## Description
Навык для работы с Supabase: подключение, авторизация, работа с базой данных через @supabase/ssr.

## Steps
1. Установить зависимости: npm install @supabase/supabase-js @supabase/ssr
2. Создать lib/supabase-server.ts с createServerClient
3. Создать lib/supabase-browser.ts с createBrowserClient
4. Добавить middleware.ts для защиты роутов
5. Переменные окружения: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

## Environment variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...