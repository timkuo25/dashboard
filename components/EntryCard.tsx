"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { maskCustomer, maskTitle } from "@/lib/guest-mask";

type BugEntry = { bugUrl: string; description: string; difficulty: string; customer: string; branch: string };
type UIEntry = { clientName: string; figmaUrl: string; difficulty: string | null; customer: string; branch: string };
type MiscEntry = { description: string; difficulty: string | null; customer: string; branch: string };

type WorkEntry = {
  id: string;
  type: "BUG" | "UI" | "MISC";
  date: string;
  bugEntry?: BugEntry | null;
  uiEntry?: UIEntry | null;
  miscEntry?: MiscEntry | null;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-green-900 text-green-300",
  MEDIUM: "bg-yellow-900 text-yellow-300",
  HARD: "bg-orange-900 text-orange-300",
  VERY_HARD: "bg-red-900 text-red-300",
  EXTREME: "bg-purple-900 text-purple-300",
};

const TYPE_BADGE: Record<string, string> = {
  BUG: "bg-red-900 text-red-300",
  UI: "bg-blue-900 text-blue-300",
  MISC: "bg-emerald-900 text-emerald-300",
};

function Meta({ customer, branch }: { customer: string; branch: string }) {
  return (
    <div className="flex gap-2 mt-1">
      {customer && <span className="text-xs text-gray-400">👤 {customer}</span>}
      {branch && <span className="text-xs text-gray-400">🌿 {branch}</span>}
    </div>
  );
}

export default function EntryCard({ entry, onDelete, showDate }: { entry: WorkEntry; onDelete?: (id: string) => void; showDate?: boolean }) {
  const { isAdmin } = useAuth();
  const dateLabel = showDate
    ? new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
    : null;
  return (
    <div className="relative bg-gray-800 rounded-xl p-4 pr-10">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[entry.type]}`}>
          {entry.type}
        </span>
        {dateLabel && <span className="text-xs text-gray-500">{dateLabel}</span>}
      </div>

      {entry.type === "BUG" && entry.bugEntry && (() => {
        const { bugUrl, description, difficulty, customer, branch } = entry.bugEntry;
        const displayCustomer = isAdmin ? customer : maskCustomer(customer);
        const displayTitle = isAdmin ? description : maskTitle(description, customer);
        return (
          <div className="flex flex-col gap-0.5">
            <Link href={`/entries/${entry.id}`} className="text-white text-base font-bold hover:text-indigo-300 w-fit">
              {displayTitle}
            </Link>
            {isAdmin && (
              <a href={bugUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs truncate hover:underline w-fit max-w-full">
                {bugUrl}
              </a>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${DIFFICULTY_COLORS[difficulty]}`}>
              {difficulty}
            </span>
            <Meta customer={displayCustomer} branch={isAdmin ? branch : ""} />
          </div>
        );
      })()}

      {entry.type === "UI" && entry.uiEntry && (() => {
        const { clientName, figmaUrl, difficulty, customer, branch } = entry.uiEntry;
        const displayCustomer = isAdmin ? customer : maskCustomer(customer);
        const displayTitle = isAdmin ? clientName : maskTitle(clientName, customer);
        return (
          <div className="flex flex-col gap-0.5">
            <Link href={`/entries/${entry.id}`} className="text-white text-base font-bold hover:text-indigo-300 w-fit">
              {displayTitle}
            </Link>
            {isAdmin && figmaUrl && (
              <a href={figmaUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs truncate hover:underline w-fit max-w-full">
                {figmaUrl}
              </a>
            )}
            {difficulty && (
              <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${DIFFICULTY_COLORS[difficulty]}`}>
                {difficulty}
              </span>
            )}
            <Meta customer={displayCustomer} branch={isAdmin ? branch : ""} />
          </div>
        );
      })()}

      {entry.type === "MISC" && entry.miscEntry && (() => {
        const { description, difficulty, customer, branch } = entry.miscEntry;
        const displayCustomer = isAdmin ? customer : maskCustomer(customer);
        const displayTitle = isAdmin ? description : maskTitle(description, customer);
        return (
          <div className="flex flex-col gap-0.5">
            <Link href={`/entries/${entry.id}`} className="text-white text-base font-bold hover:text-indigo-300 w-fit">
              {displayTitle}
            </Link>
            {difficulty && (
              <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${DIFFICULTY_COLORS[difficulty]}`}>
                {difficulty}
              </span>
            )}
            <Meta customer={displayCustomer} branch={isAdmin ? branch : ""} />
          </div>
        );
      })()}

      {isAdmin && onDelete && (
      <button
        onClick={() => onDelete(entry.id)}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 text-lg"
        aria-label="Delete"
      >
        ×
      </button>
      )}
    </div>
  );
}
