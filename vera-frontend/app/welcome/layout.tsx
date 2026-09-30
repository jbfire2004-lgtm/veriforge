import type { ReactNode } from "react";

import { SignedInVeraLayout } from "@/src/components/layout/signed-in-vera-layout";



export default function WelcomeLayout({ children }: { children: ReactNode }) {

  return (

    <SignedInVeraLayout callbackUrl="/welcome" homeHref="/welcome">

      {children}

    </SignedInVeraLayout>

  );

}

