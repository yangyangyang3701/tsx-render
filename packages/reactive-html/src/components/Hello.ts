import { createSignal } from "@idealjs/corn";
import { hyper, hyperX } from "../lib/hyper";

const Hello = () => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");

    const changeName = () => {
        const randomNum = Math.random();
        setName(randomNum.toFixed(2).toString());
    };

    const changeColor = () => {
        const randomNum = Math.random();
        if (randomNum > 0.5) {
            setColor("blue");
        } else {
            setColor("red");
        }
    };

    const el = hyper(
        "div",
        {
            style: { color: color() },
            children: [
                "hello ",
                name,
                hyper("button", {
                    children: ["change name"],
                    onClick: changeName,
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
        },
        ["name"]
    );

    return el;
};

export default Hello;
