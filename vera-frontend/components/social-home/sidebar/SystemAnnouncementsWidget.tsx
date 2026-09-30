"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const ANNOUNCEMENTS = [
  { title: "Verus network", body: "Connect with training providers and employers across Canada." },
  { title: "Safety first", body: "Share bulletins and milestones — compliance stays in admin tools." },
];

export function SystemAnnouncementsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">From Verus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.title}>
            <p className="font-medium text-foreground">{a.title}</p>
            <p className="mt-1">{a.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
