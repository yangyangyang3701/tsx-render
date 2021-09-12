import { transformSync } from "@babel/core";
import transform from "../src/transform";

describe("transform", () => {
    test("syntax-jsx", () => {
        const HelloStory = `const Hello = () => {
            return <div></div>;
        };

        export default Hello;
        `;
        const result = transformSync(HelloStory, {
            plugins: ["@babel/plugin-syntax-jsx"],
            babelrc: false,
            compact: true,
        });
        expect(result?.code).toBe(
            `const Hello=()=>{return<div></div>;};export default Hello;`
        );
    });

    test("transform-plugin-tag-ref", () => {
        const HelloStory = `const Hello = () => {
            return <div></div>;
        };

        export default Hello;
        `;
        const result = transformSync(HelloStory, {
            plugins: ["@babel/plugin-syntax-jsx", transform],
            babelrc: false,
            compact: true,
        });
        console.log(result?.code);
        expect(result?.code).toBe(
            `const Hello=()=>{return hyper("div");};export default Hello;`
        );
    });

    test("transform-plugin-nest-tag", () => {
        const HelloStory = `const Hello = () => {
            return <div><p><div/>{1+2}<div/></p><p>2</p></div>;
        };
        
        export default Hello;
        `;
        const result = transformSync(HelloStory, {
            plugins: ["@babel/plugin-syntax-jsx", transform],
            babelrc: false,
            compact: true,
        });
        console.log(result?.code);
        expect(result?.code).toBe(
            `const Hello=()=>{return hyper("div");};export default Hello;`
        );
    });

    test("transform-plugin-App", () => {
        const HelloStory = `const App = () => {
            const [name, setName] = createSignal("world");
            const [color, setColor] = createSignal("red");
            const [todos, setTodos] = createSignal([]);
        
            const change = () => {
                console.debug("[debug] change name");
                const randomNum = Math.random();
                const name = randomNum.toFixed(2).toString();
                setName(name);
                setTodos((todos) => {
                    if (todos.length > 10) {
                        return [];
                    } else {
                        return [...todos, Symbol(name)];
                    }
                });
                if (randomNum > 0.7) {
                    setColor("blue");
                } else {
                    setColor("red");
                }
            };
        
            return (
                <div style={{ color: color() }}>{name()}<button onClick={change}>change</button>{todos().map((todo) => {
                        return <div>{todo}</div>;
                    })}</div>
            );
        };
        `;

        const result = transformSync(HelloStory, {
            plugins: ["@babel/plugin-syntax-jsx", transform],
            babelrc: false,
            compact: true,
        });

        expect(result?.code).toBe(
            `const Hello=()=>{return hyper("div");};export default Hello;`
        );
    });
});
