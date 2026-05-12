"use client";

import { useState } from "react";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY_HARD", "EXTREME"];

type BugEntry = { bugUrl: string; description: string; difficulty: string; customer: string; branch: string };
type UIEntry = { clientName: string; figmaUrl: string; customer: string; branch: string };
type MiscEntry = { description: string; customer: string; branch: string };

type WorkEntry = {
  id: string;
  type: "BUG" | "UI" | "MISC";
  date: string;
  bugEntry?: BugEntry | null;
  uiEntry?: UIEntry | null;
  miscEntry?: MiscEntry | null;
};

type Props = {
  entry: WorkEntry;
  onSaved: (updated: WorkEntry) => void;
  onCancel: () => void;
};

const DEFAULT_BUG: BugEntry = { bugUrl: "", description: "", difficulty: "MEDIUM", customer: "", branch: "" };
const DEFAULT_UI: UIEntry = { clientName: "", figmaUrl: "", customer: "", branch: "" };
const DEFAULT_MISC: MiscEntry = { description: "", customer: "", branch: "" };

export default function EditEntryForm({ entry, onSaved, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<"BUG" | "UI" | "MISC">(entry.type);
  const [date, setDate] = useState(new Date(entry.date).toISOString().split("T")[0]);
  const [bugContent, setBugContent] = useState<BugEntry>(entry.bugEntry ?? DEFAULT_BUG);
  const [uiContent, setUiContent] = useState<UIEntry>(entry.uiEntry ?? DEFAULT_UI);
  const [miscContent, setMiscContent] = useState<MiscEntry>(entry.miscEntry ?? DEFAULT_MISC);

  async function handleSave() {
    setSaving(true);
    const content = type === "BUG" ? bugContent : type === "UI" ? uiContent : miscContent;
    const res = await fetch(`/api/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, date, content }),
    });
    const updated = await res.json();
    setSaving(false);
    onSaved(updated);
  }

  const inputCls = "bg-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full placeholder-gray-400";
  const labelCls = "text-xs text-gray-400 mb-1";

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-4">
      <div>
        <p className={labelCls}>Type</p>
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
      </div>

      <div>
        <p className={labelCls}>Date</p>
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {type === "BUG" && (
        <>
          <div>
            <p className={labelCls}>eBug URL</p>
            <input className={inputCls} value={bugContent.bugUrl} onChange={(e) => setBugContent({ ...bugContent, bugUrl: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Description</p>
            <input className={inputCls} value={bugContent.description} onChange={(e) => setBugContent({ ...bugContent, description: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Difficulty</p>
            <select className={inputCls} value={bugContent.difficulty} onChange={(e) => setBugContent({ ...bugContent, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <p className={labelCls}>Customer</p>
            <input className={inputCls} value={bugContent.customer} onChange={(e) => setBugContent({ ...bugContent, customer: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Branch</p>
            <input className={inputCls} value={bugContent.branch} onChange={(e) => setBugContent({ ...bugContent, branch: e.target.value })} />
          </div>
        </>
      )}

      {type === "UI" && (
        <>
          <div>
            <p className={labelCls}>Client Name</p>
            <input className={inputCls} value={uiContent.clientName} onChange={(e) => setUiContent({ ...uiContent, clientName: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Figma URL</p>
            <input className={inputCls} value={uiContent.figmaUrl} onChange={(e) => setUiContent({ ...uiContent, figmaUrl: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Customer</p>
            <input className={inputCls} value={uiContent.customer} onChange={(e) => setUiContent({ ...uiContent, customer: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Branch</p>
            <input className={inputCls} value={uiContent.branch} onChange={(e) => setUiContent({ ...uiContent, branch: e.target.value })} />
          </div>
        </>
      )}

      {type === "MISC" && (
        <>
          <div>
            <p className={labelCls}>Description</p>
            <input className={inputCls} value={miscContent.description} onChange={(e) => setMiscContent({ ...miscContent, description: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Customer</p>
            <input className={inputCls} value={miscContent.customer} onChange={(e) => setMiscContent({ ...miscContent, customer: e.target.value })} />
          </div>
          <div>
            <p className={labelCls}>Branch</p>
            <input className={inputCls} value={miscContent.branch} onChange={(e) => setMiscContent({ ...miscContent, branch: e.target.value })} />
          </div>
        </>
      )}

      <div className="flex gap-2 mt-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
