import Reactive from "../src/Reactive";

describe("basic test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const [name, setName] = reactive.createSignal<string>();
            const [result, setResult] = reactive.createSignal<
                string | undefined
            >(name());
            let count = 0;

            reactive.createEffect(() => {
                setResult(name());
                count = count + 1;
            });

            expect(count).toBe(1);

            let name1 = "world";
            setName(name1);
            expect(result()).toBe(name1);
            expect(count).toBe(2);

            let name2 = "world world";
            setName(name2);
            expect(result()).toBe(name2);
            expect(count).toBe(3);
        });
    });
});

describe("object test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const [user, setUser] = reactive.createSignal<{ name: string }>();
            const [result, setResult] = reactive.createSignal<
                { name: string } | undefined
            >(user());
            let count = 0;

            reactive.createEffect(() => {
                setResult(user());
                count = count + 1;
            });
            expect(count).toBe(1);

            let name1 = "world";
            setUser(() => ({
                name: name1,
            }));
            expect(count).toBe(2);
            expect(user()?.name).toBe(name1);
            expect(result()?.name).toBe(name1);

            let name2 = "world world";
            setUser({ name: name2 });
            expect(count).toBe(3);
            expect(result()?.name).toBe(name2);
        });
    });
});

describe("batch test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const [name, setName] = reactive.createSignal<string>();
            const [result, setResult] = reactive.createSignal<
                string | undefined
            >(name());
            let count = 0;

            reactive.createEffect(() => {
                setResult(name());
                count = count + 1;
            });

            expect(count).toBe(1);

            let name1 = "world";
            let name2 = "world world";

            reactive.batch(() => {
                setName(name1);
                setName(name2);
            });

            expect(result()).toBe(name2);
            expect(count).toBe(2);
        });
    });
});

describe("nest test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const [name, setName] = reactive.createSignal<string>();
            let count = 0;

            reactive.createEffect(() => {
                name();
                reactive.createEffect(() => {
                    name();
                    count = count + 1;
                });
            });

            expect(count).toBe(1);

            let name1 = "world";
            setName(name1);
            expect(count).toBe(3);

            let name2 = "world world";
            setName(name2);
            expect(count).toBe(6);
        });
    });

    test("test 2", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const [name, setName] = reactive.createSignal<string>();
            let count = 0;

            reactive.createEffect(() => {
                name();
                reactive.createRoot(() => {
                    reactive.createEffect(() => {
                        name();
                        count = count + 1;
                    });
                });
            });

            expect(count).toBe(1);

            let name1 = "world";
            setName(name1);
            expect(count).toBe(2);

            let name2 = "world world";
            setName(name2);
            expect(count).toBe(3);
        });
    });
});
