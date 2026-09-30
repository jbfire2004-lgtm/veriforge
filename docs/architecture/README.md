# Architecture documentation

Design notes for expanding features into full system views.

| Document | Scope |
|----------|--------|
| **[Vera Core system blueprint](./vera-core-system-blueprint.md)** | **Full architecture: ERD, DFDs, sequence diagrams, deployment, events, offline sync** |
| Workflow simulation engine (`@vera/workflow-sim`) | E2E lifecycle simulation, validators, Mermaid diagrams — run `npm run simulate:workflows` from repo root |
| Intelligence layer (`@vera/intelligence`) | Phase 2 VIE: predictive analytics, risk scoring, recommendations, anomalies, Ask Vera — `GET /api/v1/intelligence/bundle` |
| Vision layer (`@vera/vision`) | Phase 3 VVE: OCR, certificate extraction, fraud detection, auto-mapping — `POST /api/v1/vision/analyze` |
| Digital twin layer (`@vera/digital-twin`) | Phase 4 VDTE: real-time twins, timelines, predictions — `POST /api/v1/twins/hydrate` |
| Autonomous safety (`@vera/autonomous-safety`) | Phase 5 VASE: SIF, HECA, Energy Wheel, interventions — `POST /api/v1/safety/analyze` |
| Predictive scheduling (`@vera/predictive-scheduling`) | Phase 6 VPSE: workforce, equipment, dispatch, crew optimization — `POST /api/v1/scheduling/optimize` |
| Autonomous operations (`@vera/autonomous-operations`) | Phase 7 VAOE: auto-dispatch, assignment, lockout, roster, execution — `POST /api/v1/operations/run` |
| Enterprise automation (`@vera/enterprise-automation`) | Phase 8 VEAO: unified orchestrator across Phases 3–7 — `POST /api/v1/enterprise/orchestrate` |
| Command center (`@vera/command-center`) | Phase 9 VRTIE: real-time safety & operations command center — `POST /api/v1/command-center/refresh` |
| Enterprise brain (`@vera/enterprise-brain`) | Phase 10 AEB: holistic reasoning, planning, prediction, decisions — `POST /api/v1/brain/think` |
| Global network (`@vera/global-network`) | Phase 11 VGNIE: multi-company federated hazard, safety, workforce, twin & knowledge graph intelligence — `POST /api/v1/global-network/analyze` |
| Industry ecosystem (`@vera/industry-ecosystem`) | Phase 12 VAIEE: cross-industry coordination, prediction, optimization, risk & readiness — `POST /api/v1/industry-ecosystem/orchestrate` |
| Marketplace (`@vera/marketplace`) | Phase 13 VGAME: autonomous global exchange for workforce, equipment, training & services — `POST /api/v1/marketplace/run` |
| Interplanetary (`@vera/interplanetary`) | Phase 14 VIOE: multi-planet delay-tolerant safety, habitat, EVA & deep-space coordination — `POST /api/v1/interplanetary/operate` |
| Interstellar (`@vera/interstellar`) | Phase 15 VIOE-X: multi-star-system generational ships, probes & self-replicating colonies — `POST /api/v1/interstellar/expand` |
| Civilization (`@vera/civilization`) | Phase 16 UCE: governance, ethics, stability, growth & multi-century civilization memory — `POST /api/v1/civilization/govern` |
| [Vera Core platform](./vera-core-platform.md) | Platform modules, navigation, wireframes |
| [Verification & trust platform](./verification-and-trust.md) | Public verification API, compliance evaluation, site access, rule engine, frontend contract, evolution path |

For day-to-day setup, see [../DEVELOPER.md](../DEVELOPER.md).
