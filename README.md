# Lottery Pool

The starting repo of an AI pipeline lab. Every feature after this point comes through the pipeline; this repo is only what the pipeline starts from:

- **A walking skeleton.** The smallest slice that proves React -> API -> SQLite is wired: the app shows the pool name and the number of members, served from SQLite through the API. `packages/app` is React + Vite, `packages/api` is Effect-TS on Bun with `bun:sqlite`.
- **One check command.** `bun run check` runs the typecheck, the lint (Biome) and all tests, and exits non-zero on any failure.
- **Two guidelines.** `specs/guidelines/architecture.md` and `specs/guidelines/ui.md`. Every rule in them is checkable.
- **AGENTS.md.** How to run things, which guideline to read when, and the pipeline rules agents follow.

## Run it

You need [Bun](https://bun.sh).

```sh
bun install
bun run check
bun run dev
```

`bun run dev` starts the API and the app together. Open http://localhost:5173: it shows "Fourth Floor Pool" and "5 members".
