const fetch = require('chestnut-utils').fetch;

const edn = {
    async fetch(url, ctx, params) {

        let rs = await fetch(url, {
            ctx: ctx,
            requestId: 'edn',
            method: params?'post':'get',
            form : params
        });
        if(rs.error){
            rs.body = {
                result : 'fail',
                msg : '请求错误'
            }
        }
        return rs.body;
    }
};

module.exports = edn;