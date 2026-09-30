"use client";

import * as React from "react";
import { VeriForgeButton, VeriForgeCTA } from "./button";
import {
  VeriForgeTextField,
  VeriForgeSelect,
  VeriForgeCheckbox,
  VeriForgeToggle,
  VeriForgeDropdown,
  VeriForgeForm,
  VeriForgeTextArea,
} from "./inputs";
import {
  VeriForgeFeatureCard,
  VeriForgeInfoCard,
  VeriForgeStatCard,
  VeriForgeWarningCard,
} from "./cards";
import { VeriForgeTopbar, VeriForgeContentBlock } from "./panels";
import { VeriForgeAlert } from "./alerts";
import { VeriForgeTable } from "./table";
import {
  VeriForgeTopNav,
  VeriForgeSideNav,
  type VeriForgeNavItem,
} from "./navigation";
import { VeriForgeLogo, VeriForgeMark } from "./logo";
import { VeriForgeModal } from "./modal";
import { VeriForgeProgressBar, VeriForgeStepRail } from "./progress";
import { VERIFORGE_DESIGN_SYSTEM } from "./design-system";
import { VERIFORGE_UI_KIT } from "./ui-kit";
import { vfSurface } from "./surfaces";
import {
  TrainingIcon,
  VerificationIcon,
  ComplianceIcon,
  IncidentsIcon,
  EquipmentIcon,
  AuditIcon,
  FieldOpsIcon,
  RiskIcon,
} from "./icons";
import { cn } from "@/src/lib/utils";

const sampleRows = [
  { id: 1, unit: "INS-104", status: "Verified", zone: "North", critical: false },
  { id: 2, unit: "INS-218", status: "Review", zone: "East", critical: false },
  { id: 3, unit: "INS-331", status: "Fail", zone: "West", critical: true },
  { id: 4, unit: "INS-402", status: "Verified", zone: "Central", critical: false },
];

const sampleNav: VeriForgeNavItem[] = [
  { label: "Command", href: "#command", active: true, section: "operations" },
  { label: "Inspections", href: "#inspections", section: "operations" },
  { label: "Compliance", href: "#compliance", section: "operations" },
  { label: "Intelligence", href: "#intel", section: "intelligence" },
  { label: "Emergency", href: "#emergency", section: "system", critical: true },
];

/**
 * Regenerated VeriForge Safety Platform UI kit — full industrial design system.
 * Buttons · Inputs · Dropdowns · Tables · Cards · Panels · Navigation · Alerts · Modals · Iconography
 */
