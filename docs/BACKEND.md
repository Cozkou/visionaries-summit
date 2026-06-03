# Pretty Fly Creative Director — Backend

Backend-only deliverable for the design generation and commercial analysis APIs.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/verify` | No | Body `{ "password" }` → `{ "token" }` for staff |
| `POST` | `/api/designs/generate` | Yes | Generate 6 concepts from CSV bestsellers (no LLM, no stock photos) |
| `GET` | `/api/designs/:id` | Yes | Fetch stored design |
| `GET` | `/api/designs/:id/analysis` | Yes | Commercial analysis with hackathon data |

### Auth

Send either header on protected routes:

- `Authorization: Bearer <INTERNAL_API_KEY>`
- `x-api-key: <INTERNAL_API_KEY>`

In development, if `INTERNAL_API_KEY` is unset, auth is skipped (not allowed in production).

### Generate request body

```json
{
  "productType": "Hoodie",
  "targetAudience": "Menswear",
  "businessGoal": "Maximize Revenue",
  "stylePrompt": "vintage wash, neutral palette"
}
```

### Generate response

Array of `Design` objects (`id`, `name`, `description`, `imageUrl` always empty, `retailPrice`, `sourceProductId`).

## Stack

| Layer | Implementation |
|-------|----------------|
| Persistence | SQLite (`data/pretty-fly.db`) |
| Auth | API key + optional staff password exchange |
| AI text | **DeepSeek** (`deepseek-chat` default) |
| Product images | **Unsplash CDN** by product type (no API key) |
| Historical data | `src/data/pretty-fly-dashboard.json` (hackathon pack) |

Without `DEEPSEEK_API_KEY`, text generation falls back to templates. Each concept gets a photo URL from Unsplash. Set `IMAGE_SOURCE=loremflickr` for Flickr-based variety.

### DeepSeek

Set `DEEPSEEK_API_KEY` from [DeepSeek API](https://platform.deepseek.com/). The HTTP client uses `https://api.deepseek.com`. Override the model with `LLM_TEXT_MODEL` (e.g. `deepseek-chat`, `deepseek-v4-flash`).

The `openai` npm package is only used as an HTTP client for DeepSeek’s OpenAI-compatible API — **OpenAI is not called**.

## Setup

```bash
cp backend.env.example .env.local
# Edit .env.local — set INTERNAL_API_KEY, STAFF_PASSWORD, DEEPSEEK_API_KEY
npm install
npm run dev
```

## Key files (backend)

```
src/lib/db/                    # SQLite schema + repository
src/lib/auth/                  # API key guard
src/lib/data/sales-analytics.ts  # CSV metrics (line_items, products, refunds, POs)
src/lib/generate-designs.ts      # Data-only concept builder
src/lib/design-generation.ts   # Orchestrates generate pipeline
src/lib/analyze-design.ts      # Metrics + insights from CSV only
src/app/api/designs/           # Route handlers
src/app/api/auth/verify/       # Staff token exchange
```

## Production notes

- Set `INTERNAL_API_KEY` before deploy (required).
- Use a managed Postgres or Supabase instead of SQLite if you run multiple instances.
- Add monitoring around DeepSeek API failures (logs go to server console today).
