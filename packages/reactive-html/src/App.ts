import { createEffect, createSignal } from "../../corn";
import { hyper } from "./lib/hyper";

const App = () => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");
    const [todos, setTodos] = createSignal<string[]>([]);

    const change = () => {
        console.debug("[debug] change name");
        const randomNum = Math.random();
        const name = randomNum.toFixed(2).toString();
        setName(name);
        if (randomNum > 0.5) {
            setColor("blue");
        } else {
            setColor("red");
        }
    };

    return hyper("div", {
        children: [
            (el: Element) => {
                let node: Node;
                let inited = false;
                createEffect(() => {
                    if (!inited) {
                        node = document.createTextNode(name());
                    }
                    node.nodeValue = name();
                });
                inited = true;
                el.append(node!);
            },
            (el: Element) => {
                el.append(
                    hyper("button", {
                        children: [
                            (el: Element) => {
                                el.textContent = "change";
                            },
                        ],
                        onclick: (el: Element) => {
                            Reflect.set(el, "onclick", change);
                        },
                    })
                );
            },
            (el: Element) => {
                let arrayA = [];
                createEffect(() => {
                    let arrayB = todos();
                    
                });
            },
        ],
        style: (el: HTMLElement) => {
            createEffect(() => {
                Reflect.set(el.style, "color", color());
            });
        },
    });
};

export default App;
