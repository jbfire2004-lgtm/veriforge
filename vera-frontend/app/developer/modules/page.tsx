"use client";

import { useCallback, useEffect, useState } from "react";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { ModuleBuilder } from "@/src/components/developer";
import { developerApi } from "@/lib/developer-api";

export default function DeveloperModulesPage() {
  const [modules, setModules] = useState<
    { code: string; name: string; isActive: boolean }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    developerApi
      .listModules()
      .then((data) => setModules(data.modules ?? []))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <DeveloperShell
      title="Module builder"
      description="Create and update platform modules."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <ModuleBuilder modules={modules} onRefresh={reload} />
    </DeveloperShell>
  );
}
