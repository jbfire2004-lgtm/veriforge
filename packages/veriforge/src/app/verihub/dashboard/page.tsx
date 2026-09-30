import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/verihub/dashboard → /verihub */
export default function VeriHubDashboardPage() {
  return (
    <FeaturePlaceholder
      tenant="organization"
      title="VeriHub dashboard"
      description="Organization overview: enabled modules, users, billing, and shortcuts into VeriHub."
      liveHref="/verihub"
    />
  );
}
