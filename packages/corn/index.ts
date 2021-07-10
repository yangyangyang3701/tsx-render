import { jsx } from "./jsx-runtime";

export type Render = (
    element: ReturnType<typeof jsx>,
    container: Element | null
) => void;

export const render: Render = (element, container) => {
    // container?.appendChild(element);
    console.log(element);
};
