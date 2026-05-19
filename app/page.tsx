"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsPanel from "@/components/StatsPanel";
import AddEntryModal from "@/components/AddEntryModal";
import RecentBranches from "@/components/RecentBranches";
import { getWeekStart, formatWeekLabel } from "@/lib/week";
import { useAuth } from "@/components/AuthProvider";

type Entry = { id: string; type: "BUG" | "UI" | "MISC"; date: string };

type SearchResult = {
  id: string;
  type: "BUG" | "UI" | "MISC";
  date: string;
  bugEntry?:  { branch: string; customer: string; description: string; difficulty: string; bugUrl: string } | null;
  uiEntry?:   { branch: string; customer: string; clientName: string; figmaUrl: string } | null;
  miscEntry?: { branch: string; customer: string; description: string } | null;
};

function getResultMeta(r: SearchResult) {
  const sub = r.bugEntry ?? r.uiEntry ?? r.miscEntry;
  const title = r.bugEntry?.description ?? r.uiEntry?.clientName ?? r.miscEntry?.description ?? "—";
  return { title, branch: sub?.branch ?? "", customer: sub?.customer ?? "" };
}

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
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export default function Home() {
  const { isAdmin } = useAuth();
  const [weeks, setWeeks] = useState<WeekBlock[]>([]);
  const [statsKey, setStatsKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = searchInput.trim();
    if (!q) { setSearchResults(null); setIsSearching(false); return; }
    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data: SearchResult[]) => { setSearchResults(data); setIsSearching(false); });
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Work Dashboard</h1>
          {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Entry
          </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          <div>
            {/* Search bar */}
            <div className="relative mb-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search branch, customer, task…"
                className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results */}
            {searchInput.trim() ? (
              <div className="flex flex-col gap-2">
                {isSearching && (
                  <p className="text-gray-500 text-sm text-center py-4">Searching…</p>
                )}
                {!isSearching && searchResults !== null && searchResults.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No results for &ldquo;{searchInput.trim()}&rdquo;</p>
                )}
                {!isSearching && searchResults && searchResults.map((r) => {
                  const { title, branch, customer } = getResultMeta(r);
                  return (
                    <Link
                      key={r.id}
                      href={`/entries/${r.id}`}
                      className="bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 flex items-start justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{title}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          {branch && <span className="font-mono">{branch}</span>}
                          {customer && <span>{customer}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[r.type]}`}>{r.type}</span>
                        <span className="text-gray-500 text-xs">{r.date.slice(0, 10)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
            <>
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
            </>
            )}
          </div>

          <aside className="lg:sticky lg:top-8">
            <RecentBranches key={statsKey} />
          </aside>
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
