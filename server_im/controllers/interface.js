const ednService = require('../services/fetch.edn');
const errorCode = require('./error.code');

exports.login = async (ctx) => {

    const params = ctx.request.body || {};
    let rs = await ednService.login(ctx, params);

    if (!rs) {
        rs = errorCode.create(1001);
    } else if (typeof rs === 'string') {
        rs = JSON.parse(rs);
    }
    let ret = {};
    if (rs.result_code === '0000') {
        ctx.session.userinfo = rs.result_data.data;
        ret.result = 'success';
    } else {
        ret.result = 'fail';
        ret.msg = rs.result_msg;
    }

    ctx.body = ret;
};

exports.logout = async (ctx) => {
    ctx.session = null;
    ctx.body = {
        result: 'success'
    };
};