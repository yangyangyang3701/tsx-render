import Corn from "./src/Corn";
import container from "./src/inversify.config";
import TYPES from "./src/types";

const corn = container.get<Corn>(TYPES.Corn);

export { default as Corn } from "./src/Corn";
export const render = corn.render;
export const createRef = corn.createRef;
export const createSignal = corn.createSignal;
export const createEffect = corn.createEffect;
