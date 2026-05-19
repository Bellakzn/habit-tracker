import { addHabit } from "@/app/actions";

export function AddHabitForm() {
  return (
    <form
      action={addHabit}
      className="flex flex-col gap-3 rounded-xl bg-slate-800 p-4 shadow-sm ring-1 ring-slate-700 sm:flex-row sm:items-end"
    >
      <div className="flex w-full flex-col gap-1 sm:w-20">
        <label htmlFor="emoji" className="text-xs font-medium text-slate-400">
          Эмодзи
        </label>
        <input
          id="emoji"
          name="emoji"
          required
          maxLength={4}
          placeholder="💧"
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-center text-xl text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="name" className="text-xs font-medium text-slate-400">
          Название привычки
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          placeholder="Выпить стакан воды"
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <button
        type="submit"
        aria-label="Добавить привычку"
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
        </svg>
        Добавить
      </button>
    </form>
  );
}
