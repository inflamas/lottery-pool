import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The app never talks to SQLite: every /api request is proxied to packages/api.
const apiPort = process.env.API_PORT ?? "3000";

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: { "/api": `http://localhost:${apiPort}` },
	},
});
