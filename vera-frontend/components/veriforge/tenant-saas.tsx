"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { VeriForgeLogo } from "./logo";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { VeriForgeAlert } from "./alerts";
import { veriforgeTypography, VeriForgeFrame } from "./theme";
import {
  VeriForgeNotificationProvider,
  VeriForgeToastStack,
} from "./notifications";
import { apiFetch, unwrapApiPayload } from "@/lib/api-fetch";
import {
  AnvilIcon,
  ForgeBoltIcon,
  HeatEdgeIcon,
  ShieldGridIcon,
} from "./icons";

export type TenantBranding = {
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  useDefaultForgeIdentity: boolean;
};

export type TenantSession = {
  tenantId: string;
  slug: string;
  name: string;
  accessToken: string;
  userId: number;
  email: string;
  role: string;
  branding: TenantBranding;
};

export type TenantDirectoryItem = {
  tenantId: string;
  slug: string;
  name: string;
  status: string;
  dbMode: string;
  branding: TenantBranding;
};

const SESSION_KEY = "veriforge.tenant.session";
const DEFAULT_BRANDING: TenantBranding = {
  logoUrl: null,
  primaryColor: "#1E6FB8",
  accentColor: "#424242",
  useDefaultForgeIdentity: true,
};

type TenantContextValue = {
  session: TenantSession | null;
  tenants: TenantDirectoryItem[];
  setSession: (session: TenantSession | null) => void;
  login: (input: {
    email: string;
    password: string;
    tenantId?: string;
    tenantSlug?: string;
  }) => Promise<TenantSession>;
  logout: () => void;
  brandingVars: React.CSSProperties;
};

const TenantContext = React.createContext<TenantContextValue | null>(null);

export function useVeriForgeTenant() {
  const ctx = React.useContext(TenantContext);
  if (!ctx) throw new Error("useVeriForgeTenant requires VeriForgeTenantProvider");
  return ctx;
}

export function readTenantSession(): TenantSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TenantSession;
  } catch {
    return null;
  }
}

