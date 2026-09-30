"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import { resolveVeriForgeRoute } from "./veriforge-routes";
import styles from "./VFRouteTransition.module.css";

export interface VFRouteTransitionProps {
  children: React.ReactNode;
  className?: string;
  /** Force critical glow even if route meta is not critical */
  forceCritical?: boolean;
}

/**
 * Route-change transition wrapper:
 * - angularSlide on path change
 * - metallicFade on content load
 * - redGlowPulse for critical routes (incidents, compliance, …)
 */
export function VFRouteTransition({
  children,
  className,
  forceCritical = false,
}: VFRouteTransitionProps) {
  const pathname = usePathname();
  const meta = resolveVeriForgeRoute(pathname);
  const critical = forceCritical || meta.critical;
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    setTick((t) => t + 1);
  }, [pathname]);

  return (
    <div
      key={`${pathname}-${tick}`}
      className={cn(
        styles.transition,
        styles.slide,
        styles.fade,
        veriforgeMotionClasses.primitives.angularSlide,
        veriforgeMotionClasses.primitives.metallicFade,
        critical && styles.critical,
        critical && veriforgeMotionClasses.primitives.redGlowPulse,
        className,
      )}
      data-vf-route={meta.path}
      data-vf-section={meta.section}
      data-vf-critical={critical ? "true" : "false"}
      data-vf-icon={meta.icon}
    >
      {children}
    </div>
  );
}

export default VFRouteTransition;
