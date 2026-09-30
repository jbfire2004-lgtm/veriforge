import { AlertTriangle, CheckCircle2, HardHat, ShieldOff } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui";
import type { CompanyEquipment } from "./types";

export default function EquipmentPanel({ equipment }: { equipment: CompanyEquipment[] }) {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-vera-3">
          <HardHat className="h-6 w-6 text-vera-teal" aria-hidden />
          <div>
            <CardTitle className="text-xl tracking-tight">Equipment</CardTitle>
            <CardDescription>Assets owned by this company.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {equipment.length === 0 ? (
          <EmptyState
            icon={HardHat}
            title="No equipment on file"
            description="Equipment registered to this company will show here."
          />
        ) : (
          <ul className="divide-y divide-vera-charcoal/10">
            {equipment.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-vera-3 py-vera-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-vera-charcoal">{e.name ?? "Equipment"}</p>
                  <p className="text-xs text-vera-muted">ID #{e.id}</p>
                </div>
                {e.safetyStatus != null && (
                  <Badge
                    variant={
                      e.safetyStatus === "OK"
                        ? "success"
                        : e.safetyStatus === "NEEDS_INSPECTION"
                          ? "warning"
                          : "danger"
                    }
                    icon={
                      e.safetyStatus === "OK"
                        ? CheckCircle2
                        : e.safetyStatus === "NEEDS_INSPECTION"
                          ? AlertTriangle
                          : ShieldOff
                    }
                  >
                    {e.safetyStatus}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