export function persistTenantSession(session: TenantSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function brandingStyle(branding: TenantBranding): React.CSSProperties {
  const primary = branding.useDefaultForgeIdentity
    ? "#1E6FB8"
    : branding.primaryColor || "#1E6FB8";
  const accent = branding.useDefaultForgeIdentity
    ? "#424242"
    : branding.accentColor || "#424242";
  return {
    ["--vf-tenant-primary" as string]: primary,
    ["--vf-tenant-accent" as string]: accent,
    ["--vf-color-forge-red" as string]: primary,
    ["--vf-color-steel-grey" as string]: accent,
  };
}

function canMutateTenantDemo(role?: string) {
  return role === "Admin" || role === "SuperAdmin" || role === "SafetyManager";
}

function canSeeTenantDirectory(role?: string) {
  return role === "Admin" || role === "SuperAdmin";
}

function sessionTenantItem(session: TenantSession): TenantDirectoryItem {
  return {
    tenantId: session.tenantId,
    slug: session.slug,
    name: session.name,
    status: "active",
    dbMode: "shared",
    branding: session.branding,
  };
}

export function VeriForgeTenantProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = React.useState<TenantSession | null>(() =>
    typeof window === "undefined" ? null : readTenantSession(),
  );
  const [tenants, setTenants] = React.useState<TenantDirectoryItem[]>([]);

  React.useEffect(() => {
    setSessionState(readTenantSession());
  }, []);

  React.useEffect(() => {
    if (!session) {
      setTenants([]);
      return;
    }
    const fallback = sessionTenantItem(session);
    let cancelled = false;
    void apiFetch("/veriforge/tenants")
      .then(async (res) => {
        if (!res.ok) throw new Error("tenant list denied");
        const body: unknown = await res.json();
        const rows = unwrapApiPayload<
          Array<{
            tenantId?: string;
            slug?: string;
            name?: string;
            status?: string;
            dbMode?: string;
            branding?: TenantBranding;
          }>
        >(body);
        const mapped: TenantDirectoryItem[] = (Array.isArray(rows) ? rows : [])
          .filter((item) => item.tenantId)
          .map((item) => ({
            tenantId: item.tenantId as string,
            slug: item.slug ?? session.slug,
            name: item.name ?? session.name,
            status: item.status ?? "active",
            dbMode: item.dbMode === "dedicated" ? "dedicated" : "shared",
            branding: item.branding ?? session.branding,
          }));
        if (!cancelled) setTenants(mapped.length > 0 ? mapped : [fallback]);
      })
      .catch(() => {
        if (!cancelled) setTenants([fallback]);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const setSession = React.useCallback((next: TenantSession | null) => {
    persistTenantSession(next);
    setSessionState(next);
  }, []);

  const login = React.useCallback(
    async (input: {
      email: string;
      password: string;
      tenantId?: string;
      tenantSlug?: string;
    }) => {
      const res = await apiFetch("/veriforge/auth/login", {
        method: "POST",
        requireAuth: false,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          tenantId: input.tenantId,
          tenantSlug: input.tenantSlug,
        }),
      });
      const body = (await res.json()) as {
        status?: string;
        data?: {
          accessToken?: string;
          user?: { id?: number; email?: string; role?: string; tenantId?: string };
          tenant?: {
            tenantId?: string;
            slug?: string;
            name?: string;
            branding?: TenantBranding;
          };
        };
        error?: { message?: string };
      };
      if (!res.ok || body.status === "error" || !body.data?.accessToken) {
        throw new Error(body.error?.message ?? "Invalid tenant credentials");
      }
      const tenantId =
        body.data.tenant?.tenantId ?? body.data.user?.tenantId ?? input.tenantId;
      if (!tenantId) throw new Error("Login did not return a tenant");
      const next: TenantSession = {
        tenantId,
        slug: body.data.tenant?.slug ?? input.tenantSlug ?? "alloy",
        name: body.data.tenant?.name ?? tenantId,
        accessToken: body.data.accessToken,
        userId: body.data.user?.id ?? 0,
        email: body.data.user?.email ?? input.email,
        role: body.data.user?.role ?? "Worker",
        branding: body.data.tenant?.branding ?? DEFAULT_BRANDING,
      };
      setSession(next);
      return next;
    },
    [setSession],
  );

  const logout = React.useCallback(() => setSession(null), [setSession]);

  const brandingVars = brandingStyle(session?.branding ?? DEFAULT_BRANDING);

  const value = React.useMemo(
    () => ({
      session,
      tenants,
      setSession,
      login,
      logout,
      brandingVars,
    }),
    [session, tenants, setSession, login, logout, brandingVars],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function VeriForgeTenantShell({ children }: { children: React.ReactNode }) {
  return (
    <VeriForgeNotificationProvider>
      <VeriForgeTenantProvider>
        <VeriForgeTenantShellInner>{children}</VeriForgeTenantShellInner>
      </VeriForgeTenantProvider>
    </VeriForgeNotificationProvider>
  );
}

function VeriForgeTenantShellInner({ children }: { children: React.ReactNode }) {
  const { brandingVars, session, logout } = useVeriForgeTenant();
  const router = useRouter();
  const params = useParams<{ tenantId?: string }>();
  const pathname = usePathname() ?? "";
  const tenantId = params.tenantId;
  const isAuth = pathname.includes("/tenant/login") || pathname === "/veriforge/tenant";

  const nav = tenantId
    ? [
        { label: "Dashboard", href: `/veriforge/tenant/${tenantId}/dashboard` },
        { label: "Training", href: `/veriforge/tenant/${tenantId}/training` },
        { label: "Verification", href: `/veriforge/tenant/${tenantId}/verification` },
        { label: "Compliance", href: `/veriforge/tenant/${tenantId}/compliance` },
      ]
    : [];

  return (
    <div
      className="veriforge-theme min-h-screen bg-[#1A1A1A] text-[#FAFAFA]"
      style={brandingVars}
    >
      {!isAuth ? (
        <header className="border-b border-[var(--vf-tenant-accent,#424242)] bg-[linear-gradient(180deg,#1f1f1f_0%,#151515_100%)] px-4 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <VeriForgeLogo />
              <div>
                <p className={cn(veriforgeTypography.heading, "text-[11px]")}>
                  MULTI-TENANT SAAS
                </p>
                <p className="text-xs text-[#b8b8b8]">
                  {session?.name ?? tenantId ?? "Select tenant"} · isolation enforced
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em]",
                      active
                        ? "border-[var(--vf-tenant-primary,#1E6FB8)] bg-[rgba(30, 111, 184,.2)] shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                        : "border-[#424242] text-[#d0d0d0]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {canSeeTenantDirectory(session?.role) ? (
                <Link
                  href="/veriforge/tenant"
                  className="border border-[#424242] px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-[#bdbdbd]"
                >
                  Tenants
                </Link>
              ) : null}
              {session ? (
                <>
                  <span className="self-center text-[10px] uppercase tracking-[0.1em] text-[#bdbdbd]">
                    {session.email} · {session.role}
                  </span>
                  <button
                    type="button"
                    className="border border-[#424242] px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-[#bdbdbd]"
                    onClick={() => {
                      logout();
                      router.push("/veriforge/auth/login");
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        </header>
      ) : null}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <VeriForgeToastStack />
    </div>
  );
}

export function VeriForgeTenantDirectory() {
  const { tenants, session } = useVeriForgeTenant();
  if (!session) {
    return (
      <div className="space-y-4">
        <header className="border border-[#424242] bg-[#1A1A1A] p-4">
          <h1 className={cn(veriforgeTypography.heading, "text-2xl text-[#FAFAFA]")}>
            Tenant Directory
          </h1>
          <p className="mt-3 text-sm text-[#c8c8c8]">
            Sign in to see companies you are allowed to access. There is no
            public tenant catalog.
          </p>
        </header>
        <Link href="/veriforge/tenant/login">
          <VeriForgeButton>Sign in</VeriForgeButton>
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <header className="border border-[#424242] bg-[#1A1A1A] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
          VeriForge SaaS Infrastructure
        </p>
        <h1 className={cn(veriforgeTypography.heading, "mt-2 text-2xl text-[#FAFAFA]")}>
          Tenant Directory
        </h1>
        <div className="mt-3 h-0.5 w-36 bg-[var(--vf-tenant-primary,#1E6FB8)] shadow-[0_0_12px_rgba(30, 111, 184,.55)]" />
        <p className="mt-3 text-sm text-[#c8c8c8]">
          Strict isolation · tenant-aware JWT · shared or dedicated DB · bucket storage ·
          horizontal API scaling.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {tenants.map((tenant) => (
          <div key={tenant.tenantId} style={brandingStyle(tenant.branding)}>
            <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
              <p className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
                {tenant.name}
              </p>
              <p className="mt-1 text-xs text-[#aaaaaa]">
                {tenant.tenantId} · {tenant.dbMode} DB · {tenant.status}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/veriforge/tenant/login?tenantId=${tenant.tenantId}`}>
                  <VeriForgeButton size="sm">Login</VeriForgeButton>
                </Link>
                <Link href={`/veriforge/tenant/${tenant.tenantId}/dashboard`}>
                  <VeriForgeButton size="sm" variant="secondary">
                    Open
                  </VeriForgeButton>
                </Link>
              </div>
            </VeriForgeFrame>
          </div>
        ))}
      </div>

      <VeriForgeAlert
        tone="neutral"
        title="ISOLATION RULE"
        message="No tenant can access another tenant’s data. All API responses and audit logs include tenantId metadata."
      />
    </div>
  );
}

export function VeriForgeTenantLoginForm() {
  const router = useRouter();
  const search =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const { login } = useVeriForgeTenant();
  const isProd = process.env.NODE_ENV === "production";
  const [tenantSlug, setTenantSlug] = React.useState(search?.get("slug") ?? "alloy");
  const [email, setEmail] = React.useState(isProd ? "" : "ops@alloy.works");
  const [password, setPassword] = React.useState(isProd ? "" : "Str0ng!Passw0rd");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await login({ tenantSlug, email, password });
      router.push(`/veriforge/tenant/${session.tenantId}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <VeriForgeFrame className="border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-6">
        <div className="mb-4 flex justify-center">
          <VeriForgeLogo />
        </div>
        <h1 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
          Tenant-Aware Login
        </h1>
        <p className="mt-2 text-sm text-[#b8b8b8]">
          Signs in against the server user pool. The token carries tenantId; the
          API will not take tenant from a header or form spoof.
        </p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <VeriForgeTextField
            label="Tenant slug"
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value)}
            required
          />
          <VeriForgeTextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <VeriForgeTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <VeriForgeAlert tone="critical" title="AUTH FAILED" message={error} />
          ) : null}
          <VeriForgeButton type="submit" className="w-full" disabled={busy}>
            Authenticate
          </VeriForgeButton>
        </form>
      </VeriForgeFrame>
    </div>
  );
}

function TenantPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const params = useParams<{ tenantId: string }>();
  return (
    <header className="mb-4 border border-[#424242] bg-[#1A1A1A] p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#ffc9c9]">
        /tenant/{params.tenantId}
      </p>
      <h1 className={cn(veriforgeTypography.heading, "mt-2 text-xl text-[#FAFAFA]")}>
        {title}
      </h1>
      <div className="mt-3 h-0.5 w-28 bg-[var(--vf-tenant-primary,#1E6FB8)]" />
      <p className="mt-3 text-sm text-[#c8c8c8]">{description}</p>
    </header>
  );
}

export function VeriForgeTenantDashboard() {
  const params = useParams<{ tenantId: string }>();
  const { session, tenants } = useVeriForgeTenant();
  const tenant =
    tenants.find((item) => item.tenantId === params.tenantId) ?? tenants[0];

  return (
    <div className="space-y-4">
      <TenantPageHeader
        title="Tenant Dashboard"
        description="Tenant-scoped training, verification, and compliance signals with isolation metadata."
      />
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={<AnvilIcon className="text-[var(--vf-tenant-primary,#1E6FB8)]" />}
          label="DB Mode"
          value={tenant?.dbMode ?? "shared"}
        />
        <MetricCard
          icon={<ShieldGridIcon className="text-[var(--vf-tenant-primary,#1E6FB8)]" />}
          label="Session Tenant"
          value={session?.tenantId === params.tenantId ? "Matched" : "Header/Param"}
        />
        <MetricCard
          icon={<ForgeBoltIcon className="text-[var(--vf-tenant-primary,#1E6FB8)]" />}
          label="Encryption"
          value={`kek-${params.tenantId}-v1`}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SurfaceCard
          href={`/veriforge/tenant/${params.tenantId}/training`}
          title="Training"
          detail="Tenant user-pool assignments"
        />
        <SurfaceCard
          href={`/veriforge/tenant/${params.tenantId}/verification`}
          title="Verification"
          detail="forgeCheck with tenantId FK"
        />
        <SurfaceCard
          href={`/veriforge/tenant/${params.tenantId}/compliance`}
          title="Compliance"
          detail="Isolated document vault"
        />
      </div>
      <VeriForgeAlert
        tone="neutral"
        title="META CONTRACT"
        message={`All responses include meta.tenantId=${params.tenantId}. Cross-tenant JWT mismatch is rejected.`}
      />
    </div>
  );
}

export function VeriForgeTenantTrainingPage() {
  const params = useParams<{ tenantId: string }>();
  const { session } = useVeriForgeTenant();
  const [modules, setModules] = React.useState([
    { id: "trn-1", title: "Lockout-Tagout", progress: 40 },
    { id: "trn-2", title: "High-Heat Response", progress: 15 },
  ]);

  return (
    <div className="space-y-4">
      <TenantPageHeader
        title="Tenant Training"
        description="Modules scoped by tenantId column (Option A) or dedicated DB (Option B)."
      />
      {modules.map((item) => (
        <VeriForgeFrame key={item.id} className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-[#f0f0f0]">{item.title}</p>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              tenantId: {params.tenantId}
            </span>
          </div>
          <div className="mt-3">
            <VeriForgeProgressBar label="Progress" value={item.progress} />
          </div>
        </VeriForgeFrame>
      ))}
      {canMutateTenantDemo(session?.role) ? (
        <VeriForgeButton
          onClick={() =>
            setModules((prev) => [
              {
                id: `trn-${Date.now()}`,
                title: "Site Orientation",
                progress: 0,
              },
              ...prev,
            ])
          }
        >
          Assign Module
        </VeriForgeButton>
      ) : (
        <p className="text-xs text-[#8f8f8f]">Read-only reviewer session</p>
      )}
    </div>
  );
}

export function VeriForgeTenantVerificationPage() {
  const params = useParams<{ tenantId: string }>();
  const { session } = useVeriForgeTenant();
  const [status, setStatus] = React.useState<"Pending" | "Pass" | "Fail">("Pending");

  return (
    <div className="space-y-4">
      <TenantPageHeader
        title="Tenant Verification"
        description="forgeCheck workflows are tenant-aware; audit entries always include tenantId."
      />
      <VeriForgeFrame
        className={cn(
          "bg-[#1A1A1A] p-4",
          status === "Fail"
            ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.35)]"
            : "border-[#424242]",
        )}
      >
        <p className={cn(veriforgeTypography.heading, "text-sm")}>forgeCheck Status</p>
        <p className="mt-2 text-2xl text-[#FAFAFA]">{status}</p>
        <p className="mt-2 text-xs text-[#aaaaaa]">tenantId · {params.tenantId}</p>
        {canMutateTenantDemo(session?.role) ? (
          <div className="mt-4 flex gap-2">
            <VeriForgeButton onClick={() => setStatus("Pass")}>Pass</VeriForgeButton>
            <VeriForgeButton variant="secondary" onClick={() => setStatus("Fail")}>
              Fail
            </VeriForgeButton>
            <VeriForgeButton variant="ghost" onClick={() => setStatus("Pending")}>
              Reset
            </VeriForgeButton>
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#8f8f8f]">Read-only reviewer session</p>
        )}
      </VeriForgeFrame>
    </div>
  );
}

export function VeriForgeTenantCompliancePage() {
  const params = useParams<{ tenantId: string }>();
  const { session } = useVeriForgeTenant();
  const [docs, setDocs] = React.useState([
    { id: "doc-1", name: "OSHA 30", status: "valid" },
    { id: "doc-2", name: "Trade License", status: "expired" },
  ]);

  return (
    <div className="space-y-4">
      <TenantPageHeader
        title="Tenant Compliance"
        description="Documents stored in tenant-specific buckets with encryption key isolation."
      />
      {docs.map((doc) => (
        <VeriForgeFrame
          key={doc.id}
          className={cn(
            "bg-[#1A1A1A] p-4",
            doc.status === "expired"
              ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
              : "border-[#424242]",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#f0f0f0]">{doc.name}</p>
              <p className="text-xs text-[#aaaaaa]">
                bucket: veriforge-{params.tenantId} · {doc.status}
              </p>
            </div>
            <HeatEdgeIcon
              className={doc.status === "expired" ? "text-[#1E6FB8]" : "text-[#8f8f8f]"}
            />
          </div>
        </VeriForgeFrame>
      ))}
      {canMutateTenantDemo(session?.role) ? (
        <VeriForgeButton
          onClick={() =>
            setDocs((prev) => [
              { id: `doc-${Date.now()}`, name: "Uploaded COI", status: "valid" },
              ...prev,
            ])
          }
        >
          Upload To Tenant Bucket
        </VeriForgeButton>
      ) : (
        <p className="text-xs text-[#8f8f8f]">Read-only reviewer session</p>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
      <div className="mb-2">{icon}</div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#bdbdbd]">{label}</p>
      <p className="mt-1 text-sm text-[#FAFAFA]">{value}</p>
    </VeriForgeFrame>
  );
}

function SurfaceCard({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className="block">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4 transition hover:border-[var(--vf-tenant-primary,#1E6FB8)]">
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
          {title}
        </p>
        <p className="mt-2 text-xs text-[#b0b0b0]">{detail}</p>
      </VeriForgeFrame>
    </Link>
  );
}
