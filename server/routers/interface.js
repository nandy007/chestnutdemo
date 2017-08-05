

const routerUtil = require('chestnut-router');
const router = routerUtil.create('/interface');// 代表父目录为/interface
// const router = routerUtil.create('/interface', ['seesion']);// 加第二个参数就代表全部走一个过滤规则
const interface = require('../controllers/interface');

module.exports = router
  .post('/login', interface.login)
  .get('/logout', interface.logout)
  .get('/session-info', routerUtil.excuteFiters(['session']), interface.sessionInfo);//使用自定义过滤器session