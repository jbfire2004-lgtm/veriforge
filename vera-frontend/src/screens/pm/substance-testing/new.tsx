"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreateTestForm } from "@/components/substance-testing/CreateTestForm";
import { Button } from "@/components/ui/button";

export default function NewSubstanceTestPage({
  companyId = 1,
  projectId = 1,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const router = useRouter();
  const [workerIdInput, setWorkerIdInput] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const workerId = confirmed ? parseInt(workerIdInput, 10) : 0;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-[#2A2E33]">Schedule drug/alcohol test</h1>

      {!confirmed ? (
        <div className="space-y-3 rounded-2xl border border-[#2A2E33]/10 bg-white p-6">
          <label className="text-sm font-medium text-[#2A2E33]">Worker ID</label>
          <input
            type="number"
            className="w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            placeholder="Enter worker ID"
            value={workerIdInput}
            onChange={(e) => setWorkerIdInput(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            placeholder="Worker name (display)"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={!workerIdInput}
            onClick={() => setConfirmed(true)}
          >
            Continue
          </Button>
        </div>
      ) : (
        <CreateTestForm
          companyId={companyId}
          projectId={projectId}
          workerId={workerId}
          workerName={workerName || `Worker #${workerId}`}
          onCreated={(testId) =>
            router.push(`/pm/substance-testing/${testId}?projectId=${projectId}`)
          }
        />
      )}
    </div>
  );
}
