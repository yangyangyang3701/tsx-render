import { inject, injectable } from "inversify";
import Reactive from "@idealjs/corn-reactive";

import TYPES, {
    CornChild,
    CornElement,
    DOMAttributesOBJ,
    isCornText,
    CornComponent,
    JSXFunction,
    Renderer,
} from "./types";
import { createEffect, createRoot } from "..";

const isString = (type: string | CornComponent | CornChild): type is string => {
    return typeof type == "string";
};

const isArray = <T>(data: T | T[]): data is T[] => {
    return Array.isArray(data);
};

interface ICorn {
    render: Renderer;
    jsx: JSXFunction;
}

export interface Props {
    ref?: any;
    children?: CornChild | CornChild[];
    onClick?: () => void;
}

const handleCornElement = (cornEl: CornElement) => {
    console.debug("[debug] handleCornElement", cornEl);
    const element = cornEl.create();
    cornEl.mount(element);
    return element;
};

const handleCornChild = (child: CornChild) => {
    if (isCornText(child)) {
        return document.createTextNode(child.toString());
    }

    if (isArray(child)) {
        return child.map((c) => {
            return handleCornElement(c);
        });
    }

    if (child instanceof Function) {
        const res = child();
        let element = document.createTextNode("");
        createEffect(() => {
            if (res.create != null) {
                element = child().create();
                child().mount(element);
                return element;
            }
            if (isCornText(res)) {
                element.textContent = child().toString();
            }
        });

        return element;
    }

    return handleCornElement(child);
};

const appedCornChild = (target: Element, child: CornChild) => {
    const res = handleCornChild(child);
    if (res) {
        if (isArray(res)) {
            target.append(...res);
        } else {
            target.append(res);
        }
    }
};

@injectable()
class Corn implements ICorn {
    @inject(TYPES.Reactive)
    public reactive!: Reactive;

    constructor() {}

    public render = (element: CornElement, container: Element) => {
        element.mount(container);
    };

    public jsx = <P extends Props = {}>(
        type: string | CornComponent<P>,
        props: P,
        key: any
    ) => {
        if (type instanceof Function) {
            return type(props);
        }

        let cornElement: CornElement | null = null;

        const create = () => {
            const element = document.createElement(type);
            Object.entries(props).forEach((entry) => {
                if (entry[0] === "style") {
                }
                if (DOMAttributesOBJ[entry[0]] != null) {
                    Reflect.set(element, DOMAttributesOBJ[entry[0]], entry[1]);
                }
            });
            return element;
        };

        const mount = (target: Element) => {
            console.debug("[debug] mount", target);

            if (props.children == null) {
                target.appendChild(create());
                return;
            }

            if (isArray(props.children)) {
                props.children.forEach((child) => {
                    appedCornChild(target, child);
                });
                return;
            }

            appedCornChild(target, props.children);
        };

        const update = () => {};

        const destory = () => {};

        cornElement = {
            type,
            props,
            key,

            create,
            mount,
            update,
            destory,
        };

        return cornElement!;
    };
}

export default Corn;
