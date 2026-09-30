"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustryKnowledgeGraphEngine = void 0;
const scoring_1 = require("../utils/scoring");
class IndustryKnowledgeGraphEngine {
    build(ctx) {
        const nodes = [];
        const edges = [];
        let ni = 0;
        let ei = 0;
        const add = (type, label, id) => {
            const nodeId = id ?? `n-${ni++}`;
            nodes.push({ id: nodeId, type, label });
            return nodeId;
        };
        const hazard = add("hazard", "Industry hazard cluster");
        const risk = add("risk", "Industry risk envelope");
        const control = add("control", "Shared industry controls");
        const competency = add("competency", "Cross-industry competencies");
        const standard = add("training_standard", "Industry training baseline");
        const outcome = add("automation_outcome", "Federated automation outcomes");
        for (const p of ctx.participants ?? []) {
            const cid = add("company", `Participant ${p.companyHash}`, p.companyHash);
            const iid = add("industry", p.industry, (0, scoring_1.hashId)(p.industry, "industry"));
            const rid = add("region", p.region, (0, scoring_1.hashId)(p.region, "region"));
            edges.push({ id: `e-${ei++}`, from: cid, to: iid, relation: "operates_in_industry" });
            edges.push({ id: `e-${ei++}`, from: cid, to: rid, relation: "operates_in_region" });
            edges.push({ id: `e-${ei++}`, from: cid, to: hazard, relation: "contributes_signal" });
            edges.push({ id: `e-${ei++}`, from: cid, to: risk, relation: "risk_exposure" });
        }
        edges.push({ id: `e-${ei++}`, from: hazard, to: control, relation: "mitigated_by" });
        edges.push({ id: `e-${ei++}`, from: risk, to: control, relation: "reduced_by" });
        edges.push({ id: `e-${ei++}`, from: competency, to: standard, relation: "aligned_with" });
        edges.push({ id: `e-${ei++}`, from: control, to: outcome, relation: "causes" });
        return { nodes, edges };
    }
}
exports.IndustryKnowledgeGraphEngine = IndustryKnowledgeGraphEngine;
//# sourceMappingURL=industry-knowledge-graph.js.map