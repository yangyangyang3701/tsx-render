import { createEffect, createSignal } from "@idealjs/corn";
import CornElement from "./lib/cornElement";
import hyper from "./lib/hyper";

const App = (): CornElement => {
    const [name, setName] = createSignal<string>("world");
    setTimeout(() => {
        console.log("timer");
        setName("arnold");
    }, 1000);
    createEffect(() => {
        console.log("test test", name());
    });
    return hyper("div", { children: ["hello", name] });
};

export default App;
