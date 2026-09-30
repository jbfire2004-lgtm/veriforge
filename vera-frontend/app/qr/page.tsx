"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Camera,
  GraduationCap,
  HardHat,
  Info,
  ScanLine,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  StatusPill,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { QrScanner } from "@/components/verify/QrScanner";
import {
  equipmentVerifyPath,
  routeScanTarget,
  workerVerifyPath,
  type QrRouteAudience,
} from "@/lib/wallet-routing";

type VerifyType = "worker" | "credential" | "training" | "company" | "equipment";

type TypeMeta = {
  id: VerifyType;
  label: string;
  icon: LucideIcon;
  hint: string;
  destination: (id: number) => string;
};

const TYPE_META: Record<VerifyType, TypeMeta> = {
  worker: {
    id: "worker",
    label: "Worker",
    icon: User,
    hint: "Opens the public verification card at /verify/{id} — no login.",
    destination: (id) => workerVerifyPath(id),
  },
  credential: {
    id: "credential",
    label: "Credential",
    icon: ShieldCheck,
    hint: "Verifies a credential card with status, worker, and history.",
    destination: (id) => `/verify/credential?id=${encodeURIComponent(String(id))}`,
  },
  training: {
    id: "training",
    label: "Training record",
    icon: GraduationCap,
    hint: "Shows training metadata, the worker, and the certificate file.",
    destination: (id) => `/verify/core/training/${id}`,
  },
  company: {
    id: "company",
    label: "Company",
    icon: Building2,
    hint: "Opens the company directory and workers list.",
    destination: (id) => `/companies/${id}`,
  },
  equipment: {
    id: "equipment",
    label: "Equipment",
    icon: HardHat,
    hint: "Opens public equipment verification — never routes to /admin.",
    destination: (id) => equipmentVerifyPath(id),
  },
};

const TYPE_OPTIONS: VerifyType[] = [
  "worker",
  "credential",
  "training",
  "company",
  "equipment",
];

function parsePositiveInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/** Try to infer the verify target from a scanned QR. Returns null if unknown. */
function decodeScan(
  text: string,
  audience: QrRouteAudience = "public",
): { type: VerifyType; id: number; href: string } | null {
  const routed = routeScanTarget(text, audience);
  if (!routed) return null;

  if (routed.kind === "worker") {
    const idMatch = /\/verify\/(\d+)/.exec(routed.href);
    return {
      type: "worker",
      id: idMatch ? Number(idMatch[1]) : 0,
      href: routed.href,
    };
  }

  if (routed.kind === "equipment") {
    const idMatch = /[?&]id=(\d+)/.exec(routed.href);
    return {
      type: "equipment",
      id: idMatch ? Number(idMatch[1]) : 0,
      href: routed.href,
    };
  }

  if (routed.kind === "certificate") {
    return { type: "credential", id: 0, href: routed.href };
  }

  if (routed.kind === "combined") {
    const workerMatch = /worker=(\d+)/.exec(routed.href);
    return {
      type: "worker",
      id: workerMatch ? Number(workerMatch[1]) : 0,
      href: routed.href,
    };
  }

  return null;
}

