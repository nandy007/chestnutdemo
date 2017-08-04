const path = require('path');
const fs = require('fs');
module.exports = {
	"port" : 80,
	"rule" : "vhost",
	/*"sslPort" : 443,
	"sslkey" : fs.readFileSync('./privatekey.pem'),
	"sslCert" : fs.readFileSync('./certificate.pem'),*/
	"router": {
		"www.nandy.com": {
			"host": "localhost",
			"port": "3000"
		},
		"app1.nandy.com": {
			"host": "localhost",
			"port": "3001"
		},
		"app2.nandy.com": {
			"host": "localhost",
			"port": "3002"
		}
	}
};