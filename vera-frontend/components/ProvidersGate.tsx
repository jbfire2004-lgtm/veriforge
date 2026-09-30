"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme";
import { FieldModeProvider } from "@/components/field";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { BasePathFetchPatch } from "@/components/providers/BasePathFetchPatch";
import { VeraCoreUIProvider } from "@/lib/vera-core-ui";

type Props = {
  /** Pathname from middleware (SSR); client navigation uses `usePathname`. */
  pathname: string;
  children: React.ReactNode;
};

const BARE_HOME_PATHS = new Set(["/", "/home"]);

/** Signed-in landing & hub — session + theme, no heavy field/offline stack (avoids blank screen). */
const WORKSPACE_SHELL_PREFIXES = [
  "/welcome",
  "/hub",
  "/weather",
  "/briefing",
  "/calculators",
  "/feedback",
  "/onboarding",
];

/** Public industry pages — theme only (fixes blank navigation from home). */
const PUBLIC_LITE_PREFIXES = [
  "/auth",
  "/experts",
  "/jobs",
  "/safety",
  "/safety-recalls",
  "/safety-bulletins",
];

function isBareHome(pathname: string): boolean {
  return BARE_HOME_PATHS.has(pathname);
}

function isPublicLite(pathname: string): boolean {
  return PUBLIC_LITE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

function isWorkspaceShell(pathname: string): boolean {
  return WORKSPACE_SHELL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * NextAuth client route base. Must include the app basePath (e.g. `/vera`) so
 * session/csrf fetches resolve correctly when served behind the VeriForge proxy.
 */
const authBasePath = `${process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? ""}/api/auth`;

export function ProvidersGate({ pathname: serverPathname, children }: Props) {
  const clientPathname = usePathname();
  const pathname = clientPathname || serverPathname;

  if (isBareHome(pathname)) {
    return (
      <QueryProvider>
        <BasePathFetchPatch />
        {children}
      </QueryProvider>
    );
  }

  if (isWorkspaceShell(pathname)) {
    return (
      <QueryProvider>
        <BasePathFetchPatch />
        <ThemeProvider defaultMode="system">
          <SessionProvider
            basePath={authBasePath}
            refetchOnWindowFocus={false}
            refetchInterval={0}
          >
            <VeraCoreUIProvider>
              <ToastProvider>{children}</ToastProvider>
            </VeraCoreUIProvider>
          </SessionProvider>
        </ThemeProvider>
      </QueryProvider>
    );
  }

  if (isAuthPath(pathname)) {
    return (
      <QueryProvider>
        <BasePathFetchPatch />
        <ThemeProvider defaultMode="light">
          <SessionProvider
            basePath={authBasePath}
            refetchOnWindowFocus={false}
            refetchInterval={0}
          >
            <ToastProvider>{children}</ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </QueryProvider>
    );
  }

  if (isPublicLite(pathname)) {
    return (
      <QueryProvider>
        <BasePathFetchPatch />
        <ThemeProvider defaultMode="light">
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <BasePathFetchPatch />
      <ThemeProvider defaultMode="system">
        <SessionProvider
          basePath={authBasePath}
          refetchOnWindowFocus={false}
          refetchInterval={0}
        >
          <VeraCoreUIProvider>
            <FieldModeProvider>
              <ToastProvider>{children}</ToastProvider>
            </FieldModeProvider>
          </VeraCoreUIProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
