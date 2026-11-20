import { fileURLToPath } from "node:url";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { HttpRouter } from "effect/http";
import { Database } from "./Database";
import { routes } from "./http";
import { PoolRepo } from "./PoolRepo";

const port = Number(Bun.env.API_PORT ?? 3000);
const dbPath =
	Bun.env.DB_PATH ??
	fileURLToPath(new URL("../data/lottery.sqlite", import.meta.url));

const server = HttpRouter.serve(routes).pipe(
	Layer.provide(PoolRepo.layer),
	Layer.provide(Database.layer(dbPath)),
	Layer.provide(BunHttpServer.layer({ port })),
);

BunRuntime.runMain(Layer.launch(server));
