"use client";

import { useParams } from "next/navigation";
import { HubProviderPage } from "@/components/hub/social/HubProviderPage";

export default function HubProviderRoute() {
  const params = useParams();
  const providerId = parseInt(String(params?.providerId), 10);

  if (Number.isNaN(providerId)) {
    return (
      <p className="rounded-xl border border-[#2A2E33]/10 bg-white px-4 py-6 text-sm text-[#5a6b7c]">
        Invalid provider.
      </p>
    );
  }

  return <HubProviderPage providerId={providerId} />;
}
