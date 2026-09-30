import { ClipboardList } from "lucide-react";
import { HubPromoCard } from "./HubPromoCard";

export function DailyBriefingCard() {
  return (
    <HubPromoCard
      href="/briefing"
      eyebrow="One-click generator"
      title="Daily Briefing"
      description="Generate toolbox talks, FLHAs, and crew briefings in seconds."
      icon={ClipboardList}
      accentBar="from-[#1e4a7a] to-[#2F85CC]"
      iconGradient="from-[#1e4a7a] to-[#1E6FB8]"
      surface="from-[#dbeafe]/60 via-white to-white"
      ring="ring-[#1e4a7a]/15"
    />
  );
}
