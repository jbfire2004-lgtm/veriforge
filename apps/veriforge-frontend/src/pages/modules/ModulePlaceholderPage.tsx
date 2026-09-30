import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ModuleCode } from "../../types/api";
import { MODULE_META } from "../../types/api";
import { MODULE_LAUNCH, veraAppTargetLabel, veraAppUrl } from "../../lib/module-links";

export function ModulePlaceholderPage({ code }: { code: ModuleCode }) {
  const { isModuleEnabled, hasActiveAccess } = useAuth();
  const meta = MODULE_META[code];
  const launch = MODULE_LAUNCH[code];
  const enabled = isModuleEnabled(code);
  const homeUrl = veraAppUrl(launch.homePath);

  if (!hasActiveAccess) {
    if (code === "verihub") {
      return (
        <div className="vf-panel space-y-4 p-8 text-center">
          <h1 className="font-display text-2xl font-bold">{meta.label} workspace is locked</h1>
          <p className="text-forge-steel">
            Your trial has ended or billing is not active. You can still use the{" "}
            <strong>free public VeriHub</strong> — industry safety, recalls, bulletins, and jobs —
            without a subscription.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/hub" className="vf-btn-primary">
              Explore free VeriHub
            </Link>
            <Link to="/billing/activate" className="vf-btn-secondary">
              Activate subscription
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="vf-panel p-8 text-center">
        <h1 className="font-display text-2xl font-bold">{meta.label} is locked</h1>
        <p className="mt-2 text-forge-steel">Activate your subscription to use this module.</p>
        <Link to="/billing/activate" className="vf-btn-primary mt-6 inline-flex">
          Activate subscription
        </Link>
      </div>
    );
  }

  if (!enabled) {
    if (code === "verihub") {
      return (
        <div className="vf-panel space-y-4 p-8 text-center">
          <h1 className="font-display text-2xl font-bold">{meta.label} is not enabled</h1>
          <p className="text-forge-steel">
            Ask an Owner or Admin to enable VeriHub for your organization, or browse the free public
            preview in the meantime.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/hub" className="vf-btn-primary">
              Explore free VeriHub
            </Link>
            <Link to="/dashboard" className="vf-btn-secondary">
              Back to dashboard
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="vf-panel p-8 text-center">
        <h1 className="font-display text-2xl font-bold">{meta.label} is not enabled</h1>
        <p className="mt-2 text-forge-steel">
          Ask an Owner or Admin to enable this module for your organization.
        </p>
        <Link to="/dashboard" className="vf-btn-secondary mt-6 inline-flex">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-moss">
            Module
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-forge-ink">{meta.label}</h1>
          <p className="mt-2 max-w-2xl text-forge-steel">{meta.blurb}</p>
        </div>
        <a href={homeUrl} className="vf-btn-primary">
          {launch.homeLabel}
        </a>
      </div>

      <p className="text-sm text-forge-steel">
        Opens at <span className="font-mono text-forge-ink">{veraAppTargetLabel()}</span> on this
        site (dev SPA :5175). From the repo root run{" "}
        <span className="font-mono">npm run dev:veriforge</span> so SaaS, Nest, workspace UI, and
        this SPA stay in sync.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {launch.features.map((feature) => (
          <a
            key={feature.path}
            href={veraAppUrl(feature.path)}
            className="vf-panel block p-5 transition hover:border-forge-moss/50 hover:shadow-panel"
          >
            <h2 className="font-display text-lg font-semibold text-forge-ink">{feature.title}</h2>
            <p className="mt-2 text-sm text-forge-steel">{feature.description}</p>
            <p className="mt-4 text-sm font-semibold text-forge-moss">Open module →</p>
          </a>
        ))}
      </div>
    </div>
  );
}
