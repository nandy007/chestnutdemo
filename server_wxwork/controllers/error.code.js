const errorCode = {
    create : function(code){
        const info = errorCode[code]||errorCode['default'];
        return {
            errmsg : info.msg,
            errcode : code
        };
    },
    default : {
        msg : '未知错误'
    },
    1000 : {
        msg : '配置错误'
    }
};

module.exports = errorCode;