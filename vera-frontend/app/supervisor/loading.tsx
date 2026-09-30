import { DashboardSkeleton } from "@/components/ui";

/**
 * Segment-level fallback for every `/supervisor/*` route. None of the
 * supervisor pages ship their own `loading.tsx`, so without this the Next.js
 * App Router bubbles up to the root and the supervisor shell stays empty
 * during the cross-segment compile.
 */
export default function SupervisorSegmentLoading() {
  return <DashboardSkeleton className="px-vera-4 py-vera-6 sm:px-vera-6" />;
}
