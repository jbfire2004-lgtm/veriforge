import type { ReactNode } from "react";

import { SignedInVeraLayout } from "@/src/components/layout/signed-in-vera-layout";



export default function WeatherLayout({ children }: { children: ReactNode }) {

  return (

    <SignedInVeraLayout callbackUrl="/weather" homeHref="/hub">

      {children}

    </SignedInVeraLayout>

  );

}

