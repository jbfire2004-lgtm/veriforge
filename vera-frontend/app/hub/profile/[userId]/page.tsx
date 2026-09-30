"use client";

import { useParams } from "next/navigation";
import { HubProfilePage } from "@/components/hub/social/HubProfilePage";

export default function HubProfileRoute() {
  const params = useParams();
  const userId = parseInt(String(params?.userId), 10);

  if (Number.isNaN(userId)) {
    return (
      <p className="rounded-xl border border-[#2A2E33]/10 bg-white px-4 py-6 text-sm text-[#5a6b7c]">
        Invalid profile.
      </p>
    );
  }

  return <HubProfilePage userId={userId} />;
}
