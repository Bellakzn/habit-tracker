# Design System — Habit Tracker

## Tokens
- Primary: indigo-600
- Success: green-500
- Background: gray-50
- Surface: white
- Text: gray-900
- Muted: gray-500
- Border: gray-200
- Radius: rounded-xl (компоненты), rounded-full (бейджи)
- Font: system-ui (Tailwind default)

## Components
- Button: variant primary (bg-indigo-600), secondary (border), ghost (text only)
- HabitCard: белая карточка с тенью, эмодзи + название + кнопка отметить
- CompletionButton: круглая кнопка, зелёная если выполнено сегодня
- WeekStreak: 7 кружков — серый/зелёный по дням недели

## Screens
- /login — по центру форма email+пароль, кнопка войти
- / — список HabitCard, кнопка добавить привычку (+)

## States
- Привычка выполнена сегодня: CompletionButton зелёный, HabitCard с зелёной левой полосой
- Привычка не выполнена: CompletionButton серый
- Загрузка: skeleton-заглушки карточек
- Пустой список: иллюстрация + "Добавь первую привычку"

## Accessibility
- Все кнопки имеют aria-label
- Цветовой контраст минимум 4.5:1
- Клавиатурная навигация поддерживается