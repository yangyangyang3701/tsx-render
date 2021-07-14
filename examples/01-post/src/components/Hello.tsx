import { createRef } from "@idealjs/corn";
let items: number[] = [1, 2, 3];
const Hello = (props: { name: string }) => {
    const { name } = props;
    const ref = createRef("");

    const onClick = () => {
        console.log("test test");
    };

    return (
        <div ref={ref}>
            <button onClick={onClick}>test button</button>
            Hello {name}
            {items.map((i) => (
                <div>{i}</div>
            ))}
            Hello {name}
        </div>
    );
};

export default Hello;
