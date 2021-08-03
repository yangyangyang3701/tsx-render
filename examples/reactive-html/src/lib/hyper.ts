import { createEffect, createRoot } from "@idealjs/corn";

interface IProps {
    children?: string[];
}

type TypeFunc<P> = (props: P) => Element;

type Props<T extends (props: any) => any> = T extends (props: infer P) => any
    ? P
    : undefined;

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
    let children: Text[] = [];

    const create = () => {
        console.debug("[debug] hyper create");

        props = getProps && getProps();
        element = document.createElement(type);
        children =
            props?.children?.map((child) => document.createTextNode(child)) ||
            [];

        children.forEach((child) => {
            element?.append(child);
        });

        inited = true;
    };

    const update = () => {
        console.debug("[debug] hyper update");
        children.forEach((child) => child.remove);
        props = getProps && getProps();
        props?.children?.forEach((value, index) => {
            children[index].nodeValue = value;
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
