import { expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { Database } from "./Database";
import { PoolRepo } from "./PoolRepo";

test("the pool summary comes from SQLite: name and member count", async () => {
	const summary = await PoolRepo.pipe(
		Effect.flatMap((pools) => pools.summary),
		Effect.provide(
			PoolRepo.layer.pipe(Layer.provide(Database.layer(":memory:"))),
		),
		Effect.runPromise,
	);
	expect(summary).toEqual({ name: "Fourth Floor Pool", memberCount: 5 });
});
