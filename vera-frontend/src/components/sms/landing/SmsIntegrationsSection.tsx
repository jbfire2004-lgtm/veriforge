"use client";

import Link from "next/link";
import type { SmsCoreIntegration } from "@/lib/sms-core-integrations";
import { SmsCard, SmsSection } from "@/src/components/sms/design-system";

type Props = {
  items: SmsCoreIntegration[];
  title?: string;
  description?: string;
};

/** SMS Core landing — platform federation cards (SmsModuleLayout section). */
export function SmsIntegrationsSection({
  items,
  title = "Platform integrations",
  description = "SMS Core federates Projects, FieldOS, Emergency / ERP, SIF/HECA, and Safety Hub under one design template.",
}: Props) {
  return (
    <SmsSection title={title} description={description}>
      <div className="sms-grid sms-grid-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.href} className="block h-full">
              <SmsCard
                padding="md"
                className="h-full transition hover:border-[color-mix(in_srgb,var(--sf-accent)_45%,var(--sf-border))]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="sms-text-label">{item.label}</p>
                  <Icon
                    className="h-4 w-4 shrink-0 text-[var(--sms-secondary)]"
                    aria-hidden
                  />
                </div>
                <p className="sms-text-body-muted mt-2 text-sm">
                  {item.description}
                </p>
              </SmsCard>
            </Link>
          );
        })}
      </div>
    </SmsSection>
  );
}
