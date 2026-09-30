"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CoreFileUpload } from "@/src/components/core/CoreFileUpload";
import { CoreMultiFileUpload } from "@/src/components/core/CoreMultiFileUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VeraPageLayout } from "@/src/components/navigation";
import { buttonStyles } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  CORE_FILE_PURPOSE_OPTIONS,
  type CoreFilePurpose,
} from "@/lib/core/core-file-purposes";

export default function CoreUploadPage() {
  const { data: session } = useSession();
  const sessionCompanyId = (
    session?.user as { companyId?: number | null } | undefined
  )?.companyId;
  const [companyId, setCompanyId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [purpose, setPurpose] = useState<CoreFilePurpose>("document_storage");

  useEffect(() => {
    if (sessionCompanyId != null && sessionCompanyId > 0 && !companyId) {
      setCompanyId(String(sessionCompanyId));
    }
  }, [sessionCompanyId, companyId]);

  const resolvedCompany =
    companyId.trim() && Number.isFinite(Number(companyId))
      ? Number(companyId)
      : undefined;
  const resolvedProject =
    projectId.trim() && Number.isFinite(Number(projectId))
      ? Number(projectId)
      : undefined;

  return (
    <VeraPageLayout
      title="Core file upload"
      description={
        <>
          Uploads go to{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core/uploads
          </code>{" "}
          with purpose tagging and company auto-population. Browse results in{" "}
          <Link href="/pm/documents" className="font-medium underline">
            Document Archive
          </Link>
          .
        </>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/pm/documents"
            className={buttonStyles({ variant: "teal", size: "sm" })}
          >
            Document Archive
          </Link>
          <Link
            href="/core/training-ingest"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Training ingestion
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload defaults</CardTitle>
            <CardDescription>
              Company ID is taken from your account when available. Purpose tags
              classify files in Document Storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="upload-company">Company ID</Label>
              <Input
                id="upload-company"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Auto from session"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-project">Linked project ID</Label>
              <Input
                id="upload-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-purpose">Purpose</Label>
              <select
                id="upload-purpose"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value as CoreFilePurpose)
                }
              >
                {CORE_FILE_PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload file</CardTitle>
            <CardDescription>
              Endpoint:{" "}
              <code className="text-xs">POST /api/v1/core/uploads</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoreFileUpload
              purpose={purpose}
              companyId={resolvedCompany}
              projectId={resolvedProject}
              allowPurposeSelect={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-file queue</CardTitle>
            <CardDescription>
              Drag-and-drop or pick multiple files with per-file progress,
              cancel, and retry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CoreMultiFileUpload
              purpose={purpose}
              companyId={resolvedCompany}
              projectId={resolvedProject}
            />
          </CardContent>
        </Card>
      </div>
    </VeraPageLayout>
  );
}
