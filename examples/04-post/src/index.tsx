import { render } from "04-post";
import App from "./App";

window.onload = () => {
    render(<App />, document.getElementById("App"));
    console.log("test test");
};
