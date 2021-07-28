import { createEffect, createSignal } from "@idealjs/corn";
let items: number[] = [1, 2, 3];

const Hello = (props: { name: string }) => {
    const { name } = props;

    const [state, setState] = createSignal("state");

    const onClick = () => {
        console.log("test test");
        setState("test");
    };

    createEffect(() => {
        console.log(state());
    });

    return (
        <div>
            <button onClick={onClick}>test button</button>
            Hello {state()}
            {items.map((i) => (
                <div>{i}</div>
            ))}
            Hello {name}
        </div>
    );
};

export default Hello;
