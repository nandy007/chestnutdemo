
const WeixinWork = require('../../utils/WeixinWork');

const WeixinWorkCrypto = require('../../utils/WeixinWorkCrypto');

const wxconfig = require('../../weixinwork-config.json');

const errorCode = require('../error.code');

let weixin;
const getWeixin = function (corpInfo) {
    if (weixin) return weixin;
    weixin = new WeixinWork(corpInfo.corpid);
    ['oa', 'contact'].forEach(function (item, i) {
        weixin.addApp(item, corpInfo[item]);
    });
    return weixin;
};


module.exports = {
    async common(ctx) {
        const params = ctx.params,
            keyid = params.keyid,
            appid = params.appid,
            url = params[0];

        const query = ctx.query || {}, body = ctx.request.body || {};

        let corpInfo = wxconfig[keyid], appInfo;

        if (!corpInfo || !url || !(appInfo = corpInfo[appid])) {
            ctx.body = errorCode.create(1000);
        } else {
            const files = ctx.request.files, res = ctx.res;
            const method = ctx.method.toLowerCase();
            const weixin = getWeixin(corpInfo);
            await weixin.fetch({
                method, url, appid, query, body, files, res
            }).then(function (rs) {
                ctx.body = rs;
            }).catch(function () {
                ctx.body = errorCode.create();
            });
        }
    },
    async message(ctx) {
        const { msg_signature, timestamp, nonce, echostr } = ctx.query;
        const corpInfo = wxconfig['fiberhome'],
            corpid = corpInfo.corpid,
            token = corpInfo.token,
            encodingAESKey = corpInfo.encodingAESKey,
            msgXML = ctx.request.body;

        const wxworkCrypto = new WeixinWorkCrypto(corpid, token, encodingAESKey);

        if (echostr) {
            var rs = wxworkCrypto.decrypt(echostr);
            ctx.body = rs;
        } else {
            await wxworkCrypto.decryptMsg(msg_signature, timestamp, nonce, msgXML)
                .then(function (rs) {
                    var decrypt = rs.decrypt, decryptMsg = decrypt.toJSON();
                    /*var replyMsg = wxworkCrypto.encryptMsg({
                        ToUserName: decryptMsg.FromUserName,
                        FromUserName: decryptMsg.ToUserName,
                        CreateTime: new Date().getTime(),
                        MsgType: 'text',
                        Content: '欢迎你'
                    }).toString();
                    ctx.res.setHeader('Content-Type', 'application/xml');
                    ctx.body = replyMsg;
                    console.log(replyMsg);*/
                    const weixin = getWeixin(corpInfo);
                    
                    weixin.fetch({
                        method: 'post',
                        url: 'message/send',
                        appid: weixin.getAppId(rs.AgentID),
                        query: {},
                        body: {
                            "touser": decryptMsg.FromUserName,
                            "msgtype": "text",
                            "agentid": rs.AgentID,
                            "text": {
                                "content": [0,1,2,3,4,5,6,7,8,9][Math.floor(Math.random()*10)]+"欢迎您!"
                            },
                            "safe": 0
                        }
                    });

                    ctx.body = '';

                })
                .catch(function () {
                    ctx.body = errorCode.create();
                });
        }
    },
    async auth(ctx) {
        const code = ctx.query.code;
        const corpInfo = wxconfig['fiberhome'];
        const weixin = new WeixinWork(corpInfo.corpid);
        weixin.fetch({
            method: 'get',
            url: 'user/authsucc',
            appid: 'oa',
            query: { code: code },
            body: {}
        }).then(function (rs) {
            console.log(rs);
            ctx.body = '====';
        }).catch(function () {
            ctx.body = 'yes';
        });
    }
};