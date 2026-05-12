export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split("T")[0];
}

export function getWeekRange(weekStart: string): { mon: Date; fri: Date } {
  const mon = new Date(`${weekStart}T00:00:00.000Z`);
  const fri = new Date(mon);
  fri.setUTCDate(mon.getUTCDate() + 4);
  return { mon, fri };
}

export function formatWeekLabel(weekStart: string): string {
  const { mon, fri } = getWeekRange(weekStart);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const year = fri.getUTCFullYear();
  return `${fmt(mon)} – ${fmt(fri)}, ${year}`;
}

export function getDaysOfWeek(weekStart: string): { label: string; dateStr: string }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return days.map((label, i) => {
    const d = new Date(`${weekStart}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return { label, dateStr: d.toISOString().split("T")[0] };
  });
}
