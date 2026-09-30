"use client";

import { QrCode } from "lucide-react";
import {
  buildQuickActions,
} from "@/lib/navigation/dashboard-config";
import { QuickActionButton } from "@/components/vera-core/dashboard";
import { FloatingActionButton } from "@/components/vera-core/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = {
  role: string | null;
};

export function DashboardQuickActionsPanel({ role }: Props) {
  const quickActions = buildQuickActions(role);
  const hasScanFab = quickActions.some((a) => a.id === "scanQr");

  if (quickActions.length === 0) return null;

  return (
    <>
      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">Quick actions</CardTitle>
          <CardDescription>Common tasks for your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-vera-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <li key={action.id}>
                <QuickActionButton
                  href={action.href}
                  label={action.label}
                  description={action.description}
                  icon={action.icon}
                />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {hasScanFab ? (
        <FloatingActionButton
          href="/supervisor/scan"
          label="Scan QR"
          icon={QrCode}
        />
      ) : null}
    </>
  );
}
