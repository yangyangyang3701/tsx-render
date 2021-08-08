import { createSignal } from "@idealjs/corn";
import { hyper, hyperX } from "../lib/hyper";
import { proxify, ExtractConfig } from "../lib/proxify";

const Hello = () => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");

    const changeName = () => {
        console.debug("[debug] change name");
        const randomNum = Math.random();
        setName(randomNum.toFixed(2).toString());
    };

    const changeColor = () => {
        console.debug("[debug] change color");
        const randomNum = Math.random();
        if (randomNum > 0.5) {
            setColor("blue");
        } else {
            setColor("red");
        }
    };

    const el = hyper("div", {
        style: proxify({ color: color }, ["color"]),
        children: proxify(
            [
                "hello ",
                name,
                hyper("button", {
                    children: ["change name"],
                    onClick: changeName,
                    style: {
                        marginLeft: "10px",
                    },
                }),
                hyper("button", {
                    children: ["change color"],
                    onClick: changeColor,
                    style: {
                        marginLeft: "10px",
                    },
                }),
                hyperX((props: {}) =>
                    hyper("button", {
                        children: ["change color"],
                        onClick: changeColor,
                        style: {
                            marginLeft: "10px",
                        },
                    })
                ),
            ],
            ["1"]
        ),
    });

    return el;
};

export default Hello;
