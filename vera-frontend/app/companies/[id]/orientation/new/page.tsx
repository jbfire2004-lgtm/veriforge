"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";
import { OrientationBuilderAI } from "@/components/orientation/OrientationBuilderAI";
import { OrientationBuilderUpload } from "@/components/orientation/OrientationBuilderUpload";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default function CompanyOrientationNewPage({ params }: Props) {
  const { id } = use(params);
  const companyId = parseInt(id, 10);
  const search = useSearchParams();
  const mode = search.get("mode") ?? "upload";
  const base = `/companies/${companyId}/orientation`;

  return (
    <div className="space-y-6">
      <Link href={base} className="text-sm text-[#2F8F8C] hover:underline">
        ← Orientation dashboard
      </Link>
      {mode === "ai" ? (
        <OrientationBuilderAI companyId={companyId} redirectBase={base} />
      ) : (
        <OrientationBuilderUpload companyId={companyId} redirectBase={base} />
      )}
    </div>
  );
}
