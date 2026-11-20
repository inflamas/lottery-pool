import { Database as Sqlite } from "bun:sqlite";
import { expect, test } from "bun:test";
import { seed } from "./seed";

const tables = [
	"pools",
	"members",
	"tickets",
	"ticket_numbers",
	"draws",
	"draw_numbers",
] as const;

const dump = (db: Sqlite) =>
	Object.fromEntries(
		tables.map((t) => [t, db.query(`SELECT * FROM ${t} ORDER BY 1, 2`).all()]),
	);

const seeded = () => {
	const db = new Sqlite(":memory:");
	seed(db);
	return db;
};

test("the seed is deterministic: two fresh databases hold identical rows", () => {
	expect(dump(seeded())).toEqual(dump(seeded()));
});

test("seeding an already seeded database changes nothing", () => {
	const db = seeded();
	const before = dump(db);
	seed(db);
	expect(dump(db)).toEqual(before);
});

test("one pool named Fourth Floor Pool", () => {
	expect(seeded().query("SELECT name FROM pools").all()).toEqual([
		{ name: "Fourth Floor Pool" },
	]);
});

test("five members, 12 whole shares in total, one organizer", () => {
	const members = seeded()
		.query("SELECT shares, is_organizer FROM members")
		.all() as Array<{ shares: number; is_organizer: number }>;
	expect(members).toHaveLength(5);
	expect(members.every((m) => Number.isInteger(m.shares))).toBe(true);
	expect(members.reduce((sum, m) => sum + m.shares, 0)).toBe(12);
	expect(members.filter((m) => m.is_organizer === 1)).toHaveLength(1);
});

const numbersBy = (db: Sqlite, table: string, key: string) => {
	const rows = db
		.query(`SELECT ${key} AS id, number FROM ${table}`)
		.all() as Array<{ id: number; number: number }>;
	const groups = new Map<number, number[]>();
	for (const r of rows)
		groups.set(r.id, [...(groups.get(r.id) ?? []), r.number]);
	return [...groups.values()];
};

const expectSevenDistinct = (groups: number[][]) => {
	for (const numbers of groups) {
		expect(new Set(numbers).size).toBe(7);
		expect(numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 38)).toBe(
			true,
		);
	}
};

test("six tickets, each with 7 different numbers from 1 to 38", () => {
	const groups = numbersBy(seeded(), "ticket_numbers", "ticket_id");
	expect(groups).toHaveLength(6);
	expectSevenDistinct(groups);
});

test("three past draws with 7 numbers and a win in whole cents", () => {
	const db = seeded();
	const groups = numbersBy(db, "draw_numbers", "draw_id");
	expect(groups).toHaveLength(3);
	expectSevenDistinct(groups);
	const wins = db.query("SELECT win_cents FROM draws").all() as Array<{
		win_cents: number;
	}>;
	expect(wins).toHaveLength(3);
	expect(wins.every((w) => Number.isInteger(w.win_cents))).toBe(true);
});
