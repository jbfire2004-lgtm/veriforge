import { Calculator } from "lucide-react";
import { HubPromoCard } from "./HubPromoCard";

export function SafetyCalculatorsCard() {
  return (
    <HubPromoCard
      href="/calculators"
      eyebrow="Field tools"
      title="Safety Calculators"
      description="Rigging, fall clearance, crane radius, and more."
      icon={Calculator}
      accentBar="from-[#2F8F8C] to-[#3AA39F]"
      iconGradient="from-[#2F8F8C] to-[#3AA39F]"
      surface="from-[#E4F3F2]/80 via-white to-white"
      ring="ring-[#2F8F8C]/20"
    />
  );
}
