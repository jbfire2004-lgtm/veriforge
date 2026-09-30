"use client";

import { useState } from "react";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { ModuleManagerForm } from "@/src/components/forms";
import { BillingSummary } from "@/src/components/billing";
import {
  useSubscriptionBilling,
  useSubscriptionModules,
  veriforgeMutations,
} from "@/lib/veriforge-hooks";

export default function VeriHubModulesPage() {
  const modules = useSubscriptionModules();
  const billing = useSubscriptionBilling();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onToggle(code: string, enabled: boolean) {
    setBusy(code);
    setError(null);
    try {
      await veriforgeMutations.updateSubscriptionModules([{ code, enabled }]);
      await Promise.all([modules.reload(), billing.reload()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <VeriHubConsoleShell
      title="Modules"
      description="Enable product modules, review pricing, and monitor usage."
    >
      {error || modules.error ? (
        <p className="mb-4 text-sm text-red-600">
          {error ?? modules.error}
        </p>
      ) : null}
      <div className="mb-6">
        <BillingSummary billing={billing.data} modules={modules.data} />
      </div>
      {modules.loading || !modules.data ? (
        <p className="text-sm text-zinc-500">Loading modules…</p>
      ) : (
        <ModuleManagerForm
          modules={modules.data.modules}
          busyCode={busy}
          onToggle={onToggle}
        />
      )}
    </VeriHubConsoleShell>
  );
}
