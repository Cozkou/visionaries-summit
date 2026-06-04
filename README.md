# Pretty Fly Creative Director

MVP frontend for internal staff to generate and evaluate AI-powered clothing concepts for Pretty Fly streetwear.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/generate` | Generation inputs form |
| `/designs` | Concept gallery (6 CSV-derived concepts) |
| `/design/[id]` | Commercial analysis for a concept |

## Project structure

```
src/
  app/              # Pages (App Router)
  components/       # UI and page sections
  lib/data/         # sales-analytics.ts (Pretty Fly CSV pack)
  services/api.ts   # Backend API client
  store/            # Zustand (generationInputs, selectedDesign, analysisData)
  types/            # Shared TypeScript types
```

## Data

All commercial metrics come from `hackathon_assets/pretty_fly_data_pack/data/*.csv`. Concepts use real bestseller SKUs; the pack has no product images.

See `docs/BACKEND.md` for API details.
