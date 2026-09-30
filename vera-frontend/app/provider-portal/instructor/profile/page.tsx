import { apiGetSafe } from "@/lib/api";
import { Breadcrumbs, Card, CardContent, ErrorState } from "@/components/ui";

export default async function InstructorProfilePage() {
  const res = await apiGetSafe<{
    firstName: string;
    lastName: string;
    email: string | null;
    licenseNumber: string | null;
    qualificationStatus: string;
    qualificationExpiresAt: string | null;
    qualifiedCourseCodes: string[];
    courses: { code: string; name: string }[];
    provider: { name: string };
  }>("/api/v1/training-providers/instructor/me");

  if (!res.ok) {
    return <ErrorState title="Profile unavailable" description={res.error} />;
  }

  const i = res.data;

  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Instructor", href: "/provider-portal/instructor" },
          { label: "Profile" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Instructor profile</h1>
      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span> {i.firstName} {i.lastName}
          </p>
          <p>
            <span className="text-muted-foreground">Provider:</span> {i.provider.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {i.email ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">License:</span> {i.licenseNumber ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Status:</span> {i.qualificationStatus}
          </p>
          <p>
            <span className="text-muted-foreground">Qualified courses:</span>{" "}
            {i.qualifiedCourseCodes.join(", ") || "—"}
          </p>
          <div>
            <p className="text-muted-foreground mb-1">Assigned courses</p>
            <ul className="list-disc pl-5">
              {i.courses.map((c) => (
                <li key={c.code}>
                  {c.code} — {c.name}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
