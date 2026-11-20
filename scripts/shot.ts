/**
 * bun scripts/shot.ts {nr}
 *
 * Starts the app on free ports, screenshots the pool screen in headless Google
 * Chrome at 390 px and 1440 px wide into specs/{nr}-{name}/evidence/, and stops
 * the app. Exits non-zero if Chrome is missing or the pool name is not shown.
 */
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	rmSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
export const widths = [390, 1440] as const;
const height = 900;
const virtualTimeBudgetMs = 5000;

/** The only accepted arguments: exactly one ticket number. */
export const parseTicketNr = (args: ReadonlyArray<string>): string => {
	const [nr, ...rest] = args;
	if (nr === undefined || rest.length > 0 || !/^\d+$/.test(nr)) {
		throw new Error("usage: bun scripts/shot.ts {nr}");
	}
	return nr;
};

/** Finds the one ticket folder specs/{nr}-{name} among the entries of specs/. */
export const findSpecDir = (
	nr: string,
	entries: ReadonlyArray<string>,
): string => {
	const matches = entries.filter((e) => e.startsWith(`${nr}-`));
	const [match, ...others] = matches;
	if (match === undefined) throw new Error(`no specs/${nr}-{name}/ folder`);
	if (others.length > 0) {
		throw new Error(`several folders for ticket ${nr}: ${matches.join(", ")}`);
	}
	return match;
};

export const findChrome = (): string | undefined =>
	[
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		Bun.which("google-chrome"),
		Bun.which("google-chrome-stable"),
	].find((path): path is string => path != null && existsSync(path));

const freePort = (): Promise<number> =>
	new Promise((done, fail) => {
		const server = createServer();
		server.once("error", fail);
		server.listen(0, () => {
			const address = server.address();
			const port = typeof address === "object" && address ? address.port : 0;
			server.close(() => done(port));
		});
	});

const waitFor = async (url: string, timeoutMs = 30_000): Promise<Response> => {
	const deadline = Date.now() + timeoutMs;
	for (;;) {
		try {
			const res = await fetch(url);
			if (res.ok) return res;
		} catch {
			// not listening yet
		}
		if (Date.now() > deadline) throw new Error(`timed out waiting for ${url}`);
		await Bun.sleep(100);
	}
};

/** Width of a PNG file, read from its IHDR chunk. */
const pngWidth = async (path: string): Promise<number> =>
	new DataView(await Bun.file(path).slice(16, 20).arrayBuffer()).getUint32(0);

const main = async (): Promise<void> => {
	const nr = parseTicketNr(Bun.argv.slice(2));
	const specDir = findSpecDir(nr, readdirSync(join(root, "specs")));
	const chrome = findChrome();
	if (!chrome) throw new Error("Google Chrome is not installed");

	const evidence = join(root, "specs", specDir, "evidence");
	mkdirSync(evidence, { recursive: true });

	const [apiPort, appPort] = [await freePort(), await freePort()];
	const env = {
		...process.env,
		API_PORT: String(apiPort),
		DB_PATH: ":memory:",
	};
	const spawnOptions = { env, stdout: "ignore", stderr: "inherit" } as const;
	const api = Bun.spawn(["bun", "src/main.ts"], {
		...spawnOptions,
		cwd: join(root, "packages/api"),
	});
	const app = Bun.spawn(
		["bun", "x", "vite", "--port", String(appPort), "--strictPort"],
		{ ...spawnOptions, cwd: join(root, "packages/app") },
	);
	const profile = mkdtempSync(join(tmpdir(), "shot-chrome-"));

	try {
		const url = `http://localhost:${appPort}/`;
		const pool = (await (
			await waitFor(`http://localhost:${apiPort}/api/pool`)
		).json()) as { name: string };
		await waitFor(url);

		const runChrome = async (width: number, ...flags: string[]) => {
			const proc = Bun.spawn(
				[
					chrome,
					"--headless=new",
					`--user-data-dir=${profile}`,
					"--no-first-run",
					"--hide-scrollbars",
					"--force-device-scale-factor=1",
					`--window-size=${width},${height}`,
					`--virtual-time-budget=${virtualTimeBudgetMs}`,
					...flags,
					url,
				],
				{ stdout: "pipe", stderr: "ignore" },
			);
			const out = await new Response(proc.stdout).text();
			if ((await proc.exited) !== 0) throw new Error("Chrome failed");
			return out;
		};

		for (const width of widths) {
			const dom = await runChrome(width, "--dump-dom");
			if (!dom.includes(pool.name)) {
				throw new Error(
					`the page does not show the pool name "${pool.name}" at ${width} px`,
				);
			}
			const file = join(evidence, `screen-${width}.png`);
			rmSync(file, { force: true });
			await runChrome(width, `--screenshot=${file}`);
			if (!existsSync(file)) throw new Error(`Chrome did not write ${file}`);
			const actual = await pngWidth(file);
			if (actual !== width) {
				throw new Error(`${file} is ${actual} px wide, expected ${width}`);
			}
			console.log(`wrote ${file}`);
		}
	} finally {
		api.kill();
		app.kill();
		await Promise.all([api.exited, app.exited]);
		rmSync(profile, { recursive: true, force: true });
	}
};

if (import.meta.main) {
	main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	});
}
