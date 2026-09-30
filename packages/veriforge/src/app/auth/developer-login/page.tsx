import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/developer/login */
export default function DeveloperLoginPage() {
  return (
    <FeaturePlaceholder
      tenant="developer"
      title="Developer sign in"
      description="Developer JWT namespace — isolated from org and hiring-client tokens."
      liveHref="/developer/login"
    />
  );
}
