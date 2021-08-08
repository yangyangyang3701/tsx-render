export type ReadFunction<T> = () => T;
export type WriteFunction<T> = (next: T | ((preValue: T) => T)) => void;
type Effect = () => void;
interface IRoot {
    effects: Effect[];
    batch: {
        pending: boolean;
        effects: Set<Effect>;
    };
}

const isSetFunction = <T>(v: T | ((d: T) => T)): v is (d: T) => T => {
    return typeof v === "function";
};

//Publish–subscribe pattern
class Reactive {
    private roots: IRoot[] = [];
    constructor() {
        this.createSignal = this.createSignal.bind(this);
    }
    private static handler = (effects: Set<Effect>, root: IRoot) => ({
        get(target: object, p: string | symbol, receiver: any) {
            const effect = root.effects[root.effects.length - 1];
            if (effect != null) {
                effects.add(effect);
            }
            return Reflect.get(target, p, receiver);
        },
        set: (
            target: object,
            p: string | symbol,
            value: any,
            receiver: any
        ) => {
            Reflect.set(target, p, value, receiver);
            for (const effect of [...effects]) {
                root.effects.push(effect);
                if (root.batch.pending) {
                    root.batch.effects.add(effect);
                } else {
                    effect();
                }
                root.effects.pop();
            }
            return true;
        },
    });

    public createRoot = (fn: () => void) => {
        console.debug("[debug] createRoot");
        const root: IRoot = {
            effects: [],
            batch: {
                pending: false,
                effects: new Set<Effect>(),
            },
        };
        this.roots.push(root);
        fn();
        this.roots.pop();
    };

    public createSignal<T>(): { value: T | undefined };

    public createSignal<T>(value: T): { value: T };

    public createSignal<T>(value?: T) {
        const root = this.roots[this.roots.length - 1];
        const effects = new Set<Effect>();

        const proxy = new Proxy<{ value: T | undefined }>(
            { value },
            Reactive.handler(effects, root)
        );

        return proxy;
    }

    public createEffect = (fn: () => void) => {
        console.debug("[debug] create effect");
        const root = this.roots[this.roots.length - 1];
        root.effects.push(fn);
        fn();
        root.effects.pop();
    };

    public batch = (fn: () => void) => {
        const root = this.roots[this.roots.length - 1];
        root.batch.pending = true;
        fn();
        root.batch.pending = false;
        root.batch.effects.forEach((effect) => effect());
        root.batch.effects.clear();
    };
}

export default Reactive;
