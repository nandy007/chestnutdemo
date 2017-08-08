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
    database: "test",
    user: "postgres",
    password: "111111"
  }
};

module.exports = {
  port: 3001,
  rootPath: path.join(__dirname),
  database: database/*,
  middleware: {
    sessionConfig: {
      key: 'SESSIONID',
      storeConfig: database.main, // session存储配置;
      cookie : {
        maxAge : 30 * 60 * 1000 //24 * 60 * 60 * 1000
      }
    }
  }*/

};