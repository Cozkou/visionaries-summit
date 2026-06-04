# Pretty Fly Creative Director — Backend

Backend deliverable for design generation, commercial analysis, and operator control tower.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/verify` | No | Body `{ "password" }` → `{ "token" }` for staff |
| `POST` | `/api/designs/generate` | Yes | Up to 6 concepts from CSV bestsellers (no LLM) |
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

Concepts have empty `imageUrl` (data pack has no photography). No mock catalogue, session counters, or decorative countdown timers — storefront signals come from CSV + database only.

## Setup

```bash
cp backend.env.example .env.local
npm install
npm run dev
```

**Supabase:** set `DATABASE_URL` in `.env.local` (direct connection, port 5432). Tables are created automatically on first request, or apply `supabase/migrations/20260604120000_initial_app_schema.sql` in the SQL editor.

Data pack path: `hackathon_assets/pretty_fly_data_pack/data/`
