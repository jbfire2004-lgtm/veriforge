"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrientationBuilderAI } from "@/components/orientation/OrientationBuilderAI";
import { OrientationBuilderUpload } from "@/components/orientation/OrientationBuilderUpload";

export default function PmOrientationNewPage() {
  const search = useSearchParams();
  const projectIdRaw = search.get("projectId");
  const projectId = projectIdRaw ? parseInt(projectIdRaw, 10) : undefined;
  const mode = search.get("mode") ?? "upload";
  const base = `/pm/orientation${projectId ? `?projectId=${projectId}` : ""}`;

  return (
    <div className="space-y-6">
      <Link href={base} className="text-sm text-[#2F8F8C] hover:underline">
        ← Orientation dashboard
      </Link>
      {mode === "ai" ? (
        <OrientationBuilderAI projectId={projectId} redirectBase={base} />
      ) : (
        <OrientationBuilderUpload projectId={projectId} redirectBase={base} />
      )}
    </div>
  );
}
