import type { KnowledgeGraph, NetworkContextInput } from "../types";
import { hashId } from "../utils/anonymize";

export class KnowledgeGraphEngine {
  build(ctx: NetworkContextInput): KnowledgeGraph {
    const nodes: KnowledgeGraph["nodes"] = [];
    const edges: KnowledgeGraph["edges"] = [];
    let ni = 0;
    let ei = 0;

    const addNode = (type: string, label: string, id?: string) => {
      const nodeId = id ?? `n-${ni++}`;
      nodes.push({ id: nodeId, type, label });
      return nodeId;
    };

    const hazardId = addNode("hazard", "Global hazard cluster");
    const riskId = addNode("risk", "Network risk envelope");
    const controlId = addNode("control", "Shared controls library");

    for (const c of ctx.companies ?? []) {
      const cid = addNode("company", `Tenant ${c.companyHash}`, c.companyHash);
      edges.push({
        id: `e-${ei++}`,
        from: cid,
        to: hazardId,
        relation: "contributes_hazard_signal",
      });
      edges.push({ id: `e-${ei++}`, from: cid, to: riskId, relation: "risk_exposure" });
      if (c.region) {
        const rid = addNode("region", c.region, hashId(c.region, "region"));
        edges.push({ id: `e-${ei++}`, from: cid, to: rid, relation: "operates_in" });
      }
    }

    edges.push({ id: `e-${ei++}`, from: hazardId, to: controlId, relation: "mitigated_by" });
    edges.push({ id: `e-${ei++}`, from: riskId, to: controlId, relation: "reduced_by" });

    addNode("competency", "Trade competency standards");
    addNode("training_standard", "Network training baseline");

    return { nodes, edges };
  }
}
