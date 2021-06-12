# 大象放进冰箱分几步？

答：三步，把冰箱门打开，大象塞进去，关上冰箱门

这个问题看起来可能有些奇怪，但是我们如果想要渲染 TSX 分几步呢？

我们也可以把它分为的三步。

-   编译 TSX
    > TSX -> JS
-   编写 渲染器
    > JS -> DOM
-   执行
    > DOM -> VIEW

这样这个问题就简单多了，复杂的问题被分割。然后我们再依次解决每一个问题（分治法）。

# 前置知识

-   yarn workspace
-   jsx，typescript，tsx 基础语法
-   webpack 的使用

> 由于需要做一些 module 的导入，所以我们需要使用 yarn workspace。你可以按照如下工程目录创建

```
.
├── docs
├── examples
│   ├── 01-post
│   ├── 02-post
│   └── 03-post
├── package.json
└── yarn.lock
```

**package.json**

```json
{
    "private": true,
    "workspaces": ["examples/*"],
    "version": "1.0.0",
    "license": "ISC",
    "devDependencies": {
        "typescript": "^4.3.2"
    }
}
```
