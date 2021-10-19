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

@injectable()
class Corn implements ICorn {
    @inject(TYPES.Reactive)
    public reactive!: Reactive;

    constructor() {}

    public render = (element: CornElement, container: Element) => {
        console.log("test test1");

        element.createElement();
        element.mount(container);
    };

    public jsx = <P extends Props = {}>(
        type: string | CornComponent<P>,
        props: P,
        key: any
    ) => {
        let cornElement: CornElement | null = null;

        if (isString(type)) {
            let element: Element;

            const create = () => {
                element = document.createElement(type);
                Object.entries(props).forEach((entry) => {
                    if (entry[0] === "children") {
                        if (isArray(props.children)) {
                            props.children.forEach((child) => {
                                if (!isCornText(child)) {
                                    if (isArray(child)) {
                                        child.forEach((child) => {
                                            child.createElement();
                                        });
                                    } else {
                                        console.log(child);
                                        if (child instanceof Function) {
                                        } else {
                                            child?.createElement();
                                        }
                                    }
                                }
                            });
                        } else if (!isCornText(props.children)) {
                            props.children?.createElement();
                        }
                    }
                    if (entry[0] === "style") {
                    }
                    if (DOMAttributesOBJ[entry[0]] != null) {
                        Reflect.set(
                            element,
                            DOMAttributesOBJ[entry[0]],
                            entry[1]
                        );
                    }
                });
            };

            const upsert = () => {};

            const mount = (target: Element) => {
                console.debug("[debug] mount", target);
                // debugger;
                if (isArray(props.children)) {
                    props.children.forEach((child) => {
                        if (!isCornText(child)) {
                            if (isArray(child)) {
                                child.forEach((child) => {
                                    child.mount(element);
                                });
                            } else {
                                console.log(child);
                                if (child instanceof Function) {
                                    let node = document.createTextNode(child());
                                    element.appendChild(node);

                                    createEffect(() => {
                                        node.textContent = child();
                                    });
                                } else {
                                    child?.mount(element);
                                }
                            }
                        } else {
                            element.appendChild(
                                document.createTextNode(child.toString())
                            );
                        }
                    });
                } else if (!isCornText(props.children)) {
                    props.children?.mount(element);
                } else {
                    element.textContent = props.children.toString();
                }
                target.appendChild(element);
            };

            const update = () => {};

            const destory = () => {};

            const createElement = () => {
                let inited = false;

                this.reactive.createEffect(() => {
                    if (!inited) {
                        create();
                        inited = true;
                    } else {
                        console.log("test test update");
                        update();
                    }
                });
            };

            cornElement = {
                type,
                props,
                key,

                create,
                mount,
                update,
                destory,
                createElement,
            };
        } else {
            cornElement = type(props);
        }

        // if (props.ref) {
        //     props.ref.current = cornElement;
        // }

        // this.reactive.createRoot(() => {

        // });

        return cornElement!;
    };
}

export default Corn;
