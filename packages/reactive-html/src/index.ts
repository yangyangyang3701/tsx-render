import { jsx, render } from "@idealjs/corn";
import App from "./App";

window.onload = () => {
    const root = document.getElementById("App");
    render(jsx(App, {}, "a"), root!);
};
