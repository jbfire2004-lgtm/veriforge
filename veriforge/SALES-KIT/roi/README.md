# ROI Calculator — VeriForge

Directional enterprise ROI model. Replace assumptions with customer inputs before presenting numbers as commitments.

**Visual:** Iron-black sheet · steel input panels · forge-red “Total annual benefit” rail · Orbitron section headers.

## How to run a session

1. Confirm workforce size, sites, and current tool stack  
2. Enter baseline hours/costs in each lever  
3. Apply conservative adoption % (default 60–70% year 1)  
4. Sum annual benefit − subscription/services = net ROI  
5. Attach matching case-study narrative — never lead with fantasy precision  

---

## Inputs (customer)

| Input | Symbol | Example |
|-------|--------|---------|
| Workers / learners | `W` | 2,000 |
| Fully loaded hourly cost | `H` | $65 |
| Sites | `S` | 12 |
| Current annual incident cost (direct+indirect) | `I` | $1,200,000 |
| Verification checks / year (manual) | `V` | 40,000 |
| Minutes per manual verification | `Mv` | 12 |
| Compliance emergencies / year (expiry fire drills) | `C` | 24 |
| Hours per compliance fire drill | `Hc` | 40 |
| Equipment downtime hours / year (safety-related) | `D` | 1,800 |
| Downtime cost / hour | `Hd` | $400 |
| Culture program spend / year (low engagement) | `K` | $150,000 |

---

## Lever 1 — Training time reduction

**Story:** Faster time-to-competency; less duplicate training admin.

| Field | Formula / default |
|-------|-------------------|
| Hours saved / worker / year | `T_hrs` (default **4**) |
| Adoption | `A_t` (default **0.65**) |
| Annual benefit | `W × T_hrs × H × A_t` |

**Example:** `2000 × 4 × 65 × 0.65` ≈ **$338,000**

---

## Lever 2 — Verification automation savings

**Story:** Industrial-grade checks reduce manual swivel-chair verification.

| Field | Formula / default |
|-------|-------------------|
| Automated fraction | `A_v` (default **0.45**) |
| Hours saved | `V × Mv/60 × A_v` |
| Annual benefit | `hours × H` |

**Example:** `40000 × 0.2 × 0.45 × 65` ≈ **$234,000**

---

## Lever 3 — Compliance expiry prevention

**Story:** Engineered compliance cuts expiry fire drills and audit scramble.

| Field | Formula / default |
|-------|-------------------|
| Fire drills avoided | `C × A_c` (`A_c` default **0.5**) |
| Annual benefit | `C × A_c × Hc × H` |

**Example:** `24 × 0.5 × 40 × 65` ≈ **$31,200**  
*(Often small vs risk avoided — pair with audit-readiness qualitative value.)*

---

## Lever 4 — Incident reduction modeling

**Story:** Capture → investigate → close discipline + predictive/command visibility.

| Field | Formula / default |
|-------|-------------------|
| Expected reduction | `R_i` (default **0.08**–**0.15** — use **0.08** conservative) |
| Annual benefit | `I × R_i` |

**Example:** `1,200,000 × 0.08` = **$96,000**  
Label clearly as **modeled**, not guaranteed.

---

## Lever 5 — Equipment uptime improvement

**Story:** Inspections + twin awareness reduce safety-related downtime.

| Field | Formula / default |
|-------|-------------------|
| Downtime hours avoided | `D × A_e` (`A_e` default **0.06**) |
| Annual benefit | `D × A_e × Hd` |

**Example:** `1800 × 0.06 × 400` ≈ **$43,200**

---

## Lever 6 — Culture engagement uplift

**Story:** Measurable participation improves program yield (not “vibes”).

| Field | Formula / default |
|-------|-------------------|
| Yield uplift on culture spend | `U_k` (default **0.15**) |
| Annual benefit | `K × U_k` |

**Example:** `150,000 × 0.15` = **$22,500**

---

## Roll-up

| Lever | Example annual benefit |
|-------|------------------------|
| Training time reduction | $338,000 |
| Verification automation | $234,000 |
| Compliance expiry prevention | $31,200 |
| Incident reduction (modeled) | $96,000 |
| Equipment uptime | $43,200 |
| Culture engagement uplift | $22,500 |
| **Total benefit (illustrative)** | **~$764,900** |

| Cost side | Notes |
|-----------|-------|
| Subscription | From `/veriforge/pricing` packaging |
| Implementation / training | One-time year 1 |
| **Net ROI** | `(Benefit − Cost) / Cost` |
| **Payback (months)** | `Cost / (Benefit/12)` |

---

## Presentation rules

1. Always show **inputs** beside outputs.  
2. Prefer ranges (conservative / expected).  
3. Separate **hard savings** (time, downtime) from **modeled risk** (incidents).  
4. Tie each lever to an engine one-pager.  
5. Brand the sheet: **Forged for Absolute Safety** — angular, no soft charts candy.

## Worksheet stub (copy to spreadsheet)

```
W,H,S,I,V,Mv,C,Hc,D,Hd,K
T_hrs,A_t,A_v,A_c,R_i,A_e,U_k
Benefit_train = W*T_hrs*H*A_t
Benefit_verify = V*(Mv/60)*A_v*H
Benefit_comply = C*A_c*Hc*H
Benefit_incident = I*R_i
Benefit_equip = D*A_e*Hd
Benefit_culture = K*U_k
Total = SUM(benefits)
```
