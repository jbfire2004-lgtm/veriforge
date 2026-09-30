# VeriPM Project Safety Dashboard

Project-level safety intelligence for Transmission, Distribution, Substation, Civil, Industrial, and Renewable work.

## Route

- UI: `/pm/project-safety`
- API: `GET|POST /api/v1/veripm-project-safety`

## Inputs

| Selector | Values |
|----------|--------|
| Project type | Transmission, Distribution, Substation, Civil, Industrial, Renewable |
| Region | CA-AB, CA-BC, CA-ON, US-TX, US-NV, US-CA |
| Scale | Small, Medium, Large, Mega |
| Period | Quarterly |
| Cross-category | Opt-in checkbox |

## Features

- Leading indicators (observations, near-miss, toolbox, training, permits, inspections)
- Lagging indicators (TRIF, LTIF, severity, recordables, first-aid)
- Incident trends
- Focus audit trends
- Intelligent inspection trends
- Corrective action aging (buckets + /200k rates)
- Project risk profile
- Project vs industry comparison

## Rules

1. **Project-level only** unless `crossCategoryOptIn` — peers default to same project type; opt-in opens all categories.
2. **Normalize per 200,000 hours** for all count-based rates.
3. **Tokenize project IDs** — payloads expose `proj_*` tokens only, never raw IDs.

## Module

`vera-frontend/lib/veripm-project-safety/`
