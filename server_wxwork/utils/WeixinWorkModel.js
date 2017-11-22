var WeixinWorkModel = {
    'get': function(name, params){
        var entry = WeixinWorkModel[name];
        if(!entry) return params;
        var ps = {}, entryps = entry.params;
        params = params || {};
        for(var k in entryps){
            ps[k] = typeof params[k]==='undefined' ? entryps[k] : params[k];
        }
        return {
            url: entry.url,
            params: ps
        };
    },
    'gettoken': {
        url : 'gettoken',
        params: {
            corpid: null,
            corpsecret: null
        }
    }
};

module.exports = WeixinWorkModel;