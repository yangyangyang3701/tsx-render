import { createRoot } from "@idealjs/corn";
import App from "./App";

window.onload = () => {
    const root = document.getElementById("App");
    createRoot(() => {
        root?.append(App());
    });
};
