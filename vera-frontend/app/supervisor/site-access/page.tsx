"use client";

import { useEffect, useState } from "react";
import { SupervisorSiteAccessPanel } from "@/app/components/supervisor/SupervisorSiteAccessPanel";

export default function SiteAccessPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Site Access</h1>
      <SupervisorSiteAccessPanel />
    </div>
  );
}
