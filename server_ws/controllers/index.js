module.exports = {
    async index(ctx) {
        await ctx.render('index', {
            title : '首页'
        });
    }
};