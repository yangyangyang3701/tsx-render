import { createEffect, createRoot } from "@idealjs/corn";

interface IProps {
    children?: string[];
}

export const hyperX = <P extends IProps>(
    type: (props: P) => Element,
    getProps?: () => P
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
