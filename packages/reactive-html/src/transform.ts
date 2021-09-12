import { declare } from "@babel/helper-plugin-utils";
import template from "@babel/template";
import generate from "@babel/generator";
import { NodePath, Binding } from "@babel/traverse";

import * as t from "@babel/types";

const buildHyper = template(`hyper(%%tag%%,%%children%%)`);
const buildArrowFunction = template(`(el) => {%%body%%}`);
const buildJSXText = template(`let node;
let inited = false;
createEffect(() => {
    if (!inited) {
        node = document.createTextNode(%%text%%);
    }
    node.nodeValue = %%text%%;
});
inited = true;
el.append(node);`);

const TagRef = new Set(["div", "p", "button"]);

function getTag(
    name: t.JSXIdentifier | t.JSXNamespacedName | t.JSXMemberExpression
): string {
    if (t.isJSXNamespacedName(name)) {
        // console.debug("[debug] isJSXNamespacedName", name);
        return name.name.name;
    }

    if (t.isJSXIdentifier(name)) {
        // console.debug("[debug] isJSXIdentifier", name);
        return name.name;
    }

    if (t.isJSXMemberExpression(name)) {
        // console.debug("[debug] isJSXMemberExpression", name);
        return generate(name).code;
    }

    throw new Error(`Can't get from ${name}`);
}

function isCreateSignal(path: NodePath<t.CallExpression>) {
    if (t.isIdentifier(path.node.callee)) {
        return path.node.callee.name === "createSignal";
    }
    return false;
}

// const [count,setCount] = createSignal(0);
// input path is createSignal CallExpression's path
// find count's reference
function findBinding(path: NodePath<t.CallExpression>): Binding | undefined {
    let binding: Binding | undefined;
    if (t.isVariableDeclarator(path.parent)) {
        if (t.isIdentifier(path.parent.id)) {
            binding = path.scope.getBinding(path.parent.id.name);
        }
        if (t.isArrayPattern(path.parent.id)) {
            if (t.isIdentifier(path.parent.id.elements[0])) {
                binding = path.scope.getBinding(
                    path.parent.id.elements[0].name
                );
            }
        }
    }
    return binding;
}

export default declare((api, options, dirname) => {
    return {
        visitor: {
            JSXElement: {
                exit: (path, pass) => {
                    console.debug(
                        "[debug] JSXElement",
                        generate(path.node).code
                    );

                    let tag = getTag(path.node.openingElement.name);

                    if (TagRef.has(tag)) {
                        tag = `"${tag}"`;
                    }

                    const children = path.node.children;

                    const statement = buildArrowFunction({
                        body: buildHyper({
                            tag: tag,
                            children: t.arrayExpression(
                                children
                                    .map((child) => {
                                        if (t.isJSXExpressionContainer(child)) {
                                            return child.expression;
                                        }

                                        return child;
                                    })
                                    .filter(
                                        (child): child is t.Expression =>
                                            !t.isJSXEmptyExpression(child) ||
                                            !t.isJSXSpreadChild(child) ||
                                            !t.isJSXText(child)
                                    )
                            ),
                        }),
                    });

                    path.replaceWith(statement as t.Statement);
                },
            },
            JSXText(path) {
                const nodeText = path.node.value;
                path.replaceWith(t.stringLiteral(nodeText));
            },
            CallExpression(path) {
                if (isCreateSignal(path)) {
                    console.log(
                        "test test CallExpression",
                        generate(path.node).code
                    );
                    const binding = findBinding(path);
                    
                    binding?.referencePaths.forEach((p) => {
                        console.log("test test ", generate(p.parent).code);
                    });
                }
            },
        },
    };
});
