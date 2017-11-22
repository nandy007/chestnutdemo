// 此规则需要自己定义
const rules = {
    crossdomain : {
        handler : async function(ctx, next){
            ctx.set('Access-Control-Allow-Origin', '*');
            if(next) await next();
        }
    }
};

module.exports = rules;