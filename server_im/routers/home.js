
const routerUtil = require('chestnut-router');
const router = routerUtil.create('/');// 代表父目录为/
const home = require('../controllers/home');

module.exports = router
  .get('/', home.index)
  .get('main', routerUtil.excuteFiters(['sessionPage']), home.main);