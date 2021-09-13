import { createEffect, CornText } from "@idealjs/corn";

type Upsert = <E extends HTMLElement>(el: E) => void;

type Child = (() => Node | Node[]) | CornText;

export const hyper = (
    type: string,
    config: {
        children?: Child[];
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
        // config.children?.forEach((child) => {
        //     child(el);
        // });
        const children = config.children?.map((child) => {
            if (child instanceof Function) {
                return child();
            }
            return child.toString();
        });

        el.textContent = "";
        children && el.append(...children.flat());
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
