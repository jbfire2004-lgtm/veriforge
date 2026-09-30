import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/developer */
export default function DeveloperDashboardPage() {
  return (
    <FeaturePlaceholder
      tenant="developer"
      title="Developer dashboard"
      description="Platform stats, impersonation, module builder, flags, and logs."
      liveHref="/developer"
    />
  );
}
