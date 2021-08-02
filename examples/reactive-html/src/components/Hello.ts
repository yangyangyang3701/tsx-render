import { createSignal } from "@idealjs/corn";
import { hyper } from "../lib/hyper";

const Hello = (props: {}) => {
    const [name, setName] = createSignal<string>("world");
    setTimeout(() => {
        setName("other world");
    }, 5000);

    const el = hyper("div", () => ({
        children: ["hello ", name()],
    }));

    return el;
};

export default Hello;
