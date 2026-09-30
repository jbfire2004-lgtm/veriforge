"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  resolveActiveGlobalModule,
  resolveActiveFeature,
  VERA_NAV_FEATURE_GROUP_LABELS,
  type VeraNavFeatureGroupId,
} from "@/lib/navigation/vera-nav-config";
import { VeraNavDropdown } from "./VeraNavDropdown";

type Props = {
  role?: string | null;
  className?: string;
  variant?: "default" | "header";
};

/** Secondary navigation — features of the current module only. */
export function VeraModuleFeatureDropdown({
  className,
  variant = "default",
}: Props) {
  const pathname = usePathname() ?? "/";
  const activeModule = useMemo(() => resolveActiveGlobalModule(pathname), [pathname]);

  const currentFeature = useMemo(
    () => (activeModule ? resolveActiveFeature(activeModule, pathname) : null),
    [activeModule, pathname],
  );

  const items = useMemo(() => {
    if (!activeModule) return [];
    const visible = activeModule.features.filter((f) => f.showInNav !== false);
    let lastGroup: VeraNavFeatureGroupId | undefined;
    return visible.map((f, index) => {
      const groupChanged = Boolean(f.group && f.group !== lastGroup);
      const groupLabel =
        groupChanged && f.group
          ? VERA_NAV_FEATURE_GROUP_LABELS[f.group]
          : undefined;
      const separatorBefore = groupChanged && index > 0;
      if (f.group) lastGroup = f.group;
      return {
        id: f.id,
        label: f.label,
        href: f.href,
        description: f.description,
        icon: f.icon,
        active: f.id === currentFeature?.id,
        separatorBefore,
        groupLabel,
      };
    });
  }, [activeModule, currentFeature?.id]);

  if (!activeModule || !currentFeature) return null;

  return (
    <VeraNavDropdown
      label="Feature"
      currentLabel={currentFeature.label}
      currentIcon={
        variant === "header"
          ? undefined
          : currentFeature.icon ?? activeModule.icon
      }
      items={items}
      ariaLabel={`${activeModule.label} features`}
      menuDataAttr="module-nav"
      className={className}
      variant={variant}
    />
  );
}
