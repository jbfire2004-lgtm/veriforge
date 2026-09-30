"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import {
  Building2,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  HardHat,
  QrCode,
  Users,
} from "lucide-react";
import { useAsyncResource } from "@/lib/use-async-resource";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  WalletPageSkeleton,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { EquipmentComplianceBadge } from "@/components/equipment/EquipmentComplianceBadge";
import {
  getEquipmentWalletFull,
  type EquipmentMaintenanceSummary,
  type EquipmentWalletFull,
} from "@/lib/api/equipment-wallet";
import { formatShortDate } from "./worker-wallet-utils";

const QRCodeSVG = dynamic(() => import("react-qr-code").then((m) => m.default), {
  ssr: false,
  loading: () => <Skeleton className="h-44 w-44 rounded-xl" />,
});

function useWindowOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    () => "",
  );
}

async function loadEquipmentWallet(id: number) {
  try {
    const data = await getEquipmentWalletFull(id);
    return { ok: true as const, data };
  } catch (e) {
    return {
      ok: false as const,
      error: {
        kind: "error" as const,
        message: e instanceof Error ? e.message : "Could not load equipment wallet.",
      },
    };
  }
}

export function EquipmentWalletView({ equipmentId }: { equipmentId: string }) {
  const numericId = Number(equipmentId);
  const origin = useWindowOrigin();
  const { state } = useAsyncResource(
    () => (Number.isFinite(numericId) && numericId > 0 ? loadEquipmentWallet(numericId) : null),
    [numericId],
  );

  if (!Number.isFinite(numericId) || numericId < 1) {
    return <ErrorState title="Invalid equipment id" description="Use a positive numeric id." />;
  }

  if (state.status === "loading" || state.status === "idle") {
    return <WalletPageSkeleton />;
  }

  if (state.status === "error" || !state.data?.ok) {
    return (
      <ErrorState
        title="Equipment wallet unavailable"
        description={state.data && !state.data.ok ? state.data.error.message : "Unknown error"}
      />
    );
  }

  const wallet = state.data.data;
  const qrValue = wallet.qr.qrContent;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Equipment wallet
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{wallet.equipment.name}</h1>
          {wallet.equipment.serialNumber && (
            <p className="text-sm text-muted-foreground">Serial {wallet.equipment.serialNumber}</p>
          )}
        </div>
        <EquipmentComplianceBadge status={wallet.compliance.complianceStatus} />
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="mr-1 h-4 w-4" aria-hidden />
            QR
          </TabsTrigger>
          <TabsTrigger value="inspections">
            <ClipboardCheck className="mr-1 h-4 w-4" aria-hidden />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="competency">
            <GraduationCap className="mr-1 h-4 w-4" aria-hidden />
            Competency
          </TabsTrigger>
          <TabsTrigger value="training">
            <GraduationCap className="mr-1 h-4 w-4" aria-hidden />
            Training
          </TabsTrigger>
          <TabsTrigger value="workers">
            <Users className="mr-1 h-4 w-4" aria-hidden />
            Operators
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Building2 className="mr-1 h-4 w-4" aria-hidden />
            Projects
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <CalendarClock className="mr-1 h-4 w-4" aria-hidden />
            M&C
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <CompliancePanel wallet={wallet} />
          {wallet.maintenance && (
            <MaintenanceOverviewStrip maintenance={wallet.maintenance} equipmentId={wallet.equipment.id} />
          )}
          <section className="flex flex-wrap gap-2">
            <Link
              href={`/admin/inspections/pre-use?equipmentId=${wallet.equipment.id}`}
              className={buttonStyles({ variant: "teal", size: "sm" })}
            >
              Pre-use inspection
            </Link>
            <Link
              href={`/admin/equipment/${wallet.equipment.id}`}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              Admin detail
            </Link>
          </section>
        </TabsContent>

        <TabsContent value="qr" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment QR</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="rounded-xl border bg-white p-4">
                <QRCodeSVG value={qrValue} size={180} />
              </div>
              <p className="text-center text-xs text-muted-foreground break-all max-w-sm">
                Token: {wallet.qr.qrToken}
              </p>
              {origin && (
                <p className="text-center text-sm">
                  <a href={`${origin}/equipment/${wallet.equipment.id}/wallet`} className="text-teal-600 hover:underline">
                    {origin}/equipment/{wallet.equipment.id}/wallet
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-4">
          <InspectionsPanel inspections={wallet.inspections} equipmentId={wallet.equipment.id} />
        </TabsContent>

        <TabsContent value="competency" className="mt-4">
          <CompetencyPanel competency={wallet.competency} equipmentId={wallet.equipment.id} />
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <TrainingRequirementsPanel
            requirements={wallet.trainingRequirements}
            workers={wallet.assignedWorkers}
          />
        </TabsContent>

        <TabsContent value="workers" className="mt-4">
          <WorkersPanel workers={wallet.assignedWorkers} />
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <ProjectsPanel projects={wallet.assignedProjects} />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          {wallet.maintenance ? (
            <MaintenancePanel maintenance={wallet.maintenance} equipmentId={wallet.equipment.id} />
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No maintenance data"
              description="Maintenance and calibration records will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrainingRequirementsPanel({
  requirements,
  workers,
}: {
  requirements: EquipmentWalletFull["trainingRequirements"];
  workers: EquipmentWalletFull["assignedWorkers"];
}) {
  if (!requirements?.length) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No training requirements"
        description="This equipment type has no linked certification requirements."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required certifications</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certification</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Operators</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.map((req, idx) => (
              <TableRow key={`${req.certification.id}-${idx}`}>
                <TableCell className="font-medium">{req.certification.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {req.certification.code ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {workers.length > 0 ? (
                    <ul className="inline-flex flex-col gap-1 text-right text-sm">
                      {workers.map((w) => (
                        <li key={w.id}>
                          <Link
                            href={`/verify/${w.id}`}
                            className="text-teal-600 hover:underline"
                          >
                            {w.firstName} {w.lastName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">No operators</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CompliancePanel({ wallet }: { wallet: EquipmentWalletFull }) {
  const c = wallet.compliance;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardHat className="h-5 w-5" aria-hidden />
          Compliance status
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Status" value={<EquipmentComplianceBadge status={c.complianceStatus} />} />
        <Stat
          label="Last inspection"
          value={c.lastInspectionAt ? formatShortDate(c.lastInspectionAt) : "—"}
        />
        <Stat
          label="Next inspection"
          value={c.nextInspectionAt ? formatShortDate(c.nextInspectionAt) : "—"}
        />
        <Stat label="Safety" value={c.safetyStatus} />
        <Stat label="Lockout" value={c.lockedOut ? c.lockoutReason ?? "Locked" : "Clear"} />
        <Stat
          label="Requirements"
          value={
            [c.trainingRequired && "Training", c.competencyRequired && "Competency"]
              .filter(Boolean)
              .join(", ") || "None"
          }
        />
        {c.activeCompany && (
          <Stat label="Active company" value={c.activeCompany.name} />
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <section>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </section>
  );
}

function InspectionsPanel({
  inspections,
  equipmentId,
}: {
  inspections: EquipmentWalletFull["inspections"];
  equipmentId: number;
}) {
  if (!inspections.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No inspections"
        description="Inspection history will appear here."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inspection history</CardTitle>
        <Link
          href={`/admin/equipment/${equipmentId}/inspections`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.inspectionType}</TableCell>
                <TableCell>
                  <Badge variant={row.passed ? "success" : "danger"}>
                    {row.passed ? "Pass" : "Fail"}
                  </Badge>
                  {row.lockoutTriggered && (
                    <Badge variant="warning" className="ml-1">
                      Lockout
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {row.worker
                    ? `${row.worker.firstName} ${row.worker.lastName}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {row.completedAt
                    ? formatShortDate(row.completedAt)
                    : formatShortDate(row.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CompetencyPanel({
  competency,
  equipmentId,
}: {
  competency: EquipmentWalletFull["competency"];
  equipmentId: number;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Competency requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Minimum score: <strong>{competency.resolvedRules.minPassingScore}</strong> (
            {competency.resolvedRules.source})
          </p>
          {competency.resolvedRules.expiryDays != null && (
            <p>Expires after {competency.resolvedRules.expiryDays} days</p>
          )}
          <Link
            href={`/admin/equipment/${equipmentId}/competency`}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Manage competency
          </Link>
        </CardContent>
      </Card>

      {competency.recentEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent evaluations</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competency.recentEvaluations.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      {ev.worker.firstName} {ev.worker.lastName}
                    </TableCell>
                    <TableCell>{ev.score}</TableCell>
                    <TableCell>
                      <Badge variant={ev.passed ? "success" : "danger"}>
                        {ev.passed ? "Pass" : "Fail"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatShortDate(ev.evaluationDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WorkersPanel({ workers }: { workers: EquipmentWalletFull["assignedWorkers"] }) {
  if (!workers.length) {
    return (
      <EmptyState
        icon={Users}
        title="No assigned operators"
        description="Workers assigned to this equipment at active companies appear here."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned operators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {workers.map((w) => (
          <section
            key={`${w.equipmentLinkId}-${w.worker.id}`}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <Link href={`/verify/${w.worker.id}`} className="font-medium text-teal-600 hover:underline">
                {w.worker.firstName} {w.worker.lastName}
              </Link>
              <p className="text-xs text-muted-foreground">{w.companyName}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              <CalendarClock className="mr-1 inline h-3 w-3" aria-hidden />
              {formatShortDate(w.assignedAt)}
            </span>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function ProjectsPanel({ projects }: { projects: EquipmentWalletFull["assignedProjects"] }) {
  const active = projects.filter((p) => p.status === "ACTIVE" && !p.endedAt);

  if (!active.length) {
    return (
      <EmptyState
        icon={Building2}
        title="No project assignments"
        description="Active project assignments for this asset appear here."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {active.map((a) => (
          <section key={a.id} className="rounded-lg border p-3">
            <p className="font-medium">{a.project.name}</p>
            {a.project.code && (
              <p className="text-xs text-muted-foreground">Code {a.project.code}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Assigned {formatShortDate(a.assignedAt)}
            </p>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function MaintenanceOverviewStrip({
  maintenance,
  equipmentId,
}: {
  maintenance: EquipmentMaintenanceSummary;
  equipmentId: number;
}) {
  return (
    <Card className={maintenance.maintenanceOverdue || maintenance.calibrationOverdue ? "border-amber-300" : undefined}>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div className="flex flex-wrap gap-6 text-sm">
          <span>
            Next maintenance:{" "}
            {maintenance.nextMaintenanceDue
              ? formatShortDate(maintenance.nextMaintenanceDue)
              : "—"}
            {maintenance.maintenanceOverdue && (
              <Badge variant="danger" className="ml-2">
                Overdue
              </Badge>
            )}
          </span>
          <span>
            Next calibration:{" "}
            {maintenance.nextCalibrationDue
              ? formatShortDate(maintenance.nextCalibrationDue)
              : "—"}
            {maintenance.calibrationOverdue && (
              <Badge variant="danger" className="ml-2">
                Overdue
              </Badge>
            )}
          </span>
        </div>
        <Link
          href={`/admin/maintenance-calibration/maintenance/new?equipmentId=${equipmentId}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Log maintenance
        </Link>
      </CardContent>
    </Card>
  );
}

function MaintenancePanel({
  maintenance,
  equipmentId,
}: {
  maintenance: EquipmentMaintenanceSummary;
  equipmentId: number;
}) {
  return (
    <div className="space-y-4">
      <section className="flex flex-wrap gap-2">
        <Link
          href={`/admin/maintenance-calibration/maintenance/new?equipmentId=${equipmentId}`}
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          Add maintenance
        </Link>
        <Link
          href={`/admin/maintenance-calibration/calibration/new?equipmentId=${equipmentId}`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Add calibration
        </Link>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance records</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {maintenance.maintenanceRecords.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Performed</TableHead>
                  <TableHead>Next due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenance.maintenanceRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{formatShortDate(r.performedAt)}</TableCell>
                    <TableCell>
                      {r.nextDueAt ? formatShortDate(r.nextDueAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calibration records</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {maintenance.calibrationRecords.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Result</TableHead>
                  <TableHead>Calibrated</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenance.calibrationRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge variant={r.passed ? "success" : "danger"}>
                        {r.passed ? "Pass" : "Fail"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatShortDate(r.calibratedAt)}</TableCell>
                    <TableCell>
                      {r.expiresAt ? formatShortDate(r.expiresAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

