import { createEffect } from "@idealjs/corn";

type Upsert = <E extends HTMLElement>(el: E) => void;

export const hyper = (
    type: string,
    config: {
        children?: Upsert[];
        onclick?: Upsert;
        style?: Upsert;
    }
): Element => {
    let el: HTMLElement;
    let inited = false;

    createEffect(() => {
        if (!inited) {
            el = document.createElement(type);
        }
        config.children?.forEach((child) => {
            child(el);
        });
    });

    createEffect(() => {
        config.onclick && config.onclick(el);
    });

    createEffect(() => {
        config.style && config.style(el);
    });

    inited = true;
    return el!;
};
