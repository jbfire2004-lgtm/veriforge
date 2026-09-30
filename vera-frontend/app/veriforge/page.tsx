import Link from "next/link";
import { VeriForgeButton, VeriForgeLogo, VeriForgeFrame } from "@/components/veriforge";

export default function VeriForgeEntryPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--vf-effect-metallic-gradient)] p-[var(--vf-spacing-xl)]">
      <VeriForgeFrame className="w-full max-w-2xl p-[var(--vf-spacing-xl)] text-center">
        <div className="mb-[var(--vf-spacing-lg)] flex justify-center">
          <VeriForgeLogo />
        </div>
        <h1 className="mb-[var(--vf-spacing-sm)] font-[var(--vf-font-primary)] text-3xl font-bold uppercase tracking-[0.14em] text-[var(--vf-color-safety-white)]">
          VeriForge Architecture
        </h1>
        <p className="mx-auto mb-[var(--vf-spacing-lg)] max-w-xl text-sm text-[#d0d0d0]">
          Forged-metal application shell for web, dashboard, auth, user lifecycle, training,
          verification, settings, and mobile surfaces.
        </p>
        <Link href="/veriforge/homepage">
          <VeriForgeButton size="lg">ENTER PLATFORM</VeriForgeButton>
        </Link>
      </VeriForgeFrame>
    </main>
  );
}

