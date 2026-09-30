"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function UpcomingEventsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Upcoming events</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>Toolbox talks, union meetings, and provider open houses will appear here.</p>
      </CardContent>
    </Card>
  );
}
