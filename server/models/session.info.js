const config = require('../config');
const db = require('chestnut-utils').db(config.database.main);

const sessionInfo = {
    async getAllSession(){
        let rs = await db.query("select * from _mysql_session_store");
        return rs;
    }
};

module.exports = sessionInfo;