"use client";

import { useState } from "react";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { ImpersonationPanel } from "@/src/components/developer";

export default function DeveloperImpersonatePage() {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <DeveloperShell
      title="Impersonation"
      description="Start a support impersonation session for an organization."
    >
      {msg ? <p className="mb-4 text-sm text-zinc-700">{msg}</p> : null}
      <ImpersonationPanel onDone={setMsg} />
    </DeveloperShell>
  );
}
