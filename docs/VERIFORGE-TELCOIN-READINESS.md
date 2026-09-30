# Telcoin Network readiness runbook

## Scope

On-chain minting for training / equipment / workflow credentials via `services/nft-mint-service` and
`apps/wle-contracts`. Off-chain VeriForge safety ledger is **HMAC integrity**, not L1 Telcoin chain.

## Prerequisites

1. Observer (read) RPC endpoint separate from mint/submit RPC when available.
2. Remote signer / KMS (`SIGNER_MODE=remote`) for production — never long-lived hot keys in pods.
3. Contract addresses deployed for Training, Equipment, Workflow soulbound NFTs.
4. `EXPECTED_CHAIN_ID` pinned to Telcoin network ID used by ops.
5. `MIN_CONFIRMATIONS` ≥ 3 (adjust to Telcoin finality guidance).

## Environment (mint service)

```bash
NODE_ENV=production
RPC_URL=https://<mint-or-submit-rpc>
OBSERVER_RPC_URL=https://<read-only-rpc>
SIGNER_MODE=remote
REMOTE_SIGNER_URL=https://signer.internal/v1/sign-and-send
REMOTE_SIGNER_TOKEN=<secret>
EXPECTED_CHAIN_ID=<telcoin-chain-id>
MIN_CONFIRMATIONS=3
TRAINING_CONTRACT_ADDRESS=0x...
WORKFLOW_CONTRACT_ADDRESS=0x...
EQUIPMENT_CONTRACT_ADDRESS=0x...
```

Do **not** set `PRIVATE_KEY` in production unless `ALLOW_HOT_WALLET=true` with HSM injection (discouraged).

## Deploy contracts

```bash
cd apps/wle-contracts
export DEPLOYER_PRIVATE_KEY= # HSM-backed one-shot or controlled wallet
export TELCOIN_RPC_URL=...
export TELCOIN_CHAIN_ID=...
npx hardhat test
npx hardhat run scripts/soak-local.ts
npx hardhat run scripts/deploy.ts --network telcoinTestnet
```

## Verification checklist

| Check | Pass criteria |
|-------|----------------|
| Chain pin | Boot fails if `EXPECTED_CHAIN_ID` ≠ network |
| Confirmations | Mint returns only after N blocks + reorg re-check |
| Soulbound | Transfer of ACTIVE credential reverts |
| Remote signer | Process has no `PRIVATE_KEY` env in prod |
| Observer isolation | Reads use `OBSERVER_RPC_URL` when set |

## Local soak (required evidence)

`npx hardhat run scripts/soak-local.ts` deploys Training/Equipment/Workflow with **AccessControl** (`MINTER_ROLE` / `ADMIN_ROLE`), mints as the minter key (not a transfer of `DEFAULT_ADMIN_ROLE`), and asserts soulbound transfer reverts.

Live Telcoin testnet ping runs from `.github/workflows/telcoin-soak.yml`. Set `TELCOIN_SOAK_REQUIRED=true` after contracts are deployed so missing RPC secrets fail the job.

## Axelar

Axelar GMP/bridge adapters are **out of scope** and **must not** appear in product claims, UI copy, or mint-service APIs until a dedicated adapter is implemented and threat-modeled.

## Incident response

1. Disable mint routes / scale mint service to 0.
2. Rotate remote signer credentials; revoke compromised minter role on contracts if using AccessControl upgrade.
3. Announce stale credentials; use `revokeCredential` / workflow status updates on-chain.
