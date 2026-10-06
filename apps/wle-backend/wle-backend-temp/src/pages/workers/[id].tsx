import { useRouter } from "next/router";
import { api } from "~/utils/api";
import CameraUpload from "~/components/upload/CameraUpload";
import PDFUpload from "~/components/upload/PDFUpload";
import ScannerUpload from "~/components/upload/ScannerUpload";
import BulkTrainingUpload from "~/components/upload/BulkTrainingUpload";

export default function WorkerProfilePage() {
  const router = useRouter();
  const workerId = router.query.id as string;

  const { data, isLoading } = api.worker.getWorkerOverview.useQuery(
    { workerId },
    { enabled: !!workerId }
  );

  if (isLoading || !data) return <div>Loading...</div>;

  const { worker, verification } = data;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {worker.firstName} {worker.lastName}
          </h1>
          <p className="text-sm text-gray-500">{worker.company?.name}</p>
        </div>
        <div>
          <span
            className={
              verification.isCompliant
                ? "px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm"
                : "px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm"
            }
          >
            {verification.isCompliant ? "Compliant" : "Not Compliant"}
          </span>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-2">Training Issues</h2>
        {verification.issues.length === 0 && (
          <p className="text-sm text-gray-500">No issues.</p>
        )}
        <ul className="space-y-1">
          {verification.issues.map((issue, idx) => (
            <li key={idx} className="text-sm">
              <span className="font-medium">{issue.courseName}</span> —{" "}
              <span>{issue.type}</span>
              {issue.expiresAt && (
                <span> (expires {issue.expiresAt.toLocaleDateString()})</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Training Records</h2>
        <ul className="space-y-1 text-sm">
          {worker.trainingRecords.map((r) => (
            <li key={r.id}>
              {r.courseName} — completed{" "}
              {r.completedAt && new Date(r.completedAt).toLocaleDateString()}
              {r.expiresAt && ` (expires ${new Date(r.expiresAt).toLocaleDateString()})`}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Training Documents</h2>
        <ul className="space-y-1 text-sm">
          {worker.documents.map((d) => (
            <li key={d.id}>
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {d.filename}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Upload Training</h2>
        <div className="flex flex-col gap-2">
          <CameraUpload workerId={worker.id} />
          <PDFUpload workerId={worker.id} />
          <ScannerUpload workerId={worker.id} />
          {worker.companyId && (
            <BulkTrainingUpload companyId={worker.companyId} />
          )}
        </div>
      </section>
    </div>
  );
}
