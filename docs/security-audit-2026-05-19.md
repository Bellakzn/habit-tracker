# Security Audit — Habit Tracker

**Дата:** 2026-05-19
**Коммит:** `3c4fb9d` (main)
**Стэк:** Next.js 16.2.6, React 19.2.4, @supabase/ssr 0.10.3, Supabase Auth

## Итоги

| Область | Статус | Детали |
|---------|--------|--------|
| Секреты в коде/git | ✅ | Ключи в `.env.local`, в истории нет |
| Frontend exposure | ✅ | `service_role` не попадает в бандл |
| API auth + IDOR | ✅ | Server Actions с `auth.getUser()` и фильтрацией по `user_id` |
| RLS на `habits` и `completions` | ⚠️ | Не верифицируется из репо — проверить в Supabase dashboard (**Critical, если RLS отключён**) |
| Webhooks | ✅ | Эндпоинтов нет |
| CORS + CSP headers | ❌ | `next.config.ts` пустой, security-headers отсутствуют (Medium) |
| Dependencies (npm audit) | ⚠️ | 2 moderate: postcss XSS через `next` (Low impact) |

**Главный риск:** RLS — единственная защита данных от пользовательского браузера, поскольку `NEXT_PUBLIC_SUPABASE_ANON_KEY` доступен на клиенте. Если RLS не настроен корректно на стороне Supabase, любой авторизованный (или анонимный) пользователь может читать чужие привычки через прямой вызов REST API Supabase. **Проверить вручную в Supabase dashboard.**

---

## 1. Секреты в коде и git — ✅

### Проверки
- `grep` на `API_KEY|SECRET|TOKEN|password|service_role|bearer` по всему дереву кода (исключая `node_modules`, `.next`, `.git`) — найдены только UI-связанные совпадения (`type="password"`, `htmlFor="password"`) и легитимный вызов `supabase.auth.signInWithPassword`. Секретов в коде нет.
- `.gitignore` — содержит `.env*` (строка 32). Корректно.
- `git ls-files` — `.env*` файлов в индексе нет.
- `git log -- '.env*'` — ни в одной ревизии не было закоммичено.
- Поиск по всей истории git (`git rev-list --all`) на `service_role`, `sk_live`, `sk_test`, JWT-паттерны: только ложные срабатывания в SHA-512 интегритах `package-lock.json`.

### `.env.local` (локально, не в git)
```
NEXT_PUBLIC_SUPABASE_URL=<REDACTED>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<REDACTED>
```
Только публичные `NEXT_PUBLIC_*` переменные — это ожидаемо для архитектуры с RLS, где сервер не использует service_role.

**Вывод:** секретов в коде/истории нет.

---

## 2. Frontend exposure — ✅

### Проверки
- `grep -r service_role|SERVICE_ROLE|SUPABASE_SERVICE` по `.next/dev/static/` — 0 совпадений.
- `grep -r SECRET|secret_key|private_key` по `.next/dev/static/` — 0 совпадений.
- Production-сборка `.next/static/` отсутствует (есть только dev-сборка `.next/dev/static/` ~20 MB). Перед деплоем рекомендуется повторить проверку на `.next/static/` после `npm run build`.

### Замечание
`NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` намеренно публичны — они инлайнятся в клиентский bundle. Это безопасно **только при условии корректно настроенных RLS** (см. раздел 4).

**Вывод:** утечек service_role или приватных секретов в клиентский bundle не обнаружено.

---

## 3. API auth + IDOR — ✅

### Архитектура
**В проекте нет `/api/*` HTTP-роутов.** Документ `api.md` описывает их концептуально, но фактическая реализация — Server Actions в `app/actions.ts`. Это закрывает целый класс атак: нет публичных HTTP endpoints, к которым можно обращаться напрямую вне фреймворка.

### Авторизация
- Глобальная защита маршрутов: `proxy.ts:42-46` — если `user` отсутствует и путь не в `PUBLIC_PATHS = ["/login"]`, выполняется redirect на `/login`. Применяется ко всем не-статическим путям (matcher на строке 58).
- Используется `supabase.auth.getUser()` (а не `getSession()`), что валидирует токен на стороне Supabase — это правильный паттерн для SSR. Подтверждено в `proxy.ts:33-35`, `app/actions.ts:55,93,117`, `app/page.tsx:21-23`.

