import { render } from "02-post";
import App from "./App";

window.onload = () => {
    render(<App />, document.getElementById("App"));
};