export default function QrScanPage() {
  const router = useRouter();
  const [type, setType] = useState<VerifyType>("worker");
  const [idInput, setIdInput] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMeta = useMemo(() => TYPE_META[type], [type]);
  const SelectedTypeIcon = selectedMeta.icon;

  const navigate = useCallback(
    (next: { type: VerifyType; id: number; href?: string }) => {
      const target =
        next.href ??
        (next.type === "worker"
          ? workerVerifyPath(next.id)
          : TYPE_META[next.type].destination(next.id));
      router.push(target);
    },
    [router]
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = parsePositiveInt(idInput);
    if (id == null) {
      setError("Enter a positive whole number such as 42.");
      return;
    }
    setError(null);
    navigate({ type, id });
  };

  const onDecode = useCallback(
    (text: string) => {
      const next = decodeScan(text, "public");
      if (next == null) {
        setError("Could not decode that QR. Try again or enter the ID manually.");
        return;
      }
      setError(null);
      if (next.type !== "credential") {
        setType(next.type);
        setIdInput(String(next.id));
      }
      setScanOpen(false);
      navigate(next);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-vera-white pb-vera-16">
      <div className="mx-auto max-w-2xl px-vera-5 py-vera-10 md:px-vera-8">
        <div className="mb-vera-8 space-y-vera-4">
          <Breadcrumbs
            items={[{ label: "VERA", href: "/" }, { label: "Verify" }]}
          />
          <div className="space-y-vera-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-vera-teal">
              Field verification
            </p>
            <h1 className="text-3xl font-medium tracking-tight text-vera-deep md:text-4xl">
              Scan to verify
            </h1>
            <p className="max-w-2xl text-sm font-normal leading-relaxed text-vera-muted md:text-base">
              This scanner is for <strong>public verification</strong> — no sign-in.
              Worker QRs open <span className="font-mono text-xs">/verify/&#123;id&#125;</span>;
              equipment QRs open <span className="font-mono text-xs">/verify/equipment</span>.
              Signed-in staff use <span className="font-mono text-xs">/wallet/&#123;id&#125;</span> for
              the full hub.
            </p>
          </div>
        </div>

        <Card className="mb-vera-6 border-vera-charcoal/10 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
            <div className="flex items-center gap-vera-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-vera-teal/10 text-vera-deep ring-1 ring-inset ring-vera-teal/20">
                <ScanLine className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-xl tracking-tight">
                  Scan or enter ID
                </CardTitle>
                <CardDescription>
                  Choose a target type then scan a QR or paste the numeric ID.
                </CardDescription>
              </div>
            </div>
            <StatusPill tone="info" icon={ShieldCheck} subtle>
              Public
            </StatusPill>
          </CardHeader>
          <CardContent className="space-y-vera-5">
            <form
              onSubmit={onSubmit}
              className="grid gap-vera-4 sm:grid-cols-[180px_1fr_auto] sm:items-end"
            >
              <div className="min-w-0 space-y-vera-2">
                <Label htmlFor="verify-type">Type</Label>
                <Select
                  id="verify-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as VerifyType)}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {TYPE_META[opt].label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="min-w-0 space-y-vera-2">
                <Label htmlFor="verify-id">{selectedMeta.label} ID</Label>
                <Input
                  id="verify-id"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 42"
                  value={idInput}
                  onChange={(e) => {
                    setIdInput(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="off"
                  aria-invalid={error != null}
                  aria-describedby={error != null ? "verify-id-error" : undefined}
                />
              </div>

              <div className="flex flex-wrap gap-vera-2 sm:flex-nowrap">
                <Button
                  type="submit"
                  variant="teal"
                  disabled={idInput.trim() === ""}
                >
                  Verify
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScanOpen(!scanOpen)}
                  aria-pressed={scanOpen}
                >
                  <Camera className="mr-vera-2 h-4 w-4" aria-hidden />
                  {scanOpen ? "Stop" : "Scan"}
                </Button>
              </div>
            </form>

            {error != null && (
              <p
                id="verify-id-error"
                className="rounded-xl border border-red-200 bg-red-50/70 px-vera-4 py-vera-3 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}

            <p className="flex items-start gap-vera-2 text-xs text-vera-muted">
              <SelectedTypeIcon
                className="h-4 w-4 shrink-0 text-vera-teal"
                aria-hidden
              />
              <span>{selectedMeta.hint}</span>
            </p>

            <QrScanner
              open={scanOpen}
              onClose={() => setScanOpen(false)}
              onDecode={onDecode}
            />
          </CardContent>
        </Card>

        <Card className="border-vera-charcoal/10 shadow-sm">
          <CardHeader className="flex flex-row items-start gap-vera-3 space-y-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vera-surface text-vera-deep ring-1 ring-inset ring-vera-charcoal/10">
              <Info className="h-4 w-4" aria-hidden />
            </span>
            <div className="space-y-vera-1">
              <CardTitle className="text-base">Public vs staff paths</CardTitle>
              <CardDescription>
                Printed worker QRs encode public verify URLs. Staff bookmarks and
                in-app links may use /wallet for the authenticated hub.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mb-vera-4 grid gap-vera-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-vera-4">
              <p className="font-semibold text-emerald-900">Public (this page)</p>
              <ul className="mt-vera-2 space-y-vera-1 font-mono text-xs text-emerald-950">
                <li>/verify/&#123;workerId&#125;</li>
                <li>/verify/t/&#123;token&#125;</li>
                <li>/verify/equipment?id=&#123;id&#125;</li>
              </ul>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-vera-4">
              <p className="font-semibold text-sky-900">Staff (sign-in required)</p>
              <ul className="mt-vera-2 space-y-vera-1 font-mono text-xs text-sky-950">
                <li>/wallet/&#123;workerId&#125;</li>
                <li>/equipment/&#123;id&#125;/wallet</li>
              </ul>
            </div>
          </CardContent>
          <CardHeader className="flex flex-row items-start gap-vera-3 space-y-0 border-t border-vera-charcoal/10 pt-vera-5">
            <div className="space-y-vera-1">
              <CardTitle className="text-base">Supported QR formats</CardTitle>
              <CardDescription>
                The scanner reads any of these — pick a type only when entering
                an ID manually.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-vera-3">
            <ul className="space-y-vera-2 text-sm text-vera-charcoal">
              <li className="flex items-center gap-vera-3">
                <StatusPill tone="info" subtle>
                  ID
                </StatusPill>
                <span className="font-mono text-xs text-vera-muted">42</span>
              </li>
              <li className="flex items-center gap-vera-3">
                <StatusPill tone="info" subtle>
                  URL
                </StatusPill>
                <span className="font-mono text-xs text-vera-muted">
                  https://vera.app/verify/42
                </span>
              </li>
              <li className="flex items-center gap-vera-3">
                <StatusPill tone="info" subtle>
                  JSON
                </StatusPill>
                <span className="font-mono text-xs text-vera-muted">
                  {`{"type":"credential","id":42}`}
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-vera-2 pt-vera-2">
              <Link
                href="/verify/credential"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <ShieldCheck className="mr-vera-2 h-4 w-4" aria-hidden />
                Credential viewer
              </Link>
              <Link
                href="/verify/worker"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <User className="mr-vera-2 h-4 w-4" aria-hidden />
                Worker verification
              </Link>
              <Link
                href="/verify/training"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                <GraduationCap className="mr-vera-2 h-4 w-4" aria-hidden />
                Training viewer
              </Link>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-vera-12 text-center text-xs text-vera-muted">
          VERA · Verification entry point · For official verification use site
          procedures.
        </footer>
      </div>
    </div>
  );
}
