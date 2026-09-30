import type { ReactNode } from "react";
import { VeriForgeLogo } from "@/components/veriforge";

export default function VeriForgeAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="veriforge-theme grid min-h-screen place-items-center bg-[var(--vf-color-iron-black)] p-[var(--vf-spacing-md)]">
      <div className="w-full max-w-md border border-[var(--vf-color-steel-grey)] bg-[var(--vf-effect-metallic-gradient)] p-[var(--vf-spacing-lg)]">
        <div className="mb-[var(--vf-spacing-md)] flex justify-center">
          <VeriForgeLogo />
        </div>
        {children}
      </div>
    </div>
  );
}

