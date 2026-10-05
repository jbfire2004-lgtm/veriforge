"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionTemplateEngine = void 0;
const common_1 = require("@nestjs/common");
const inspection_show_if_1 = require("./inspection-show-if");
let InspectionTemplateEngine = class InspectionTemplateEngine {
    visibleItems(items, answers) {
        return (0, inspection_show_if_1.visibleChecklistItems)(items, answers);
    }
    validateRequired(items, answers) {
        const pruned = (0, inspection_show_if_1.pruneHiddenChecklistAnswers)(items, answers);
        const visible = this.visibleItems(items, pruned);
        const errors = [];
        for (const item of visible) {
            if (!item.required)
                continue;
            const val = pruned[item.id];
            if (val === undefined || val === null || val === '') {
                errors.push(`Required: ${item.label}`);
            }
            if (item.type === 'pass_fail' && val === undefined) {
                errors.push(`Required pass/fail: ${item.label}`);
            }
        }
        return errors;
    }
};
exports.InspectionTemplateEngine = InspectionTemplateEngine;
exports.InspectionTemplateEngine = InspectionTemplateEngine = __decorate([
    (0, common_1.Injectable)()
], InspectionTemplateEngine);
//# sourceMappingURL=inspection-template.engine.js.map