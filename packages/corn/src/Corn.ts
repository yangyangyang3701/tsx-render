import { inject, injectable } from "inversify";
import TYPES, {
    CornChild,
    CornElement,
    CreateRef,
    isCornText,
    JSXElement,
    JSXFunction,
    Renderer,
} from "./types";
import Dispatcher from "./Dispatcher";

const isString = (type: string | JSXElement | CornChild): type is string => {
    return typeof type == "string";
};

const isArray = <T>(data: T | T[]): data is T[] => {
    return Array.isArray(data);
};

interface ICorn {
    render: Renderer;
    jsx: JSXFunction;
    createRef: CreateRef;
}

export interface Props {
    ref?: any;
    children?: CornChild | CornChild[];
}

@injectable()
class Corn implements ICorn {
    @inject(TYPES.Dispatcher)
    private _dispatcher!: Dispatcher;

    constructor() {}

    public render = (element: CornElement, container: Element) => {
        console.debug("[Debug] render", element, container);
        element.create();
        element.mount(container);
    };

    public jsx = <P extends Props = any>(
        type: string | JSXElement<P>,
        props: P,
        key: any
    ) => {
        let cornElement: CornElement;
        if (isString(type)) {
            let element: Element;

            const create = () => {
                element = document.createElement(type);

                if (type === "button") {
                    element.addEventListener("click", () => {
                        console.log("test test");
                    });
                }

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
            };

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

            cornElement = {
                type,
                props,
                key,
                create,
                mount,
                update,
                destory,
            };
        } else {
            cornElement = type(props);
        }

        if (props.ref) {
            props.ref.current = cornElement;
        }
        return cornElement;
    };

    public createRef<T>(value?: T) {
        return {
            current: value,
        };
    }
}

export default Corn;
