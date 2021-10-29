import { createEffect, createSignal, createMemo } from "@idealjs/corn";

const Hello = (props: { name: string }) => {
    const { name } = props;

    const [state, setState] = createSignal(true);

    const [todos, setTodos] = createSignal<boolean[]>([]);

    const onClick = () => {
        setState((s) => !s);
        setTodos((todos) => [...todos, state()]);
    };

    createEffect(() => {
        console.log("Hello", name, state());
    });

    createEffect(() => {
        console.log("Hello", name, todos());
    });

    return (
        <div>
            <div>Hello {name}</div>
            <div>
                <button onClick={onClick}>test button</button>
            </div>
            <div>state {state}</div>
            <div>todos</div>
        </div>
    );
};

export default Hello;
