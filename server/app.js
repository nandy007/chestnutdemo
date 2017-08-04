const app = require('chestnut-app');

const config = require('./config');

const router = require('chestnut-router');
const filters = require('./filters/router.filters');
router.addFilters(filters);

app.start(config);