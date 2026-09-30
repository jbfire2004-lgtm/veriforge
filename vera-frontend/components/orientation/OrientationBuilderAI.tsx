"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { aiGenerateOrientation, createOrientation } from "@/lib/orientation/api";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  companyId?: number;
  projectId?: number;
  redirectBase: string;
};

export function OrientationBuilderAI({ companyId, projectId, redirectBase }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("Site orientation");
  const [industry, setIndustry] = useState("Construction");
  const [businessType, setBusinessType] = useState("General contractor");
  const [workEnvironment, setWorkEnvironment] = useState("Outdoor industrial");
  const [hazards, setHazards] = useState("Heights\nMobile equipment\nUnderground utilities");
  const [ppe, setPpe] = useState("Hard hat\nSafety boots\nHigh-vis vest");
  const [programs, setPrograms] = useState("FLHA\nIncident reporting\nWHMIS");
  const [region, setRegion] = useState("Canada — Alberta");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const pkg = await createOrientation({
        companyId,
        projectId,
        type: "AI_GENERATED",
        title,
        languages: ["en", "fr", "es", "tl", "pa"],
      });
      await aiGenerateOrientation(pkg.id, {
        industry,
        businessType,
        workEnvironment,
        hazards: hazards.split("\n").filter(Boolean),
        ppeRequirements: ppe.split("\n").filter(Boolean),
        safetyPrograms: programs.split("\n").filter(Boolean),
        regulatoryRegion: region,
      });
      router.push(`${redirectBase}/${pkg.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection title="AI orientation builder" description="Powered by Vera Copilot (template v1)">
      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4 rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Package title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Regulatory region</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hazards">Hazards (one per line)</Label>
          <Textarea id="hazards" rows={4} value={hazards} onChange={(e) => setHazards(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ppe">PPE requirements</Label>
          <Textarea id="ppe" rows={3} value={ppe} onChange={(e) => setPpe(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Generating…" : "Generate orientation"}
        </Button>
      </form>
    </WorkspaceSection>
  );
}
