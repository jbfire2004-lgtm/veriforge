"use client";

import { useEffect, useState } from "react";
import { listOrientationWorkers } from "@/lib/orientation/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

type Props = { packageId: string };

export function OrientationWorkerList({ packageId }: Props) {
  const [rows, setRows] = useState<
    {
      id: string;
      status: string;
      quizScore: number | null;
      worker: { id: number; firstName: string; lastName: string };
    }[]
  >([]);

  useEffect(() => {
    void listOrientationWorkers(packageId).then(setRows);
  }, [packageId]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Worker</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Quiz</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              {r.worker.firstName} {r.worker.lastName}
            </TableCell>
            <TableCell>{r.status.replace(/_/g, " ")}</TableCell>
            <TableCell>{r.quizScore != null ? `${r.quizScore.toFixed(0)}%` : "—"}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-[#64748b]">
              Publish the package to link workers.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
