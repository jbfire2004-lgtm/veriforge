import Link from "next/link";
import type { SmsQuickAction } from "./sms-landing-config";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import { SmsSection } from "@/src/components/sms/design-system";

type Props = {
  actions: SmsQuickAction[];
  querySuffix?: string;
};

/** Section 1 — large tappable tiles for starting common SMS workflows. */
export function SmsQuickActionsSection({ actions, querySuffix = "" }: Props) {
  return (
    <SmsSection title="Quick Actions" description="Start a field workflow in one tap.">
      <ul className="grid grid-cols-1 gap-[var(--sms-space-4)] sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <Link
                href={`${action.href}${querySuffix}`}
                aria-label={`${action.title}: ${action.description}`}
                className={sfCn(
                  "sms-tap-target group flex h-full min-h-[5.5rem] flex-col gap-3 rounded-[var(--sf-radius-lg)] border border-[var(--sf-border)]",
                  "bg-[var(--sf-surface)] p-[var(--sms-space-5)] shadow-[var(--sf-shadow-sm)] transition",
                  "hover:border-[var(--sms-secondary)]/40 hover:shadow-[var(--sf-shadow-md)] active:scale-[0.99]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sms-secondary)]",
                )}
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--sf-radius-md)] bg-[var(--sms-secondary-muted)] text-[var(--sms-secondary)]"
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span>
                  <span className="sms-text-h3 block">{action.title}</span>
                  <span className="sms-text-body-muted mt-1 block line-clamp-2">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </SmsSection>
  );
}
