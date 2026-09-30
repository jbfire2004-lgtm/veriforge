"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import styles from "./VFMobilePage.module.css";

export function VFMobilePage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className={cn(
        styles.page,
        styles.slide,
        styles.fade,
        veriforgeMotionClasses.primitives.angularSlide,
        veriforgeMotionClasses.primitives.metallicFade,
        className,
      )}
    >
      {children}
    </div>
  );
}

export default VFMobilePage;
