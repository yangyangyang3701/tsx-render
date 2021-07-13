import Corn from "./src/Corn";
import container from "./src/inversify.config";
import TYPES from "./src/types";

export namespace JSX {
    export interface IntrinsicElements {
        // HTML
        div: any;
    }
}

const corn = container.get<Corn>(TYPES.Corn);

export const jsx = corn.jsx;

export const jsxs = corn.jsx;
