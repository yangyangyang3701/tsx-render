import { declare } from "@babel/helper-plugin-utils";
import template from "@babel/template";
import generate from "@babel/generator";

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

const TagRef = new Set(["div", "p"]);

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

// function convertJSXIdentifier(node,parent){

// }

export default declare((api, options, dirname) => {
    return {
        visitor: {
            JSXElement: {
                exit: (path) => {
                    // console.debug("[debug] JSXElement", path);

                    let tag = getTag(path.node.openingElement.name);

                    if (TagRef.has(tag)) {
                        tag = `"${tag}"`;
                    }

                    const children = path.node.children;
                    if (t.isJSXExpressionContainer(children)) {
                    } else {
                    }

                    // child is t.JSXElement | t.JSXFragment
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
                        );

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
        },
    };
});
