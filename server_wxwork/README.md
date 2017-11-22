# agileui模板说明

此模板默认包含：agile-ui、agile-vm和aui-component框架用于组件化的mvvm模式开发。

项目以webpack开发和打包。

## 目录结构说明

资源构建目录位于public/build目录下

app目录：应用代码目录，组件、js等需要webpack打包的资源均放置在此目录

app/components目录：存放aui组件文件的目录，aui组件在此目录开发

public目录：webpack-dev-hot静态目录

public/index.html文件：为开发版入口文件

public/build目录：为webpack构建资源保存的目录，文件名为bundle.js


如有必要请修改webpack.config.js文件进行个性化配置

