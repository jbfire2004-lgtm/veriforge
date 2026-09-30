import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/verihub/signup and /auth/login */
export default function OrgLoginPage() {
  return (
    <FeaturePlaceholder
      tenant="organization"
      title="Organization sign in"
      description="Org JWT namespace (veriforge-app)."
      liveHref="/auth/login"
    />
  );
}
