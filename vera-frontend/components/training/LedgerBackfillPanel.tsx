"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, Loader2 } from "lucide-react";
import { backfillCredentialLedger, type LedgerBackfillResult } from "@/lib/credential-ledger";
import { unknownToErrorMessage } from "@/lib/core";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export function LedgerBackfillPanel({
  defaultCompanyId,
}: {
  defaultCompanyId?: number;
}) {
  const [companyId, setCompanyId] = useState(
    defaultCompanyId != null ? String(defaultCompanyId) : "",
  );
  const [limit, setLimit] = useState("500");
  const [dryRun, setDryRun] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LedgerBackfillResult | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const cid = companyId.trim() ? parseInt(companyId, 10) : undefined;
      const res = await backfillCredentialLedger({
        companyId: Number.isFinite(cid) ? cid : undefined,
        limit: parseInt(limit, 10) || 500,
        dryRun,
      });
      setResult(res);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-[#2A2E33]/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-[#247A78]" aria-hidden />
          Credential ledger backfill
        </CardTitle>
        <CardDescription>
          Reconstruct immutable ledger events for training records created before the
          ledger shipped. Run a dry run first, then commit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="backfill-company">Company ID (optional)</Label>
            <Input
              id="backfill-company"
              inputMode="numeric"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="All companies"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="backfill-limit">Batch limit</Label>
            <Input
              id="backfill-limit"
              inputMode="numeric"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
          />
          Dry run (preview only — no writes)
        </label>

        {error ? <CoreAlert variant="error">{error}</CoreAlert> : null}

        {result ? (
          <CoreAlert variant={result.dryRun ? "info" : "success"}>
            <p className="font-medium">
              {result.dryRun ? "Dry run complete" : "Backfill complete"}
            </p>
            <ul className="mt-2 list-inside list-disc text-sm">
              <li>Scanned: {result.scanned}</li>
              <li>Records backfilled: {result.recordsBackfilled}</li>
              <li>Skipped (already had ledger): {result.recordsSkipped}</li>
              <li>Events {result.dryRun ? "planned" : "created"}: {result.eventsCreated}</li>
              {result.errors.length > 0 ? (
                <li className="text-amber-800">Errors: {result.errors.length}</li>
              ) : null}
            </ul>
          </CoreAlert>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => void run()}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {dryRun ? "Run dry run" : "Run backfill"}
          </Button>
          <Link
            href="/admin/training"
            className="text-sm text-[#247A78] underline underline-offset-2 self-center"
          >
            Training records
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
