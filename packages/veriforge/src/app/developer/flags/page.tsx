import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/developer/feature-flags */
export default function DeveloperFlagsPage() {
  return (
    <FeaturePlaceholder
      tenant="developer"
      title="Feature flags"
      description="Toggle platform feature flags and inspect payloads."
      liveHref="/developer/feature-flags"
    />
  );
}
