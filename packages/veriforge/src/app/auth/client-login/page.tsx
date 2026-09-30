import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/client/login */
export default function ClientLoginPage() {
  return (
    <FeaturePlaceholder
      tenant="hiring_client"
      title="Hiring client sign in"
      description="Hiring-client JWT namespace — isolated from org tokens."
      liveHref="/client/login"
    />
  );
}
