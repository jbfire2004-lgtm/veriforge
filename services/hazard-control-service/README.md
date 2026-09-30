# Vera Unified Hazard & Control Engine

Microservice for hazard/control libraries, mappings, energy wheel detection, and SIF/HECA scoring.

## Features

- Hazard and control libraries (per company)
- Hazard → control mapping with validation
- Energy wheel auto-detection from descriptions
- SIF/HECA scoring engine
- Required PPE, training, controls (JSONB)
- Record versioning on map/score updates
- Multi-company JWT isolation

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/hazard` | Create hazard (auto SIF/HECA + energy wheel) |
| POST | `/control` | Create control |
| POST | `/hazard/map-controls` | Link hazard to control(s) |
| POST | `/hazard/sif-heca` | Re-score hazard SIF/HECA |
| GET | `/hazard/{id}` | Hazard + controls + energy wheel + mapping validation |
| GET | `/control/{id}` | Control + linked hazards |

## Quick start

```bash
cd services/hazard-control-service
cp .env.example .env
docker compose up -d hazard-db
npm install
npx prisma migrate deploy
npm run dev
```

Port **3006**. Postgres **5438**.

## Example

```json
POST /hazard
{
  "company_id": "uuid",
  "hazard_type": "physical",
  "category": "fall",
  "energy_type": "gravity",
  "severity": 4,
  "likelihood": 3,
  "title": "Overhead fall hazard",
  "description": "Workers at height near energized electrical panel"
}
```

## Tests

```bash
npm test
```
