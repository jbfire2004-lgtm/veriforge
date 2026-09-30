import { ProviderCoursesClient } from "./ProviderCoursesClient";
import { apiGetSafe } from "@/lib/api";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { Breadcrumbs, ErrorState } from "@/components/ui";

export default async function ProviderCoursesPage() {
  const dash = await apiGetSafeProviderDashboard();
  if (!dash.ok) {
    return <ErrorState title="Could not load provider" description={dash.error} />;
  }

  const courses = await apiGetSafe<unknown[]>(
    `/api/v1/training-providers/providers/${dash.data.provider.id}/courses`
  );

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal" },
          { label: "Courses" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Course management</h1>
      <ProviderCoursesClient
        providerId={dash.data.provider.id}
        initialCourses={courses.ok ? courses.data : []}
      />
    </div>
  );
}
