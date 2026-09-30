import { VeriForgeEquipmentInspectionEngine } from "@/components/veriforge";

export default function VeriForgeInspectionsPage() {
  return (
    <section className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Equipment Inspection Engine
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#FAFAFA]">
          Inspect. Score. Certify. Maintain.
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Industrial equipment registry, inspection scheduling, digital checklists, defect
          reporting, certification tracking, scoring, and maintenance linkage.
        </p>
      </header>
      <VeriForgeEquipmentInspectionEngine />
    </section>
  );
}
