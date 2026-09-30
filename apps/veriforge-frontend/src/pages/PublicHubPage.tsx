import { Link } from "react-router-dom";
import {
  PUBLIC_VERIHUB_FREE,
  PUBLIC_VERIHUB_SUBSCRIBER,
  veraAppTargetLabel,
  veraAppUrl,
} from "../lib/module-links";

function FeatureGrid({
  title,
  subtitle,
  features,
  locked,
}: {
  title: string;
  subtitle: string;
  features: typeof PUBLIC_VERIHUB_FREE;
  locked?: boolean;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-forge-ink">{title}</h2>
        <p className="mt-1 text-sm text-forge-steel">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) =>
          locked ? (
            <article key={feature.path} className="vf-panel relative p-5 opacity-90">
              <p className="text-xs font-semibold uppercase tracking-wide text-forge-alert">
                Subscription required
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-forge-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-forge-steel">{feature.description}</p>
              <Link to="/signup" className="vf-btn-primary mt-4 inline-flex text-sm">
                Start free trial
              </Link>
            </article>
          ) : (
            <a
              key={feature.path}
              href={veraAppUrl(feature.path)}
              className="vf-panel block p-5 transition hover:border-forge-moss/50 hover:shadow-panel"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-forge-moss">Free</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-forge-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-forge-steel">{feature.description}</p>
              <p className="mt-4 text-sm font-semibold text-forge-moss">Open →</p>
            </a>
          ),
        )}
      </div>
    </section>
  );
}

export function PublicHubPage() {
  return (
    <div className="space-y-10" data-testid="public-hub-page">
      <div className="vf-panel p-6 sm:p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-moss">
          VeriHub · Public preview
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forge-ink sm:text-4xl">
          Explore VeriHub before you subscribe
        </h1>
        <p className="mt-3 max-w-3xl text-forge-steel">
          Industry safety intelligence, recalls, bulletins, and the job board are available to
          everyone. Start a VeriForge trial to unlock company dashboards, activity feeds, and full
          workspace integration.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={veraAppUrl("/hub")} className="vf-btn-primary">
            Open public Hub home
          </a>
          <Link to="/signup" className="vf-btn-secondary">
            Start free trial
          </Link>
        </div>
        <p className="mt-4 text-sm text-forge-steel">
          Free links open at{" "}
          <span className="font-mono text-forge-ink">{veraAppTargetLabel()}</span> (same site,
          port 5175).
        </p>
      </div>

      <FeatureGrid
        title="Free for everyone"
        subtitle="No account or subscription required — opens in the public hub."
        features={PUBLIC_VERIHUB_FREE}
      />

      <FeatureGrid
        title="Included with VeriForge trial"
        subtitle="Subscribe or start a trial to unlock these workspace features."
        features={PUBLIC_VERIHUB_SUBSCRIBER}
        locked
      />
    </div>
  );
}
