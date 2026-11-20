# Architecture

## Stack

Bun workspaces · React + Vite (`packages/app`) · Effect-TS on Bun (`packages/api`) · SQLite through `bun:sqlite`, no ORM · Biome · TypeScript.

Why this stack, in the owner's words: "Effect is what I use most and I like Functional Programming. The Architecture is simple."

## Packages

| Package        | Owns                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `packages/app` | The screens: React components, the design tokens, and the `fetch` calls to `/api/*`. It holds no data of its own. |
| `packages/api` | The HTTP API, the SQLite schema, the seed, and every query. It is the only owner of the data.                     |

## Request flow

1. A screen in `packages/app` calls `fetch("/api/...")`.
2. The Vite dev server proxies `/api` to the API on `API_PORT` (default 3000), set in `packages/app/vite.config.ts`.
3. A route in `packages/api/src/http.ts` handles the request and calls a repository service (for example `PoolRepo`).
4. The repository runs SQL on the `Database` service, the single `bun:sqlite` connection.
5. The rows come back as a schema-encoded JSON response, through the proxy, into React state, onto the screen.

## Rules

Each rule names its check. `bun run check` runs all of them.

1. **Dependencies only in the root `package.json`.** No `packages/*/package.json` has a `dependencies`, `devDependencies`, `peerDependencies` or `optionalDependencies` key.
   Check: `scripts/guidelines.test.ts`, "dependencies live only in the root package.json".
2. **Only `packages/api` touches SQLite.** No file outside `packages/api/` contains `bun:sqlite`, so none can open the database.
   Check: `scripts/guidelines.test.ts`, "only packages/api touches SQLite".
3. **Money in whole cents.** Every money column is named `*_cents`, has type `INTEGER`, and no column has type `REAL`. Money crosses the API as an integer number of cents and is formatted only on the screen.
   Check: `scripts/guidelines.test.ts`, "money columns are INTEGER and end in _cents".
4. **The seed is deterministic.** `packages/api/src/seed.ts` uses literal data only: no clock, no randomness.
   Check: `packages/api/src/seed.test.ts`, "the seed is deterministic".
