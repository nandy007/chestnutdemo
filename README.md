# chestnutdemo 示例

基于[chestnut-app](https://github.com/nandy007/chestnut-app)的示例

同时需要依赖：[chestnut-router](https://github.com/nandy007/chestnut-router)、[chestnut-session](https://github.com/nandy007/chestnut-session)、[chestnut-utils](https://github.com/nandy007/chestnut-utils)模块

# 使用方法

## 下载和初始化

注：需要使用node 7.X、8.X以上版本，支持async await语法

请使用git clone或者下载zip包后解压得到chesynutdemo目录

使用命令行进入此目录，然后执行

```bash

npm install


```

## 修改配置文件

进入server目录修改config.js的database信息为真实的数据库信息

## 启动app

进入server目录，执行

```bash

node app.js


```

## 浏览器访问

在浏览器上访问http://127.0.0.1:3001即可访问



# 目录结构说明

## server目录

为一个基于chestnut-app的koa应用，其中routers（路由配置）、views（视图渲染）为固定目录不可改动；controllers（控制器）、services（service层控制），models（数据层控制）用于辅助控制分层，目录自定义。

访问过程为：routers -》 controllers+views -》 services -》 models

当需要测试负载均衡的时候可以copy一份server在同级目录修改config.js的port为3002或者其他值即可

## static目录

为静态资源目录，此目录也不可修改，默认是在应用根目录的上一级的static目录

## server_roundrobin

为采用roundrobin实验法实现的负载均衡示例


## server_vhost

为反向代理的示例