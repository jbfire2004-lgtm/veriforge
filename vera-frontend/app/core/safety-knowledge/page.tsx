import { canAccessCoreTools } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { SafetyKnowledgeClient } from "@/components/safety-knowledge/SafetyKnowledgeClient";
import { VeraPageLayout } from "@/src/components/navigation";

export default async function CoreSafetyKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ workerId?: string }>;
}) {
  await requireRouteAccess({
    callbackUrl: "/core/safety-knowledge",
    guard: canAccessCoreTools,
  });

  const sp = await resolveSearchParams(searchParams);
  const initialWorkerId = sp.workerId
    ? parseInt(sp.workerId, 10)
    : undefined;

  return (
    <VeraPageLayout
      title="Safety Knowledge"
      description="Evaluates demonstrated safety knowledge from verified training, site orientation, policy acknowledgments, and field participation (FLHA, BBO, inspections)."
    >
      <SafetyKnowledgeClient
        initialWorkerId={
          initialWorkerId != null && !Number.isNaN(initialWorkerId)
            ? initialWorkerId
            : undefined
        }
      />
    </VeraPageLayout>
  );
}