### Server Actions — проверка auth и IDOR

| Action | Auth check | IDOR-фильтр |
|---|---|---|
| `signIn` (`app/actions.ts:7`) | n/a (логин) | n/a |
| `signUp` (`app/actions.ts:21`) | n/a (регистрация) | n/a |
| `signOut` (`app/actions.ts:43`) | нет (идемпотентно) | n/a |
| `deleteHabit` (`app/actions.ts:49`) | ✅ строка 58 | ✅ `.eq("user_id", user.id)` на обоих DELETE (строки 66, 76) |
| `addHabit` (`app/actions.ts:85`) | ✅ строка 96 | ✅ `user_id: user.id` в INSERT (строка 102) |
| `toggleCompletion` (`app/actions.ts:111`) | ✅ строка 120 | ✅ SELECT отфильтрован `.eq("user_id", user.id)` (строка 130); последующий DELETE по `existing.id` безопасен, потому что `existing` мог принадлежать только текущему юзеру |

**Defense in depth:** все мутации фильтруют по `user_id` на уровне приложения, даже если RLS отказал. Это правильный паттерн.

### Замечания (низкий приоритет)
- Серверной валидации длины и формата нет — `name` ограничен `maxLength={80}` только на форме, `emoji` — `maxLength={4}`. Атакующий может через crafted FormData отправить мегабайтные строки. Impact: засорение БД, но не privilege escalation. Рекомендация: добавить серверную валидацию.
- `signOut` не проверяет auth — допустимо, операция идемпотентна.

**Вывод:** auth и IDOR закрыты. Уровень риска — низкий.

---

## 4. RLS — ⚠️ Не верифицируется из репо

### Что найдено
- В репо **нет SQL-миграций**, нет директории `supabase/`, нет файлов с описанием политик. RLS-политики живут только в Supabase Dashboard.
- Единственное упоминание RLS — в `.claude/skills/CLAUDE.md`: "Каждый пользователь видит только свои привычки (RLS)" — это намерение, а не доказательство настройки.

### Почему это критично
`NEXT_PUBLIC_SUPABASE_ANON_KEY` инлайнится в клиентский JS и виден любому пользователю в DevTools. Если RLS на `habits` или `completions` **отключён** или политики **некорректны**:

```js
// атакующий выполняет это в браузере
fetch('https://<project>.supabase.co/rest/v1/habits?select=*', {
  headers: { apikey: '<anon key>', Authorization: 'Bearer <anon key>' }
})
// → получит ВСЕ привычки ВСЕХ пользователей
```

### Чек-лист для ручной проверки в Supabase
```sql
-- 1. Проверить, что RLS включён
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('habits', 'completions');
-- relrowsecurity должно быть true для обеих

-- 2. Посмотреть политики
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('habits', 'completions');
```

### Ожидаемые политики (минимум)
```sql
-- habits
CREATE POLICY "habits_select_own" ON habits FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- completions — аналогично, плюс проверка владения habit_id
CREATE POLICY "completions_select_own" ON completions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "completions_insert_own" ON completions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM habits WHERE id = habit_id AND user_id = auth.uid())
  );
CREATE POLICY "completions_delete_own" ON completions FOR DELETE
  USING (auth.uid() = user_id);
```

### Дополнительные рекомендации
- Сохранить SQL-схему и политики в репо (например, `supabase/migrations/*.sql`), чтобы RLS можно было ревьюить через git.
- Включить `supabase db diff` или `supabase db dump` в CI/локальный workflow для отслеживания дрейфа.

**Вывод:** в коде не доказать. **Срочно** проверить в Supabase dashboard перед публичным релизом.

---

## 5. Webhooks — ✅

### Проверки
- `find app -name route.ts` — нет route handlers.
- `find . -type d -name api` (вне `node_modules`) — нет.
- `grep -rEi webhook|stripe|signature.verify|x-hub-signature` — 0 совпадений в коде.

