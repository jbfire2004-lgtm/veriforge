"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { veriforgeMotionClasses } from "@/src/motion/veriforge-motion";
import {
  useComplianceScoreSync,
  useIncidentAnalyticsSync,
  useTrainingAnalyticsSync,
  useRiskAnalyticsSync,
  useEmergencyAnalyticsSync,
  useCommandCenterAnalyticsSync,
  useLedgerAnalyticsSync,
  useSafetyKpiAnalyticsSync,
  VeriForgeLogo,
} from "@/components/veriforge";
import { VFKpiCard } from "./VFKpiCard";
import { VFKpiBar } from "./VFKpiBar";
import { VFDashboardSection } from "./VFDashboardSection";
import { VFDashboardGrid } from "./VFDashboardGrid";
import { VFDashboardChart } from "./VFDashboardChart";
import { VFAlertsPanel, type VFDashboardAlert } from "./VFAlertsPanel";
import styles from "./VeriForgeDashboard.module.css";

export function VeriForgeDashboard() {
  const { score } = useComplianceScoreSync(78);
  const { analytics: incidents } = useIncidentAnalyticsSync();
  const { analytics: training } = useTrainingAnalyticsSync();
  const { analytics: risk } = useRiskAnalyticsSync();
  const { analytics: emergency } = useEmergencyAnalyticsSync();
  const { analytics: command } = useCommandCenterAnalyticsSync();
  const { analytics: ledger } = useLedgerAnalyticsSync();
  const { analytics: safetyKpis } = useSafetyKpiAnalyticsSync();

  const complianceCritical = score.score < 70;
  const incidentCritical = incidents.criticalCount > 0;
  const riskCritical =
    risk.highRiskCount > 0 || risk.criticalCount > 0;
  const emergencyCritical = emergency.activeEmergencies > 0;
  const commandCritical =
    command.criticalSites > 0 || command.activeEmergencies > 0;
  const ledgerCritical =
    !ledger.chainIntegrity || ledger.criticalBlocks > 0;

  const alerts = React.useMemo<VFDashboardAlert[]>(() => {
    const rows: VFDashboardAlert[] = [];
    if (incidentCritical) {
      rows.push({
        id: "alert-incidents",
        title: "Critical Incidents",
        message: `${incidents.criticalCount} critical · ${incidents.openIncidents} open investigations`,
        tone: "critical",
      });
    }
    if (complianceCritical) {
      rows.push({
        id: "alert-compliance",
        title: "Compliance Gap",
        message: `Live score ${score.score}% below industrial threshold`,
        tone: "critical",
      });
    }
    if (emergencyCritical) {
      rows.push({
        id: "alert-emergency",
        title: "Emergency Active",
        message: "Emergency response channel requires forge attention",
        tone: "critical",
      });
    }
    if (commandCritical) {
      rows.push({
        id: "alert-command",
        title: "Command Watch",
        message: `${command.criticalSites} critical sites · ${command.activeEmergencies} emergencies`,
        tone: "critical",
      });
    }
    if (training.overdueModules > 0) {
      rows.push({
        id: "alert-training",
        title: "Training Overdue",
        message: `${training.overdueModules} modules past due across workforce`,
        tone: "warning",
      });
    }
    if (ledgerCritical) {
      rows.push({
        id: "alert-ledger",
        title: "Ledger Integrity",
        message: ledger.chainIntegrity
          ? `${ledger.criticalBlocks} critical blocks on chain`
          : "Chain integrity broken — verify hashes",
        tone: ledger.chainIntegrity ? "warning" : "critical",
      });
    }
    if (rows.length === 0) {
      rows.push({
        id: "alert-stable",
        title: "Forge Stable",
        message: "No critical industrial alerts on this shift",
        tone: "warning",
      });
    }
    return rows;
  }, [
    incidentCritical,
    complianceCritical,
    emergencyCritical,
    commandCritical,
    ledgerCritical,
    incidents.criticalCount,
    incidents.openIncidents,
    score.score,
    command.criticalSites,
    command.activeEmergencies,
    training.overdueModules,
    ledger.chainIntegrity,
    ledger.criticalBlocks,
  ]);

  const readinessBars = [
    {
      label: "Compliance",
      value: score.score,
      critical: complianceCritical,
    },
    {
      label: "Training",
      value: training.completionRate,
      critical: training.overdueModules > 0,
    },
    {
      label: "Investigation",
      value: incidents.investigationProgress,
      critical: incidentCritical,
    },
    {
      label: "Command Health",
      value: command.commandHealthScore,
      critical: commandCritical,
    },
    {
      label: "Ledger Health",
      value: ledger.ledgerHealthScore,
      critical: ledgerCritical,
    },
    {
      label: "Safety KPI",
      value: safetyKpis.averageScore,
      critical: safetyKpis.criticalCount > 0,
    },
  ];

  return (
    <div
      className={cn(styles.page, veriforgeMotionClasses.primitives.metallicFade)}
      style={
        {
          ["--vf-forge-red" as string]: COLORS.forgeRed,
          ["--vf-iron-black" as string]: COLORS.ironBlack,
          ["--vf-glow" as string]: SHADOWS.metallicShadow,
        } as React.CSSProperties
      }
    >
      <header
        className={cn(styles.hero, veriforgeMotionClasses.primitives.angularSlide)}
      >
        <div>
          <p className={styles.heroKicker}>VeriForge Industrial Dashboard</p>
          <h1 className={styles.heroTitle}>Forge Command Overview</h1>
          <p className={styles.heroBody}>
            Angular KPI cards, metallic progress rails, steel-grey charts, and
            red-glow critical alerts — stamped with forged-metal identity.
          </p>
        </div>
        <div className="h-[56px] shrink-0">
          <VeriForgeLogo />
        </div>
      </header>

      <VFDashboardSection
        kicker="Live Signals"
        title="Angular KPI Cards"
        description="Steel-grey cards with red accent borders, metallic headers, and industrial motion."
      >
        <VFDashboardGrid columns={4}>
          <VFKpiCard
            kicker="Compliance"
            title="Live Score"
            value={`${score.score}%`}
            delta={`Synced ${score.timestamp.slice(0, 19)}`}
            critical={complianceCritical}
          />
          <VFKpiCard
            kicker="Incidents"
            title="Open / Critical"
            value={`${incidents.openIncidents} / ${incidents.criticalCount}`}
            delta={`Investigation ${incidents.investigationProgress}%`}
            critical={incidentCritical}
          />
          <VFKpiCard
            kicker="Training"
            title="Completion"
            value={`${training.completionRate}%`}
            delta={`${training.overdueModules} overdue modules`}
            critical={training.overdueModules > 0}
          />
          <VFKpiCard
            kicker="Risk"
            title="Risk Pressure"
            value={risk.averageResidual}
            delta={`${risk.highRiskCount} high · ${risk.criticalCount} critical`}
            critical={riskCritical}
          />
          <VFKpiCard
            kicker="Command"
            title="Site Health"
            value={`${command.commandHealthScore}%`}
            delta={`${command.totalSites} sites · ${command.criticalSites} critical`}
            critical={commandCritical}
          />
          <VFKpiCard
            kicker="Ledger"
            title="Chain Health"
            value={`${ledger.ledgerHealthScore}%`}
            delta={`${ledger.totalBlocks} blocks · ${ledger.chainIntegrity ? "OK" : "BROKEN"}`}
            critical={ledgerCritical}
          />
          <VFKpiCard
            kicker="Emergency"
            title="Response"
            value={emergency.activeEmergencies}
            delta={`${emergency.criticalCount} critical · readiness ${emergency.drillReadiness}%`}
            critical={emergencyCritical}
          />
          <VFKpiCard
            kicker="Safety KPIs"
            title="Overall"
            value={`${safetyKpis.averageScore}%`}
            delta={`${safetyKpis.criticalCount} critical · ${safetyKpis.belowTarget} below target`}
            critical={safetyKpis.criticalCount > 0}
          />
        </VFDashboardGrid>
      </VFDashboardSection>

      <VFDashboardSection
        kicker="Progress Rails"
        title="Metallic KPI Bars"
        description="Angular geometry · metallic fills · red glow on critical rails."
      >
        <VFDashboardGrid columns={2}>
          {readinessBars.map((bar) => (
            <div
              key={bar.label}
              className={cn(
                styles.liveCard,
                bar.critical && styles.liveCardCritical,
              )}
            >
              <VFKpiBar
                label={bar.label}
                value={bar.value}
                critical={bar.critical}
              />
            </div>
          ))}
        </VFDashboardGrid>
      </VFDashboardSection>

      <VFDashboardSection
        kicker="Intelligence"
        title="Steel-Grey Charts"
        description="Red highlight lines · angular bar rise · metallic line draw."
      >
        <VFDashboardGrid columns={2}>
          <VFDashboardChart
            title="Readiness Trend"
            linePoints={[62, 68, 64, 74, 71, 82, 78, 88]}
            bars={[
              { label: "A", value: 92 },
              { label: "B", value: 76 },
              { label: "C", value: 84 },
              { label: "D", value: 68 },
            ]}
          />
          <VFDashboardChart
            title="Incident Pressure"
            linePoints={[40, 55, 48, 70, 62, 80, 74, 90]}
            bars={[
              { label: "Crit", value: Math.min(100, incidents.criticalCount * 20 + 20) },
              { label: "Mod", value: Math.min(100, incidents.moderateCount * 15 + 25) },
              { label: "Low", value: Math.min(100, incidents.lowCount * 10 + 30) },
              { label: "Inv", value: incidents.investigationProgress },
            ]}
          />
        </VFDashboardGrid>
      </VFDashboardSection>

      <VFDashboardSection
        kicker="Watch Floor"
        title="Alerts Panel"
        description="Red metallic glow for critical · steel-grey for warnings."
      >
        <VFDashboardGrid columns={2}>
          <VFAlertsPanel alerts={alerts} />
          <div className={styles.liveStack}>
            <div
              className={cn(
                styles.liveCard,
                incidentCritical && styles.liveCardCritical,
                incidentCritical && veriforgeMotionClasses.primitives.redGlowPulse,
              )}
            >
              <p className={styles.liveLabel}>Incident Investigation</p>
              <VFKpiBar
                label={`Open ${incidents.openIncidents}`}
                value={incidents.investigationProgress}
                critical={incidentCritical}
              />
              <p className={styles.liveMeta}>
                Critical {incidents.criticalCount} · Moderate{" "}
                {incidents.moderateCount} · Low {incidents.lowCount}
              </p>
            </div>
            <div
              className={cn(
                styles.liveCard,
                ledgerCritical && styles.liveCardCritical,
              )}
            >
              <p className={styles.liveLabel}>Blockchain Ledger</p>
              <VFKpiBar
                label={`Blocks ${ledger.totalBlocks}`}
                value={ledger.ledgerHealthScore}
                critical={ledgerCritical}
              />
              <p className={styles.liveMeta}>
                Integrity {ledger.chainIntegrity ? "OK" : "BROKEN"} · Contracts{" "}
                {ledger.activeContracts} · Fires {ledger.contractFires}
              </p>
            </div>
          </div>
        </VFDashboardGrid>
      </VFDashboardSection>
    </div>
  );
}

export default VeriForgeDashboard;
