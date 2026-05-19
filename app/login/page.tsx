import { signIn, signUp } from "@/app/actions";

type SearchParams = Promise<{ error?: string; message?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-xl bg-slate-800 p-8 shadow-lg ring-1 ring-slate-700">
        <h1 className="text-2xl font-semibold text-slate-100">Войти</h1>
        <p className="mt-1 text-sm text-slate-400">
          Email и пароль от вашего аккаунта.
        </p>

        <form className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-950 px-3 py-2 text-sm text-red-300 ring-1 ring-red-900"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-xl bg-indigo-950 px-3 py-2 text-sm text-indigo-200 ring-1 ring-indigo-900"
            >
              {message}
            </p>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              formAction={signIn}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
            >
              Войти
            </button>
            <button
              type="submit"
              formAction={signUp}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
