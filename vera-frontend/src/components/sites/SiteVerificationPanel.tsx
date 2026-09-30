"use client";

import { useState } from "react";
import { verifySite, type SiteVerifyDto } from "@/src/api/sites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Calls GET /api/v1/sites/:id/verify — lightweight gate check that the site exists and is active.
 */
export function SiteVerificationPanel() {
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SiteVerifyDto | null>(null);

  async function runVerify() {
    const id = parseInt(idInput, 10);
    if (!Number.isFinite(id) || id < 1) {
      setError("Enter a positive numeric site id.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifySite(id);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site verification</CardTitle>
        <CardDescription>
          Endpoint: <code className="text-xs">GET /api/v1/sites/&#123;id&#125;/verify</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="verify-site-id">Site ID</Label>
          <Input
            id="verify-site-id"
            inputMode="numeric"
            placeholder="e.g. 1"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="button" onClick={runVerify} disabled={loading}>
          {loading ? "Checking…" : "Verify"}
        </Button>

        {error && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {result && (
          <div
            className={[
              "rounded-md border px-3 py-3 text-sm",
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            ].join(" ")}
          >
            <p className="font-semibold">
              {result.ok ? "Site is active" : "Site exists but is inactive"}
            </p>
            <ul className="mt-2 space-y-1 text-xs font-mono">
              <li>siteId: {result.siteId}</li>
              <li>name: {result.name}</li>
              <li>code: {result.code ?? "null"}</li>
              <li>region: {result.region ?? "null"}</li>
              <li>verifiedAt: {result.verifiedAt}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
