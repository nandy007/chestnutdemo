module.exports = {
	"port" : "3000",
	"rule" : "roundrobin",
	"servers":[
		{
			"host":"localhost",
			"port":"3001"
		},
		{
			"host":"localhost",
			"port":"3002"
		}
	]
};