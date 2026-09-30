import { FeaturePlaceholder } from "../../_shared/FeaturePlaceholder";

/** Live: vera-frontend/app/verihub/roles */
export default function VeriHubRolesPage() {
  return (
    <FeaturePlaceholder
      tenant="organization"
      title="Roles"
      description="Org roles (Owner, Admin, Manager, Worker) and permission bundles."
      liveHref="/verihub/roles"
    />
  );
}
