const errorCode = {
    create : function(code){
        const info = errorCode[code]||errorCode['default'];
        return {
            result : 'fail',
            msg : info[code],
            error_code : code
        }
    },
    default : {
        msg : '未知错误'
    },
    1000 : {
        msg : '数据库错误'
    },
    1001 : {
        msg : '数据格式错误'
    },
    2001 : {
        msg : '群组操作失败'
    }
};

module.exports = errorCode;