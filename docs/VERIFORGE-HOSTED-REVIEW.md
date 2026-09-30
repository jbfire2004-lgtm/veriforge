# Hosted VeriForge review (no source access)

A GitHub login **cannot** be limited to “look but do not copy.” Anyone with repository read can clone. For a third-party preproduction checkout **without code**, do not add them to the repo. Give them a running app URL and an Auditor account only.

## What they get

| | |
|---|---|
| App | Production or staging URL you host (not this git remote) |
| Login | `/veriforge/auth/login` or `/veriforge/tenant/login` |
| Tenant slug | `alloy` |
| Email | `reviewer@alloy.works` |
| Password | `VERIFORGE_REVIEWER_PASSWORD` on the host, or the non-prod default `Review!Only2026` |
| Role | `Auditor` — can **view** training, verification, compliance, and the HMAC ledger. Cannot create users, change settings, or commit/fire ledger blocks. |

Do **not** send `ops@alloy.works` / `admin@forgeco.io` / `Str0ng!Passw0rd`. Those are operator and SuperAdmin seeds.

## What they must not get

- GitHub org, the git remote, zip of the tree, or CI logs that dump source
- Kubernetes `KUBE_CONFIG_DATA`, OIDC deploy roles, or `VERIFORGE_TENANT_JWT_SECRET`
- Database dumps, ledger JSON, or tenant registry files
- Browser source maps (production build has `productionBrowserSourceMaps: false`)

## Host setup before you send the invite

1. Run the **production Next build** (`vera-frontend`) against Nest `:3001` with durable files:

   `VERIFORGE_TENANT_REGISTRY_PATH`  
   `VERIFORGE_LEDGER_PATH`  
   `VERIFORGE_LEDGER_HMAC_KEY` (32+ chars)  
   `VERIFORGE_TENANT_JWT_SECRET` (32+ chars)

2. Set a unique reviewer password for that host:

   `VERIFORGE_REVIEWER_PASSWORD` (12+ chars, mixed case, digit, symbol)

   Restart Nest so `ensureReviewerUser` can create `reviewer@alloy.works` if it does not exist. Existing reviewer passwords are not overwritten on boot.

3. Confirm login as Auditor, then confirm ledger **GET** works and ledger **POST /commit** returns 403. The demo role dropdown stays off unless `NEXT_PUBLIC_VERIFORGE_DEMO_ROLE_SWITCH=true` (do not set that on the review host).

4. Production Next build has `productionBrowserSourceMaps: false`. That reduces reconstruction from the browser bundle; it does not make the running JS unreadable.

5. Optional: `TELCOIN_SOAK_REQUIRED` stays off for this review unless NFT mint RPC is in scope.

6. GitHub: keep the reviewer off `Contents: Read`. Use a private staging URL plus network allow-list if you have one.

## Honest scope for the reviewer

- They are reviewing the **running product and API**, not performing a white-box source audit.
- Nest tenant data is a JSON file on a volume, not Postgres. Call that out if they ask about multi-pod HA.
- Off-chain safety records are HMAC integrity, not Telcoin L1. On-chain mint is a separate service.

If they later need a **code** review, that is a different engagement: limited GitHub read in a short-lived fork or archive, NDA, and an Auditor app account still used for runtime checks.
