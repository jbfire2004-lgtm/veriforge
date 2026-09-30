"use client";

import { useCallback, useEffect, useState } from "react";
import { useFieldMode } from "./FieldModeProvider";
import type { ConflictRecord } from "@/lib/field";
import { Button, Card, CardContent } from "@/components/ui";

export function ConflictResolverPanel() {
  const { syncEngine } = useFieldMode();
  const [rows, setRows] = useState<ConflictRecord[]>([]);

  const refresh = useCallback(async () => {
    setRows(await syncEngine.listConflicts());
  }, [syncEngine]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function resolve(id: string, keep: "client" | "server") {
    await syncEngine.resolveConflict(id, keep);
    await refresh();
  }

  const open = rows.filter((r) => !r.resolved);

  return (
    <div className="space-y-3">
      {open.length === 0 ? (
        <p className="text-sm text-muted-foreground">No unresolved conflicts.</p>
      ) : (
        open.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-2 pt-6">
              <p className="font-medium">{c.rule}</p>
              <p className="text-sm text-muted-foreground">{c.message}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => void resolve(c.id, "client")}>
                  Keep mine
                </Button>
                <Button size="sm" variant="outline" onClick={() => void resolve(c.id, "server")}>
                  Use server
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
