"use client";

import { useState } from "react";
import { useCompanyTrainingRequirements } from "@/hooks/useCompanyTrainingRequirements";

type Props = {
  companyId: number;
};

export default function CompanyTrainingRequirementsPanel({ companyId }: Props) {
  const { rows, loading, saving, error, add, update, remove } =
    useCompanyTrainingRequirements(companyId);
  const [courseName, setCourseName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("365");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftCourse, setDraftCourse] = useState("");
  const [draftDays, setDraftDays] = useState("");
  const [pending, setPending] = useState(false);

  async function onAdd() {
    const days = Number(expiresInDays);
    if (!courseName.trim() || !Number.isFinite(days) || days < 1) return;
    setPending(true);
    try {
      await add(courseName.trim(), Math.floor(days));
      setCourseName("");
      setExpiresInDays("365");
    } finally {
      setPending(false);
    }
  }

  function startEdit(row: {
    id: number;
    courseName: string;
    expiresInDays: number;
  }) {
    setEditingId(row.id);
    setDraftCourse(row.courseName);
    setDraftDays(String(row.expiresInDays));
  }

  async function saveEdit() {
    if (editingId == null) return;
    const days = Number(draftDays);
    if (!draftCourse.trim() || !Number.isFinite(days) || days < 1) return;
    setPending(true);
    try {
      await update(editingId, {
        courseName: draftCourse.trim(),
        expiresInDays: Math.floor(days),
      });
      setEditingId(null);
    } finally {
      setPending(false);
    }
  }

  async function onRemove(id: number) {
    setPending(true);
    try {
      await remove(id);
      if (editingId === id) setEditingId(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Company training requirements</h2>
      <p className="text-sm text-gray-600">
        Courses workers must complete for compliance checks (matched to training
        records by course name).
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading requirements…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 items-end border-b pb-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">Course name</span>
              <input
                className="border rounded px-3 py-2 w-64 text-black"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Fall Protection"
                disabled={pending || saving}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">Valid for (days)</span>
              <input
                type="number"
                min={1}
                className="border rounded px-3 py-2 w-28 text-black"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                disabled={pending || saving}
              />
            </label>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              disabled={pending || saving}
              onClick={() => void onAdd()}
            >
              {saving ? "Saving…" : "Add requirement"}
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-gray-500">
              No company-wide requirements yet.
            </p>
          ) : (
            <ul className="divide-y border rounded">
              {rows.map((r) => (
                <li key={r.id} className="px-3 py-3 text-sm space-y-2">
                  {editingId === r.id ? (
                    <div className="flex flex-wrap gap-2 items-end">
                      <input
                        className="border rounded px-2 py-1 w-56 text-black"
                        value={draftCourse}
                        onChange={(e) => setDraftCourse(e.target.value)}
                        disabled={pending}
                      />
                      <input
                        type="number"
                        min={1}
                        className="border rounded px-2 py-1 w-24 text-black"
                        value={draftDays}
                        onChange={(e) => setDraftDays(e.target.value)}
                        disabled={pending}
                      />
                      <button
                        type="button"
                        className="rounded-[3px] border border-[#1F2328] bg-[#2A2E33] px-3 py-1 text-sm font-medium text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#343940] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] disabled:opacity-50"
                        disabled={pending}
                        onClick={() => void saveEdit()}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 border rounded text-sm"
                        disabled={pending}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-medium text-gray-900">
                          {r.courseName}
                        </span>
                        <span className="text-gray-500 ml-2">
                          renew every {r.expiresInDays} days
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline text-sm"
                          disabled={pending}
                          onClick={() => startEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline text-sm"
                          disabled={pending}
                          onClick={() => void onRemove(r.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
