export namespace JSX {
    export interface IntrinsicElements {
        // HTML
        div: any;
    }
}

interface JSXElement<P = any> {
    (props: P): CornElement<P>;
}

interface CornElement<P> {
    type: string | CornElement<P>;
    props: P;
    key: any;
}

interface Props {
    children?: any;
}

const isString = (type: string | JSXElement): type is string => {
    return typeof type == "string";
};

const cornElement = <P>(
    type: string | JSXElement<P>,
    props: P,
    key: any
): CornElement<P> => {
    if (isString(type)) {
        return {
            type: type,
            props,
            key,
        };
    } else {
        return {
            type: type(props),
            props,
            key,
        };
    }
};

export const jsx = <P extends Props>(
    type: string | JSXElement<P>,
    props: P,
    key: any
): CornElement<P> => {
    return cornElement(type, props, key);
};

export const jsxs = jsx;
