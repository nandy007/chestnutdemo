const router = require('chestnut-router').create('/');

const index = require('../controllers/index');

module.exports = router.get('/', index.index);