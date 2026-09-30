import type { ReactNode } from "react";

import { SignedInVeraLayout } from "@/src/components/layout/signed-in-vera-layout";



export default function CalculatorsLayout({ children }: { children: ReactNode }) {

  return (

    <SignedInVeraLayout callbackUrl="/calculators" homeHref="/hub">

      {children}

    </SignedInVeraLayout>

  );

}

