import { RenewalsFlow } from "@/components/renewals/RenewalsFlow";

export const dynamic = "force-dynamic";

export default async function WorkerRenewalsPage({
  params,
}: {
  params: Promise<{ workerId: string }>;
}) {
  const { workerId } = await params;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <RenewalsFlow workerId={workerId} />
    </main>
  );
}
