import type { InterstellarContextInput, InterstellarKnowledgeGraph } from "../types";

export class InterstellarKnowledgeGraphEngine {
  build(ctx: InterstellarContextInput): InterstellarKnowledgeGraph {
    const nodes: InterstellarKnowledgeGraph["nodes"] = [];
    const edges: InterstellarKnowledgeGraph["edges"] = [];
    let ni = 0;
    let ei = 0;

    const add = (type: string, label: string, system?: string) => {
      const id = `n-${ni++}`;
      nodes.push({ id, type, label, system: system as InterstellarKnowledgeGraph["nodes"][0]["system"] });
      return id;
    };

    const sol = add("star_system", "Sol", "sol");
    const ac = add("star_system", "Alpha Centauri", "alpha_centauri");
    const prox = add("star_system", "Proxima", "proxima");
    const trap = add("star_system", "TRAPPIST-1", "trappist_1");

    edges.push({ id: `e-${ei++}`, from: sol, to: ac, relation: "comm_link" });
    edges.push({ id: `e-${ei++}`, from: sol, to: prox, relation: "comm_link" });
    edges.push({ id: `e-${ei++}`, from: sol, to: trap, relation: "comm_link" });

    for (const a of ctx.assets ?? []) {
      const aid = add(a.kind, a.name, a.system);
      const sid =
        a.system === "sol"
          ? sol
          : a.system === "alpha_centauri"
            ? ac
            : a.system === "proxima"
              ? prox
              : trap;
      edges.push({ id: `e-${ei++}`, from: aid, to: sid, relation: "located_in" });
      const hazard = add("hazard", `Hazards ${a.name}`, a.system);
      edges.push({ id: `e-${ei++}`, from: aid, to: hazard, relation: "exposes" });
      if ((a.crewCount ?? 0) > 0) {
        const crew = add("crew", `Crew ${a.name}`, a.system);
        edges.push({ id: `e-${ei++}`, from: crew, to: aid, relation: "aboard" });
      }
      if ((a.robotCount ?? 0) > 0) {
        const robot = add("robot", `Robots ${a.name}`, a.system);
        edges.push({ id: `e-${ei++}`, from: robot, to: aid, relation: "operates" });
      }
      if ((a.terraformStage ?? 0) > 0) {
        const tf = add("terraforming_stage", `Terraform ${a.terraformStage}`, a.system);
        edges.push({ id: `e-${ei++}`, from: aid, to: tf, relation: "undergoing" });
      }
    }

    add("resource", "Helium-3 reserves");
    add("scientific_discovery", "Exoplanet survey catalog");
    add("automation_outcome", "Interstellar automation log");

    return { nodes, edges };
  }
}
