import { Effect } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/http";
import { PoolRepo, PoolSummary } from "./PoolRepo";

const poolSummaryJson = HttpServerResponse.schemaJson(PoolSummary);

/** GET /api/pool -> { name, memberCount } */
export const routes = HttpRouter.add(
	"GET",
	"/api/pool",
	Effect.gen(function* () {
		const pools = yield* PoolRepo;
		const summary = yield* pools.summary;
		return yield* poolSummaryJson(summary);
	}).pipe(
		Effect.catchTag("PoolNotFound", () =>
			HttpServerResponse.json({ error: "PoolNotFound" }, { status: 404 }),
		),
	),
);
