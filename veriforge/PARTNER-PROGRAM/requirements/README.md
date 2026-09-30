# Partner Requirements

Measurable bars for **deployments**, **certifications**, **integrations**, and **support capabilities**. Use with [`../tiers/`](../tiers/).

---

## 1. Deployments

| Metric | Forge | Alloy | Titanium |
|--------|-------|-------|----------|
| Production / paid pilot tenants | ≥1 | ≥5 (T12M active) | ≥15 active **or** 1 enterprise ≥8 sites |
| Go-live checklist signed | Yes | Yes | Yes + architecture review |
| Brand QA on customer UI | Spot check | Required per go-live | Required + annual audit |
| Tenant isolation verified | Sandbox | Production evidence | Production + pen-test summary (or equivalent) |

### Go-live checklist (minimum)

- [ ] VFAppShell / VeriForge shell — not Vera unified nav  
- [ ] Angular geometry (`border-radius: 0`)  
- [ ] Metallic headers / steel borders / forge-red active only  
- [ ] `meta.tenantId` correct on API traffic  
- [ ] Critical routes labeled; reduced-motion respected  
- [ ] Admin + backup admin named  

---

## 2. Certifications

| Role track | Forge tier | Alloy tier | Titanium tier |
|------------|------------|------------|---------------|
| Individual credential | Forge Certified | Alloy Certified | Titanium Certified |
| Headcount | ≥1 | ≥2 (incl. 1 Alloy) | ≥3 (incl. 1 Titanium architect) |
| Renewal | 24 months | 18 months | 12 months |
| Practical assessment | Sandbox task | Production-like lab | Architecture + integration defense |

See [`../certification/`](../certification/).

---

## 3. Integrations

| Capability | Forge | Alloy | Titanium |
|------------|-------|-------|----------|
| Sandbox API keys | Required | Required | Required |
| Production API integration | Optional | **≥1** | **≥2** |
| Webhook consumer | Optional | Recommended | Required (at least one path) |
| Tenant isolation review | Self-attest | VeriForge review | Formal review + evidence |
| Ledger / twin (advanced) | — | Optional | ≥1 advanced path preferred |

Allowed integration classes: Auth/SSO · HRIS/user sync · LMS · GRC export · webhooks · Safety Blockchain Ledger consumers · Digital Twin ingestion · Command Center automation.

Rules: [`../api-integration/`](../api-integration/).

---

## 4. Support capabilities

| Capability | Forge | Alloy | Titanium |
|------------|-------|-------|----------|
| Customer L1 | Email / ticket | Phone/email 8×5 | 16×5 or better |
| L2 product troubleshooting | Escalate to VF | In-house + escalate | In-house L2/L3 |
| Severity-1 response (partner→VF) | Best effort | ≤4 business hours | ≤1 hour (named bridge) |
| Runbooks | Template | Custom per practice | Joint runbooks with VF |
| Status communication | Ad hoc | Customer-facing updates | War-room participation |

### Severity model (align with VeriForge)

| Sev | Meaning |
|-----|---------|
| S1 | Critical safety workflow down / cross-tenant risk |
| S2 | Major engine impaired; workaround exists |
| S3 | Minor / cosmetic / single-user |
| S4 | Question / enhancement |

---

## Evidence pack (submit for tier upgrade)

1. Deployment list (tenant IDs redacted as needed · counts · industries)  
2. Certification transcripts  
3. Integration architecture diagram (angular one-pager style OK)  
4. Support roster + coverage hours  
5. Brand compliance screenshots  
6. Security questionnaire  

Submit via partner portal / partner success contact.
