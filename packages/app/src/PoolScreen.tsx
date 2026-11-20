import { useEffect, useState } from "react";

type PoolSummary = { readonly name: string; readonly memberCount: number };

type State =
	| { readonly kind: "loading" }
	| { readonly kind: "failed" }
	| { readonly kind: "loaded"; readonly pool: PoolSummary };

export const membersLabel = (count: number): string =>
	count === 1 ? "1 member" : `${count} members`;

export function PoolScreen() {
	const [state, setState] = useState<State>({ kind: "loading" });

	useEffect(() => {
		const controller = new AbortController();
		fetch("/api/pool", { signal: controller.signal })
			.then((res) => {
				if (!res.ok) throw new Error(`GET /api/pool -> ${res.status}`);
				return res.json() as Promise<PoolSummary>;
			})
			.then((pool) => setState({ kind: "loaded", pool }))
			.catch(() => {
				if (!controller.signal.aborted) setState({ kind: "failed" });
			});
		return () => controller.abort();
	}, []);

	return (
		<main className="screen">
			{state.kind === "loading" && <p>Loading…</p>}
			{state.kind === "failed" && (
				<p className="error">Could not load the pool.</p>
			)}
			{state.kind === "loaded" && (
				<>
					<h1 className="pool-name">{state.pool.name}</h1>
					<p className="pool-members">{membersLabel(state.pool.memberCount)}</p>
				</>
			)}
		</main>
	);
}
