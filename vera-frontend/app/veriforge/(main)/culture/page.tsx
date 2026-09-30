import { VeriForgeSafetyCultureProgram } from "@/components/veriforge";

export default function VeriForgeCulturePage() {
  return (
    <section className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Safety Culture Program
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#FAFAFA]">
          Lead. Empower. Improve.
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Industrial culture program across leadership engagement, worker empowerment, training
          excellence, verification discipline, incident transparency, and continuous improvement.
        </p>
      </header>
      <VeriForgeSafetyCultureProgram />
    </section>
  );
}
