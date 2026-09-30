import { VeraPageLayout } from "@/src/components/navigation";
import { FieldOsPermitsView } from "@/components/field/FieldOsPermitsView";

export const metadata = {
  title: "FieldOS Permit Tasks",
  description: "Field execution of VERIPM permits with live sync back to VERIPM and dashboards.",
};

export default function FieldOsPermitsPage() {
  return (
    <VeraPageLayout
      title="FieldOS Permit Tasks"
      description="Complete permit tasks in the field — signatures, photos, hazard controls sync to VERIPM."
    >
      <FieldOsPermitsView />
    </VeraPageLayout>
  );
}
