import { createEffect, createSignal, createMemo } from "@idealjs/corn";

const Hello = (props: { name: string }) => {
    const { name } = props;

    const [state, setState] = createSignal(true);
    createMemo(() => {
        return <div>{state()}</div>;
    });

    const onClick = () => {
        console.log("test test");
        setState((s) => !s);
    };

    createEffect(() => {
        console.log(state());
    });

    return (
        <div>
            <div>Hello {name}</div>
            <div>
                <button onClick={onClick}>test button</button>
            </div>
            <div>state {state}</div>
        </div>
    );
};

export default Hello;
