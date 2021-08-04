import { createEffect } from "@idealjs/corn";

interface IProps {
    children?: (string | (() => Element))[];
    onClick?: any;
    style?: any;
}

type TypeFunc<P> = (props: P) => Element;

export const hyperX = <T extends P, P = undefined>(
    type: TypeFunc<P>,
    getProps?: () => T
) => {
    const props = (getProps && getProps()) || ({} as P);
    const element = type(props);

    return element;
};

export const hyper = <P extends IProps>(type: string, getProps?: () => P) => {
    let element: Element | null = null;

    let inited = false;
    let props: P | undefined = undefined;
    let children: (Text | Element)[] = [];

    const create = () => {
        console.debug("[debug] hyper create");

        props = getProps && getProps();
        element = document.createElement(type);

        for (const key in props) {
            console.log("test test", key, key.toLowerCase() in element);
            // assign props to element if key in element. onClick -> onclick
            if (key === "style" && element instanceof HTMLElement) {
                for (const styleKey in props[key]) {
                    Reflect.set(element.style, styleKey, props[key][styleKey]);
                }
                continue;
            }
            if (key.toLowerCase() in element) {
                Reflect.set(element, key.toLowerCase(), props[key]);
                continue;
            }
        }

        children =
            props?.children?.map((child) => {
                if (child instanceof Function) {
                    return child();
                } else {
                    return document.createTextNode(child);
                }
            }) || [];

        children.forEach((child) => {
            element?.append(child);
        });

        inited = true;
    };

    const update = () => {
        props = getProps && getProps();
        console.debug("[debug] hyper update", props);

        props?.children?.forEach((value, index) => {
            if (
                !(children[index] instanceof Element) &&
                typeof value == "string"
            ) {
                children[index].nodeValue = value;
            }
        });
    };

    createEffect(() => {
        console.debug("[debug] hyper effect");

        if (!inited) {
            create();
        } else {
            update();
        }
    });

    return element!;
};
