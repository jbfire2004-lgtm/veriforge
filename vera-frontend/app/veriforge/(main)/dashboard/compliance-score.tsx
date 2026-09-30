"use client";

import {
  VeriForgeComplianceScoreBar,
  useComplianceScoreSync,
} from "@/components/veriforge";

export function VeriForgeDashboardComplianceScore() {
  const { score } = useComplianceScoreSync(78);
  return (
    <VeriForgeComplianceScoreBar
      score={score.score}
      label={`Live Compliance Score · ${score.timestamp.slice(0, 19)}`}
    />
  );
}
