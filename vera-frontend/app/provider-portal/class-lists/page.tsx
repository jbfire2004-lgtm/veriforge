import { apiGetSafe } from "@/lib/api";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { ClassListUploadClient } from "./ClassListUploadClient";
import { Breadcrumbs, ErrorState } from "@/components/ui";

export default async function ClassListUploadPage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) return <ErrorState title="Unavailable" description={dash.error} />;

  const courses = await apiGetSafe<{ id: number; code: string; name: string }[]>(
    `/api/v1/training-providers/providers/${dash.data.provider.id}/courses`
  );

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs items={[{ label: "Class lists" }]} />
      <h1 className="text-2xl font-semibold">Upload class list</h1>
      <ClassListUploadClient
        providerId={dash.data.provider.id}
        courses={courses.ok ? courses.data : []}
      />
    </div>
  );
}
