const app = require('chestnut-app');

const config = require('./config');

// 定义自己的static目录，默认的公共的static仍然在外层生效
const koaStatic = require('koa-static');
app.use(koaStatic(
    './static'
));

const router = require('chestnut-router');
const filters = require('./filters/router.filters');
router.addFilters(filters);

app.start(config);