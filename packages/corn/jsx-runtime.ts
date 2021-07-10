export interface ClassAttributes {}

export interface HTMLAttributes {}

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
        if (Array.isArray(config.children)) {
            config.children.forEach((child: any) => {
                el.appendChild(child);
            });
        } else {
            el.innerText = config.children;
        }
        return el;
    }

    return type();
};
