import { VeriForgeSafetyKpiIntelligenceSystem } from "@/components/veriforge";

export default function VeriForgeSafetyKpisPage() {
  return (
    <section className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Safety KPI Intelligence System
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#FAFAFA]">
          Define. Score. Forecast. Report.
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Industrial KPI definition, scoring, dashboards, forecasting, alerts,
          benchmarking, and export-ready reporting across training, verification,
          compliance, incidents, field, and culture.
        </p>
      </header>
      <VeriForgeSafetyKpiIntelligenceSystem />
    </section>
  );
}
