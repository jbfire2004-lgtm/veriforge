import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function AccessCheckPage() {
  const router = useRouter();
  const workerId = router.query.workerId as string;
  const siteId = router.query.siteId as string;

  const { data, isLoading } = api.access.check.useQuery(
    { workerId, siteId },
    { enabled: !!workerId && !!siteId }
  );

  if (isLoading || !data) return <div>Checking…</div>;

  return (
    <div className="p-6 flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-semibold">Site Entry Check</h1>

      {data.allowed ? (
        <div className="p-6 bg-green-100 text-green-800 rounded text-xl">
          ✔ Cleared for Entry
        </div>
      ) : (
        <div className="p-6 bg-red-100 text-red-800 rounded text-xl">
          ✖ Access Denied
          <ul className="mt-3 text-sm">
            {data.reasons.map((r, idx) => (
              <li key={idx}>
                {r.courseName} — {r.type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
