exports.index = async (ctx) => {
    const title = '首页';
    await ctx.render('index', {
        title
    });
};

exports.main = async (ctx) => {
    const title = '栗子在线';
    const userinfo = ctx.session.userinfo || {};
    await ctx.render('main', {
        title,
        userinfo
    });
};