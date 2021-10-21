import { ReadFunction } from "@idealjs/corn-reactive";

export const value = <T>(r: ReadFunction<T>, callback: (v: T) => any) => {
    return () => callback(r());
};
