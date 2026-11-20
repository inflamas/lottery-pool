/** Checks for the rules in specs/guidelines/architecture.md and ui.md. */
import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { Glob } from "bun";
import { schema } from "../packages/api/src/schema";

const root = resolve(import.meta.dir, "..");

const files = (pattern: string): string[] =>
	[...new Glob(pattern).scanSync({ cwd: root })]
		.filter((f) => !f.includes("node_modules/"))
		.sort();

const read = (file: string): Promise<string> =>
	Bun.file(resolve(root, file)).text();

test("architecture: dependencies live only in the root package.json", async () => {
	const manifests = files("packages/*/package.json");
	expect(manifests.length).toBeGreaterThan(0);
	for (const manifest of manifests) {
		const keys = Object.keys(JSON.parse(await read(manifest)));
		expect(keys.filter((k) => /dependencies$/i.test(k))).toEqual([]);
	}
});

test("architecture: only packages/api touches SQLite", async () => {
	const sources = [
		...files("packages/**/*.{ts,tsx}"),
		...files("scripts/**/*.ts"),
	].filter(
		(f) => !f.startsWith("packages/api/") && f !== "scripts/guidelines.test.ts",
	);
	expect(sources.length).toBeGreaterThan(0);
	for (const source of sources) {
		expect(`${source}: ${(await read(source)).includes("bun:sqlite")}`).toBe(
			`${source}: false`,
		);
	}
});

test("architecture: money columns are INTEGER and end in _cents", () => {
	const columns = schema
		.split("\n")
		.map((line) => line.trim().split(/\s+/))
		.filter(([name]) => name !== undefined && /^[a-z_]+$/.test(name));
	const money = columns.filter(([name]) => name?.endsWith("_cents"));
	expect(money.length).toBeGreaterThan(0);
	for (const [, type] of money) expect(type).toBe("INTEGER");
	for (const [name, type] of columns) {
		if (/amount|price|win|cost|payout|stake/.test(name ?? "")) {
			expect(`${name} ${type}`).toMatch(/_cents INTEGER$/);
		}
		expect(type).not.toBe("REAL");
	}
});

test("ui: raw hex colors and raw pixel values appear only in tokens.css", async () => {
	const sources = files("packages/app/src/**/*.{css,ts,tsx}").filter(
		(f) => !f.endsWith("/tokens.css") && !f.endsWith(".test.ts"),
	);
	expect(sources.length).toBeGreaterThan(0);
	for (const source of sources) {
		const lines = (await read(source))
			.split("\n")
			.filter((line) => !line.trim().startsWith("@media"));
		const raw = lines.filter(
			(line) => /#[0-9a-f]{3,8}\b/i.test(line) || /\d(px|rem|em)\b/.test(line),
		);
		expect(`${source}: ${raw.join(" | ")}`).toBe(`${source}: `);
	}
});

test("ui: tokens.css is the single token file and defines exactly one green", async () => {
	expect(files("packages/app/src/**/tokens.css")).toEqual([
		"packages/app/src/tokens.css",
	]);
	const tokens = await read("packages/app/src/tokens.css");
	for (const prefix of ["color", "space", "radius", "text", "font"]) {
		expect(tokens).toContain(`--${prefix}`);
	}
	const greens = [...tokens.matchAll(/--([a-z0-9-]+):\s*#([0-9a-f]{6})\b/gi)]
		.filter(([, , hex = ""]) => {
			const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) =>
				Number.parseInt(hex.slice(i, i + 2), 16),
			);
			return g > r * 1.3 && g > b * 1.3;
		})
		.map(([, name]) => name);
	expect(greens).toEqual(["color-open"]);
});
