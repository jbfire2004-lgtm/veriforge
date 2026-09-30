"use client";

import {
  MobileAngularCard,
  MobileScreenHeader,
  MobileStatusChip,
  VeriForgeButton,
  useVeriForgeNotifications,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

export default function VeriForgeMobileNotificationsPage() {
  const { queue, unreadCount, markRead, dismiss, clearAll } = useVeriForgeNotifications();

  return (
    <div className="space-y-4">
      <MobileScreenHeader
        kicker="Mobile Notifications"
        title="Alert Forge"
        description="Red metallic critical alerts and steel-grey info alerts in an angular layout."
      />

      <MobileAngularCard critical={unreadCount > 0}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
            Unread · {unreadCount}
          </p>
          <VeriForgeButton size="sm" variant="secondary" onClick={clearAll}>
            Clear All
          </VeriForgeButton>
        </div>
      </MobileAngularCard>

      <div className="space-y-2">
        {queue.length === 0 ? (
          <MobileAngularCard>
            <p className="text-sm text-[#b8b8b8]">No active alerts in the forge queue.</p>
          </MobileAngularCard>
        ) : (
          queue.map((item) => {
            const critical = item.tone === "critical";
            return (
              <MobileAngularCard key={item.id} critical={critical}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#FAFAFA]")}>
                        {item.title}
                      </p>
                      <MobileStatusChip
                        label={item.tone}
                        tone={critical ? "critical" : item.tone === "success" ? "pass" : "neutral"}
                      />
                    </div>
                    <p className="mt-2 text-sm text-[#d0d0d0]">{item.message}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                      {item.category} · {item.forgeStatus} · {item.timestamp.slice(0, 19)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {!item.read ? (
                    <VeriForgeButton size="sm" variant="secondary" onClick={() => markRead(item.id)}>
                      Mark Read
                    </VeriForgeButton>
                  ) : null}
                  <VeriForgeButton size="sm" variant="ghost" onClick={() => dismiss(item.id)}>
                    Dismiss
                  </VeriForgeButton>
                </div>
              </MobileAngularCard>
            );
          })
        )}
      </div>
    </div>
  );
}
