"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmInvestigationReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rca_engine_1 = require("./rca.engine");
let PmInvestigationReportService = class PmInvestigationReportService {
    constructor(prisma, rca) {
        this.prisma = prisma;
        this.rca = rca;
    }
    async buildReport(eventId) {
        var _a;
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: eventId, deletedAt: null },
            include: {
                investigation: true,
                rootCauses: true,
                contributingFactors: true,
                correctiveActions: true,
                witnesses: { include: { statements: true } },
                attachments: true,
                injuries: true,
                project: { select: { name: true } },
                createdBy: { select: { username: true } },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        let causalTree = (_a = event.investigation) === null || _a === void 0 ? void 0 : _a.causalTreeJson;
        if (!causalTree || Object.keys(causalTree).length === 0) {
            causalTree = this.rca.buildCausalTree({
                eventTitle: event.title,
                rootCauses: event.rootCauses.map((r) => ({
                    id: r.id,
                    description: r.description,
                    category: r.category,
                })),
                contributingFactors: event.contributingFactors,
            });
        }
        const executiveSummary = this.buildExecutiveSummary(event);
        if (event.investigation) {
            await this.prisma.pmSafetyEventInvestigation.update({
                where: { eventId },
                data: { executiveSummary },
            });
        }
        return {
            eventId,
            generatedAt: new Date().toISOString(),
            executiveSummary,
            event: {
                title: event.title,
                type: event.eventType,
                severity: event.severity,
                riskScore: event.riskScore,
                project: event.project.name,
                occurredAt: event.occurredAt,
                status: event.status,
            },
            rootCauseMap: causalTree,
            pathways: this.rca.taprootPathways(),
            rootCauses: event.rootCauses,
            contributingFactors: event.contributingFactors,
            correctiveActions: event.correctiveActions,
            evidence: {
                attachments: event.attachments.length,
                witnesses: event.witnesses.length,
                statements: event.witnesses.reduce((s, w) => s + w.statements.length, 0),
                injuries: event.injuries.length,
            },
            html: this.renderPrintableHtml(event, executiveSummary, causalTree),
        };
    }
    buildExecutiveSummary(event) {
        var _a;
        const parts = [
            `${event.eventType.replace(/_/g, ' ')} — ${event.severity} severity: ${event.title}.`,
            event.description ? event.description.slice(0, 400) : '',
            ((_a = event.investigation) === null || _a === void 0 ? void 0 : _a.immediateActions)
                ? `Immediate actions: ${event.investigation.immediateActions}`
                : '',
            event.rootCauses.length
                ? `Root causes identified: ${event.rootCauses
                    .map((r) => r.description)
                    .join('; ')}`
                : 'Root cause analysis in progress.',
            event.correctiveActions.length
                ? `${event.correctiveActions.length} corrective action(s) — ${event.correctiveActions.filter((c) => c.status === 'closed' || c.status === 'verified').length} closed.`
                : '',
        ].filter(Boolean);
        return parts.join('\n\n');
    }
    renderPrintableHtml(event, summary, tree) {
        const treeJson = JSON.stringify(tree, null, 2);
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Investigation Report — ${escapeHtml(event.title)}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#0a2540}
h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:1.5rem;border-bottom:1px solid #e2e8f0;padding-bottom:.25rem}
.meta{color:#64748b;font-size:.875rem}.summary{white-space:pre-wrap;line-height:1.5}
pre{background:#f8fafc;padding:1rem;border-radius:8px;font-size:11px;overflow:auto}
ul{padding-left:1.25rem}
@media print{body{margin:0}}
</style></head><body>
<h1>Investigation Report</h1>
<p class="meta">${escapeHtml(event.project.name)} · ${event.eventType} · ${event.severity} · ${event.occurredAt.toLocaleDateString()}</p>
<h2>Executive summary</h2>
<div class="summary">${escapeHtml(summary)}</div>
<h2>Root causes</h2>
<ul>${event.rootCauses
            .map((r) => `<li>${escapeHtml(r.description)} (${r.method})</li>`)
            .join('') || '<li>None recorded</li>'}</ul>
<h2>Corrective actions</h2>
<ul>${event.correctiveActions
            .map((c) => `<li>${escapeHtml(c.title)} — ${c.status}${c.dueAt ? ` (due ${c.dueAt.toLocaleDateString()})` : ''}</li>`)
            .join('') || '<li>None</li>'}</ul>
<h2>Root cause map</h2>
<pre>${escapeHtml(treeJson)}</pre>
<p class="meta">Generated by Vera Platform · ${new Date().toLocaleString()}</p>
</body></html>`;
    }
};
exports.PmInvestigationReportService = PmInvestigationReportService;
exports.PmInvestigationReportService = PmInvestigationReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rca_engine_1.RcaEngine])
], PmInvestigationReportService);
function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
//# sourceMappingURL=pm-investigation-report.service.js.map