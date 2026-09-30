import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { apiFetchJson } from "@/lib/api-fetch";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";

type WorkerProfileResponse = {
  firstName: string;
  lastName: string;
  training: { records: TrainingRow[]; expiredCount: number };
  credentials: { records: CredentialRow[]; expiredCount: number };
  incidents: IncidentRow[];
  compliance?: { isCompliant?: boolean };
};

type TrainingRow = {
  id: number;
  courseName?: string;
  expiresAt?: string | null;
  certification?: { name?: string };
};

type CredentialRow = {
  id: number;
  name?: string;
  expiresAt?: string | null;
  certification?: { name?: string };
};

type IncidentRow = { id: number; title?: string; description?: string };

export default async function WorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workerId = Number(id);
  if (!Number.isFinite(workerId) || workerId < 1) {
    redirect("/dashboard");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/workers/${workerId}`)}`);
  }

  let profile: WorkerProfileResponse;
  try {
    profile = await apiFetchJson<WorkerProfileResponse>(`/workers/${workerId}/profile`, {
      cache: "no-store",
      session,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not load this worker profile.";
    return (
      <div className="space-y-8">
        <VeraPageHeader title="Worker profile" description="Training and credentials for this worker." />
        <ErrorState title="Profile unavailable" description={message}>
          <Link href="/dashboard" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to dashboard
          </Link>
        </ErrorState>
      </div>
    );
  }

  const trainingRecords = profile.training?.records ?? [];
  const credentials = profile.credentials?.records ?? [];
  const incidents = profile.incidents ?? [];

  const now = new Date();
  const expiredTraining = trainingRecords.filter(
    (t) => t.expiresAt && new Date(t.expiresAt) <= now
  );
  const expiredCredentials = credentials.filter(
    (c) => c.expiresAt && new Date(c.expiresAt) <= now
  );

  const isCompliant =
    profile.compliance?.isCompliant ??
    (expiredTraining.length === 0 &&
      expiredCredentials.length === 0 &&
      incidents.length === 0);

  const expiredTrainingCount = profile.training?.expiredCount ?? expiredTraining.length;

  return (
    <div className="space-y-8">
      <VeraPageHeader
        title={`${profile.firstName} ${profile.lastName}`}
        description="Training records and credentials are linked by certification. Open a row to manage it in admin."
        actions={
          <div className="flex flex-wrap items-center gap-vera-3">
            <span
              className={`rounded px-3 py-1 text-sm font-medium ${
                isCompliant
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
            </span>
            <Link
              href={`/verify/${workerId}`}
              className="text-sm font-semibold text-vera-deep underline-offset-4 hover:underline"
            >
              Worker wallet
            </Link>
          </div>
        }
      />

      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Training records</h2>
        <p className="mb-3 text-sm text-gray-600">
          Linked via <span className="font-medium">certification</span> to course definitions.{" "}
          {expiredTrainingCount > 0 && (
            <span className="text-amber-800">{expiredTrainingCount} expired on file.</span>
          )}
        </p>

        {trainingRecords.length === 0 && (
          <p className="text-sm text-gray-500">No training records.</p>
        )}

        <ul className="space-y-2 text-sm">
          {trainingRecords.map((t) => (
            <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-0">
              <div>
                <Link
                  href={`/admin/training/${t.id}`}
                  className="font-medium text-vera-deep hover:text-vera-teal hover:underline"
                >
                  {t.courseName ?? t.certification?.name ?? `Record #${t.id}`}
                </Link>
                {t.certification?.name != null && t.courseName != null && (
                  <span className="ml-2 text-xs text-gray-500">({t.certification.name})</span>
                )}
              </div>
              <span className="text-gray-600">
                Expires: {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : "N/A"}
              </span>
              <Link
                href={`/verify/core/training/${t.id}`}
                className="text-xs font-semibold text-vera-teal hover:underline"
              >
                Verify
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Credentials</h2>
        <p className="mb-3 text-sm text-gray-600">
          Digital credentials tied to the same worker profile.{" "}
          {profile.credentials != null && profile.credentials.expiredCount > 0 && (
            <span className="text-amber-800">{profile.credentials.expiredCount} expired on file.</span>
          )}
        </p>

        {credentials.length === 0 && <p className="text-sm text-gray-500">No credentials.</p>}

        <ul className="space-y-2 text-sm">
          {credentials.map((c) => (
            <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-0">
              <div>
                <Link
                  href={`/verify/credential?id=${c.id}`}
                  className="font-medium text-vera-deep hover:text-vera-teal hover:underline"
                >
                  {c.certification?.name ?? c.name ?? `Credential #${c.id}`}
                </Link>
              </div>
              <span className="text-gray-600">
                Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "N/A"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Incidents</h2>

        {incidents.length === 0 && <p className="text-sm text-gray-500">No incidents.</p>}

        <ul className="space-y-1 text-sm">
          {incidents.map((i) => (
            <li key={i.id}>
              <span className="font-medium">{i.title}</span> — {i.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
