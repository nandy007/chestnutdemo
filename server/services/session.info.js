const sessionInfoModel = require('../models/session.info');
const sessionInfo = {
    async getSessionInfo(){
        let rs = await sessionInfoModel.getAllSession();
        return rs;
    }
};

module.exports = sessionInfo;