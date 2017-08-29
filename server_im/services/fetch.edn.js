
const endModel = require('../models/fetch.edn');

const edn = {
    async login(ctx, params) {
        const username = params.username;
        const password = params.password;
        if(!username||!password){
            return null;
        }
        let rs = await endModel.fetch('http://www.exmobi.cn/interface/mbuilder2/login', ctx, JSON.stringify({
                "edn_account": params.username,
                "edn_pwd": params.password,
            }));
        return rs;
    }
}

module.exports = edn;