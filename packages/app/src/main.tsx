import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tokens.css";
import "./app.css";
import { PoolScreen } from "./PoolScreen";

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing from index.html");

createRoot(root).render(
	<StrictMode>
		<PoolScreen />
	</StrictMode>,
);
