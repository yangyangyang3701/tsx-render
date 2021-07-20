type ReadFunction<T> = () => T;
type WriteFunction<T> = (next: T) => void;
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

const roots: IRoot[] = [];
const handler = (effects: Set<Effect>, root: IRoot) => ({
    get(target: object, p: string | symbol, receiver: any) {
        const effect = root.effects[root.effects.length - 1];
        if (effect != null) {
            effects.add(effect);
        }
        return Reflect.get(target, p, receiver);
    },
    set: (target: object, p: string | symbol, value: any, receiver: any) => {
        Reflect.set(target, p, value, receiver);
        for (const effect of [...effects]) {
            root.effects.push(effect);
            //if patch push sub to patch stack
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

const createRoot = (fn: () => void) => {
    const root: IRoot = {
        effects: [],
        batch: {
            pending: false,
            effects: new Set<Effect>(),
        },
    };
    roots.push(root);
    fn();
    roots.pop();
};

const createSignal = <T>(value?: T): [ReadFunction<T>, WriteFunction<T>] => {
    const root = roots[roots.length - 1];
    const effects = new Set<Effect>();

    const proxy = new Proxy<{ value: T }>({ value }, handler(effects, root));

    const read = () => {
        return proxy.value;
    };

    const write = (nextValue: T | ((preValue: T) => T)) => {
        if (isSetFunction(nextValue)) {
            proxy.value = nextValue(proxy.value);
        } else {
            proxy.value = nextValue;
        }
    };
    return [read, write];
};

const createEffect = (fn: () => void) => {
    const root = roots[roots.length - 1];
    root.effects.push(fn);
    fn();
    root.effects.pop();
};

const batch = (fn: () => void) => {
    const root = roots[roots.length - 1];
    root.batch.pending = true;
    fn();
    root.batch.pending = false;
    root.batch.effects.forEach((effect) => effect());
};
