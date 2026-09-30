"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  resolveVeriForgeRoute,
  VERIFORGE_ROUTES,
  type VeriForgeRouteMeta,
} from "./veriforge-routes";

type VFRouteContextValue = {
  pathname: string;
  route: VeriForgeRouteMeta;
  routes: VeriForgeRouteMeta[];
  critical: boolean;
};

const VFRouteContext = React.createContext<VFRouteContextValue | null>(null);

export function VFRouteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/veriforge";
  const route = resolveVeriForgeRoute(pathname);
  const value = React.useMemo(
    () => ({
      pathname,
      route,
      routes: VERIFORGE_ROUTES,
      critical: route.critical,
    }),
    [pathname, route],
  );

  return (
    <VFRouteContext.Provider value={value}>{children}</VFRouteContext.Provider>
  );
}

export function useVFRoute(): VFRouteContextValue {
  const ctx = React.useContext(VFRouteContext);
  const pathname = usePathname() ?? "/veriforge";
  if (ctx) return ctx;
  const route = resolveVeriForgeRoute(pathname);
  return {
    pathname,
    route,
    routes: VERIFORGE_ROUTES,
    critical: route.critical,
  };
}

export default VFRouteProvider;
