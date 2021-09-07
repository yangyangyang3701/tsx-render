import { declare } from "@babel/helper-plugin-utils";

const transformPlugin = declare((api, options, dirname) => {
    return {
        visitor: {
            JSXElement: () => {},
        },
    };
});

export default transformPlugin;
