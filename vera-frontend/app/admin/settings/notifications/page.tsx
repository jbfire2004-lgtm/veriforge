"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  getNotificationSettings,
  sendTestNotification,
  updateNotificationSettings,
  type NotificationPreferences,
} from "@/lib/api/notifications";
import { Button, Card, CardContent, ErrorState, Input, Label, Skeleton } from "@/components/ui";

const TOGGLES: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "inAppEnabled", label: "In-app notifications" },
  { key: "emailEnabled", label: "Email" },
  { key: "smsEnabled", label: "SMS" },
  { key: "pushEnabled", label: "Push" },
  { key: "inspectionDue", label: "Inspection due" },
  { key: "competencyExpiry", label: "Competency expiry" },
  { key: "ppeExpiry", label: "PPE expiry" },
  { key: "maintenanceDue", label: "Maintenance due" },
  { key: "calibrationDue", label: "Calibration due" },
  { key: "assignmentAlerts", label: "Assignment alerts" },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setPrefs(await getNotificationSettings());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      }
    })();
  }, []);

  async function save() {
    if (!prefs) return;
    setBusy(true);
    setSaved(false);
    try {
      const updated = await updateNotificationSettings(prefs);
      setPrefs(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!prefs && !error) {
    return (
      <AdminPageShell title="Notification settings" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}>
        <Skeleton className="h-64 w-full max-w-lg rounded-xl" />
      </AdminPageShell>
    );
  }

  if (error && !prefs) {
    return (
      <AdminPageShell title="Notification settings">
        <ErrorState title="Settings unavailable" description={error} />
      </AdminPageShell>
    );
  }

  if (!prefs) return null;

  return (
    <AdminPageShell
      title="Notification settings"
      description="Choose channels and alert types. Email/SMS/push use provider stubs until production keys are configured."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Notifications", href: "/admin/notifications" },
        { label: "Settings" },
      ]}
    >
      <Card className="max-w-lg">
        <CardContent className="space-y-6 pt-6">
          <section className="space-y-3">
            {TOGGLES.map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between gap-4 text-sm">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(prefs[key])}
                  onChange={(e) =>
                    setPrefs({ ...prefs, [key]: e.target.checked } as NotificationPreferences)
                  }
                />
              </label>
            ))}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Quiet hours start</Label>
              <Input
                type="time"
                value={prefs.quietHoursStart ?? ""}
                onChange={(e) =>
                  setPrefs({ ...prefs, quietHoursStart: e.target.value || null })
                }
              />
            </div>
            <div>
              <Label>Quiet hours end</Label>
              <Input
                type="time"
                value={prefs.quietHoursEnd ?? ""}
                onChange={(e) =>
                  setPrefs({ ...prefs, quietHoursEnd: e.target.value || null })
                }
              />
            </div>
          </section>

          <section>
            <Label>SMS phone</Label>
            <Input
              value={prefs.phone ?? ""}
              onChange={(e) => setPrefs({ ...prefs, phone: e.target.value || null })}
              placeholder="+1..."
            />
          </section>

          <section className="flex flex-wrap gap-2">
            <Button variant="teal" disabled={busy} onClick={() => void save()}>
              {busy ? "Saving…" : "Save settings"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={async () => {
                await sendTestNotification();
              }}
            >
              Send test
            </Button>
          </section>
          {saved && <p className="text-sm text-teal-700">Settings saved.</p>}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
