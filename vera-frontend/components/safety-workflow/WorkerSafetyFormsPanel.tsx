"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchSafetyWorkflowForms, type SafetyWorkflowForm } from "@/lib/safety-workflow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

export function WorkerSafetyFormsPanel({ workerId }: { workerId: number }) {
  const [forms, setForms] = useState<SafetyWorkflowForm[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await fetchSafetyWorkflowForms({ workerId });
      setForms(rows);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safety forms</CardTitle>
        <CardDescription>JHA, FLHA, SIF, HECA, inspections, and related submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : forms.length === 0 ? (
          <p className="text-sm text-vera-muted">No safety forms for this worker.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.formType ?? f.definitionId}</TableCell>
                  <TableCell>
                    <Link
                      href={`/pm/safety-forms/${f.id}`}
                      className="font-medium hover:text-vera-teal hover:underline"
                    >
                      {f.title ?? "View form"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone="neutral" subtle>
                      {f.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="text-sm text-vera-muted">
                    {new Date(f.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
