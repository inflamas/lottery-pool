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

## Roadmap, epics and tickets

Work is described at three levels, all under `specs/`:

```
specs/roadmap.md                      the roadmap: every epic, in order
├─ Epic 1 · The pool screen           a goal, too big to build in one go
│  ├─ specs/01-members/ticket.md      a ticket: one small change
│  ├─ specs/02-countdown/ticket.md
│  ├─ specs/03-tickets/ticket.md
│  └─ specs/04-new-numbers/ticket.md
├─ Epic 2 · Money                     not sliced into tickets yet
└─ Epic 3 · Changes to the pool       not sliced into tickets yet
```

- **Roadmap.** `specs/roadmap.md` lists the epics in the order we want them.
- **Epic.** A goal, in two lines. An epic never goes into the pipeline as a whole: it is sliced into tickets first. It is done when all its tickets are merged.
- **Ticket.** One slice of an epic, small enough for one spec, one change and one review. Each ticket has its own folder, `specs/{nr}-{name}/`, with a `ticket.md`: title, the epic it belongs to, size, one user story and one "Done means" line.

The link goes both ways: the roadmap names the tickets of each epic, and line 2 of every `ticket.md` names its epic.

Only tickets go through the pipeline. Everything the pipeline writes about a ticket (brainstorm, spec, progress, review, approval, retro, screenshots) lands in that ticket's folder, next to `ticket.md`.
