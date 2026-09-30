"use client";

import { useParams } from "next/navigation";
import { HubCompanyPage } from "@/components/hub/social/HubCompanyPage";

export default function HubCompanyRoute() {
  const params = useParams();
  const companyId = parseInt(String(params?.companyId), 10);

  if (Number.isNaN(companyId)) {
    return (
      <p className="rounded-xl border border-[#2A2E33]/10 bg-white px-4 py-6 text-sm text-[#5a6b7c]">
        Invalid company.
      </p>
    );
  }

  return <HubCompanyPage companyId={companyId} />;
}
