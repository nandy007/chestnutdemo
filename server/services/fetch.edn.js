
const endModel = require('../models/fetch.edn');

const edn = {
    async login(ctx, params) {
        const username = params.username;
        const password = params.password;
        if(!username||!password){
            return null;
        }
        let rs = await endModel.fetch('https://auth.exmobi.cn/login?output=json', ctx, params);
        return rs;
    }
}

module.exports = edn;