import { createSignal } from "@idealjs/corn";
import { hyper } from "../lib/hyper";

const Hello = (props: {}) => {
    const [name, setName] = createSignal<string>("world");

    const onClick = () => {
        setName(Math.random().toFixed(2).toString());
    };

    const el = hyper("div", () => ({
        children: [
            "hello ",
            name(),
            () => hyper("button", () => ({ onClick, children: ["button"] })),
        ],
    }));

    return el;
};

export default Hello;
