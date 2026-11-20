import { expect, test } from "bun:test";
import { membersLabel } from "./PoolScreen";

test("the member count reads as a sentence fragment", () => {
	expect(membersLabel(5)).toBe("5 members");
	expect(membersLabel(1)).toBe("1 member");
});
