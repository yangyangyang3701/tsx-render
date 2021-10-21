# tsx-render

tsx-render 是一组实验室级别的库，目的是用于学习和研究。

# 包组织

-   主库 `corn` 。基于 `inversify` 用于导出成品 api。

    > 如 `corn-reactive` 中已经完成设计和编码的 createRoot，createEffect，createSignal，createDiffSignal。

-   辅助仓库 `corn-reactive`。提供响应式 api。

-   辅助仓库 `reactive-html`。使用 `corn` 中的 api 创建响应式的前端程序。

# 快速开始

-   安装依赖

    ```
    yarn
    ```

-   运行例子

```
cd examples/01-post
yarn start
```
