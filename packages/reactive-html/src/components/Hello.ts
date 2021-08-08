import { createSignal } from "@idealjs/corn";
import { hyper, hyperX } from "../lib/hyper";
import { proxify, ExtractConfig } from "../lib/proxify";

const Hello = () => {
    const [name, setName] = createSignal<string>("world");
    const [color, setColor] = createSignal<string>("red");

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

    const el = hyper("div", {
        style: proxify({ color: color }, ["color"]),
        children: proxify(
            [
                "hello ",
                name,
                hyper("button", {
                    children: proxify(["change", name], ["1"]),
                    onClick: change,
                    style: {
                        marginLeft: "10px",
                    },
                }),
                hyperX(
                    (props: { name: string }) => {
                        const { name } = props;
                        return hyper("button", {
                            children: proxify(["change", name], ["1"]),
                            onClick: change,
                            style: {
                                marginLeft: "10px",
                            },
                        });
                    },
                    proxify(
                        {
                            name: name,
                        },
                        ["name"]
                    )
                ),
            ],
            ["1"]
        ),
    });

    return el;
};

export default Hello;
