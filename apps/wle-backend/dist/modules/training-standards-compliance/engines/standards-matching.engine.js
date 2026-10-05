"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardsMatchingEngine = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let StandardsMatchingEngine = class StandardsMatchingEngine {
    match(input) {
        var _a, _b, _c;
        const requiredCodes = new Set(input.courseStandardKeys);
        const content = [(_a = input.contentText) !== null && _a !== void 0 ? _a : '', (_b = input.certificationName) !== null && _b !== void 0 ? _b : '']
            .join(' ')
            .toLowerCase();
        const matched = new Set(input.courseStandardKeys);
        const byKind = {};
        for (const std of input.catalogStandards) {
            if (!std.active)
                continue;
            const hit = requiredCodes.has(std.code) ||
                std.keywords.some((k) => content.includes(k.toLowerCase()));
            if (hit) {
                matched.add(std.code);
                const kind = std.kind;
                byKind[kind] = (_c = byKind[kind]) !== null && _c !== void 0 ? _c : [];
                if (!byKind[kind].includes(std.code))
                    byKind[kind].push(std.code);
            }
        }
        const csaRequired = input.catalogStandards
            .filter((s) => s.kind === client_1.TrainingStandardKind.CSA && s.active)
            .map((s) => s.code);
        const missing = csaRequired.filter((c) => !matched.has(c));
        const total = Math.max(csaRequired.length, 1);
        const score = Math.round((matched.size / (matched.size + missing.length || 1)) * 100);
        return {
            matched: [...matched],
            missing,
            score: Math.min(100, score),
            byKind,
        };
    }
};
exports.StandardsMatchingEngine = StandardsMatchingEngine;
exports.StandardsMatchingEngine = StandardsMatchingEngine = __decorate([
    (0, common_1.Injectable)()
], StandardsMatchingEngine);
//# sourceMappingURL=standards-matching.engine.js.map