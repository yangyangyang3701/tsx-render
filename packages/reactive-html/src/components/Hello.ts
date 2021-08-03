import { createSignal } from "@idealjs/corn";
import { hyper } from "../lib/hyper";

const Hello = (props: {}) => {
    const [name, setName] = createSignal<string>("world");
    setTimeout(() => {
        setName("other world");
    }, 5000);

    const onClick = () => {
        setName(Math.random().toFixed(2).toString());
    };

    const el = hyper("div", () => ({
        onClick,
        children: ["hello ", name()],
    }));

    return el;
};

export default Hello;
