"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  onAdded: () => void;
  defaultDate?: string;
};

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY_HARD", "EXTREME"];

export default function AddEntryModal({ onClose, onAdded, defaultDate }: Props) {
  const [type, setType] = useState<"BUG" | "UI" | "MISC">("BUG");
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const [bugContent, setBugContent] = useState({ bugUrl: "", description: "", difficulty: "MEDIUM", customer: "", branch: "" });
  const [uiContent, setUiContent] = useState({ clientName: "", figmaUrl: "", customer: "", branch: "" });
  const [miscContent, setMiscContent] = useState({ description: "", customer: "", branch: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const content = type === "BUG" ? bugContent : type === "UI" ? uiContent : miscContent;
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, date, content }),
    });
    setLoading(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Add Work Entry</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(["BUG", "UI", "MISC"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  type === t ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          />

          {type === "BUG" && (
            <>
              <input placeholder="eBug URL" value={bugContent.bugUrl} onChange={(e) => setBugContent({ ...bugContent, bugUrl: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Short description" value={bugContent.description} onChange={(e) => setBugContent({ ...bugContent, description: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <select value={bugContent.difficulty} onChange={(e) => setBugContent({ ...bugContent, difficulty: e.target.value })} className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input placeholder="Customer" value={bugContent.customer} onChange={(e) => setBugContent({ ...bugContent, customer: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Branch" value={bugContent.branch} onChange={(e) => setBugContent({ ...bugContent, branch: e.target.value })} className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
            </>
          )}

          {type === "UI" && (
            <>
              <input placeholder="Client name" value={uiContent.clientName} onChange={(e) => setUiContent({ ...uiContent, clientName: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Figma URL" value={uiContent.figmaUrl} onChange={(e) => setUiContent({ ...uiContent, figmaUrl: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Customer" value={uiContent.customer} onChange={(e) => setUiContent({ ...uiContent, customer: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Branch" value={uiContent.branch} onChange={(e) => setUiContent({ ...uiContent, branch: e.target.value })} className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
            </>
          )}

          {type === "MISC" && (
            <>
              <input placeholder="Description" value={miscContent.description} onChange={(e) => setMiscContent({ ...miscContent, description: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Customer" value={miscContent.customer} onChange={(e) => setMiscContent({ ...miscContent, customer: e.target.value })} required className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
              <input placeholder="Branch" value={miscContent.branch} onChange={(e) => setMiscContent({ ...miscContent, branch: e.target.value })} className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400" />
            </>
          )}

          <div className="flex gap-2 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-50">
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
