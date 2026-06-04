# Pretty Fly Creative Director — Backend

Backend deliverable for design generation, commercial analysis, and operator control tower.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/verify` | No | Body `{ "password" }` → `{ "token" }` for staff |
| `POST` | `/api/designs/generate` | Yes | One concept from CSV bestsellers with generated product imagery |
| `GET` | `/api/designs/:id` | Yes | Fetch stored design |
| `GET` | `/api/designs/:id/analysis` | Yes | Commercial analysis with hackathon CSV metrics |
| `GET` | `/api/control-tower/*` | No | Operator snapshot built live from data pack |
| `GET` | `/api/catalog` | No | Store catalogue from `products.csv` + sales stats |
| `GET` | `/api/china-market` | No | Live China research fetch |

### Auth

Send either header on protected routes:

- `Authorization: Bearer <INTERNAL_API_KEY>`
- `x-api-key: <INTERNAL_API_KEY>`

In development, if `INTERNAL_API_KEY` is unset, auth is skipped (not allowed in production).

## Stack

| Layer | Implementation |
|-------|----------------|
| Persistence | Supabase Postgres (`DATABASE_URL` required in production); SQLite only for local dev without Postgres |
| Design / analysis | `sales-analytics.ts` — line_items, products, refunds, POs, suppliers |
| Control tower | `control-tower-build.ts` — variants, ads CSVs, support_tickets |
| Storefront catalog | `catalog.ts` — products.csv + variant inventory |
| Publish | SQLite early-release listing; optional WooCommerce when configured |
| China market | Live HTTP from official sources (no static fallback file) |

Concept generation is backend-only: one concept per request, grounded in the CSV pack, with image output generated server-side through an OpenAI-compatible image API. It supports either direct OpenAI or ImageRouter via environment variables. No mock catalogue, session counters, or decorative countdown timers — storefront signals come from CSV + database only.

## Setup

```bash
cp backend.env.example .env.local
npm install
npm run dev
```

**Supabase:** local backend env is configured for project `kqjbgzrihtjizegshwgw`. The working server-only `DATABASE_URL` uses the Supabase transaction pooler on port `6543`; `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are present for future Supabase API/auth work but are not required by the current backend code. CSV analytics stay file-based — not in Postgres.

Data pack path: `hackathon_assets/pretty_fly_data_pack/data/`
