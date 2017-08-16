const app = require('chestnut-app');
const config = require('./config');
app.init(config);

var server = require('http').createServer(app.callback());

var io = require('socket.io')(server);
io.on('connection', function (client) {
  console.log('已连接');
  client.on('login', function (data, cb) {
    console.log(data);
    cb({ result: 'success' });
  });
  client.on('message', function (data) {
    client.emit('message', data);
  });
  client.on('disconnect', function () {
    console.log('断开连接');
  });
});

server.listen(config.port);
console.log(`已启动服务器${config.port}`);