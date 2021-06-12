import { render } from "@idealjs/tsx-render";
import App from "./App";
window.onload = () => {
    render(<App />, document.getElementById("App"));
};
