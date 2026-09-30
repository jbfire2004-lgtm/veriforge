"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPrioritizationEngine = exports.AutoMappingEngine = exports.AutoCorrectionEngine = exports.AutoSummarizationEngine = exports.AutoTaggingEngine = exports.AutoClassificationEngine = void 0;
const CSA_PATTERNS = [/CSA\s*Z462/i, /CSA\s*W117/i, /CSA\s*B335/i, /electrical/i];
const OHS_PATTERNS = [/OHS/i, /occupational/i, /WHMIS/i, /fall protection/i];
class AutoClassificationEngine {
    classifyTraining(input) {
        const text = `${input.title} ${(input.standardCodes ?? []).join(" ")}`;
        const tags = [];
        const standards = [];
        if (CSA_PATTERNS.some((p) => p.test(text))) {
            tags.push("csa");
            standards.push("CSA");
        }
        if (OHS_PATTERNS.some((p) => p.test(text))) {
            tags.push("ohs");
            standards.push("OHS");
        }
        if (input.isValid)
            tags.push("valid");
        else
            tags.push("invalid");
        return {
            category: tags.includes("csa") ? "safety_standard" : "general_training",
            tags,
            confidence: tags.length > 0 ? 0.85 : 0.5,
            standards,
        };
    }
    classifyInspectionPhoto(_hints) {
        const hazards = _hints?.hazards ?? [];
        return {
            category: hazards.length ? "hazard_detected" : "routine",
            tags: hazards.length ? ["hazard", ...hazards] : ["clear"],
            confidence: hazards.length ? 0.7 : 0.6,
        };
    }
}
exports.AutoClassificationEngine = AutoClassificationEngine;
class AutoTaggingEngine {
    tag(entityType, signals) {
        const tags = [entityType];
        for (const [k, v] of Object.entries(signals)) {
            if (v)
                tags.push(k);
        }
        return tags;
    }
}
exports.AutoTaggingEngine = AutoTaggingEngine;
class AutoSummarizationEngine {
    summarize(title, bullets) {
        const top = bullets.slice(0, 5);
        const text = `${title}: ${top.join("; ")}${bullets.length > 5 ? "…" : ""}`;
        return { text, bullets: top, generatedAt: new Date().toISOString() };
    }
}
exports.AutoSummarizationEngine = AutoSummarizationEngine;
class AutoCorrectionEngine {
    suggestCorrections(issues) {
        return issues.map((i) => {
            if (i.includes("expir"))
                return "Renew or upload updated certificate";
            if (i.includes("mismatch"))
                return "Re-map training to correct standard";
            if (i.includes("inspection"))
                return "Complete inspection before assignment";
            return `Resolve: ${i}`;
        });
    }
}
exports.AutoCorrectionEngine = AutoCorrectionEngine;
class AutoMappingEngine {
    mapTrainingToStandards(input) {
        const cls = new AutoClassificationEngine().classifyTraining(input);
        return {
            csa: cls.standards?.includes("CSA") ? ["Z462", "W117"] : [],
            ohs: cls.standards?.includes("OHS") ? ["WHMIS", "FallProtection"] : [],
        };
    }
}
exports.AutoMappingEngine = AutoMappingEngine;
class AutoPrioritizationEngine {
    prioritize(items) {
        return [...items].sort((a, b) => b.priority - a.priority);
    }
}
exports.AutoPrioritizationEngine = AutoPrioritizationEngine;
//# sourceMappingURL=auto-engines.js.map