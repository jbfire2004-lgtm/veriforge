"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentWorkflowEngine = void 0;
const common_1 = require("@nestjs/common");
const TRANSITIONS = {
    draft: ['review', 'archived'],
    review: ['approved', 'draft', 'archived'],
    approved: ['published', 'review', 'archived'],
    published: ['superseded', 'archived'],
    superseded: ['archived'],
    archived: [],
};
class DocumentWorkflowEngine {
    assertTransition(from, to) {
        var _a;
        const allowed = (_a = TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid document transition: ${from} → ${to}`);
        }
    }
    publishFields(now = new Date()) {
        return { publishedAt: now, status: 'published' };
    }
    supersedeFields(now = new Date()) {
        return {
            status: 'superseded',
            supersededAt: now,
        };
    }
    archiveFields(now = new Date()) {
        return {
            status: 'archived',
            archivedAt: now,
        };
    }
}
exports.DocumentWorkflowEngine = DocumentWorkflowEngine;
//# sourceMappingURL=document-workflow.engine.js.map