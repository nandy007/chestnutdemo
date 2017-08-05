let cache = {};

const getClientIp = function (req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
};


module.exports = {
	"port": "3000",
	"rule": function (options) {
		return function (req, res, proxy) {
			const ip = getClientIp(req);
			console.log(ip);
			proxy.web(req, res, { target: 'http://127.0.0.1:3001' });
		}
	}
};