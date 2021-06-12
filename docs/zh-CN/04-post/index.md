# 执行

DOM -> VIEW

这一节我们使用 webpack 作为我们的打包器。

## 打包运行

1. 添加依赖

    - html-webpack-plugin
    - ts-loader
    - typescript
    - webpack
    - webpack-cli

2. 修改 package.json

    添加 script

    ```json
    {

        "scripts": {
            "start": "webpack serve",
            ...
        },
        ...
    }
    ```

    **package.json**

    ```json
    {
        "name": "04-post",
        "version": "1.0.0",
        "scripts": {
            "start": "webpack serve",
            "build": "tsc"
        },
        "devDependencies": {
            "html-webpack-plugin": "^5.3.1",
            "ts-loader": "^9.2.3",
            "typescript": "^4.3.2",
            "webpack": "^5.38.1",
            "webpack-cli": "^4.7.2"
        }
    }
    ```

3. 配置 webconfig 配置
   **webpack.config.js**

    ```js
    const HtmlWebpackPlugin = require("html-webpack-plugin");
    const path = require("path");

    module.exports = {
        mode: "development",
        entry: "./src/index.tsx",
        output: {
            path: path.resolve(__dirname, "./dist"),
            filename: "index_bundle.js",
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./public/index.html",
            }),
        ],
    };
    ```

4. 添加 HTML 模板

    **public/index.html**

    ```html
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <title>Document</title>
        </head>
        <body>
            <div id="App"></div>
        </body>
    </html>
    ```

5. 运行
    ```
    yarn start
    ```
