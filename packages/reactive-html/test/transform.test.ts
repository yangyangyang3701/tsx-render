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
});
