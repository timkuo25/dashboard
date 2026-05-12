"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsPanel from "@/components/StatsPanel";
import { getWeekStart, formatWeekLabel } from "@/lib/week";

type Entry = { id: string; type: "BUG" | "UI" | "MISC"; date: string };

type WeekBlock = {
  weekStart: string;
  label: string;
  total: number;
  byType: Record<string, number>;
};

const TYPE_COLORS: Record<string, string> = {
  BUG: "bg-red-900 text-red-300",
  UI: "bg-blue-900 text-blue-300",
  MISC: "bg-emerald-900 text-emerald-300",
};

export default function Home() {
  const [weeks, setWeeks] = useState<WeekBlock[]>([]);
  const [statsKey, setStatsKey] = useState(0);

  useEffect(() => {
    fetch("/api/entries")
      .then((r) => r.json())
      .then((entries: Entry[]) => {
        const map = new Map<string, WeekBlock>();
        for (const e of entries) {
          const ws = getWeekStart(new Date(e.date));
          if (!map.has(ws)) {
            map.set(ws, { weekStart: ws, label: formatWeekLabel(ws), total: 0, byType: { BUG: 0, UI: 0, MISC: 0 } });
          }
          const block = map.get(ws)!;
          block.total++;
          block.byType[e.type]++;
        }
        const sorted = Array.from(map.values()).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
        setWeeks(sorted);
      });
  }, [statsKey]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Work Dashboard</h1>
        </div>

        <StatsPanel key={statsKey} all />

        <div className="flex flex-col gap-3">
          {weeks.length === 0 && (
            <p className="text-gray-500 text-center py-12">No entries yet.</p>
          )}
          {weeks.map((w) => (
            <Link
              key={w.weekStart}
              href={`/week/${w.weekStart}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center justify-between transition-colors"
            >
              <div>
                <p className="text-white font-medium">{w.label}</p>
                <p className="text-gray-400 text-sm mt-0.5">{w.total} {w.total === 1 ? "entry" : "entries"}</p>
              </div>
              <div className="flex gap-2">
                {(["BUG", "UI", "MISC"] as const).filter((t) => w.byType[t] > 0).map((t) => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[t]}`}>
                    {t} {w.byType[t]}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
