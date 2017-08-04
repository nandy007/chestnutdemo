

const router = require('chestnut-router').create('/');// 代表父目录为/
const home = require('../controllers/home');

module.exports = router
  .get('/', home.index)
  .get('main', home.main);