import { createEffect, createRoot, createSignal } from "../../corn";
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
            setTodos((todos) => [...todos, name]);
            setColor("blue");
        } else {
            setTodos((todos) => todos.slice(1));
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
                let arrayA: { el: Node; item: string }[] = [];
                createEffect(() => {
                    let arrayB = todos();
                    let tmp: Array<(el: Element) => void> = [];
                    //compare arrayA and arrayB;
                    for (let i = 0; i < arrayA.length; i++) {
                        for (let j = 0; j < arrayB.length; j++) {
                            if (arrayA[i].item === arrayB[j]) {
                                tmp.push(
                                    ...arrayB.splice(0, j).map((it) => {
                                        return (el: Element) => {
                                            const child = hyper("div", {
                                                children: [
                                                    (el: Element) => {
                                                        el.textContent = it;
                                                    },
                                                ],
                                            });
                                            el.append(child);
                                        };
                                    })
                                );
                                arrayA.shift();
                                arrayB.shift();
                            }
                        }

                        tmp.push((el: Element) => {
                            const elA = arrayA.shift()?.el;
                            elA && el.removeChild(elA);
                        });
                    }
                    tmp.push(
                        ...arrayB.map((it) => {
                            return (el: Element) => {
                                const child = hyper("div", {
                                    children: [
                                        (el: Element) => {
                                            el.textContent = it;
                                        },
                                    ],
                                });
                                el.append(child);
                                arrayA.push({ el: child, item: it });
                            };
                        })
                    );
                    createRoot(() => {
                        tmp.forEach((t) => {
                            t(el);
                        });
                    });
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
