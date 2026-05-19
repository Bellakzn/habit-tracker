import { CompletionButton } from "./CompletionButton";
import { DeleteHabitButton } from "./DeleteHabitButton";

export function HabitCard({
	habit,
	completedToday,
}: {
	habit: { id: string; name: string; emoji: string };
	completedToday: boolean;
}) {
	return (
		<article
			className={
				completedToday
					? "flex items-center gap-3 rounded-xl border-l-4 border-green-500 bg-slate-800 p-4 shadow-sm ring-1 ring-slate-700"
					: "flex items-center gap-3 rounded-xl border-l-4 border-transparent bg-slate-800 p-4 shadow-sm ring-1 ring-slate-700"
			}
		>
			<span
				className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-2xl"
				aria-hidden="true"
			>
				{habit.emoji}
			</span>
			<h2 className="flex-1 text-base font-medium text-slate-100">
				{habit.name}
			</h2>
			<CompletionButton
				habitId={habit.id}
				completed={completedToday}
				habitName={habit.name}
			/>
			<DeleteHabitButton habitId={habit.id} habitName={habit.name} />
		</article>
	);
}
