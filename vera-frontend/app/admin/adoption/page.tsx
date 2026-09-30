"use client";

import { useState } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { AdoptionMapPanel } from "@/components/admin/adoption/AdoptionMapPanel";
import { ModuleUsagePanel } from "@/components/admin/adoption/ModuleUsagePanel";
import { GrowthPanel } from "@/components/admin/adoption/GrowthPanel";
import { FeedbackManagerPanel } from "@/components/admin/adoption/FeedbackManagerPanel";

export default function AdminAdoptionPage() {
  const [tab, setTab] = useState("map");

  return (
    <AdminPageShell
      title="Adoption & usage"
      description="Geographic adoption, module usage, growth metrics, and product feedback."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Adoption" },
      ]}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex flex-wrap gap-1">
          <TabsTrigger value="map">Adoption map</TabsTrigger>
          <TabsTrigger value="usage">Module usage</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <AdoptionMapPanel />
        </TabsContent>
        <TabsContent value="usage">
          <ModuleUsagePanel />
        </TabsContent>
        <TabsContent value="growth">
          <GrowthPanel />
        </TabsContent>
        <TabsContent value="feedback">
          <FeedbackManagerPanel />
        </TabsContent>
      </Tabs>
    </AdminPageShell>
  );
}
