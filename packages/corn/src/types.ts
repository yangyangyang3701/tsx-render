export type CornText = string | number;

export const isCornText = (
    cornChild: CornChild | undefined
): cornChild is CornText => {
    return typeof cornChild == "string" || typeof cornChild == "number";
};

export type CornChild = CornText | CornElement | CornElement[];

export interface CornElement<P = any> {
    type: string | CornElement<P>;
    props: P;
    key: any;
    create: () => void;
    mount: (container: Element) => void;
    update: () => void;
    destory: () => void;
}

export type JSXElement<P = any> = (props: P) => CornElement<P>;

export type Renderer = (element: CornElement, container: Element) => void;

export type JSXFunction = <P extends {}>(
    type: string | JSXElement<P>,
    props: P,
    key: any
) => CornElement<P>;

export interface RefObject<T> {
    readonly current: T | null;
}

export interface MutableRefObject<T> {
    current: T;
}

export interface CreateRef {
    <T>(initialValue: T | undefined): RefObject<T>;
    <T>(initialValue: T): MutableRefObject<T>;
}

const TYPES = {
    Corn: Symbol("Corn"),
    Dispatcher: Symbol("Dispatcher"),
};

export default TYPES;
