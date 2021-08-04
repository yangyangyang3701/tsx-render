import { createSignal } from "@idealjs/corn";
import { hyper } from "../lib/hyper";

const Hello = (props: {}) => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");
    const onClick = () => {
        const randomNum = Math.random();
        setName(randomNum.toFixed(2).toString());
        if (randomNum > 0.5) {
            setColor("blue");
        } else {
            setColor("red");
        }
    };

    const el = hyper("div", () => ({
        style: { color: color() },
        children: [
            "hello ",
            name(),
            () =>
                hyper("button", () => ({
                    children: ["change name"],
                    onClick,
                    style: {
                        marginLeft: "10px",
                    },
                })),
        ],
    }));

    return el;
};

export default Hello;
