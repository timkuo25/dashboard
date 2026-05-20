"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EditEntryForm from "@/components/EditEntryForm";
import { getWeekStart } from "@/lib/week";
import { useAuth } from "@/components/AuthProvider";

function maskCustomer(customer: string): string {
  if (!customer) return "";
  return "Brand " + customer.charAt(0).toUpperCase();
}

function maskTitle(title: string, customer: string): string {
  if (!customer || !title) return title;
  const escaped = customer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return title.replace(new RegExp(escaped, "gi"), "").replace(/\s+/g, " ").trim();
}

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

type Entry = {
  id: string;
  type: "BUG" | "UI" | "MISC";
  date: string;
  bugEntry?: { bugUrl: string; description: string; difficulty: string; customer: string; branch: string } | null;
  uiEntry?: { clientName: string; figmaUrl: string; difficulty: string | null; customer: string; branch: string } | null;
  miscEntry?: { description: string; difficulty: string | null; customer: string; branch: string } | null;
};

export default function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [editing, setEditing] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/entries/${id}`)
        .then((r) => r.json())
        .then(setEntry);
    });
  }, [params]);

  if (!entry) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const weekStart = getWeekStart(new Date(entry.date));
  const date = new Date(entry.date).toLocaleDateString("en-CA");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/week/${weekStart}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
          >
            ← Back
          </Link>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[entry.type]}`}>
            {entry.type}
          </span>
          <span className="text-gray-400 text-sm">{date}</span>
        </div>
        {!editing && (
          isAdmin ? (
          <button
            onClick={() => setEditing(true)}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Edit
          </button>
          ) : null
        )}
      </div>

      {!editing ? (
        <div className="bg-gray-800 rounded-xl p-5">
          {entry.type === "BUG" && entry.bugEntry && (() => {
            const { bugUrl, description, difficulty, customer, branch } = entry.bugEntry;
            const displayCustomer = isAdmin ? customer : maskCustomer(customer);
            const displayTitle = isAdmin ? description : maskTitle(description, customer);
            return (
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <a href={bugUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm break-all">
                    {bugUrl}
                  </a>
                )}
                <p className="text-white">{displayTitle}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${DIFFICULTY_COLORS[difficulty]}`}>
                  {difficulty}
                </span>
                <div className="flex gap-4 mt-1">
                  <span className="text-sm text-gray-400">Customer: <span className="text-white">{displayCustomer || "—"}</span></span>
                  {isAdmin && <span className="text-sm text-gray-400">Branch: <span className="text-white">{branch || "—"}</span></span>}
                </div>
              </div>
            );
          })()}
          {entry.type === "UI" && entry.uiEntry && (() => {
            const { clientName, figmaUrl, customer, branch } = entry.uiEntry;
            const displayCustomer = isAdmin ? customer : maskCustomer(customer);
            const displayTitle = isAdmin ? clientName : maskTitle(clientName, customer);
            return (
              <div className="flex flex-col gap-2">
                <p className="text-white font-medium">{displayTitle}</p>
                {isAdmin && (
                  <a href={figmaUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm break-all">
                    {figmaUrl}
                  </a>
                )}
                <div className="flex gap-4 mt-1">
                  <span className="text-sm text-gray-400">Customer: <span className="text-white">{displayCustomer || "—"}</span></span>
                  {isAdmin && <span className="text-sm text-gray-400">Branch: <span className="text-white">{branch || "—"}</span></span>}
                </div>
              </div>
            );
          })()}
          {entry.type === "MISC" && entry.miscEntry && (() => {
            const { description, customer, branch } = entry.miscEntry;
            const displayCustomer = isAdmin ? customer : maskCustomer(customer);
            const displayTitle = isAdmin ? description : maskTitle(description, customer);
            return (
              <div className="flex flex-col gap-2">
                <p className="text-white">{displayTitle}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-sm text-gray-400">Customer: <span className="text-white">{displayCustomer || "—"}</span></span>
                  {isAdmin && <span className="text-sm text-gray-400">Branch: <span className="text-white">{branch || "—"}</span></span>}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <EditEntryForm
          entry={entry}
          onSaved={(updated) => { setEntry(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}
      </main>
    </div>
  );
}
