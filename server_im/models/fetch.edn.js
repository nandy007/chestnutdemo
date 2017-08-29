const fetch = require('chestnut-utils').fetch;

const edn = {
    async fetch(url, ctx, params) {

        let rs = await fetch(url, {
            ctx: ctx,
            requestId: 'edn',
            method: params ? 'post' : 'get',
            headers: {
                "Content-Type": "application/json"
            },
            body: params
        });
        //console.log(rs);
        if (rs.error) {
            rs.body = {
                result: 'fail',
                msg: '请求错误'
            }
        }
        return rs.body;
    }
};

module.exports = edn;