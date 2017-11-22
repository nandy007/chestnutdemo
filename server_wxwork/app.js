// 引入chestnut-app模块，其为一个继承了Koa的实例化对象
const app = require('chestnut-app');

// 引入config配置文件，app启动需要的配置都在里面
const config = require('./config');

// 引入chestnut-router模块，可以添加路由和过滤器，这里是添加过滤器
const router = require('chestnut-router');
// 定义过滤器规则
const filters = require('./filters/router.filters');
// 将过滤器添加到路由规则里
router.addFilters(filters);
/*app.use(async function (ctx, next) {
    //if (ctx.method === 'POST' && ctx.is('text/xml')) {
    if(ctx.path==='/interface/message'){
        await new Promise(function (resolve, reject) {
            try {
                let postdata = "";
                ctx.req.addListener("data", (data) => {
                    postdata += data
                });
                ctx.req.addListener("end", function () {
                    resolve(ctx.request.body = postdata);
                });
            } catch (err) {
                reject(err);
            }
        });

        await next();

    } else {
        await next();
    }


});*/
// 统一跨域设置
app.use(filters.crossdomain.handler);

// 启动
app.start(config);
