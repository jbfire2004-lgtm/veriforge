"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type AssignmentRow = {
  id: number;
  assignedAt: string;
  returnedAt: string | null;
  equipment?: { name?: string | null } | null;
  worker?: { firstName?: string | null; lastName?: string | null } | null;
  company?: { name?: string | null } | null;
};

export default function EquipmentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returning, setReturning] = useState<number | null>(null);
  const toast = useToast();

  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await apiGet<AssignmentRow[]>("/equipment-assignments");
        if (!cancelled) {
          setAssignments(rows);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setAssignments([]);
          setError(e instanceof Error ? e.message : "Could not load assignments.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const returnAssignment = async (id: number) => {
    setReturning(id);
    try {
      await apiPatch(`/equipment-assignments/${id}/return`, {});
      toast.toast({ title: "Assignment returned.", variant: "success" });
      reload();
    } catch (e) {
      toast.toast({
        title: "Could not return assignment.",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setReturning(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Assignments</h1>
        <Link
          href="/equipment-assignments/create"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Assign Equipment
        </Link>
      </div>

      {error != null ? (
        <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Equipment</th>
            <th className="p-2 border">Assigned To</th>
            <th className="p-2 border">Assigned At</th>
            <th className="p-2 border">Returned</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {assignments === null ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                Loading…
              </td>
            </tr>
          ) : assignments.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-sm text-gray-500">
                No assignments.
              </td>
            </tr>
          ) : (
            assignments.map((a) => (
              <tr key={a.id} className="border">
                <td className="p-2 border">{a.equipment?.name ?? "—"}</td>
                <td className="p-2 border">
                  {a.worker
                    ? `${a.worker.firstName ?? ""} ${a.worker.lastName ?? ""}`.trim()
                    : a.company?.name ?? "—"}
                </td>
                <td className="p-2 border">
                  {new Date(a.assignedAt).toLocaleString()}
                </td>
                <td className="p-2 border">
                  {a.returnedAt
                    ? new Date(a.returnedAt).toLocaleString()
                    : "Active"}
                </td>
                <td className="p-2 border">
                  {!a.returnedAt && (
                    <button
                      type="button"
                      disabled={returning === a.id}
                      onClick={() => returnAssignment(a.id)}
                      className="rounded-[3px] border border-[#A8842F] bg-[#C89F3D] px-3 py-1 text-sm font-medium text-[#1C1A10] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#B89136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
                    >
                      {returning === a.id ? "Returning…" : "Return"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
