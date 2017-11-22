var crypto = require('crypto');
var xml2js = require('xml2js'), parseString = xml2js.parseString;

var WeixinWorkCrypto = function (corpid, token, encodingAESKey) {
    this.corpid = corpid;
    this.token = token;
    this.aesKey = new Buffer(encodingAESKey + '=', 'base64');
    this.iv = this.aesKey.slice(0, 16);
};

var wp = WeixinWorkCrypto.prototype;

wp.getSignature = function (timestamp, nonce, encrypt) {
    var rawSignature = [this.token, timestamp, nonce, encrypt].sort().join('');
    var sha1 = crypto.createHash("sha1");
    sha1.update(rawSignature);
    return sha1.digest("hex");
};


wp.decryptMsg = function (msgSignature, timestamp, nonce, msgXML) {
    var self = this;
    return new Promise(function (resolve, reject) {
        parseString(msgXML, function (err, result) {
            try {
                var data = result.xml, msgEncrypt = data.Encrypt[0];
                if (self.getSignature(timestamp, nonce, msgEncrypt) != msgSignature) return Promise.reject(null);
                var decryptedMessage = self.decrypt(msgEncrypt);
                parseString(decryptedMessage, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        var json = {
                            ToUserName: data.ToUserName[0],
                            AgentID: data.AgentID[0],
                            decrypt: {
                                toString: function () {
                                    return decryptedMessage;
                                },
                                toJSON: function () {
                                    var obj = {}, xmlObj = result.xml;
                                    for(var k in xmlObj){
                                        var v = xmlObj[k];
                                        obj[k] = v instanceof Array ? v[0] : v;
                                    }
                                    return obj;
                                }
                            }
                        };
                        resolve(json);
                    }
                });
            } catch (e) {
                console.log(e);
                reject(e);
            }

        });
    });
};

wp.encryptMsg = function (replyMsg, opts) {
    
    if(typeof replyMsg==='object'){
        var arr = ['<xml>'];
        for(var k in replyMsg){
            var msg = replyMsg[k];
            if(k.indexOf('Time')>-1){
                arr.push('<'+k+'>'+msg+'</'+k+'>');
            }else{
                arr.push('<'+k+'><![CDATA['+msg+']]></'+k+'>');
            }
        }
        arr.push('</xml>');
        replyMsg = arr.join('');
    }
    //console.log(replyMsg);
    var result = {};
    var options = opts || {};
    result.Encrypt = this.encrypt(replyMsg);
    result.Nonce = options.nonce || parseInt((Math.random() * 100000000000), 10);
    result.TimeStamp = options.timestamp || new Date().getTime();
    result.MsgSignature = this.getSignature(result.TimeStamp, result.Nonce, result.Encrypt);

    return {
        toString: function(){
            return [
                '<xml>',
                '<Encrypt><![CDATA['+result.Encrypt+']]></Encrypt>',
                '<MsgSignature><![CDATA['+result.MsgSignature+']]></MsgSignature>',
                '<TimeStamp>'+result.TimeStamp+'</TimeStamp>',
                '<Nonce><![CDATA['+result.Nonce+']]></Nonce>',
                '</xml>'
            ].join('');

        },
        toJSON: function(){
            return result;
        }
    };
};

wp.encrypt = function (xmlMsg) {
    var random16 = crypto.pseudoRandomBytes(16);
    var msg = new Buffer(xmlMsg);
    var msgLength = new Buffer(4);
    msgLength.writeUInt32BE(msg.length, 0);
    var corpId = new Buffer(this.corpid);
    var raw_msg = Buffer.concat([random16, msgLength, msg, corpId]);//randomString + msgLength + xmlMsg + this.corpID;
    //var encoded = WeixinWorkCrypto.PKCS7Encoder(raw_msg);
    var cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.iv);
    //cipher.setAutoPadding(false);
    var cipheredMsg = Buffer.concat([cipher.update(/*encoded*/raw_msg), cipher.final()]);
    return cipheredMsg.toString('base64');
};

wp.decrypt = function (str) {
    var aesCipher = crypto.createDecipheriv("aes-256-cbc", this.aesKey, this.iv);
    aesCipher.setAutoPadding(false);
    var decipheredBuff = Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]);
    decipheredBuff = WeixinWorkCrypto.PKCS7Decoder(decipheredBuff);
    var len_netOrder_corpid = decipheredBuff.slice(16);
    var msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
    //recoverNetworkBytesOrder(len_netOrder_corpid.slice(0, 4));
    var result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
    var corpid = len_netOrder_corpid.slice(msg_len + 4).toString();
    if (corpid != this.corpid) return null;
    return result;
};

WeixinWorkCrypto.PKCS7Decoder = function (buff) {
    var pad = buff[buff.length - 1];
    if (pad < 1 || pad > 32) {
        pad = 0;
    }
    return buff.slice(0, buff.length - pad);
};

WeixinWorkCrypto.PKCS7Encoder = function (buff) {
    var blockSize = 32;
    var strSize = buff.length;
    var amountToPad = blockSize - (strSize % blockSize);
    var pad = new Buffer(amountToPad - 1);
    pad.fill(String.fromCharCode(amountToPad));
    return Buffer.concat([buff, pad]);
};


module.exports = WeixinWorkCrypto;
