import { createEffect, createRoot } from "@idealjs/corn";

interface IProps {
    children?: string[];
    onClick?: any;
    style?: any;
}

type TypeFunc<P> = (props: P) => Element;

export const hyperX = <T extends P, P = undefined>(
    type: TypeFunc<P>,
    getProps?: () => T
) => {
    console.debug("[debug] hyperX start");
    const props = (getProps && getProps()) || ({} as P);
    const element = type(props);
    console.debug("[debug] hyperX end");
    return element;
};

export const hyper = <P extends IProps>(
    type: string,
    getProps?: () => P,
    ...Elements: Element[]
) => {
    console.debug("[debug] hyper start");
    let element: Element | null = null;

    let inited = false;
    let props: P | undefined = undefined;
    let children: Text[] = [];

    const create = () => {
        console.debug("[debug] hyper create");

        props = getProps && getProps();
        element = document.createElement(type);

        for (const key in props) {
            // assign props to element if key in element. onClick -> onclick
            if (key === "style" && element instanceof HTMLElement) {
                for (const styleKey in props[key]) {
                    Reflect.set(element.style, styleKey, props[key][styleKey]);
                }
                continue;
            }
            if (key.toLowerCase() in element) {
                console.log("test test set listener", type);
                Reflect.set(element, key.toLowerCase(), props[key]);
                continue;
            }
        }

        children =
            props?.children?.map((child) => {
                return document.createTextNode(child);
            }) || [];

        children.forEach((child) => {
            element?.append(child);
        });

        Elements.forEach((e) => {
            element?.append(e);
        });

        inited = true;
    };

    const update = () => {
        console.debug("[debug] hyper update");

        props = getProps && getProps();

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
        console.debug("[debug] hyper effect", type, inited);
        if (!inited) {
            create();
            inited = true;
        } else {
            update();
        }
    });

    return element!;
};
