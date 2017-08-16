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
  port: 3011,
  rootPath: path.join(__dirname),
  database: database/*,
  // 此处没配置sessionConfig使用默认存储，但是建议配置，请事先准备一个mysql数据库
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