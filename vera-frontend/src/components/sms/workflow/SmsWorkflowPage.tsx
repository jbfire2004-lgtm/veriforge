"use client";

import { useState, type ReactNode } from "react";
import { PmPageShell, type PmPageShellProps } from "@/src/components/pm/layout";
import { SmsBadge } from "@/src/components/sms/design-system";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import type { SmsWorkflowStep } from "./steps";
import { formatSmsWorkflowDate, formatSmsWorkflowStatus, smsWorkflowStatusTone } from "./status";
import { SmsWorkflowFooter, type SmsWorkflowFooterProps } from "./SmsWorkflowFooter";
import {
  SmsWorkflowToolDrawer,
  SmsWorkflowToolToggle,
  type SmsWorkflowToolAction,
} from "./SmsWorkflowToolDrawer";
import { SmsWorkflowStepNav } from "./SmsWorkflowStepNav";

export type SmsWorkflowPageProps = Omit<PmPageShellProps, "children" | "toolDrawer" | "footer"> & {
  steps: SmsWorkflowStep[];
  activeStep: string;
  onStepChange: (step: string) => void;
  status?: string | null;
  assignedTo?: string | null;
  lastUpdated?: string | Date | null;
  children: ReactNode;
  toolActions?: SmsWorkflowToolAction[];
  showToolDrawer?: boolean;
  footer?: SmsWorkflowFooterProps;
  stepValidationMessage?: string | null;
};

export function SmsWorkflowPage({
  title,
  eyebrow,
  description,
  filters,
  actions,
  mobileActions,
  width,
  className,
  auth,
  steps,
  activeStep,
  onStepChange,
  status,
  assignedTo,
  lastUpdated,
  children,
  toolActions,
  showToolDrawer = true,
  footer,
  stepValidationMessage,
}: SmsWorkflowPageProps) {
  const [toolOpen, setToolOpen] = useState(false);

  const formattedStatus = status ? formatSmsWorkflowStatus(status) : null;
  const formattedUpdated = formatSmsWorkflowDate(lastUpdated);
  const activeStepMeta = steps.find((s) => s.id === activeStep);

  const headerMeta = (
    <div className="flex flex-wrap items-center gap-2">
      {formattedStatus ? (
        <SmsBadge tone={smsWorkflowStatusTone(status!)}>{formattedStatus}</SmsBadge>
      ) : null}
      {assignedTo ? (
        <span className="sms-text-caption">
          <span className="text-[var(--sf-text-muted)]">Assigned </span>
          <span className="font-medium text-[var(--sf-text)]">{assignedTo}</span>
        </span>
      ) : null}
      {formattedUpdated ? (
        <span className="sms-text-caption text-[var(--sf-text-muted)]">
          Updated {formattedUpdated}
        </span>
      ) : null}
    </div>
  );

  const combinedDescription = (
    <div className="space-y-1.5">
      {headerMeta}
      {activeStepMeta?.description ? (
        <p className="sms-text-body-muted">{activeStepMeta.description}</p>
      ) : description ? (
        <div className="sms-text-body-muted">{description}</div>
      ) : null}
    </div>
  );

  return (
    <PmPageShell
      eyebrow={eyebrow ?? "Vera SMS"}
      title={title}
      description={combinedDescription}
      filters={filters}
      actions={actions}
      mobileActions={mobileActions}
      width={width ?? "default"}
      className={sfCn("pb-32 md:pb-28", className)}
      auth={auth}
      toolDrawer={
        showToolDrawer && toolActions?.length ? (
          <>
            <SmsWorkflowToolToggle onClick={() => setToolOpen(true)} />
            <SmsWorkflowToolDrawer
              open={toolOpen}
              onOpenChange={setToolOpen}
              actions={toolActions}
            />
          </>
        ) : undefined
      }
      footer={footer ? <SmsWorkflowFooter {...footer} stepError={stepValidationMessage} /> : undefined}
    >
      <div role="tablist" aria-label={`${title} workflow`} className="mb-[var(--sms-space-4)]">
        <SmsWorkflowStepNav
          steps={steps}
          activeStep={activeStep}
          onStepChange={onStepChange}
        />
      </div>
      <div className="min-h-[10rem]" role="tabpanel" aria-live="polite">
        {children}
      </div>
    </PmPageShell>
  );
}
