import { signOut } from "@/app/actions";
import { AddHabitForm } from "@/components/AddHabitForm";
import { HabitCard } from "@/components/HabitCard";
import { ProgressStats } from "@/components/ProgressStats";
import { buildBuckets, parseRange } from "@/lib/progress";
import { createClient } from "@/lib/supabase-server";

type Habit = { id: string; name: string; emoji: string; created_at: string };
type SearchParams = Promise<{ range?: string }>;

export default async function HomePage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const { range: rangeParam } = await searchParams;
	const range = parseRange(rangeParam);

	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { buckets, oldestDay, today } = buildBuckets(range);

	const [{ data: habits }, { data: completions }] = await Promise.all([
		supabase
			.from("habits")
			.select("id, name, emoji, created_at")
			.order("created_at", { ascending: true })
			.returns<Habit[]>(),
		supabase
			.from("completions")
			.select("habit_id, completed_at")
			.gte("completed_at", oldestDay)
			.returns<{ habit_id: string; completed_at: string }[]>(),
	]);

	const list = habits ?? [];

	const completedMap = new Map<string, Set<string>>();
	for (const c of completions ?? []) {
		let set = completedMap.get(c.habit_id);
		if (!set) {
			set = new Set();
			completedMap.set(c.habit_id, set);
		}
		set.add(c.completed_at);
	}

	return (
		<main className="min-h-screen bg-slate-900">
			<div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
				<header className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-slate-100">
							Мои привычки
						</h1>
						<p className="text-sm text-slate-400">{user?.email}</p>
					</div>
					<form action={signOut}>
						<button
							type="submit"
							className="rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
						>
							Выйти
						</button>
					</form>
				</header>

				<AddHabitForm />

				{list.length === 0 ? (
					<div className="flex flex-col items-center gap-2 rounded-xl bg-slate-800 p-10 text-center shadow-sm ring-1 ring-slate-700">
						<span className="text-4xl" aria-hidden="true">
							✨
						</span>
						<p className="text-base font-medium text-slate-100">
							Добавь первую привычку
						</p>
						<p className="text-sm text-slate-400">
							Маленькие шаги каждый день — большие перемены через месяц.
						</p>
					</div>
				) : (
					<ul className="flex flex-col gap-3">
						{list.map((habit) => (
							<li key={habit.id}>
								<HabitCard
									habit={habit}
									completedToday={
										completedMap.get(habit.id)?.has(today) ?? false
									}
								/>
							</li>
						))}
					</ul>
				)}

				<ProgressStats
					habits={list}
					buckets={buckets}
					completedMap={completedMap}
					range={range}
				/>
			</div>
		</main>
	);
}