export function VeriForgeShowcase() {
  const [enabled, setEnabled] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [zone, setZone] = React.useState("north");
  const [selected, setSelected] = React.useState<number | undefined>(1);

  return (
    <section
      className={cn("veriforge-theme space-y-6 p-4 md:p-6", vfSurface.canvas)}
    >
      <VeriForgeTopbar
        title={VERIFORGE_UI_KIT.name}
        subtitle={`v${VERIFORGE_UI_KIT.version} · ${VERIFORGE_DESIGN_SYSTEM.name}`}
        actions={<VeriForgeLogo />}
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <VeriForgeSideNav title="Safety modules" items={sampleNav} />

        <div className="space-y-6">
          <VeriForgeTopNav items={sampleNav} />

          <VeriForgeContentBlock
            title="Design system"
            description="Industrial, compliant, enterprise-grade — trust through muted structure."
            icon={<VeriForgeMark size={18} />}
          >
            <ul className="grid gap-2 md:grid-cols-2">
              {VERIFORGE_UI_KIT.rules.map((rule) => (
                <li
                  key={rule}
                  className={cn(
                    vfSurface.inset,
                    "px-3 py-2 text-sm text-[#D5DBE0]",
                  )}
                >
                  {rule}
                </li>
              ))}
            </ul>
          </VeriForgeContentBlock>

          {/* Buttons */}
          <VeriForgeContentBlock
            title="Buttons"
            description="Slate primary · graphite secondary · safety-blue action · amber/green status · red never for CTAs."
          >
            <div className="flex flex-wrap gap-2">
              <VeriForgeButton>Primary</VeriForgeButton>
              <VeriForgeButton variant="secondary">Secondary</VeriForgeButton>
              <VeriForgeButton variant="action">Action</VeriForgeButton>
              <VeriForgeButton variant="success">Success</VeriForgeButton>
              <VeriForgeButton variant="warning">Warning</VeriForgeButton>
              <VeriForgeButton variant="ghost">Ghost</VeriForgeButton>
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-[#8A9199]">
              Critical variant exists for alert dismissals only — not shown as a
              default action
            </p>
            <VeriForgeCTA
              className="mt-4"
              kicker="Compliance ready"
              title="Authorize inspection workflow"
              description="Matte controls communicate trust. Critical red is reserved for alerts only."
              actionLabel="Authorize"
            />
          </VeriForgeContentBlock>

          {/* Forms */}
          <div className="grid gap-4 lg:grid-cols-2">
            <VeriForgeContentBlock
              title="Inputs & forms"
              description="Graphite borders · safety-blue focus glow · structured industrial layout."
            >
              <VeriForgeForm columns={1} className="space-y-3">
                <VeriForgeTextField
                  label="Work order"
                  placeholder="WO-2026-1184"
                />
                <VeriForgeSelect
                  label="Zone (native)"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  options={[
                    { label: "North yard", value: "north" },
                    { label: "South line", value: "south" },
                  ]}
                />
                <VeriForgeTextArea
                  label="Notes"
                  placeholder="Observation summary…"
                />
                <VeriForgeCheckbox
                  label="Require supervisor sign-off"
                  defaultChecked
                />
                <VeriForgeToggle
                  label="Lockout / tagout interlock"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </VeriForgeForm>
            </VeriForgeContentBlock>

            <VeriForgeContentBlock
              title="Dropdowns"
              description="Matte graphite menu · blue active/hover · no consumer chrome."
            >
              <VeriForgeDropdown
                label="Inspection type"
                value={zone}
                onChange={setZone}
                options={[
                  { label: "North yard", value: "north" },
                  { label: "South line", value: "south" },
                  { label: "Central plant", value: "central" },
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <VeriForgeButton
                  variant="action"
                  size="sm"
                  onClick={() => setOpen(true)}
                >
                  Open modal
                </VeriForgeButton>
                <VeriForgeButton variant="secondary" size="sm">
                  Secondary
                </VeriForgeButton>
              </div>
            </VeriForgeContentBlock>
          </div>

          {/* Cards */}
          <VeriForgeContentBlock
            title="Cards & panels"
            description="Slate/graphite surfaces · thin borders · ISO header icons · no heavy shadows."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <VeriForgeInfoCard
                title="Verification"
                detail="Inspection evidence captured and ready for audit review."
              />
              <VeriForgeFeatureCard
                title="Compliance"
                summary="Controls mapped to policy requirements with clear ownership."
              />
              <VeriForgeStatCard
                label="Open CAPAs"
                value={12}
                delta="−3 this week"
              />
              <VeriForgeWarningCard
                title="Review required"
                message="Two inspections exceed review SLA. Escalate before shift close."
              />
            </div>
          </VeriForgeContentBlock>

          {/* Alerts */}
          <VeriForgeContentBlock
            title="Alerts"
            description="Amber/green status · controlled red only for critical compliance failures."
          >
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeAlert
                tone="critical"
                title="Critical compliance failure"
                message="Permit expired on Unit INS-331. Work stoppage required."
              />
              <VeriForgeAlert
                tone="warning"
                title="Caution"
                message="Inspection window closes in 4 hours."
              />
              <VeriForgeAlert
                tone="success"
                title="Verified"
                message="Lockout verification completed for Line B."
              />
              <VeriForgeAlert
                tone="neutral"
                title="System notice"
                message="Maintenance window begins at 02:00 UTC."
              />
            </div>
          </VeriForgeContentBlock>

          {/* Tables */}
          <VeriForgeContentBlock
            title="Tables"
            description="High-contrast rows · soft blue selection · red rail only for critical failures."
          >
            <VeriForgeTable
              columns={[
                { key: "unit", header: "Unit", sortable: true },
                { key: "status", header: "Status", sortable: true },
                { key: "zone", header: "Zone" },
              ]}
              rows={sampleRows}
              rowKey={(row) => row.id}
              selectedRowKey={selected}
              onSelectRow={(row) => {
                setSelected(Number(row.id));
                setOpen(true);
              }}
              isCriticalRow={(row) => Boolean(row.critical)}
            />
          </VeriForgeContentBlock>

          {/* Progress */}
          <VeriForgeContentBlock
            title="Progress"
            description="Safety-blue progress · green complete · amber caution — never glossy fills."
          >
            <div className="space-y-4">
              <VeriForgeProgressBar
                label="Compliance score"
                value={86}
                tone="green"
              />
              <VeriForgeProgressBar
                label="Training currency"
                value={64}
                tone="blue"
              />
              <VeriForgeProgressBar
                label="Overdue reviews"
                value={38}
                tone="amber"
              />
              <VeriForgeStepRail
                steps={["Intake", "Inspect", "Verify", "Close"]}
                current={2}
              />
            </div>
          </VeriForgeContentBlock>

          {/* Iconography */}
          <VeriForgeContentBlock
            title="Iconography"
            description="ISO-style line icons on muted plates — verification, inspection, compliance."
          >
            <div className="flex flex-wrap gap-3">
              <TrainingIcon size={40} tone="active" />
              <VerificationIcon size={40} tone="active" />
              <ComplianceIcon size={40} tone="active" />
              <IncidentsIcon size={40} tone="critical" />
              <EquipmentIcon size={40} tone="neutral" />
              <AuditIcon size={40} tone="active" />
              <FieldOpsIcon size={40} tone="active" />
              <RiskIcon size={40} tone="neutral" />
            </div>
          </VeriForgeContentBlock>
        </div>
      </div>

      <VeriForgeModal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm inspection action"
        description="Apply verification status and write an audit trail entry."
        primaryActionLabel="Confirm"
        primaryVariant="action"
        onPrimaryAction={() => setOpen(false)}
      >
        <p className="text-sm leading-relaxed text-[#D5DBE0]">
          This action is logged to the compliance rail and visible to
          supervisors. No red confirm buttons — safety blue signals authorized
          workflow actions.
        </p>
      </VeriForgeModal>
    </section>
  );
}
