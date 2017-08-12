// 此规则需要自己定义
const rules = {
    session: function (ctx) {
        const hasData = ctx.session.hasData;
        if (!hasData) ctx.body = {
            result: 'fail',
            msg: '会话超时'
        };
        return hasData;
    }
};

module.exports = rules;