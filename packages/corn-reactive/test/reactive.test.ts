import Reactive from "../src/Reactive";

describe("basic test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const name = reactive.createSignal<string>();
            const result = reactive.createSignal<string | undefined>(
                name.value
            );
            let count = 0;

            reactive.createEffect(() => {
                result.value = name.value;
                count = count + 1;
            });

            expect(count).toBe(1);

            let name1 = "world";
            name.value = name1;
            expect(result.value).toBe(name1);
            expect(count).toBe(2);

            let name2 = "world world";
            name.value = name2;
            expect(result.value).toBe(name2);
            expect(count).toBe(3);
        });
    });
});

describe("object test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const user = reactive.createSignal<{ name: string }>();
            const result = reactive.createSignal<{ name: string } | undefined>(
                user.value
            );
            let count = 0;

            reactive.createEffect(() => {
                result.value = user.value;
                count = count + 1;
            });
            expect(count).toBe(1);

            let name1 = "world";
            let user1 = {
                name: name1,
            };
            user.value = user1;
            expect(count).toBe(2);
            expect(user.value?.name).toBe(user1.name);
            expect(result.value?.name).toBe(name1);

            let name2 = "world world";
            let user2 = {
                name: name2,
            };
            user.value = user2;
            expect(count).toBe(3);
            expect(result.value?.name).toBe(user2.name);
        });
    });
});

describe("batch test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const name = reactive.createSignal<string>();
            const result = reactive.createSignal<string | undefined>(
                name.value
            );
            let count = 0;

            reactive.createEffect(() => {
                result.value = name.value;
                count = count + 1;
            });

            expect(count).toBe(1);

            let name1 = "world";
            let name2 = "world world";

            reactive.batch(() => {
                name.value = name1;
                name.value = name2;
            });

            expect(result.value).toBe(name2);
            expect(count).toBe(2);
        });
    });
});

describe("nest test", () => {
    test("test 1", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const name = reactive.createSignal<string>();
            let count = 0;

            reactive.createEffect(() => {
                name.value;
                reactive.createEffect(() => {
                    name.value;
                    count = count + 1;
                });
            });

            expect(count).toBe(1);

            let name1 = "world";
            name.value = name1;
            expect(count).toBe(3);

            let name2 = "world world";
            name.value = name2;
            expect(count).toBe(6);
        });
    });

    test("test 2", () => {
        const reactive = new Reactive();
        reactive.createRoot(() => {
            const name = reactive.createSignal<string>();
            let count = 0;

            reactive.createEffect(() => {
                console.debug("[debug]", name.value);
                reactive.createRoot(() => {
                    reactive.createEffect(() => {
                        console.debug("[debug]", name.value);
                        count = count + 1;
                    });
                });
            });

            expect(count).toBe(1);

            let name1 = "world";
            name.value = name1;
            expect(count).toBe(2);

            let name2 = "world world";
            name.value = name2;
            expect(count).toBe(3);
        });
    });
});
