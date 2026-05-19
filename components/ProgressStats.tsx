import Link from "next/link";
import { type Bucket, intensityClass, type Range } from "@/lib/progress";

type Habit = { id: string; name: string; emoji: string };

const RANGES: { value: Range; label: string }[] = [
	{ value: "week", label: "7 дней" },
	{ value: "month", label: "30 дней" },
	{ value: "year", label: "12 месяцев" },
];

function rangeHref(value: Range): string {
	return value === "week" ? "/" : `/?range=${value}`;
}

function RangeTabs({ current }: { current: Range }) {
	return (
		<nav
			aria-label="Период"
			className="flex gap-1 rounded-xl bg-slate-900 p-1 ring-1 ring-slate-700"
		>
			{RANGES.map((item) => {
				const active = item.value === current;
				return (
					<Link
						key={item.value}
						href={rangeHref(item.value)}
						aria-current={active ? "page" : undefined}
						className={
							active
								? "rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white"
								: "rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-100"
						}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}

export function ProgressStats({
	habits,
	buckets,
	completedMap,
	range,
}: {
	habits: Habit[];
	buckets: Bucket[];
	completedMap: Map<string, Set<string>>;
	range: Range;
}) {
	return (
		<section className="rounded-xl bg-slate-800 p-4 shadow-sm ring-1 ring-slate-700">
			<header className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-base font-semibold text-slate-100">Прогресс</h2>
				<RangeTabs current={range} />
			</header>

			{habits.length === 0 ? (
				<p className="text-sm text-slate-400">
					Добавь привычку, чтобы увидеть прогресс.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full border-separate border-spacing-x-1 border-spacing-y-2">
						<thead>
							<tr>
								<th className="w-full" />
								{buckets.map((b) => (
									<th
										key={b.key}
										scope="col"
										className="text-center text-xs font-medium text-slate-400"
									>
										<div className="capitalize">{b.label}</div>
										{b.sublabel && (
											<div className="text-slate-500">{b.sublabel}</div>
										)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{habits.map((habit) => {
								const set = completedMap.get(habit.id);
								return (
									<tr key={habit.id}>
										<th
											scope="row"
											className="whitespace-nowrap pr-3 text-left text-sm font-normal text-slate-100"
										>
											<span className="mr-2" aria-hidden="true">
												{habit.emoji}
											</span>
											{habit.name}
										</th>
										{buckets.map((b) => {
											const done = set
												? b.dates.reduce(
														(acc, d) => acc + (set.has(d) ? 1 : 0),
														0,
													)
												: 0;
											const ratio = done / b.dates.length;
											const label =
												b.dates.length === 1
													? `${habit.name}, ${b.dates[0]}: ${done ? "выполнено" : "не выполнено"}`
													: `${habit.name}, ${b.label}: ${done} из ${b.dates.length}`;
											return (
												<td key={b.key} className="p-0">
													<div
														role="img"
														aria-label={label}
														className={`mx-auto h-7 w-7 rounded-md ${intensityClass(ratio)}`}
													/>
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
