const request = require('request'), fs = require('fs');


//https://qyapi.weixin.qq.com/cgi-bin/media/get?access_token=-53l9y1G5vAM1TfmfVx6JWkL5TCOs85_oxINtadrDnGw_g9E3RtBI4UmTK5tt8zPVS__fpRKNY3WRuHS5TDTJecQeuIy2v7hXTZTlI2QblGeuRAfrw1mGwNS-DO0cXXTN_odjgD5V1D2GPYkHyCgxC93csv8E8XsFzULhGIfcVHYOz9F_9BM3ajdK-2XQ51MjBJZjxUnRtQYQl2EWQbEUg&media_id=32vbIB1Ckq5W5A5cedvF2cFVupLuXuRaYCrzwHp0318fyLQ3UT_efdIZtExOa9djT
var fetch = function (method, url, opts, res) {

    return new Promise(function (resolve, reject) {
        var rs = request[method](fetch.formateUrl(url), opts, function (err, httpResponse, body) {
            if (err) {
                reject(err);
            } else {
                if(httpResponse.statusCode >= 400){
                    reject(null);
                }else if(res){
                    resolve(null);
                }else{
                    resolve(fetch.washResult(body));
                }
                
            }
        });
        if(res) rs.pipe(res);
    });
};

fetch.formateUrl = function (url) {
    if (url.indexOf('https') !== 0) {
        url = 'https://qyapi.weixin.qq.com/cgi-bin/' + url;
    }
    return url;
};

fetch.washResult = function (rs) {
    if (!rs) return null;
    try {
        if (typeof rs === 'string') {
            return JSON.parse(rs);
        }
    } catch (e) {
        console.log(e);
    }
    return rs;
};

fetch.get = function (options) {
    var url = options.url, params = options.params;
    var opts = {};
    if (params) {
        opts.useQuerystring = true;
        opts.qs = params;
    }
    return fetch('get', url, opts, options.res);
};

fetch.formateFiles = function (files, obj) {
    files = files || [];
    files.forEach(function (file) {
        var fieldname = file.fieldname;
        var fileObj = {
            value: fs.createReadStream(file.path),
            options: {
                filename: file.originalname,
                contentType: file.mimetype
            }
        };
        if (!obj[fieldname]) {
            obj[fieldname] = fileObj;
        } else if (obj[fieldname] instanceof Array) {
            obj[fieldname].push(fileObj);
        } else {
            obj[fieldname] = [obj[fieldname], fileObj];
        }
    });
};

fetch.post = function (options) {
    var url = options.url, params = options.params, files = options.files;
    var opts = {};
    if (files) {
        opts.formData = (function (params) {
            var obj = {};
            for (var k in params) {
                obj[k] = params[k];
            }
            return obj;
        })(params);
        fetch.formateFiles(files, opts.formData);
    } else if (params) {
        opts.body = params;
        opts.json = true;
    }

    return fetch('post', url, opts, options.res);
}

var WeixinWorkModel = require('./WeixinWorkModel');

var WeixinWorkMap = {};

var WeixinWork = function (corpid) {

    if (WeixinWorkMap[corpid]) return WeixinWorkMap[corpid];

    WeixinWorkMap[corpid] = this;

    this.corpid = corpid;
    this.apps = {};
};

var wp = WeixinWork.prototype;


// params = {agentId,secret}
wp.addApp = function (appId, params) {
    var apps = appId;
    if (params) {
        apps = {};
        apps[appId] = params;
    }
    for (var k in apps) {
        this.apps[k] = apps[k];
    }
};

wp.getAppInfo = function () {
    var temp = arguments[0], appId, appInfo;
    try {
        if (typeof temp === 'object') {
            appId = [temp.agentId, temp.secret].join('-');
            appInfo = this.apps[appId];
            if (!appInfo) {
                this.addApp(appId, temp);
            }
        } else {
            appId = temp;
        }
        if (!appInfo) appInfo = this.apps[appId];
    } catch (e) {
        console.log(e);
        return null;
    }

    return appInfo;
};

wp.validateToken = (appInfo) => {
    var tokenInfo = appInfo.token;
    if (!tokenInfo) return false;
    const start = tokenInfo.start;
    const cur = new Date().getTime();
    return (cur - start) / 1000 < tokenInfo.expires_in;
}

wp.getToken = function () {
    var appInfo = this.getAppInfo(arguments[0]);

    if (!appInfo) return Promise.reject(null);

    if (this.validateToken(appInfo)) return Promise.reject(appInfo.token);

    var agentId = appInfo.agentId, secret = appInfo.secret;

    var entry = WeixinWorkModel.get('gettoken', {
        corpid: this.corpid,
        corpsecret: secret
    });

    return fetch.get(entry).then(function (rs) {
        if (rs && rs.errcode === 0) {
            appInfo.token = rs;
        }
        return Promise.resolve(rs);
    });
};


/**
 * 
 {
    opts = {method, url, appid, query, body(post), files(multipart), res(pipe)}
 }
 */
wp.fetch = function (opts) {
    var _this = this;
    return this
        .getToken(opts.appid)
        .then(function (rs) {

            if(!rs) return Promise.reject(null);

            if (opts.url === 'gettoken') {
                return Promise.resolve(rs);
            }
            
            var token = rs && rs['access_token'], params = opts.query||{};
            params['access_token'] = token;
            if (opts.method === 'post') {
                opts.url += _this.addQuery(params);
                params = opts.body||{};
            }
            opts.params = params;
            return fetch[opts.method](opts);
        });
};

wp.addQuery = function (query) {
    var params = [];
    for (var k in query) {
        params.push(k + '=' + query[k]);
    }
    return '?' + params.join('&');
};

wp.destroy = function () {
    this.apps = {};
    delete WeixinWorkMap[this.corpid];
    this.corpid = null;
};

wp.getAppId = function(agentId){
    var apps = this.apps;
    for(var k in apps){
        if(apps[k].agentId===agentId) return k;
    }
    return null;
};


module.exports = WeixinWork;