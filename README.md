# SolidBeats — SolidJS 2

A music player demo built with **SolidJS 2** and **Solid Router 2** (server functions, streaming SSR, single-flight
mutations). It's a SolidJS port of the Next.js 16.3 demo [vercel-labs/next-beats](https://github.com/vercel-labs/next-beats)
([live](https://next-beats.dev)). The music is synthesized per genre with the Web Audio API; the audio engine in
`src/lib/audio` is taken from the original unchanged.

```bash
pnpm install
pnpm dev     # http://localhost:5173
pnpm build   # Vercel build output (.vercel/output) via Nitro
```

Sign in with any name. The data is an in-memory mock (`src/lib/server.ts`) seeded from the original's Prisma seed; it
resets when the server restarts. The **Delays** toggle (top right) adds the original's artificial database latency so
the loading states are visible.

## How the Next.js features map

- `'use cache'` + `cacheTag` → router `query()` wrappers around `"use server"` functions (`src/lib/queries.ts`).
- `updateTag` / `revalidateTag` → `respond(value, { revalidate: [query.key, …] })` from the mutation; the router
  refetches those queries in the same round trip (`src/lib/mutations.ts`).
- Partial prefetching → `viewportPreload({ data: true })` for links marked `preload="viewport"`, plus
  `intentPreload()` on hover, focus, and touch (`src/router.ts`).
- `Suspense` → `<Loading>`; error boundaries → `<Errored>`.
- `useOptimistic` + `useTransition` → `createOptimistic` inside a Solid `action` (likes, playlist toggles).
- `proxy.ts` auth gate → a start middleware (`src/middleware.ts`).
