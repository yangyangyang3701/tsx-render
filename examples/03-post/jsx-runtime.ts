export namespace JSX {
    export interface IntrinsicElements {
        // HTML
        div: any;
    }
}

export const jsx = (
    type: string | Function,
    config: { children?: any },
    key: any
): Element => {
    if (typeof type === "string") {
        const el = document.createElement(type);
        return el;
    }
    return type();
};
