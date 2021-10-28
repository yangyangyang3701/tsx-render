import { createEffect, createMemo, createSignal } from "@idealjs/corn";
import CornElement from "./lib/cornElement";
import hyper from "./lib/hyper";

const App = (): CornElement => {
    const [name, setName] = createSignal<string>("world");
    const [todos, setTodos] = createSignal<string[]>(["world"]);
    const nameDiv = createMemo(() => {
        return hyper("div", { children: [name()] });
    });

    const todosDiv = createMemo(() => {
        return todos().map((todo) => hyper("div", { children: [todo] }));
    });

    setTimeout(() => {
        console.log("timer");
        setName("arnold");
        setTodos((todos) => [...todos, "arnold"]);
    }, 1000);

    createEffect(() => {
        console.log("test test", name());
    });

    return hyper("div", { children: ["hello", name, nameDiv, todosDiv] });
};

export default App;
