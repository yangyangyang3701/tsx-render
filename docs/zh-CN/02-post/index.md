# 编译 TSX

TSX -> JS

> TSX 只是 JSX 类型增强

为什么我选择做 TSX 的渲染器，而不是 JSX 的渲染器，主要原因是编译 TSX 和编译 JSX 的方式不同，另外在 typescript 类型的约束下，可以更好的学习 JSX 语法。

## 新建工程

为了便于编译 TSX，和观察生成的 JS 代码，我们新建一个工程（可以参考 example/02-post）

我们需要

-   typescript
-   @types/react
-   @types/react-dom

> 为什么不需要 react，react-dom 包呢？  
> 因为我们只需要 typescript 把 TSX 编译为 JS 即可，不需要实际运行

目录结构（由 tree 命令生成）

```
.
├── package.json
├── src
│   ├── App.tsx
│   └── index.tsx
└── tsconfig.json
```

**package.json**

```json
{
    "name": "02-post",
    "scripts": {
        "build": "tsc"
    },
    "devDependencies": {
        "@types/react": "^17.0.9",
        "@types/react-dom": "^17.0.6",
        "typescript": "^4.3.2"
    }
}
```

**src/index.tsx**

```tsx
import { render } from "react-dom";
import App from "./App";

window.onload = () => {
    render(<App />, document.getElementById("App"));
};
```

**src/App.tsx**

```tsx
const list = ["a", "b", "c"];
const App = () => {
    return (
        <div>
            {list.map((i) => (
                <div key={i}>{i}</div>
            ))}
        </div>
    );
};

export default App;
```

**tsconfig.json**

```json
{
    "compilerOptions": {
        "outDir": "./dist",
        "declaration": true,
        "target": "es6",
        "module": "esnext",
        "moduleResolution": "node",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "jsx": "react-jsx"
    }
}
```

> tsconfig.json 中 jsx 属性我们使用 **react-jsx**

## 尝试编译

编译后目录结构如下（由 tree 命令生成）

```
.
├── dist
│   └── src
│       ├── App.d.ts
│       ├── App.js
│       ├── index.d.ts
│       └── index.js
├── node_modules
├── package.json
├── src
│   ├── App.tsx
│   └── index.tsx
└── tsconfig.json
```

观察编译后的结果 dist/src/index.js 和 dist/src/app.js。我们发现导入语句引入了 react 与 react-dom。

我们希望编译后的代码做一些调整，将引入的 react 替换为我们自己的包。

```js
import { jsx as _jsx } from "react/jsx-runtime";
// ->
import { jsx as _jsx } from "02-post/jsx-runtime";
```

将 react-dom 也替换成我们自己的包。这里需要导出一个 render 函数。

```js
import { render } from "readt-dom";
// ->
import { render } from "02-post";
```

## 调整配置，添加依赖

-   **调整配置**

    在 tsconfig.json 添加

    ```json
    {
        "compilerOptions": {
            "jsxImportSource": "02-post"
            ...
        }
        ...
    }
    ```

    **tsconfig.json**

    ```json
    {
        "compilerOptions": {
            "outDir": "./dist",
            "declaration": true,
            "target": "es6",
            "module": "esnext",
            "moduleResolution": "node",
            "strict": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
            "forceConsistentCasingInFileNames": true,
            "jsx": "react-jsx",
            "jsxImportSource": "02-post"
        }
    }
    ```

-   **添加依赖**

    新增 index.ts

    **index.ts**

    ```ts
    export const render = (type: any, config: any) => {};
    ```

    新增 jsx-runtime.tsx

    **jsx-runtime.ts**

    ```ts
    export namespace JSX {
        export interface IntrinsicElements {
            // HTML
            div: any;
        }
    }
    ```

    再次执行 yarn build，import 已经调整为我们想要的语句了。

-   **修改代码**

    修改 src/index.tsx

    ```ts
    import { render } from "react-dom";
    // ->
    import { render } from "02-post";
    ```

    **src/index.tsx**

    ```ts
    import { render } from "02-post";
    import App from "./App";
    window.onload = () => {
        render(<App />, document.getElementById("App"));
    };
    ```

## 再次编译

编译后目录结构如下（由 tree 命令生成）

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

这时候我们已经生成了 tsx-render 的基础结构了
