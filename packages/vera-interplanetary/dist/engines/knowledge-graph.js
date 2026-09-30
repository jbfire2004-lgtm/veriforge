"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterplanetaryKnowledgeGraphEngine = void 0;
class InterplanetaryKnowledgeGraphEngine {
    build(ctx) {
        const nodes = [];
        const edges = [];
        let ni = 0;
        let ei = 0;
        const add = (type, label, body) => {
            const id = `n-${ni++}`;
            nodes.push({ id, type, label, body: body });
            return id;
        };
        const earth = add("planet", "Earth", "earth");
        const moon = add("planet", "Moon", "moon");
        const mars = add("planet", "Mars", "mars");
        const mission = add("mission", ctx.missionId ?? "deep-space-mission", "deep_space");
        for (const s of ctx.sites ?? []) {
            const sid = add(s.facilityType, s.name, s.body);
            const pid = s.body === "earth" ? earth : s.body === "moon" ? moon : s.body === "mars" ? mars : mission;
            edges.push({ id: `e-${ei++}`, from: sid, to: pid, relation: "located_on" });
            const hazard = add("hazard", `Hazards ${s.name}`, s.body);
            edges.push({ id: `e-${ei++}`, from: sid, to: hazard, relation: "exposes" });
            if ((s.crewCount ?? 0) > 0) {
                const crew = add("crew", `Crew ${s.name}`, s.body);
                edges.push({ id: `e-${ei++}`, from: crew, to: sid, relation: "stations_at" });
            }
            if ((s.robotCount ?? 0) > 0) {
                const robot = add("robot", `Robotics ${s.name}`, s.body);
                edges.push({ id: `e-${ei++}`, from: robot, to: sid, relation: "operates_at" });
            }
            const equip = add("equipment", `Equipment ${s.name}`, s.body);
            edges.push({ id: `e-${ei++}`, from: equip, to: sid, relation: "deployed_at" });
        }
        edges.push({ id: `e-${ei++}`, from: earth, to: moon, relation: "comm_link" });
        edges.push({ id: `e-${ei++}`, from: earth, to: mars, relation: "comm_link" });
        edges.push({ id: `e-${ei++}`, from: moon, to: mars, relation: "comm_link" });
        add("resource", "Life support reserves");
        add("automation_outcome", "Autonomous action log");
        return { nodes, edges };
    }
}
exports.InterplanetaryKnowledgeGraphEngine = InterplanetaryKnowledgeGraphEngine;
//# sourceMappingURL=knowledge-graph.js.map