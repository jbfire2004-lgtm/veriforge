import { VeriForgeSafetyBlockchainLedger } from "@/components/veriforge";

export default function VeriForgeLedgerPage() {
  return (
    <section className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge Safety Blockchain Ledger
        </p>
        <h1 className="mt-2 font-[var(--vf-font-primary)] text-2xl uppercase tracking-[0.11em] text-[#FAFAFA]">
          Hash. Sign. Prove.
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.6)]" />
        <p className="mt-3 max-w-4xl text-sm text-[#d2d2d2]">
          Immutable safety records, verification proofs, compliance hashing, incident
          chain-of-custody, equipment inspections, workforce certification, and risk &amp;
          audit blockchains — forged with industrial-grade integrity.
        </p>
      </header>
      <VeriForgeSafetyBlockchainLedger />
    </section>
  );
}
