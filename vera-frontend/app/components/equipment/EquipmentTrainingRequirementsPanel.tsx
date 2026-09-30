"use client";

import { useMemo, useState } from "react";
import { useEquipmentTrainingRequirements } from "@/hooks/useEquipmentTrainingRequirements";

type Props = {
  equipmentId: number;
};

export default function EquipmentTrainingRequirementsPanel({
  equipmentId,
}: Props) {
  const { rows, certifications, loading, error, add, remove } =
    useEquipmentTrainingRequirements(equipmentId);
  const [selectedCertId, setSelectedCertId] = useState<string>("");
  const [pending, setPending] = useState(false);

  const usedCertIds = useMemo(
    () => new Set(rows.map((r) => r.certificationId)),
    [rows]
  );

  const availableCerts = useMemo(
    () => certifications.filter((c) => !usedCertIds.has(c.id)),
    [certifications, usedCertIds]
  );

  async function onAdd() {
    const id = Number(selectedCertId);
    if (!id) return;
    setPending(true);
    try {
      await add(id);
      setSelectedCertId("");
    } finally {
      setPending(false);
    }
  }

  async function onRemove(id: number) {
    setPending(true);
    try {
      await remove(id);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Required certifications</h2>
      <p className="text-sm text-gray-600">
        Operators must hold these certifications before using this equipment.
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
          <div className="flex flex-wrap gap-2 items-end">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">Certification</span>
              <select
                className="border rounded px-3 py-2 min-w-[220px] text-black"
                value={selectedCertId}
                onChange={(e) => setSelectedCertId(e.target.value)}
                disabled={pending || availableCerts.length === 0}
              >
                <option value="">
                  {availableCerts.length === 0
                    ? "All certifications linked"
                    : "Select…"}
                </option>
                {availableCerts.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                    {c.code ? ` (${c.code})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              disabled={
                pending || !selectedCertId || availableCerts.length === 0
              }
              onClick={() => void onAdd()}
            >
              Add requirement
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-gray-500">
              No certification requirements yet.
            </p>
          ) : (
            <ul className="divide-y border rounded">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {r.certification.name}
                    </span>
                    {r.certification.code && (
                      <span className="text-gray-500 ml-2">
                        ({r.certification.code})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:underline text-sm disabled:opacity-50"
                    disabled={pending}
                    onClick={() => void onRemove(r.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
