import { JhaFlhaFieldOffline } from "@/components/field/JhaFlhaFieldOffline";
import { SifHecaFieldOffline } from "@/components/field/SifHecaFieldOffline";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import type { SafetyFormKind } from "@/lib/field";
import Link from "next/link";

const KINDS: SafetyFormKind[] = ["JHA", "FLHA", "SIF", "HECA"];

export default async function FieldSafetyFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ companyId?: string; projectId?: string; siteId?: string }>;
}) {
  const { kind: raw } = await params;
  const sp = await resolveSearchParams(searchParams);
  const kind = (raw?.toUpperCase() ?? "JHA") as SafetyFormKind;
  if (!KINDS.includes(kind)) {
    return <p className="p-4">Unknown form type: {raw}</p>;
  }

  const companyId = sp.companyId ? Number(sp.companyId) : 1;
  const projectId = sp.projectId ? Number(sp.projectId) : 1;
  const siteId = sp.siteId ? Number(sp.siteId) : undefined;

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <Link href="/field" className="text-sm text-teal-700 underline">
        ← Field dashboard
      </Link>
      {kind === "JHA" || kind === "FLHA" ? (
        <JhaFlhaFieldOffline
          kind={kind}
          companyId={companyId}
          projectId={projectId}
          siteId={siteId}
        />
      ) : (
        <SifHecaFieldOffline
          kind={kind}
          companyId={companyId}
          projectId={projectId}
          siteId={siteId}
        />
      )}
    </div>
  );
}
