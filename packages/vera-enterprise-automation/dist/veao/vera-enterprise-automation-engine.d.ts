import { CrossModuleAutomationEngine } from "../engines/cross-module-automation";
import { MultiEntityAutomationEngine } from "../engines/multi-entity-automation";
import { ComplianceAutomationEngine } from "../engines/compliance-automation";
import { DocumentAutomationEngine } from "../engines/document-automation";
import { TwinAutomationEngine } from "../engines/twin-automation";
import { DataAutomationEngine } from "../engines/data-automation";
import { EnterpriseRulesEngine } from "../engines/enterprise-rules";
import { EnterpriseWorkflowEngine } from "../engines/enterprise-workflow";
import { AutomationConflictResolver } from "../engines/automation-conflicts";
import { EnterpriseExecutionEngine } from "../engines/enterprise-execution";
import { OfflineEnterpriseEngine } from "../engines/offline-enterprise";
import { AutomationEventEngine } from "../engines/automation-events";
import type { EnterpriseAutomationReport, EnterpriseContextInput } from "../types";
/**
 * Vera Enterprise Automation Orchestrator (VEAO)
 */
export declare class VeraEnterpriseAutomationEngine {
    readonly crossModule: CrossModuleAutomationEngine;
    readonly multiEntity: MultiEntityAutomationEngine;
    readonly compliance: ComplianceAutomationEngine;
    readonly document: DocumentAutomationEngine;
    readonly twin: TwinAutomationEngine;
    readonly data: DataAutomationEngine;
    readonly rules: EnterpriseRulesEngine;
    readonly workflow: EnterpriseWorkflowEngine;
    readonly conflicts: AutomationConflictResolver;
    readonly execution: EnterpriseExecutionEngine;
    readonly offline: OfflineEnterpriseEngine;
    readonly events: AutomationEventEngine;
    orchestrate(ctx: EnterpriseContextInput): EnterpriseAutomationReport;
    orchestrateOffline(ctx: EnterpriseContextInput): EnterpriseAutomationReport;
    syncOffline(): EnterpriseAutomationReport[];
    onEvent(ctx: EnterpriseContextInput, event: string, data?: Record<string, unknown>): EnterpriseAutomationReport;
    overrideAction(report: EnterpriseAutomationReport, actionId: string, reason: string): EnterpriseAutomationReport;
    rollbackAction(report: EnterpriseAutomationReport, actionId: string, reason: string): EnterpriseAutomationReport;
    private buildDashboard;
}
//# sourceMappingURL=vera-enterprise-automation-engine.d.ts.map