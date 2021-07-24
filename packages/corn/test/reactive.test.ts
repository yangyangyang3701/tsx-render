import Reactive from "../src/Reactive";

test("test 1", () => {
    const reactive = new Reactive();
    reactive.createRoot(() => {
        const [name, setName] = reactive.createSignal<string>();
        reactive.createEffect(() => {
            console.log(`hello ${name()}`);
        });
        setName("world");
    });
});
