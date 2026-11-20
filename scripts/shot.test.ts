import { expect, test } from "bun:test";
import { findSpecDir, parseTicketNr, widths } from "./shot";

test("shot takes one ticket number and nothing else", () => {
	expect(parseTicketNr(["12"])).toBe("12");
	expect(() => parseTicketNr([])).toThrow();
	expect(() => parseTicketNr(["12", "extra"])).toThrow();
	expect(() => parseTicketNr(["twelve"])).toThrow();
});

test("shot resolves the ticket folder from its number", () => {
	const entries = ["guidelines", "roadmap.md", "1-pool-name", "12-entry"];
	expect(findSpecDir("1", entries)).toBe("1-pool-name");
	expect(findSpecDir("12", entries)).toBe("12-entry");
	expect(() => findSpecDir("2", entries)).toThrow();
	expect(() => findSpecDir("1", [...entries, "1-other"])).toThrow();
});

test("shot covers both guideline widths", () => {
	expect([...widths]).toEqual([390, 1440]);
});
