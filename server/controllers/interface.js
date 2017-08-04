const ednService = require('../services/fetch.edn');
const sessionInfoService = require('../services/session.info');
const errorCode = require('./error.code');

exports.login = async (ctx) => {
    const params = ctx.request.body||{};
    let rs = await ednService.login(ctx, params);
    if(!rs){
        rs = errorCode.create(1001);
    }else if(typeof rs === 'string'){
        rs = JSON.parse(rs);
    }

    if(rs.result==='success'){
        ctx.session.username = params.username
    }

    ctx.body = rs;
};

exports.logout = async (ctx) => {
    ctx.session = null;
    ctx.body = {
        result : 'success'
    };
};

exports.sessionInfo = async (ctx) => {
    let rs = await sessionInfoService.getSessionInfo();
    ctx.body = rs.error?errorCode.create(1000):{
        result : 'success',
        data : {
            list : rs,
            username : ctx.session.username
        }
    };
};