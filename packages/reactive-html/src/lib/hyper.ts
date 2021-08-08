import { createEffect, createRoot } from "@idealjs/corn";
import CSS from "csstype";
import { ReadFunction } from "@idealjs/corn-reactive";

interface IProps {
    children?: (string | Element | ReadFunction<any>)[];
    onClick?: any;
    style?: CSS.Properties;
}

type TypeFunc<P> = (props: P) => Element;

export function hyperX<T extends P, P = undefined>(
    type: TypeFunc<P>,
    config?: T,
    proxyKeys?: (string | symbol)[]
): Element;

export function hyperX(type: TypeFunc<{}>, config: {} = {}) {
    console.debug("[debug] hyperX start");
    const element = type(config);
    console.debug("[debug] hyperX end");
    return element;
}

export function hyper<P extends IProps>(type: string, config?: P): Element;

export function hyper(type: string, config: {} = {}) {
    console.debug("[debug] hyper start");
    let element: Element | null = null;

    let inited = false;
    let children: (Text | Element)[] = [];

    const props: any = config;

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
            props?.children?.map((child: any) => {
                if (child instanceof Element) {
                    return child;
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

        for (const key in props) {
            // assign props to element if key in element. onClick -> onclick
            if (key === "style" && element instanceof HTMLElement) {
                for (const styleKey in props[key]) {
                    Reflect.set(element.style, styleKey, props[key][styleKey]);
                }
                continue;
            }
        }

        props?.children?.forEach((value: any, index: number) => {
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
