import { transformSync } from "@babel/core";

const HelloStory = `const Hello = () => {
    return <div></div>;
};

export default Hello;
`;

describe("transform", () => {
    test("syntax-jsx", () => {
        const result = transformSync(HelloStory, {
            plugins: ["@babel/plugin-syntax-jsx"],
            babelrc: false,
            compact: true,
        });
        expect(result?.code).toBe(
            `const Hello=()=>{return<div></div>;};export default Hello;`
        );
    });
});
