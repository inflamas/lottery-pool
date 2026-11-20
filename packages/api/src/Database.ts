import { Database as Sqlite } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Context, Effect, Layer } from "effect";
import { seed } from "./seed";

const open = (path: string): Sqlite => {
	if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
	const db = new Sqlite(path, { create: true, strict: true });
	seed(db);
	return db;
};

/** The one SQLite connection. Only packages/api may depend on it. */
export class Database extends Context.Service<Database, Sqlite>()(
	"api/Database",
) {
	/** Opens (and seeds, if empty) the database at `path`; closes it on release. */
	static readonly layer = (path: string) =>
		Layer.effect(
			Database,
			Effect.acquireRelease(
				Effect.sync(() => open(path)),
				(db) => Effect.sync(() => db.close()),
			),
		);
}
