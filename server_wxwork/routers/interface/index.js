
const router = require('chestnut-router').create('/interface');

const controller = require('../../controllers/interface');

module.exports = router
	.all('/auth', controller.auth)
	.all('/message', async function (ctx, next) {
		if (ctx.method === 'POST' && ctx.is('text/xml')) {
			await new Promise(function (resolve, reject) {
				try {
					let postdata = "";
					ctx.req.addListener("data", (data) => {
						postdata += data
					});
					ctx.req.addListener("end", function () {
						resolve(ctx.request.body = postdata);
					});
				} catch (err) {
					reject(err);
				}
			});

			await next();

		} else {
			await next();
		}


	}, controller.message)
	.all('/:keyid/:appid/(.*)', controller.common);