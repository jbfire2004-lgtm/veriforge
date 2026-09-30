import { redirect } from "next/navigation";
import { PublicWorkerVerificationCard } from "@/components/verify/PublicWorkerVerificationCard";

/** Canonical public verify entry — unguessable worker or equipment qr token. */
export default async function PublicTokenVerifyPage({
  params,
}: {
  params: Promise<{ token: string }> | { token: string };
}) {
  const { token: raw } = await Promise.resolve(params);
  const token = decodeURIComponent(raw);

  if (token.startsWith("e-") || token.startsWith("E-")) {
    redirect(`/verify/equipment?ref=${encodeURIComponent(token)}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 text-center">
        <p className="text-sm font-medium text-slate-800">Vera public verification</p>
        <p className="text-xs text-slate-500">Token-based link — no account required.</p>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <PublicWorkerVerificationCard workerId={token} />
      </main>
    </div>
  );
}
