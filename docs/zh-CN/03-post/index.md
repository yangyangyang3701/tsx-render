# 编写 渲染器

JS -> DOM

上一节中我们成功的将 tsx 文件编译成了 js 文件。

这一节中，我们要尝试将控制 dom 渲染。

**dist/src/App.js**

```js
import { jsx as _jsx } from "02-post/jsx-runtime";
const list = ["a", "b", "c"];
const App = () => {
    return _jsx(
        "div",
        { children: list.map((i) => _jsx("div", { children: i }, i)) },
        void 0
    );
};
export default App;
```

**dist/src/index.js**

```js
import { jsx as _jsx } from "02-post/jsx-runtime";
import { render } from "02-post";
import App from "./App";
window.onload = () => {
    render(_jsx(App, {}, void 0), document.getElementById("App"));
};
```

## 核心函数编写

目前核心函数很少只有 **render** 和 **jsx**

### 函数类型

render 函数有两个参数

```ts
export type Render = (
    element: ReturnType<typeof jsx>,
    container: Element | null
) => {};
```

1. 第一个参数接受 jsx 函数的返回值。
2. 第二个参数为 html 元素。

jsx 函数有三个参数

```ts
export const jsx = (
    type: string | Function,
    config: { children?: any },
    key: any
): Element => {};
```

1. type 参数为 `string` 时，直接创建元素，`Function` 是另一个 jsx 函数。
2. config 有一个属性是 children，这个属性很重要，但是我们先给 any，在编写 jsx 函数时，我们再做具体完善。
3. key 这个参数我们暂时不考虑，先填 `any`。

jsx 返回值类型，我们暂时假设为 Element 类型，render 直接将 Element 附加到 container 节点上。

### 简单实现

**jsx-runtime.ts**

```ts
export namespace JSX {
    export interface IntrinsicElements {
        // HTML
        div: any;
    }
}

export const jsx = (
    type: string | Function,
    config: { children?: any },
    key: any
): Element => {
    if (typeof type === "string") {
        const el = document.createElement(type);
        return el;
    }
    return type();
};
```

**index.ts**

```ts
import { jsx } from "./jsx-runtime";

export type Render = (
    element: ReturnType<typeof jsx>,
    container: Element | null
) => void;

export const render: Render = (element, container) => {
    container?.appendChild(element);
};
```

目前的结构

```
.
├── dist
│   ├── index.d.ts
│   ├── index.js
│   ├── jsx-runtime.d.ts
│   ├── jsx-runtime.js
│   └── src
│       ├── App.d.ts
│       ├── App.js
│       ├── index.d.ts
│       └── index.js
├── index.ts
├── jsx-runtime.ts
├── node_modules
├── package.json
├── src
│   ├── App.tsx
│   └── index.tsx
└── tsconfig.json
```

完成这一步之后，我们的工程已经没有红色波浪，或者任何的 typescript 编译错误了。
下面一节我们将通过打包工具尝试运行我们的程序。
