

const routerUtil = require('chestnut-router');
// 这一部分的路由不使用过滤器
const router = routerUtil.create('/interface');// 代表父目录为/interface
// const router = routerUtil.create('/interface', ['seesion']);// 加第二个参数就代表全部走一个过滤规则
const interface = require('../controllers/interface');

module.exports = router
  .post('/login', interface.login)
  .get('/logout', interface.logout);