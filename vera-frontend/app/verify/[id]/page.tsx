import { PublicWorkerVerificationCard } from "@/components/verify/PublicWorkerVerificationCard";

/** Public worker verification card — no sign-in required. */
export default async function PublicWorkerVerifyPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 text-center">
        <p className="text-sm font-medium text-slate-800">Vera public verification</p>
        <p className="text-xs text-slate-500">
          No account required — this is the public card at{" "}
          <span className="font-mono">/verify/{id}</span>. Signed-in staff open the full hub at{" "}
          <a href={`/wallet/${id}`} className="text-teal-700 underline">
            /wallet/{id}
          </a>
          .
        </p>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <PublicWorkerVerificationCard workerId={id} />
      </main>
    </div>
  );
}
