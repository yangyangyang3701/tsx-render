import { createRoot } from "../../../packages/corn";
import App from "./App";
import { hyperX } from "./lib/hyper";

window.onload = () => {
    const root = document.getElementById("App");
    createRoot(() => {
        root?.append(hyperX(App));
    });
};
