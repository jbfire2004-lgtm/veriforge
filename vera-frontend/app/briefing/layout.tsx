import type { ReactNode } from "react";

import { SignedInVeraLayout } from "@/src/components/layout/signed-in-vera-layout";



export default function BriefingLayout({ children }: { children: ReactNode }) {

  return (

    <SignedInVeraLayout callbackUrl="/briefing" homeHref="/hub">

      {children}

    </SignedInVeraLayout>

  );

}

