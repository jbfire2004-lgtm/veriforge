import { VeraPageLayout } from "@/src/components/navigation";
import { ProjectSafetyDashboardView } from "@/components/veripm-project-safety/ProjectSafetyDashboardView";

export const metadata = {
  title: "Project Safety Dashboard — Vera PM",
  description:
    "Project-level leading/lagging indicators, trends, risk profile, and industry comparison.",
};

export default function ProjectSafetyDashboardPage() {
  return (
    <VeraPageLayout>
      <ProjectSafetyDashboardView />
    </VeraPageLayout>
  );
}
