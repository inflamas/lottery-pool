import type { Database as Sqlite } from "bun:sqlite";
import { schema } from "./schema";

/**
 * The seed is plain literal data: no clock, no randomness, explicit ids.
 * Seeding any empty database always produces the same rows.
 */
export const seedData = {
	pool: { id: 1, name: "Fourth Floor Pool" },
	members: [
		{ id: 1, name: "Ana Ruiz", shares: 3, isOrganizer: true },
		{ id: 2, name: "Ben Okafor", shares: 2, isOrganizer: false },
		{ id: 3, name: "Chloe Martin", shares: 2, isOrganizer: false },
		{ id: 4, name: "Dev Patel", shares: 4, isOrganizer: false },
		{ id: 5, name: "Eva Lindqvist", shares: 1, isOrganizer: false },
	],
	tickets: [
		{ id: 1, numbers: [3, 8, 14, 19, 23, 31, 36] },
		{ id: 2, numbers: [1, 5, 12, 17, 22, 29, 38] },
		{ id: 3, numbers: [2, 9, 11, 20, 27, 33, 35] },
		{ id: 4, numbers: [4, 7, 15, 18, 24, 30, 37] },
		{ id: 5, numbers: [6, 10, 13, 21, 26, 32, 34] },
		{ id: 6, numbers: [5, 9, 16, 19, 25, 28, 36] },
	],
	draws: [
		{
			id: 1,
			drawnOn: "2026-10-30",
			numbers: [2, 8, 14, 21, 27, 31, 38],
			winCents: 0,
		},
		{
			id: 2,
			drawnOn: "2026-11-06",
			numbers: [5, 12, 17, 22, 26, 33, 36],
			winCents: 1250,
		},
		{
			id: 3,
			drawnOn: "2026-11-13",
			numbers: [4, 7, 15, 18, 24, 29, 35],
			winCents: 48000,
		},
	],
} as const;

/** Creates the tables and, if the database has no pool yet, inserts the seed. */
export const seed = (db: Sqlite): void => {
	db.exec(schema);
	const existing = db.query("SELECT COUNT(*) AS n FROM pools").get() as {
		n: number;
	};
	if (existing.n > 0) return;

	db.transaction(() => {
		const { pool, members, tickets, draws } = seedData;
		db.run("INSERT INTO pools (id, name) VALUES (?, ?)", [pool.id, pool.name]);
		for (const m of members) {
			db.run(
				"INSERT INTO members (id, pool_id, name, shares, is_organizer) VALUES (?, ?, ?, ?, ?)",
				[m.id, pool.id, m.name, m.shares, m.isOrganizer ? 1 : 0],
			);
		}
		for (const t of tickets) {
			db.run("INSERT INTO tickets (id, pool_id) VALUES (?, ?)", [
				t.id,
				pool.id,
			]);
			for (const n of t.numbers) {
				db.run("INSERT INTO ticket_numbers (ticket_id, number) VALUES (?, ?)", [
					t.id,
					n,
				]);
			}
		}
		for (const d of draws) {
			db.run(
				"INSERT INTO draws (id, pool_id, drawn_on, win_cents) VALUES (?, ?, ?, ?)",
				[d.id, pool.id, d.drawnOn, d.winCents],
			);
			for (const n of d.numbers) {
				db.run("INSERT INTO draw_numbers (draw_id, number) VALUES (?, ?)", [
					d.id,
					n,
				]);
			}
		}
	})();
};
