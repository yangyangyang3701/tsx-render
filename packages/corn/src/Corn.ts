import { inject, injectable } from "inversify";
import Reactive from "@idealjs/corn-reactive";

import TYPES, {
    CornChild,
    CornElement,
    DOMAttributesOBJ,
    isCornText,
    JSXElement,
    JSXFunction,
    Renderer,
} from "./types";

const isString = (type: string | JSXElement | CornChild): type is string => {
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
        element.createElement();
        element.mount(container);
    };

    public jsx = <P extends Props = {}>(
        type: string | JSXElement<P>,
        props: P,
        key: any
    ) => {
        let cornElement: CornElement | null = null;

        this.reactive.createRoot(() => {
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
                                                child.create();
                                            });
                                        } else {
                                            child.create();
                                        }
                                    }
                                });
                            } else if (!isCornText(props.children)) {
                                props.children?.create();
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
                    if (isArray(props.children)) {
                        props.children.forEach((child) => {
                            if (!isCornText(child)) {
                                if (isArray(child)) {
                                    child.forEach((child) => {
                                        child.mount(element);
                                    });
                                } else {
                                    child.mount(element);
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
                    //@ts-ignore
                    this.reactive.createRoot(() => {
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

            if (props.ref) {
                props.ref.current = cornElement;
            }
        });

        return cornElement!;
    };
}

export default Corn;
