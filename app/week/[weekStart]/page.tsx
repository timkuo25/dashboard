"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import EntryCard from "@/components/EntryCard";
import StatsPanel from "@/components/StatsPanel";
import { formatWeekLabel } from "@/lib/week";

type WorkEntry = {
  id: string;
  type: "BUG" | "UI" | "MISC";
  date: string;
  bugEntry?: { bugUrl: string; description: string; difficulty: string; customer: string; branch: string } | null;
  uiEntry?: { clientName: string; figmaUrl: string; difficulty: string | null; customer: string; branch: string } | null;
  miscEntry?: { description: string; difficulty: string | null; customer: string; branch: string } | null;
};

const TYPE_LABEL: Record<string, string> = {
  BUG: "Bug Fixes",
  UI: "Custom UI",
  MISC: "Misc",
};

const TYPE_ORDER = ["BUG", "UI", "MISC"] as const;

export default function WeekPage({ params }: { params: Promise<{ weekStart: string }> }) {
  const [weekStart, setWeekStart] = useState("");
  const [entries, setEntries] = useState<WorkEntry[]>([]);

  const fetchEntries = useCallback((ws: string) => {
    fetch(`/api/entries?weekStart=${ws}`)
      .then((r) => r.json())
      .then(setEntries);
  }, []);

  useEffect(() => {
    params.then(({ weekStart: ws }) => {
      setWeekStart(ws);
      fetchEntries(ws);
    });
  }, [params, fetchEntries]);

  async function handleDelete(id: string) {
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (!weekStart) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  const byType = Object.fromEntries(TYPE_ORDER.map((t) => [t, entries.filter((e) => e.type === t)]));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white text-sm">← Back</Link>
            <h1 className="text-lg font-semibold">{formatWeekLabel(weekStart)}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <StatsPanel weekStart={weekStart} />
          {TYPE_ORDER.map((type) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-200">{TYPE_LABEL[type]}</h2>
                <span className="text-xs text-gray-500">{byType[type].length}</span>
              </div>
              {byType[type].length === 0 ? (
                <p className="text-gray-600 text-sm pl-1">—</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {byType[type].map((entry) => (
                    <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} showDate />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
