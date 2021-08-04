import { createSignal } from "@idealjs/corn";
import { hyper, hyperX } from "../lib/hyper";

const Hello = (props: {}) => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");

    const changeName = () => {
        console.log("test test change name");
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
        () => ({
            style: { color: color() },
            children: ["hello ", name()],
        }),
        hyper("button", () => ({
            children: ["change name"],
            onClick: changeName,
            style: {
                marginLeft: "10px",
            },
        })),
        hyperX(() =>
            hyper("button", () => ({
                children: ["change color"],
                onClick: changeColor,
                style: {
                    marginLeft: "10px",
                },
            }))
        )
    );

    return el;
};

export default Hello;
