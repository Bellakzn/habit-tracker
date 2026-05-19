export type Range = "week" | "month" | "year";

export type Bucket = {
  key: string;
  label: string;
  sublabel?: string;
  dates: string[];
};

const weekdayFmt = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });
const monthFmt = new Intl.DateTimeFormat("ru-RU", { month: "short" });

export function parseRange(value: string | undefined): Range {
  if (value === "month" || value === "year") return value;
  return "week";
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildBuckets(range: Range): {
  buckets: Bucket[];
  oldestDay: string;
  today: string;
} {
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const today = isoDay(todayUtc);

  if (range === "year") {
    const buckets: Bucket[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(
        Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() - i, 1),
      );
      const lastDay = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
      ).getUTCDate();
      const dates: string[] = [];
      for (let d = 1; d <= lastDay; d++) {
        dates.push(
          isoDay(
            new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), d)),
          ),
        );
      }
      buckets.push({
        key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
        label: monthFmt.format(start).replace(".", ""),
        sublabel: String(start.getUTCFullYear()).slice(-2),
        dates,
      });
    }
    return { buckets, oldestDay: buckets[0].dates[0], today };
  }

  const days = range === "week" ? 7 : 30;
  const buckets: Bucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(
        todayUtc.getUTCFullYear(),
        todayUtc.getUTCMonth(),
        todayUtc.getUTCDate() - i,
      ),
    );
    const key = isoDay(d);
    buckets.push({
      key,
      label: range === "week" ? weekdayFmt.format(d) : String(d.getUTCDate()),
      sublabel: range === "week" ? String(d.getUTCDate()) : undefined,
      dates: [key],
    });
  }
  return { buckets, oldestDay: buckets[0].key, today };
}

export function intensityClass(ratio: number): string {
  if (ratio >= 1) return "bg-green-400";
  if (ratio >= 0.75) return "bg-green-500";
  if (ratio >= 0.5) return "bg-green-600";
  if (ratio >= 0.25) return "bg-green-700";
  if (ratio > 0) return "bg-green-900";
  return "bg-slate-700";
}
