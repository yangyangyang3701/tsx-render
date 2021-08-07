import { createEffect, createRoot } from "@idealjs/corn";
import { ReadFunction } from "../../../corn-reactive";

interface IProps {
    children?: (string | Element | ReadFunction<any>)[];
    onClick?: any;
    style?: any;
}

type TypeFunc<P> = (props: P) => Element;

const proxyHandler = <T extends {}>(
    proxyKeys: (string | symbol)[]
): ProxyHandler<T> => ({
    get(target, p, reciver) {
        if (proxyKeys.includes(p)) {
            return Reflect.get(target, p, reciver)();
        } else {
            return Reflect.get(target, p, reciver);
        }
    },
});

export function hyperX<T extends P, P = undefined>(
    type: TypeFunc<P>,
    config?: T,
    proxyKeys?: (string | symbol)[]
): Element;

export function hyperX(
    type: TypeFunc<{}>,
    config: {} = {},
    proxyKeys: (string | symbol)[] = []
) {
    console.debug("[debug] hyperX start");
    const props = new Proxy(config, proxyHandler(proxyKeys));
    const element = type(props);
    console.debug("[debug] hyperX end");
    return element;
}

export function hyper<P extends IProps>(
    type: string,
    config?: P,
    proxyKeys?: (string | symbol)[]
): Element;

export function hyper(
    type: string,
    config: {} = {},
    proxyKeys: (string | symbol)[] = []
) {
    console.debug("[debug] hyper start");
    let element: Element | null = null;

    let inited = false;
    const props = new Proxy<IProps>(config, proxyHandler(proxyKeys));
    let children: (Text | Element)[] = [];

    const create = () => {
        console.debug("[debug] hyper create");
        element = document.createElement(type);

        for (const key in props) {
            // assign props to element if key in element. onClick -> onclick
            if (key === "style" && element instanceof HTMLElement) {
                for (const styleKey in props[key]) {
                    Reflect.set(element.style, styleKey, props[key][styleKey]);
                }
                continue;
            }

            if (key === "onClick" && key.toLowerCase() in element) {
                Reflect.set(element, key.toLowerCase(), props[key]);
                continue;
            }
        }

        children =
            props?.children?.map((child) => {
                if (child instanceof Element) {
                    return child;
                } else if (child instanceof Function) {
                    return document.createTextNode(child());
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
        console.debug("[debug] hyper update");

        props?.children?.forEach((value, index) => {
            if (children[index] instanceof Text && value instanceof Function) {
                children[index].nodeValue = value();
            }
            if (children[index] instanceof Text && typeof value === "string") {
                children[index].nodeValue = value;
            }
        });
    };

    createEffect(() => {
        console.debug("[debug] hyper effect", type, inited);
        createRoot(() => {
            if (!inited) {
                create();
                inited = true;
            } else {
                update();
            }
        });
    });

    return element!;
}
