import Link from "next/link";
import type { SmsToolCard } from "./sms-landing-config";
import { SmsButton, SmsCard, SmsSection } from "@/src/components/sms/design-system";

type Props = {
  tools: SmsToolCard[];
  querySuffix?: string;
};

/** Section 2 — tool cards with Open actions for each SMS module. */
export function SmsToolsPanelSection({ tools, querySuffix = "" }: Props) {
  return (
    <SmsSection title="Tools" description="Registers, libraries, and workspaces.">
      <ul className="sms-grid sms-grid-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <li key={tool.id}>
              <SmsCard padding="md" className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--sf-radius-md)] bg-[var(--sms-secondary-muted)] text-[var(--sms-secondary)]"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="sms-text-h3">{tool.title}</h3>
                    <p className="sms-text-body-muted mt-1 line-clamp-2">{tool.description}</p>
                  </div>
                </div>
                <div className="mt-auto pt-[var(--sms-space-4)]">
                  <Link href={`${tool.href}${querySuffix}`} aria-label={`Open ${tool.title}`}>
                    <SmsButton
                      type="button"
                      variant="secondary"
                      className="sms-tap-target w-full sm:w-auto"
                    >
                      Open
                    </SmsButton>
                  </Link>
                </div>
              </SmsCard>
            </li>
          );
        })}
      </ul>
    </SmsSection>
  );
}
