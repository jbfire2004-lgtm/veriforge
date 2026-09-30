import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { HubDailyWidgets } from "@/components/hub/widgets/HubDailyWidgets";
import { HubWorkerWalletCard } from "@/components/hub/workspace/HubWorkerWalletCard";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Readiness — Vera Hub",
  description: "Worker, equipment, training, safety, and project readiness dashboards.",
};

export default async function HubReadinessPage() {
  await getServerSession(authOptions);

  return (
    <VeraPageLayout
      title="Operational readiness"
      description="Live compliance and safety metrics scoped to your role and subscription."
    >
      <div className="space-y-10 pb-16">
        <HubDailyWidgets expanded />
        <HubWorkerWalletCard />
      </div>
    </VeraPageLayout>
  );
}
