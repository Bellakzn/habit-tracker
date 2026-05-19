# Deploy Skill

## Triggers
- "задеплой"
- "деплой на vercel"
- "настрой CI/CD"
- "deploy"
- "github actions"

## Description
Деплой проекта на Vercel через GitHub Actions.

## Steps
1. Установить Vercel CLI: npm install -g vercel@latest
2. Подключить проект: vercel link
3. Добавить GitHub Secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
4. Создать .github/workflows/deploy.yml
5. Push в main → автоматический деплой

## Required secrets
- VERCEL_TOKEN — из vercel.com/account/tokens
- VERCEL_ORG_ID — из .vercel/project.json после vercel link
- VERCEL_PROJECT_ID — из .vercel/project.json после vercel link
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY