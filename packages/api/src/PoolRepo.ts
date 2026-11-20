import { Context, Data, Effect, Layer, Schema } from "effect";
import { Database } from "./Database";

export const PoolSummary = Schema.Struct({
	name: Schema.String,
	memberCount: Schema.Number,
});
export type PoolSummary = typeof PoolSummary.Type;

export class PoolNotFound extends Data.TaggedError("PoolNotFound") {}

export class PoolRepo extends Context.Service<
	PoolRepo,
	{ readonly summary: Effect.Effect<PoolSummary, PoolNotFound> }
>()("api/PoolRepo") {
	static readonly layer = Layer.effect(
		PoolRepo,
		Effect.gen(function* () {
			const db = yield* Database;
			const query = db.query<PoolSummary, []>(
				`SELECT p.name AS name,
				        (SELECT COUNT(*) FROM members m WHERE m.pool_id = p.id) AS memberCount
				   FROM pools p
				  ORDER BY p.id
				  LIMIT 1`,
			);
			return {
				summary: Effect.suspend(() => {
					const row = query.get();
					return row ? Effect.succeed(row) : Effect.fail(new PoolNotFound());
				}),
			};
		}),
	);
}
