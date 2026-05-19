"use client";

import { deleteHabit } from "@/app/actions";

export function DeleteHabitButton({
  habitId,
  habitName,
}: {
  habitId: string;
  habitName: string;
}) {
  return (
    <form action={deleteHabit}>
      <input type="hidden" name="habit_id" value={habitId} />
      <button
        type="submit"
        aria-label={`Удалить «${habitName}»`}
        onClick={(event) => {
          if (
            !window.confirm(
              `Удалить привычку «${habitName}»? История выполнений тоже будет удалена.`,
            )
          ) {
            event.preventDefault();
          }
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-900 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.75 2a.75.75 0 00-.671.415L7.42 3.75H4a.75.75 0 000 1.5h.305l.853 10.74A2.25 2.25 0 007.398 18h5.204a2.25 2.25 0 002.24-2.01l.853-10.74H16a.75.75 0 000-1.5h-3.42l-.659-1.335A.75.75 0 0011.25 2h-2.5zM8.5 7.75a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0v-6zm3 0a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0v-6z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </form>
  );
}
