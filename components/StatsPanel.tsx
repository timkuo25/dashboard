"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type Stats = {
  week: { total: number; byType: Record<string, number>; daily: { date: string; count: number }[] };
  month: { total: number; byType: Record<string, number> };
  bugDifficulty: Record<string, number>;
};

const TYPE_COLORS: Record<string, string> = {
  BUG: "#f87171",
  UI: "#60a5fa",
  MISC: "#34d399",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "#86efac",
  MEDIUM: "#fcd34d",
  HARD: "#f97316",
  VERY_HARD: "#ef4444",
  EXTREME: "#7c3aed",
};

export default function StatsPanel({ weekStart, all }: { weekStart?: string; all?: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const url = all ? "/api/stats?all=true" : weekStart ? `/api/stats?weekStart=${weekStart}` : "/api/stats";
    fetch(url).then((r) => r.json()).then(setStats);
  }, [weekStart, all]);

  if (!mounted || !stats) return <div className="text-gray-400 py-8 text-center">Loading stats...</div>;

  const typeDistData = Object.entries(stats.week.byType).map(([name, value]) => ({ name, value }));
  const difficultyData = Object.entries(stats.bugDifficulty).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-2">
        <p className="text-gray-400 text-sm">{all ? "Total" : "This Week"}</p>
        <p className="text-4xl font-bold text-white">{stats.week.total}</p>
        {!all && <p className="text-gray-400 text-sm">This Month: {stats.month.total}</p>}
        {!all && (
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={128} debounce={1}>
              <BarChart data={stats.week.daily}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "none" }} />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-2">{all ? "By Type" : "This Week by Type"}</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height={208} debounce={1}>
            <PieChart>
              <Pie data={typeDistData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={55} label>
                {typeDistData.map((entry) => (
                  <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? "#6b7280"} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: "#1f2937", border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-2">Task Difficulty</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height={176} debounce={1}>
            <BarChart data={difficultyData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} width={70} />
              <Tooltip contentStyle={{ background: "#1f2937", border: "none" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {difficultyData.map((entry) => (
                  <Cell key={entry.name} fill={DIFFICULTY_COLORS[entry.name] ?? "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
