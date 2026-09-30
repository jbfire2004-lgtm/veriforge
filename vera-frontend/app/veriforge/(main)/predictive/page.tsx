import { VeriForgeSafetyAiPredictiveEngine } from "@/components/veriforge";

export default function VeriForgePredictivePage() {
  return (
    <section className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Safety AI Predictive Engine
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#FAFAFA]">
          Forecast. Score. Prevent.
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Industrial-grade incident, risk, compliance, training, equipment, field hazard,
          and KPI forecasting — with model metadata, confidence scores, and red-glow
          critical alerts across dashboard and mobile.
        </p>
      </header>
      <VeriForgeSafetyAiPredictiveEngine />
    </section>
  );
}
