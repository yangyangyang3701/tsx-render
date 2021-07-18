import { injectable } from "inversify";

type Execute = () => void;
type ReadFunction<T> = () => T;
type WriteFunction<T> = (nextValue: T | ((preValue?: T) => T)) => void;
type ContextDeps = Set<
    Set<{
        execute: Execute;
    }>
>;
type Running = {
    execute: Execute;
    dependencies: ContextDeps;
};

const isSetFunction = <T>(v: T | ((d: T) => T)): v is (d: T) => T => {
    return typeof v === "function";
};

export type CreateSignal = {
    <T>(): [ReadFunction<T | undefined>, WriteFunction<T | undefined>];
    <T>(value: T): [ReadFunction<T>, WriteFunction<T>];
};

export type CreateEffect = {
    (fn: () => void): void;
};

interface Dispatcher {}

@injectable()
class Dispatcher {
    private context: Running[] = [];

    private proxyHandler = (
        subscriptions: Set<{
            execute: Execute;
        }>
    ) => {
        return {
            get: (target: object, p: string | symbol, receiver: any) => {
                console.log("test test get", p);

                const running = this.context[this.context.length - 1];
                if (running) {
                    subscriptions.add(running);
                    running.dependencies.add(subscriptions);
                }
                return Reflect.get(target, p, receiver);
            },
            set: (
                target: object,
                p: string | symbol,
                value: any,
                receiver: any
            ) => {
                console.log("test test set", p);

                Reflect.set(target, p, value, receiver);
                for (const sub of [...subscriptions]) {
                    sub.execute();
                }
                return true;
            },
        };
    };

    private cleanup = (running: Running) => {
        for (const dep of running.dependencies) {
            dep.delete(running);
        }
        running.dependencies.clear();
    };

    public createSignal: CreateSignal = <T>(value?: T) => {
        const subscriptions = new Set<{ execute: Execute }>();
        const proxy = new Proxy<{ value: typeof value }>(
            { value },
            this.proxyHandler(subscriptions)
        );
        const read = () => {
            return proxy.value;
        };

        const write: WriteFunction<typeof value> = (nextValue) => {
            if (isSetFunction(nextValue)) {
                proxy.value = nextValue(proxy.value);
            } else {
                proxy.value = nextValue;
            }
        };
        return [read, write];
    };

    public createEffect: CreateEffect = (fn) => {
        const execute = () => {
            this.cleanup(running);

            this.context.push(running);
            try {
                fn();
            } finally {
                this.context.pop();
            }
        };

        const running: Running = {
            execute,
            dependencies: new Set(),
        };

        execute();
    };
}

export default Dispatcher;
