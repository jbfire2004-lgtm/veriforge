import { Suspense } from "react";
import { CoreTrainingVerificationContent } from "./CoreTrainingVerificationContent";

type PageProps = { params: Promise<{ id: string }> };

export default async function CoreTrainingVerificationPage({ params }: PageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center text-red-600">
        Invalid training record id.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl p-6 text-center text-gray-500">
          Verifying training record…
        </div>
      }
    >
      <CoreTrainingVerificationContent id={id} />
    </Suspense>
  );
}
