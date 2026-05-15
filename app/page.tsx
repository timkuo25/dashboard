"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsPanel from "@/components/StatsPanel";
import AddEntryModal from "@/components/AddEntryModal";
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

function getMonthKey(weekStart: string): string {
  const d = new Date(weekStart);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year} 年 ${parseInt(month)} 月`;
}

export default function Home() {
  const [weeks, setWeeks] = useState<WeekBlock[]>([]);
  const [statsKey, setStatsKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  function loadEntries() {
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
        setCollapsedMonths(new Set(sorted.map((w) => getMonthKey(w.weekStart))));
      });
  }

  useEffect(() => { loadEntries(); }, [statsKey]);

  // Group weeks by month
  const monthGroups: { monthKey: string; weeks: WeekBlock[] }[] = [];
  for (const w of weeks) {
    const mk = getMonthKey(w.weekStart);
    const last = monthGroups[monthGroups.length - 1];
    if (last && last.monthKey === mk) {
      last.weeks.push(w);
    } else {
      monthGroups.push({ monthKey: mk, weeks: [w] });
    }
  }

  function toggleMonth(mk: string) {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(mk)) next.delete(mk);
      else next.add(mk);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Work Dashboard</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Entry
          </button>
        </div>

        <StatsPanel key={statsKey} all />

        <div className="flex flex-col gap-2">
          {weeks.length === 0 && (
            <p className="text-gray-500 text-center py-12">No entries yet.</p>
          )}
          {monthGroups.map(({ monthKey, weeks: mWeeks }) => {
            const isCollapsed = collapsedMonths.has(monthKey);
            const monthTotal = mWeeks.reduce((s, w) => s + w.total, 0);
            return (
              <div key={monthKey}>
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-gray-300 font-semibold text-sm">{formatMonthLabel(monthKey)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{monthTotal} {monthTotal === 1 ? "entry" : "entries"}</span>
                </button>

                {!isCollapsed && (
                  <div className="flex flex-col gap-2 mt-1 mb-2">
                    {mWeeks.map((w) => (
                      <Link
                        key={w.weekStart}
                        href={`/week/${w.weekStart}`}
                        className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex items-center justify-between transition-colors ml-4"
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
                )}
              </div>
            );
          })}
        </div>
      </main>

      {showModal && (
        <AddEntryModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setStatsKey((k) => k + 1); loadEntries(); }}
        />
      )}
    </div>
  );
}
