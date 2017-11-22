const path = require('path');
const database = {
  main: {
    id: 'main',
    type: 'mysql',
    database: 'test',
    user: 'root',
    password: 'root',
    port: '3306',
    host: 'localhost'
  },
  pg: {
    id: 'pg',
    type: "pgsql",
    host: "192.168.160.68",
    port: "5432",
    database: "ednnew",
    user: "postgres",
    password: "FHuma025"
  }
};

module.exports = {
  port: 3001,
  rootPath: path.join(__dirname),
  database: database,
  middleware: {
    sessionConfig: {
      key: 'SESSIONID',
      storeConfig: database.main // session存储配置;
    },
    staticPath: path.join(__dirname, './public')
  },
  rule: function (options) {
    return function (req, res, proxy, app) {
      console.log(req.url);
      console.log(app.callback);
      app.callback()(req, res);

      // 通过代理指向分配的服务器
      //proxy.web(req, res, opts);
    };
  }
};