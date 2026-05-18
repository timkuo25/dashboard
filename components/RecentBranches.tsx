"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BranchItem = {
  branch: string;
  date: string;
  type: "BUG" | "UI" | "MISC";
  entryId: string;
};

const TYPE_COLORS: Record<string, string> = {
  BUG: "bg-red-900 text-red-300",
  UI: "bg-blue-900 text-blue-300",
  MISC: "bg-emerald-900 text-emerald-300",
};

export default function RecentBranches() {
  const [branches, setBranches] = useState<BranchItem[]>([]);

  useEffect(() => {
    fetch("/api/branches")
      .then((r) => r.json())
      .then(setBranches);
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Recent Branches
      </h2>
      {branches.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No branches yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {branches.map((b) => (
            <li key={b.branch}>
              <Link
                href={`/entries/${b.entryId}`}
                className="flex items-start justify-between gap-2 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-mono truncate group-hover:text-indigo-300 transition-colors">
                    {b.branch}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{b.date}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${TYPE_COLORS[b.type]}`}>
                  {b.type}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
