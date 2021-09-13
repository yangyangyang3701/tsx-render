import {
    createDiffSignal,
    createEffect,
    createRoot,
    createSignal,
} from "@idealjs/corn";
import { FLAG, WithFlag } from "../../corn-reactive/src/type";
import { hyper } from "./lib/hyper";

const App = () => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");
    const [todos, setTodos] = createDiffSignal<WithFlag<Symbol>[]>([]);

    const change = () => {
        console.debug("[debug] change name");
        const randomNum = Math.random();
        const name = randomNum.toFixed(2).toString();
        setName(name);
        setTodos((todos) => {
            if (todos.length > 10) {
                return [];
            } else {
                return [...todos, { data: Symbol(name), $flag: FLAG.NEW }];
            }
        });
        if (randomNum > 0.7) {
            setColor("blue");
        } else {
            setColor("red");
        }
    };

    // setTimeout(() => {
    //     const button = document.getElementsByTagName("button").item(0);
    //     console.log(button);
    //     const handler = setInterval(() => {
    //         for (let index = 0; index < 10; index++) {
    //             button?.click();
    //         }
    //     }, 50);
    //     setTimeout(() => {
    //         clearInterval(handler);
    //     }, 100000);
    // }, 1000);

    return hyper("div", {
        children: [
            () => {
                let node: Node;
                let inited = false;
                createEffect(() => {
                    if (!inited) {
                        node = document.createTextNode(name());
                    }
                    node.nodeValue = name();
                });
                inited = true;
                return node!;
            },
            () => {
                return hyper("button", {
                    children: ["change"],
                    onclick: (el: Element) => {
                        Reflect.set(el, "onclick", change);
                    },
                });
            },
            () => {
                const entries = new Map<any, Element>();
                createEffect(() => {
                    const data = todos();
                    console.log(data);
                    data.forEach((withFT) => {
                        if (withFT.$flag === FLAG.NEW) {
                            createRoot(() => {
                                const child = hyper("div", {
                                    children: [withFT.data.toString()],
                                });
                                // el.append(child);
                                entries.set(withFT.data, child);
                            });
                        }
                        if (withFT.$flag === FLAG.REMOVED) {
                            entries.get(withFT.data)?.remove();
                            entries.delete(withFT.data);
                        }
                    });
                });
                return [...entries.values()];
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
