import { toggleCompletion } from "@/app/actions";

export function CompletionButton({
	habitId,
	completed,
	habitName,
}: {
	habitId: string;
	completed: boolean;
	habitName: string;
}) {
	return (
		<form action={toggleCompletion}>
			<input type="hidden" name="habit_id" value={habitId} />
			<button
				type="submit"
				aria-label={
					completed
						? `Снять отметку «${habitName}» за сегодня`
						: `Отметить «${habitName}» как выполнено сегодня`
				}
				aria-pressed={completed}
				className={
					completed
						? "flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-sm transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/40"
						: "flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-400 transition hover:border-indigo-400 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
				}
			>
				{completed ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="h-5 w-5"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M16.704 5.296a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L8.5 12.086l6.79-6.79a1 1 0 011.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="h-5 w-5"
						aria-hidden="true"
					>
						<path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
					</svg>
				)}
			</button>
		</form>
	);
}
