# VeriForge Safety Blockchain Ledger

Industrial-grade immutability, verification, compliance, and audit integrity using the forged-metal identity.

## Purpose

- Immutable safety records
- Verification proofs
- Compliance document hashing
- Incident chain-of-custody
- Equipment inspection ledger
- Workforce certification ledger
- Risk & audit blockchains

## Block types

| Type | Payload | Visual |
|------|---------|--------|
| Training | ModuleId, score, timestamp | Angular metallic · red glow on fail |
| Verification | forgeCheck result, workflow steps | Metallic bevel · red accent on fail |
| Compliance | Document hash, expiry, validation | Angular border · red alert on expiry |
| Incident | Severity, evidence hash, investigation | Heavy industrial · red glow critical |
| Equipment | Inspection, defects, certification | Steel-grey · red accent |
| Risk | Hazard, controls, risk score | Angular risk matrix |
| Audit | Evidence hash, scoring, timestamp | Metallic angular edges |

## Features

- Block creation with SHA-256 hashing & signing
- Immutable append-only chain with prevHash linkage
- Cross-tenant isolation (`tenantId` stamped on every block)
- Verification proofs (hash + signature check)
- Ledger explorer with angular chain visualization
- Smart safety contracts

## Smart safety contracts / integrity

The Nest safety ledger uses **HMAC-SHA256** with `VERIFORGE_LEDGER_HMAC_KEY`. Production **requires** `VERIFORGE_LEDGER_PATH` on a durable volume and fails closed if the write fails. It is an integrity ledger, not a public L1 blockchain.

Tenant directory, users, and hashed reset tokens persist to `VERIFORGE_TENANT_REGISTRY_PATH` (required in production). Restart no longer reseeds over live data.

- UI: `/veriforge/ledger`
- API: `/veriforge/ledger`
- Permission: `AUDIT_VIEW` (JWT role claims only)
