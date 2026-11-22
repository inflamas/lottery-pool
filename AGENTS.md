# Lottery Pool

Stack: Bun workspaces, React + Vite (`packages/app`), Effect-TS API (`packages/api`), SQLite via `bun:sqlite`, Biome.

## Run

- `bun install` once.
- `bun run dev` starts the app (http://localhost:5173) and the API (port 3000) together.
- `bun run check` runs the typecheck, the lint (Biome) and all tests under `packages/` and `scripts/`; it exits non-zero on any failure.
- `bun scripts/shot.ts {nr}` writes `screen-390.png` and `screen-1440.png` into `specs/{nr}-{name}/evidence/`.

## Read first

- Before adding a package, service or dependency: `specs/guidelines/architecture.md`.
- Before building a screen: `specs/guidelines/ui.md`.

## Pipeline rules

- Every ticket gets two branches, each in its own git worktree created from an up-to-date `main`: `spec/{nr}-{name}` in `.claude/worktrees/spec-{nr}-{name}` for the brainstorm and the spec, `dev/{nr}-{name}` in `.claude/worktrees/dev-{nr}-{name}` for the implementation and the review. The main checkout stays on `main`: tickets run in parallel without touching each other.
- An agent works only inside the worktree of its branch: every file it writes and every command it runs stays there.
- Agents never merge and never push; a human merges each branch into `main` locally after approving it.
- If a ticket's branch or file already exists, continue on it; never recreate a branch or overwrite a record.
- Everything about a ticket lives in `specs/{nr}-{name}/` (ticket, brainstorm, spec, spec-review, progress, review, approval, retro, and `evidence/` for screenshots), the roadmap in `specs/roadmap.md`.
- Merging is the approval: a spec has no status line. On `spec/{nr}-{name}` it is a draft; once a human merges that branch into `main` it is approved. The agent never writes `approval.md`, and never merges: only a human does.
- The agent writes and revises `spec.md` only on `spec/{nr}-{name}`, keeping every answer and every "## Gate feedback" a human wrote.
- A spec on `main` is the implementation contract: never modify, delete, rename or replace it on `main` or on a dev branch.
- The first line of `progress.md` is the implementation state: "State: building", "State: blocked" or "State: ready for review".
- If implementation reveals a material gap, write it under "## Proposed spec revision" in `progress.md`, set "State: blocked" and stop the affected work; the spec is revised only on `spec/{nr}-{name}`, and the work resumes only after a human has merged the revision into `main` and `main` into the dev branch.
- The implementation revision of a ticket is the last commit on its dev branch outside `progress.md`, `review.md`, `approval.md`, `evidence/` and `.claude/skills/`:

  ```sh
  git log -1 --format=%h dev/{nr}-{name} -- . ':!specs/*/progress.md' ':!specs/*/review.md' ':!specs/*/approval.md' ':!specs/*/evidence' ':!.claude/skills'
  ```

  A green check, a verdict in `review.md` and a decision in `approval.md` each name the revision they cover and count only while it is still the implementation revision; any later change voids them.
