import { VeraPageLayout } from "@/src/components/navigation";
import { TrainingCompetencyDashboardView } from "@/components/vericore-training-competency/TrainingCompetencyDashboardView";

export const metadata = {
  title: "VeriCore Training & Competency Dashboard",
  description:
    "Workforce training intelligence — completion, gaps, expiry heatmaps, regional skills, AI correlation, risk.",
};

export default function TrainingCompetencyPage() {
  return (
    <VeraPageLayout>
      <TrainingCompetencyDashboardView />
    </VeraPageLayout>
  );
}