Приложение не принимает webhook-ов от внешних сервисов. Атак на signature verification быть не может.

---

## 6. CORS + CSP headers — ❌

### Что найдено
`next.config.ts` пустой:
```ts
const nextConfig: NextConfig = {
  /* config options here */
};
```

**Нет ни одного security-header:** CSP, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### Риски
- **Clickjacking** (отсутствует X-Frame-Options / CSP `frame-ancestors`) — третья сторона может встроить приложение в `<iframe>` и обмануть пользователя.
- **XSS amplification** — без CSP любой stored/reflected XSS даёт полный exfiltration. Для приложения с Supabase это особенно болезненно: украденный access token из `localStorage`/`cookie` даёт полный доступ к API в рамках RLS пользователя.
- **MIME sniffing** (отсутствует `X-Content-Type-Options: nosniff`).
- **Referrer leak** — при клике на внешние ссылки утечёт полный URL.

### Рекомендация — добавить в `next.config.ts`
```ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",          // Next inline-скрипты для гидратации
      "style-src 'self' 'unsafe-inline'",            // Tailwind inline styles
      "img-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
```
**Важно:** перед включением CSP проверьте `next.js`-документацию для версии 16 (`node_modules/next/dist/docs/`) — конвенции хедеров в этой версии могут отличаться (см. AGENTS.md: "This is NOT the Next.js you know"). Возможно, потребуется nonce-based CSP вместо `unsafe-inline` для скриптов.

### CORS
CORS в проекте не настраивается, т.к. нет публичных HTTP-API. Server Actions обрабатываются через POST на тот же origin с Next.js встроенной CSRF-защитой. Это нормально.

---

## 7. Dependencies — ⚠️ 2 moderate

```
npm audit:
  moderate: 2
  high: 0
  critical: 0
```

### Уязвимости
| Пакет | Severity | CVE/Advisory | Описание |
|---|---|---|---|
| `postcss` (<8.5.10, транзитивная через `next`) | moderate | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), CVSS 6.1 | XSS через незакрытый `</style>` в CSS Stringify Output |
| `next` (9.3.4-canary.0 — 16.3.0-canary.5) | moderate | (effect of postcss) | через postcss |

`npm audit fix` предлагает откат до `next@9.3.3` (semver-major downgrade) — **не делать**.

### Реальный impact для этого проекта
- `postcss` используется в **build-time** для обработки Tailwind CSS. CSS-input полностью контролируется разработчиками (не user-input).
- В приложении нет user-controlled CSS (нет CMS, нет markdown с inline-стилями).
- **Реальный риск: низкий.** Уязвимость опасна для проектов, которые принимают CSS от пользователей.

### Рекомендация
Подождать релиз `next@16.x`, обновляющего транзитивный `postcss>=8.5.10`. Можно ускорить через `npm overrides`:
```json
{
  "overrides": {
    "postcss": "^8.5.10"
  }
}
```
После обновления повторить `npm audit`.

---

## Итог и приоритеты

### P0 — Сделать сейчас
1. **Верифицировать RLS** в Supabase для `habits` и `completions` SQL-запросами из раздела 4. Без подтверждения RLS все остальные защиты не имеют значения.

### P1 — В ближайший спринт
2. **Добавить security headers** в `next.config.ts` (см. раздел 6). Особенно CSP с `frame-ancestors 'none'` и `connect-src` whitelist для Supabase.
3. **Зафиксировать SQL-схему и RLS-политики в git** (`supabase/migrations/*.sql`), чтобы RLS можно было ревьюить.

### P2 — Когда дойдут руки
4. **Серверная валидация** длины `name` и `emoji` в `addHabit` (раздел 3, замечание).
5. **`npm overrides` для postcss** ≥ 8.5.10 (раздел 7).

### Что уже хорошо
- Server Actions вместо публичных HTTP API — меньше attack surface.
- `auth.getUser()` (не `getSession()`) — корректная валидация на сервере.
- Defense in depth: фильтрация по `user_id` в каждом запросе сверх RLS.
- Чистая history git, нет утечек секретов.
- Нет webhook endpoints — нечего атаковать signature verification.
