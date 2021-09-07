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
        node = document.createTextNode(name());
    }
    node.nodeValue = name();
});
inited = true;
el.append(node);`);

const TagRef = ["div"];

function getTag(
    name: t.JSXIdentifier | t.JSXNamespacedName | t.JSXMemberExpression
): string {
    if (t.isJSXNamespacedName(name)) {
        console.debug("[debug] isJSXNamespacedName", name);
        return name.name.name;
    }

    if (t.isJSXIdentifier(name)) {
        console.debug("[debug] isJSXIdentifier", name);
        return name.name;
    }

    if (t.isJSXMemberExpression(name)) {
        console.debug("[debug] isJSXMemberExpression", name);
        return generate(name).code;
    }

    throw new Error(`Can't get from ${name}`);
}

export default declare((api, options, dirname) => {
    return {
        visitor: {
            JSXElement: (path) => {
                path.node.openingElement.name;
                let tag = getTag(path.node.openingElement.name);

                if (TagRef.includes(tag)) {
                    tag = `"${tag}"`;
                }

                const statement = buildHyper({
                    tag: tag,
                    children: undefined,
                });

                path.replaceWith(statement as t.Statement);
            },
        },
    };
});
