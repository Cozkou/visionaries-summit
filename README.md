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
| `/designs` | Concept gallery (6 mock designs) |
| `/design/[id]` | Commercial analysis for a concept |

## Project structure

```
src/
  app/              # Pages (App Router)
  components/       # UI and page sections
  data/             # mockDesigns.ts, mockAnalysis.ts
  services/api.ts   # API placeholders (swap for backend)
  store/            # Zustand (generationInputs, selectedDesign, analysisData)
  types/            # Shared TypeScript types
```

## Backend integration

Replace mock implementations in `src/services/api.ts`:

- `generateDesigns()` → POST generation endpoint
- `getDesignAnalysis()` → GET analysis by design id

Pages call these services only; no page structure changes required.
