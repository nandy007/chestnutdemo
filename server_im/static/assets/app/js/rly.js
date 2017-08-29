define(function () {
    return rlyUtil;
});

var rlyUtil = (function () {
    return {
        init: function (appid) {
            var resp = RL_YTX.init(appid);
            var ret = false;
            if (170002 == resp.code) {
                //缺少必要参数，详情见msg参数
                //用户逻辑处理
                $.ui.alert(resp.msg);
            } else if (174001 == resp.code) {
                //不支持HTML5，关闭页面
                //用户逻辑处理
                $.ui.alert(resp.msg);
            } else if (200 == resp.code) {
                //初始化成功
                //用户逻辑处理
                //判断不支持的功能，屏蔽页面展示
                ret = resp.unsupport;
            }
            return ret;
        },
        doLogin: function (userinfo, cb) {
            //账号登录参数设置
            var loginBuilder = new RL_YTX.LoginBuilder();
            loginBuilder.setType(1);//登录类型 1账号登录，3voip账号密码登录
            loginBuilder.setUserName(userinfo.user_id);//设置用户名
            //loginBuilder.setPwd();//type值为1时，密码可以不赋值
            loginBuilder.setSig(userinfo.rly.sig);//设置sig
            loginBuilder.setTimestamp(userinfo.rly.timestamp);//设置时间戳
            //执行用户登录
            RL_YTX.login(loginBuilder, function (obj) {
                // 更新个人信息
                var uploadPersonInfoBuilder = new RL_YTX.UploadPersonInfoBuilder();
                uploadPersonInfoBuilder.setNickName(userinfo.nickName);
                RL_YTX.uploadPersonInfo(uploadPersonInfoBuilder, function () {
                    //console.log('更新个人信息成功');
                }, function () {
                    //console.log('更新个人信息失败');
                });
                //登录成功回调
                cb.doLogin && cb.doLogin(obj);
                //收到普通消息事件监听
                RL_YTX.onMsgReceiveListener(function (obj) {
                    console.log(obj);
                    //收到push消息或者离线消息或判断输入状态
                    //如果obj.msgType==12  判断obj.msgDomainn的值
                    //obj.msgDomain 0 无输入状态  1 正在输入  2 正在录音
                    if (obj.msgType === 12) {
                        return;
                    }
                    obj.msgType = rlyUtil.type.getByType(obj.msgType);
                    obj.msgFileName = obj.msgFileName;
                    cb.doMsgReceive && cb.doMsgReceive(obj);
                });
                //注册群组通知事件监听
                RL_YTX.onNoticeReceiveListener(function (obj) {
                    //console.log(obj);
                    var msgContent = rlyUtil.getMsgContent(obj);
                    //收到群组通知 
                    var theObj = {
                        msgType: 'text',
                        msgContent: msgContent,
                        msgSender: obj.member || obj.admin,
                        msgReceiver: obj.groupId,
                        msgId: obj.msgId,
                        senderNickName: obj.memberName || obj.adminName,
                        receiveNickName: obj.groupName,
                        auditType: obj.auditType,
                        admin: obj.admin
                    };
                    //console.log(theObj);
                    cb.doNoticeReceive && cb.doNoticeReceive(theObj);
                });
                RL_YTX.onConnectStateChangeLisenter(function (obj) {
                    //连接状态变更
                    // obj.code;//变更状态 1 断开连接 2 重连中 3 重连成功 4 被踢下线 5 断开连接，需重新登录
                    // 断线需要人工重连
                    cb.doConnectStateChange && cb.doConnectStateChange(obj);
                });
            }, function (obj) {
                //登录失败方法回调
                console.log('登录rly失败');
                $.ui.alert('登录失败', function () {
                    mainUtil.doLogout();
                });
            })
        },
        doLogout: function (cb) {
            RL_YTX.logout(function () {
                //登出成功处理
                cb && cb(true);
            }, function (obj) {
                //登出失败处理
                cb && cb(false);
            });
        },
        getMsgContent: function (obj) {
            var auditType = obj.auditType, member = obj.admin || obj.member, memberName = obj.adminName || obj.memberName;
            //1,(1申请加入群组，2邀请加入群组，3直接加入群组，4解散群组，5退出群组，6踢出群组，7确认申请加入，8确认邀请结果，10管理员修改群组信息，11用户修改群组成员名片)
            switch (auditType) {
                case '2':
                case '3':
                    return memberName + '被邀请加入群组';
                case '4':
                    return '群组已解散';
                case '5':
                    return memberName + '退出群组';
                case '6':
                    return memberName + '被踢出群组';
                case '8':
                    return memberName + '加入群组';

                default:
                    return null;
            }
        },
        S4: function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        guid: function () {
            var S4 = this.S4;
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        },
        sendMsg: function (msgObj, cb) {
            msgObj.msgId = this.guid();
            msgObj.msgDateCreated = new Date().getTime();
            //新建消息体对象
            var obj = new RL_YTX.MsgBuilder();
            //设置自定义消息id
            obj.setId(msgObj.msgId);
            //假设页面存在一个id为file的<input type=”file”>元素 
            //获取图片或附件对象
            //var file = document.getElementById("file").files[0];
            //设置图片或附件对象
            if (msgObj.file) obj.setFile(msgObj.file);
            //设置发送的文本内容
            if (msgObj.text) obj.setText(msgObj.text);
            //设置发送的消息类型1文本消息4 图片消息6 附件消息
            //发送非文本消息时，text字段将被忽略，发送文本消息时 file字段将被忽略
            obj.setType(this.type.get(msgObj.msgType));
            //设置接收者
            obj.setReceiver(msgObj.receiver);

            RL_YTX.sendMsg(obj, function (obj) {
                //发送消息成功
                //处理用户逻辑，通知页面
                msgObj.msgFileUrl = obj.fileUrl;
                $.extend(msgObj, obj);
                cb && cb(msgObj);
            }, function (obj) {//失败
                //发送消息失败
                //处理用户逻辑，通知页面刷新，展现重发按钮
                cb && cb(null);
            }, function (sended, total) {
                //发送图片或附件时的进度条
                //如果发送文本消息，可以不传该参数
            });

        },
        type: {
            text: 1,
            picture: 4,
            attachment: 6,
            get: function (type) {
                return this[type] || this['text'];
            },
            getByType: function (type) {
                for (var k in this) {
                    var _type = this[k];
                    if (typeof _type === 'function') continue;
                    if (_type === type) {
                        return k;
                    }
                }
                return type;
            }
        },
        createGroup: function (config, cb) {
            //新建创建群组对象
            var obj = new RL_YTX.CreateGroupBuilder();
            //设置群组名称
            obj.setGroupName(config.groupName);
            //设置群组公告
            obj.setDeclared(config.declared);
            // 设置群组类型，如：1临时群组（100人）
            obj.setScope(1);
            // 设置群组验证权限，如：需要身份验证2
            obj.setPermission(2);
            //设置为讨论组 该字段默认为2 表示群组，创建讨论组时设置为1
            obj.setTarget(2);
            //发送消息
            RL_YTX.createGroup(obj, function (obj) {
                //获取新建群组id
                var groupId = obj.data;
                //更新页面
                cb && cb(groupId);
            }, function (obj) {
                //创建群组失败
                cb && cb(null);
            });
        },
        inviteJoinGroup: function (config, cb) {
            var builder = new RL_YTX.InviteJoinGroupBuilder();
            builder.setGroupId(config.id);
            builder.setMembers(config.users);
            //是否需要对方确认（1不需要直接加入，2需要）
            var confirm = 1;
            builder.setConfirm(confirm);
            //发送邀请
            RL_YTX.inviteJoinGroup(builder, function () {
                //邀请成功
                if (confirm == 1) {
                    //更新页面群组成员列表
                }

                cb && cb(confirm);
                //等待被邀请者同意
            }, function (obj) {
                //邀请成员失败
                cb && cb(false);
            })

        },
        getGroupMembers: function (groupId, cb) {
            //新建获取群组成员列表请求对象
            var obj = new RL_YTX.GetGroupMemberListBuilder();
            //设置群组id
            obj.setGroupId(groupId);
            //该接口为分页接口，如果要获取全部数据，设置pageSize为-1
            obj.setPageSize(-1);
            //发送请求
            RL_YTX.getGroupMemberList(obj, function (obj) {
                //成功获取数据，更新页面
                cb && cb(obj);
            }, function (obj) {
                //获取数据失败
                cb && cb(null);
            });
        },
        quitGroup: function (groupId, cb) {
            //新建退出群组请求对象
            var obj = new RL_YTX.QuitGroupBuilder();
            //设置群组id
            obj.setGroupId(groupId);
            //发送请求
            RL_YTX.quitGroup(obj, function () {
                //退出群组成功
                //更新页面
                cb && cb(true, groupId);
            }, function (obj) {
                //退出群组失败
                cb && cb(false, groupId);
            });
        },
        dismissGroup: function (groupId, cb) {
            var obj = new RL_YTX.DismissGroupBuilder();
            obj.setGroupId(groupId);
            RL_YTX.dismissGroup(obj, function () {
                //解散成功,更新页面
                cb && cb(true);
            }, function (obj) {
                //解散失败
                cb && cb(false);
            });

        },
        deleteGroupMember: function (config, cb) {
            //构建踢出用户请求对象
            var builder = new RL_YTX.DeleteGroupMemberBuilder();
            builder.setGroupId(config.groupId);
            builder.setMemberId(config.member);
            RL_YTX.deleteGroupMember(builder, function () {
                //踢出成功
                cb && cb(true);
            }, function (obj) {
                //踢出失败
                cb && cb(false);
            });

        }
    };
})();