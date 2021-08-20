export type ReadFunction<T> = () => T;
export type WriteFunction<T> = (next: T | ((preValue: T) => T)) => void;
interface IEffect<T = any> {
    fn: (prev: T) => T;
    prev?: T;
}
interface IRoot {
    effects: IEffect[];
    batch: {
        pending: boolean;
        effects: Set<IEffect>;
    };
}

interface IDiffFlag {
    $flag: any;
}

type DiffType<T> = T extends object ? T & IDiffFlag : { value: T } & IDiffFlag;

type ExtractArray<T> = T extends Array<infer C> ? C : any;

const isSetFunction = <T>(v: T | ((d: T) => T)): v is (d: T) => T => {
    return v instanceof Function;
};

//Publish–subscribe pattern
class Reactive {
    private roots: IRoot[] = [];
    constructor() {
        this.createSignal = this.createSignal.bind(this);
    }
    private static handler = (effects: Set<IEffect>, root: IRoot) => ({
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
                    effect.prev = effect.fn(effect.prev);
                }
                root.effects.pop();
            }
            return true;
        },
    });

    private static diffHandler = <T>(
        effects: Set<IEffect>,
        root: IRoot,
        compare: (p: ExtractArray<T>, n: ExtractArray<T>) => boolean
    ) => {
        const prev = [];
        return {
            get(
                target: { value: T[] | undefined },
                p: string | symbol,
                receiver: any
            ): Array<T & { flag: any }> | undefined {
                const effect = root.effects[root.effects.length - 1];
                if (effect != null) {
                    effects.add(effect);
                }
                if (target == null) {
                    return undefined;
                }
                return Reflect.get(target, p, receiver);
            },
            set: (
                target: { value: T[] },
                p: string | symbol,
                value: T[],
                receiver: any
            ) => {
                Reflect.set(target, p, value, receiver);
                for (const effect of [...effects]) {
                    root.effects.push(effect);
                    if (root.batch.pending) {
                        root.batch.effects.add(effect);
                    } else {
                        effect.prev = effect.fn(effect.prev);
                    }
                    root.effects.pop();
                }
                return true;
            },
        };
    };

    public createRoot = (fn: () => void) => {
        console.debug("[debug] createRoot");
        const root: IRoot = {
            effects: [],
            batch: {
                pending: false,
                effects: new Set<IEffect>(),
            },
        };
        this.roots.push(root);
        fn();
        this.roots.pop();
    };

    public createSignal<T>(): [
        ReadFunction<T | undefined>,
        WriteFunction<T | undefined>
    ];

    public createSignal<T>(value: T): [ReadFunction<T>, WriteFunction<T>];

    public createSignal<T>(
        value?: T
    ): [ReadFunction<typeof value>, WriteFunction<typeof value>] {
        const root = this.roots[this.roots.length - 1];
        const effects = new Set<IEffect>();

        const proxy = new Proxy<{ value: typeof value }>(
            { value },
            Reactive.handler(effects, root)
        );

        const read: ReadFunction<typeof value> = () => {
            return proxy.value;
        };

        const write: WriteFunction<typeof value> = (nextValue) => {
            if (isSetFunction(nextValue)) {
                proxy.value = value = nextValue(value);
            } else {
                proxy.value = value = nextValue;
            }
        };
        return [read, write];
    }

    public createDiffSignal<T extends any[]>(): [
        ReadFunction<DiffType<ExtractArray<T>>[] | undefined>,
        WriteFunction<T | undefined>
    ];

    public createDiffSignal<T extends any[]>(
        value: T
    ): [
        ReadFunction<DiffType<ExtractArray<typeof value>>[]>,
        WriteFunction<typeof value>
    ];

    public createDiffSignal<T extends any[]>(
        value?: T,
        compare: (p: ExtractArray<T>, n: ExtractArray<T>) => boolean = (p, n) =>
            p === n
    ): [
        ReadFunction<DiffType<ExtractArray<typeof value>>[]>,
        WriteFunction<typeof value>
    ] {
        const root = this.roots[this.roots.length - 1];
        const effects = new Set<IEffect>();

        const proxy = new Proxy(
            { value },
            Reactive.diffHandler<T>(effects, root, compare)
        );

        const read: ReadFunction<DiffType<T>[]> = () => {
            return proxy.value as DiffType<T>[];
        };

        const write: WriteFunction<typeof value> = (nextValue) => {
            if (isSetFunction(nextValue)) {
                proxy.value = value = nextValue(value);
            } else {
                proxy.value = value = nextValue;
            }
        };
        return [read, write];
    }

    public createEffect = <T>(fn: (pre?: T) => T) => {
        console.debug("[debug] create effect");
        const root = this.roots[this.roots.length - 1];
        const effect: IEffect = {
            fn,
        };
        root.effects.push(effect);
        effect.prev = fn();
        root.effects.pop();
    };

    public batch = (fn: () => void) => {
        const root = this.roots[this.roots.length - 1];
        root.batch.pending = true;
        fn();
        root.batch.pending = false;
        root.batch.effects.forEach((effect) => {
            effect.prev = effect.fn(effect.prev);
        });
        root.batch.effects.clear();
    };
}

export default Reactive;
