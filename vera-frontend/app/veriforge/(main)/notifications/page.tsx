"use client";

import {
  VeriForgeButton,
  VeriForgeContentBlock,
  VeriForgeInlineAlert,
  VeriForgeNotificationCenter,
  useVeriForgeNotifications,
  type VeriForgeNotification,
} from "@/components/veriforge";

const inlineCritical: VeriForgeNotification = {
  id: "inline-critical",
  category: "system",
  tone: "critical",
  title: "CRITICAL SYSTEM ALERT",
  message: "Emergency ventilation fallback engaged in Zone 7.",
  timestamp: new Date().toISOString(),
  forgeStatus: "failed",
  userId: 1,
  actionLabel: "Dispatch Response",
};

export default function VeriForgeNotificationsPage() {
  const { push } = useVeriForgeNotifications();

  return (
    <div className="space-y-[var(--vf-spacing-md)]">
      <VeriForgeInlineAlert item={inlineCritical} />

      <VeriForgeContentBlock
        title="Notification Delivery Controls"
        description="Priority queue with critical override, grouped training/compliance events, and forge metadata."
      >
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <VeriForgeButton
            onClick={() =>
              push({
                category: "system",
                tone: "critical",
                title: "System Hazard Escalation",
                message: "Critical pressure event requires immediate supervisor response.",
                forgeStatus: "failed",
                userId: 7,
                actionLabel: "View Incident",
              })
            }
          >
            Trigger Critical
          </VeriForgeButton>
          <VeriForgeButton
            variant="secondary"
            onClick={() =>
              push({
                category: "training",
                tone: "warning",
                title: "Training Overdue",
                message: "Confined Space recertification deadline approaching.",
                forgeStatus: "pending",
                userId: 7,
                actionLabel: "Assign Module",
              })
            }
          >
            Trigger Training
          </VeriForgeButton>
          <VeriForgeButton
            variant="ghost"
            onClick={() =>
              push({
                category: "verification",
                tone: "info",
                title: "forgeCheck Started",
                message: "Verification workflow initiated for worker profile W-103.",
                forgeStatus: "pending",
                userId: 7,
                actionLabel: "Open Workflow",
              })
            }
          >
            Trigger Verification
          </VeriForgeButton>
          <VeriForgeButton
            variant="secondary"
            onClick={() =>
              push({
                category: "compliance",
                tone: "warning",
                title: "Documents Required",
                message: "Two required compliance documents are missing.",
                forgeStatus: "pending",
                userId: 7,
                actionLabel: "Upload Docs",
              })
            }
          >
            Trigger Compliance
          </VeriForgeButton>
          <VeriForgeButton
            variant="ghost"
            onClick={() =>
              push({
                category: "activity",
                tone: "success",
                title: "Profile Updated",
                message: "User security profile updated successfully.",
                forgeStatus: "verified",
                userId: 7,
                actionLabel: "View Profile",
              })
            }
          >
            Trigger Activity
          </VeriForgeButton>
        </div>
      </VeriForgeContentBlock>

      <VeriForgeNotificationCenter />
    </div>
  );
}

