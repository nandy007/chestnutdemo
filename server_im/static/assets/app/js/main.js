define(function () {
    mainUtil.init();
    return mainUtil;
});
var mainUtil = (function () {

    var AVATAR_PRE = 'https://www.exmobi.cn/interface/rlyim/getAvatar?voipId=';

    var EMOJI_SRC = 'assets/app/img/emoji/';

    var END_EVENT_NAME = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    
    userinfo.avata = AVATAR_PRE + userinfo.user_id;
    
    var obj = {
        userinfo: userinfo,
        theuser: {
            username: '',
            email: '',
            user_id: '',
            realname: '',
            mobile: '',
            avata: ''
        },
        groupinfo: {
            admin: '',
            groupId: '',
            groupName: '',
            members: [],
            doFilter: function (index, item) {
                item.avata = AVATAR_PRE + item.member;
            },
            delHandler: function (item) {
                var member = item.member;
                if (member === obj.userinfo.user_id) {
                    return $.ui.alert('不能将自己踢出群组');
                }
                var groupId = obj.groupinfo.groupId;
                imUtil.deleteGroupMember({
                    groupId: groupId,
                    member: member
                }, function (rs) {
                    mainUtil.getGroupMembers(groupId);
                });

            },
            doAdd: function () {
                mainUtil.doCheckPop();
                mainUtil.changeRole('#groupuser');
                mainUtil.groupSelect.init();
            },
            isActive: false,
            doDel: function () {
                var $el = $(this);
                if (obj.groupinfo.isActive) {
                    return obj.groupinfo.isActive = false;
                }
                if (obj.groupinfo.admin !== obj.userinfo.user_id) {
                    return $.ui.alert('您不是管理员无法删除人员');
                }

                obj.groupinfo.isActive = true;


            },
            doExit: function () {
                var groupId = obj.groupinfo.groupId;
                if (obj.groupinfo.admin === obj.userinfo.user_id) {
                    $.ui.confirm('您是管理员，确定解散该群吗？', function () {
                        mainUtil.doCheckPop();
                        imUtil.dismissGroup(groupId, function (rs) {
                            delete mainUtil.groupMembers[groupId];
                            mainUtil.addMsgGroupQueue({
                                method: 'remove',
                                item: {
                                    id: groupId
                                }
                            });
                        });
                    });
                } else {
                    $.ui.confirm('确定退出该群吗？', function () {
                        mainUtil.doCheckPop();
                        imUtil.quitGroup(groupId, function (rs, groupId) {
                            delete mainUtil.groupMembers[groupId];
                            mainUtil.addMsgGroupQueue({
                                method: 'remove',
                                item: {
                                    id: groupId
                                }
                            });
                        });
                    });
                }
            }
        },
        searchbar: {
            groupinfo: {
                groupName: '',
                declared: ''
            },
            __temp: '',
            get searchValue() {
                return obj.searchbar.__temp;
            },
            set searchValue(val) {
                obj.searchbar.__temp = val;
                obj.searchbar.searchPrompt = val || '搜索';
                obj.sidepanel.txlGroup.doFilters();
                mainUtil.changeRole('#txlpanel', '#txlBtn');
            },
            searchPrompt: '搜索',
            isSelected: false,
            selected: [],
            doCancel: function () {
                mainUtil.changeRole('#welcome');
            },
            doHide: function () {
                mainUtil.search.clearSelected();
                $('#txlpanel .listitem.active').removeClass('active');
            },
            doAdd: function () {
                if (mainUtil.search.isSelected) return;
                mainUtil.changeRole('#selectedarea', '#txlpanel', '#txlBtn');
                mainUtil.search.startSelected();
                mainUtil.panel.clearMsgActive();
            },
            doSelected: function () {
                mainUtil.search.doSelected();
            }
        },
        groupuser: {
            __temp: '',
            get searchValue() {
                return obj.groupuser.__temp;
            },
            set searchValue(val) {
                obj.groupuser.__temp = val;
                obj.groupuser.searchPrompt = val || '搜索';
                mainUtil.groupSelect.init(val);
            },
            searchPrompt: '搜索',
            unselected: [],
            selected: [],
            itemClick: function (item) {
                var $el = $(this);
                if ($el.hasClass('active')) {
                    for (var i = 0, len = obj.groupuser.selected.length; i < len; i++) {
                        var theItem = obj.groupuser.selected[i];
                        if (theItem.user_id === item.user_id) {
                            obj.groupuser.selected.splice(i, 1);
                            $el.removeClass('active');
                            break;
                        }
                    }
                    return;
                }

                if (item.status !== '1') {
                    return $.ui.alert('该用户尚未注册无法选择');
                }

                obj.groupuser.selected.push({
                    user_id: item.user_id,
                    realname: item.realname,
                    avata: AVATAR_PRE + item.user_id,
                    doRemove: function (index) {
                        obj.groupuser.selected.splice(index, 1);
                        $el.removeClass('active');
                    }
                });
                $el.addClass('active');

            },
            doSelected: function () {
                if (obj.groupuser.selected.length === 0) {
                    return $.ui.alert('请选择人员');
                }

                var users = [], groupId = obj.groupinfo.groupId;
                $.util.each(obj.groupuser.selected, function (index, item) {
                    users.push(item.user_id);
                });

                while (users.length > 0) {

                    imUtil.inviteJoinGroup({
                        id: groupId,
                        users: users.splice(0, users.length > 5 ? 5 : users.length)
                    }, function (confirm) {
                        if (!confirm) {
                            $.ui.alert('邀请人员失败');
                        }
                        if (users.length === 0) {
                            mainUtil.doCheckPop();
                            mainUtil.getGroupMembers(groupId);
                        }
                    });

                }
            },
            doCancel: function () {
                mainUtil.doCheckPop();
            }
        },
        commFunc: {
            showWelcome: function () {
                mainUtil.changeRole('#welcome');
                mainUtil.panel.clearMsgActive();
                mainUtil.doCheckPop();
            },
            showSetting: function () {
                mainUtil.removeStorage();
                $.ui.alert('记录已清空', function () {
                    mainUtil.doRefresh();
                });
            },
            doLogout: function () {
                mainUtil.doLogout();
            },
            doCheckPop: function () {
                mainUtil.doCheckPop();
            }
        },
        sidepanel: {
            txlGroup: {
                itemClick: function (item) {
                    var $el = $(this);
                    if (mainUtil.panel.clickType === 'selected') {
                        return mainUtil.search.doSelect($el, item);
                    }
                    return mainUtil.panel.chatTo($el, item);
                },
                doFilters: function (items) {
                    var group = obj.sidepanel.txlGroup;
                    $.util.each(items || [group.enterprise, group.expert, group.friend], function (i, arr) {
                        $.util.each(arr, function (index, item) {
                            mainUtil.search.doFilter(index, item);
                        });
                    });
                },
                enterprise: [],
                expert: [],
                friend: []
            },
            msgGroupClick: function (data) {
                mainUtil.showMsgGroup(data);
            },
            msgGroupFilter: function (index, item) {
                item.avata = AVATAR_PRE + item.id;
            },
            msgGroup: []
        },
        toolFunc: {
            showUserinfo: function (e, userinfo) {
                var x = event.clientX, y = event.clientY;
                $.extend(obj.theuser, userinfo);
                return mainUtil.changeActive(e, $('#userinfo').css({ left: x, top: y }));
            },
            showMenuList: function (e) {
                return mainUtil.changeActive(e, $('#menulist'));
            },
            changeMenu: function (id) {
                var $el = $(this), $target = $('#' + id);
                mainUtil.changeRole($el, $target);
            }
        },
        emoji: {
            getSrc: function (type) {
                return EMOJI_SRC + type + '.png';
            },
            doSelected: function (name) {
                var $el = $('#workbench .chatwin.active');
                var vm = $el.render(), myObj = vm.getData();
                myObj.msg = myObj.msg + mainUtil.chat.getContent(name);
                mainUtil.doCheckPop();
            },
            list: [
                { type: 'weixiao', name: '微笑' },
                { type: 'nanguo', name: '难过' },
                { type: 'se', name: '色' },
                { type: 'fadai', name: '发呆' },
                { type: 'cool', name: '酷' },
                { type: 'daku', name: '大哭' },
                { type: 'haixiu', name: '害羞' },

                { type: 'bizui', name: '闭嘴' },
                { type: 'shuijiao', name: '睡觉' },
                { type: 'ku', name: '哭' },
                { type: 'liuhan', name: '流汗' },
                { type: 'fanu', name: '发怒' },
                { type: 'zhayan', name: '眨眼' },
                { type: 'ziya', name: '龇牙' },

                { type: 'jingya', name: '惊讶' },
                { type: 'aoman', name: '傲慢' },
                { type: 'deyi', name: '得意' },
                { type: 'kelian', name: '可怜' },
                { type: 'baibai', name: '拜拜' },
                { type: 'kaixin', name: '开心' },
                { type: 'outu', name: '呕吐' },

                { type: 'fendou', name: '奋斗' },
                { type: 'huaixiao', name: '坏笑' },
                { type: 'ganga', name: '尴尬' },
                { type: 'jingxia', name: '惊吓' },
                { type: 'dahaqian', name: '打哈欠' },
                { type: 'baiyan', name: '白眼' },
                { type: 'bishi', name: '鄙视' },

                { type: 'chouyan', name: '抽烟' },
                { type: 'qiaotou', name: '敲头' },
                { type: 'qingqing', name: '亲亲' },
                { type: 'gongxi', name: '恭喜' },
                { type: 'jianxiao', name: '奸笑' },
                { type: 'maren', name: '骂人' },
                { type: 'qiu', name: '糗' },

                { type: 'shangxin', name: '伤心' },
                { type: 'shouweiqu', name: '受委屈' },
                { type: 'touxiao', name: '偷笑' },
                { type: 'wabikong', name: '挖鼻孔' },
                { type: 'weiqu', name: '委屈' },
                { type: 'wen', name: '问' },
                { type: 'cahan', name: '擦汗' },

                { type: 'zuohengheng', name: '左哼哼' },
                { type: 'youhengheng', name: '右哼哼' },
                { type: 'yun', name: '晕' },
                { type: 'daxiao', name: '大笑' },
                { type: 'xia', name: '吓' },
                { type: 'kun', name: '困' },
                { type: 'xu', name: '嘘' },

                { type: 'jiayou', name: '加油' },
                { type: 'qiang', name: '强' },
                { type: 'iloveyou', name: '我爱你' },
                { type: 'chajin', name: '差劲' },
                { type: 'no', name: 'No' },
                { type: 'ok', name: 'Ok' },
                { type: 'ruo', name: '弱' },

                { type: 'baoquan', name: '抱拳' },
                { type: 'woshou', name: '握手' },
                { type: 'yeah', name: 'Yeah' },
                { type: 'lai', name: '来' },
                { type: 'zhutou', name: '猪头' },
                { type: 'xin', name: '心' },
                { type: 'xinsui', name: '心碎' },

                { type: 'baobao', name: '抱抱' },
                { type: 'hongchun', name: '红唇' },
                { type: 'caidao', name: '菜刀' },
                { type: 'taiyang', name: '太阳' },
                { type: 'yewan', name: '夜晚' },
                { type: 'kulou', name: '骷髅' },
                { type: 'huaxiele', name: '花谢了' },

                { type: 'dangao', name: '蛋糕' },
                { type: 'kafei', name: '咖啡' },
                { type: 'zuqiu', name: '足球' },
                { type: 'kulou', name: '骷髅' },
                { type: 'xigua', name: '西瓜' },
                { type: 'zhadan', name: '炸弹' },
                { type: 'lanqiu', name: '篮球' },

                { type: 'liwu', name: '礼物' },
                { type: 'dabian', name: '大便' },
                { type: 'meigui', name: '玫瑰' },
                { type: 'mifan', name: '米饭' },
                { type: 'piaochong', name: '瓢虫' },
                { type: 'pijiu', name: '啤酒' },
                { type: 'shandian', name: '闪电' }
            ]
        }
    };

    return {
        init: function () {

            $('body').render(obj);

            $.req('https://www.exmobi.cn/interface/rlyim/getSig?access_token=' + userinfo.access_token,
                function (rs) {

                    mainUtil.initSidePanel();

                    mainUtil.getTxl(userinfo.access_token);

                    $.ajax({
                        url: 'https://www.exmobi.cn/interface/rlyim/register?status=1&access_token=' + userinfo.access_token
                    });

                    require(['app/js/im'], function () {
                        var ret = imUtil.init(rs.result_data.appid);
                        if (ret) {
                            userinfo.rly = rs.result_data;
                            userinfo.nickName = userinfo.realname || userinfo.username;
                            imUtil.doLogin(userinfo, mainUtil.im);
                        }
                    });
                },
                function () {
                    mainUtil.doLogout();
                }
            );
        },
        getTxl: function (token) {
            $.req('https://www.exmobi.cn/interface/rlyim/getMembers?access_token=' + token,
                function (data) {
                    var txlGroup = obj.sidepanel.txlGroup, result_data = data.result_data;
                    //txlGroup.enterprise.push.apply(txlGroup.enterprise, result_data.enterprise);
                    //txlGroup.expert.push.apply(txlGroup.expert, result_data.expert);
                    //txlGroup.friend.push.apply(txlGroup.friend, result_data.friend);
                    obj.sidepanel.txlGroup.doFilters([result_data.enterprise, result_data.expert, result_data.friend]);
                    txlGroup.enterprise = result_data.enterprise;
                    txlGroup.expert = result_data.expert;
                    txlGroup.friend = result_data.friend;
                }
            );

        },
        initSidePanel: function () {
            var msgGroup = this.getStorege();
            obj.sidepanel.msgGroup = msgGroup || [];
        },
        getKey: function (id) {
            return 'im-' + id;
        },
        version: '3',
        removeStorage: function () {
            var id = obj.userinfo.user_id, storage = window.localStorage, key = this.getKey(id);
            storage.setItem(key, null);
        },
        setStorage: function () {
            var msgGroup = obj.sidepanel.msgGroup;
            /*if (msgGroup.length === 0) {
                return;
            }*/
            var num = 30;
            for (var i = 0, len = msgGroup.length; i < len; i++) {
                var l = msgGroup[i].msgs.length;
                if (l > num) {
                    msgGroup[i].msgs.splice(0, l - num);
                }
            }
            var id = obj.userinfo.user_id, key = this.getKey(id);
            $.util.storage.set(key, { version: this.version, group: msgGroup });
        },
        getStorege: function () {
            var id = obj.userinfo.user_id, key = this.getKey(id);
            var imInfo = $.util.storage.get(key);
            if (!imInfo) return null;
            if (typeof imInfo.version === 'undefined' || imInfo.version !== this.version) {
                this.removeStorage();
                return null;
            }
            if (imInfo.group instanceof Array) {
                return imInfo.group;
            }
            return null;
        },
        addMsg: function (item, data) {
            if (!item.msgs) item.msgs = [];
            /*while(item.msgs.length>29){
                item.msgs.shift();
            }*/
            if (data.msgFileUrl) data.msgContent = data.msgFileUrl;
            item.msgs.push(data);
        },
        addMsgGroup: function (item, tips) {
            mainUtil.panel.setTips(item, tips || 0);
            obj.sidepanel.msgGroup.unshift(item);
        },
        msgQueue: [],
        msgQueenHanlder: false,
        handlerMsgQueue: function (isDo) {
            if (!isDo && this.msgQueenHanlder) {
                return;
            }
            var queueItem = this.msgQueue.shift();
            if (!queueItem) {
                return this.msgQueenHanlder = false;
            }
            this.msgQueenHanlder = true;

            var item = queueItem.item, data = queueItem.data;

            if (!item.msgs) item.msgs = [];

            if (!item.admin && data.admin) {
                item.admin = data.admin;
            }

            item.msgs.push(data);

            if (data.msgSender !== obj.userinfo.user_id) {
                this.panel.setTips(item, (item.tips || 0) + 1);
            }

            queueItem.cb && queueItem.cb(item);

            this.handlerMsgQueue(true);

        },
        addMsgQueue: function (msgObj, cb) {
            //item, data
            var data = msgObj.data;
            if (data.msgFileUrl) data.msgContent = data.msgFileUrl;
            if (cb) msgObj.cb = cb;
            if (!data.msgContent) {
                return msgObj.cb && msgObj.cb(msgObj.item || msgObj.data);
            }

            this.msgQueue.push(msgObj);
            this.handlerMsgQueue();
        },
        msgGroupQueen: [],
        msgGroupQueenHanlder: false,
        handlerMsgGroupQueue: function (isDo) {
            //console.log(isDo, this.msgGroupQueenHanlder, JSON.stringify(this.msgGroupQueen));
            if (!isDo && this.msgGroupQueenHanlder) {
                return;
            }
            var queueItem = this.msgGroupQueen.shift();
            if (!queueItem) {
                return this.msgGroupQueenHanlder = false;
            }
            this.msgGroupQueenHanlder = true;

            var item = queueItem.item;
            var i = 0, msgGroup = obj.sidepanel.msgGroup, theItem;
            //console.log(JSON.stringify(msgGroup), JSON.stringify(item));
            for (len = msgGroup.length; i < len; i++) {
                var msgItem = msgGroup[i];
                if (msgItem.id === item.id) {
                    theItem = msgItem;
                    break;
                }
            }

            if (queueItem.method === 'remove') {
                if (theItem) {
                    msgGroup.splice(i, 1);
                    /*var $el = $('#msg-' + queueItem.id);
                    var vm = $el.render();
                    if (vm) vm.destroy();*/
                    mainUtil.changeRole('#welcome');
                }
                queueItem.cb && queueItem.cb(queueItem.item);
                return this.handlerMsgGroupQueue(true);
            }

            if (theItem) {
                //this.panel.setTips(theItem);
                queueItem.item = theItem;
            } else {
                this.panel.setTips(item);
                if (!item.msgs) item.msgs = [];
                obj.sidepanel.msgGroup.unshift(item);
            }

            if (queueItem.data) {
                this.addMsgQueue(queueItem);
            } else {
                queueItem.cb && queueItem.cb(queueItem.item);
            }
            this.handlerMsgGroupQueue(true);
        },
        addMsgGroupQueue: function (msgObj, cb) {
            var _this = this;
            msgObj.cb = function () {
                _this.setStorage();
                cb && cb.apply(cb, arguments);
            };
            this.msgGroupQueen.push(msgObj);
            this.handlerMsgGroupQueue();
        },
        groupMembers: {},
        getGroupMembers: function (id) {
            imUtil.getGroupMembers(id, function (infos) {
                obj.groupinfo.members = mainUtil.groupMembers[id] = infos;
            });
        },
        showMsgGroup: function (data) {
            var id = data.id;
            var $target = $('#' + id);
            if ($target.length === 0) {
                $target = $($('#chatwin_tmpl').html()).appendTo('#workbench');
                var members = this.groupMembers[id];
                if (!members) members = this.groupMembers[id] = [];
                var myObj = {
                    id: id,
                    isGroup: !!data.isGroup,
                    doChatwinHide: function () {
                        if ($('.chatwin.active').length === 0) {
                            $('#txlpanel .listitem').removeClass('active');
                        }
                    },
                    showGroupinfo: function (e) {
                        e.stopPropagation();

                        $.extend(obj.groupinfo, { groupId: id, groupName: data.showName, admin: data.admin, isActive: false });
                        mainUtil.changeRole('#groupInfo');

                        if (members.length > 0) {
                            obj.groupinfo.members = members;
                            return false;
                        }

                        mainUtil.getGroupMembers(id);

                        return false;
                    },
                    showBiaoqing: function (e, id) {
                        var $el = $(this);
                        return mainUtil.changeActive(e, '#biaoqing');
                    },
                    doPaste: function (event) {
                        var e = event.originalEvent || {};
                        var item = e.clipboardData && e.clipboardData.items[0];
                        if (!item) return;

                        var file = item.getAsFile();
                        myObj.selectFile('picture', file);
                    },
                    checkScroll: function (e) {
                        var $el = $(this);
                        var $bottom = $el.children(':last');
                        if ($bottom.offset().top - $el.height() < 20) {
                            mainUtil.panel.setTips(data, 0);
                        }
                    },
                    selectFile: function (type, file) {
                        if (!this.value && !file) return;
                        myObj.doSend({
                            msgType: 'file',
                            file: file || this.files[0],
                            msgType: type
                        });
                    },
                    doSend: function (msgObj) {
                        if (!msgObj.msgType && !myObj.msg) {
                            $.ui.alert('请输入聊天内容')
                            return;
                        }
                        if (msgObj.file && msgObj.file.type.indexOf('image') === 0) {
                            msgObj.msgType = 'picture';
                        }
                        imUtil.sendMsg({
                            file: msgObj.file,
                            text: myObj.msg,
                            receiver: id,
                            msgType: msgObj.msgType
                        }, function (msgObj) {
                            if (msgObj) {
                                mainUtil.freshMsgPanelGroup({
                                    "msgType": msgObj.msgType,
                                    "msgContent": msgObj.msgFileUrl || msgObj.text,
                                    "msgFileName": msgObj.file && msgObj.file.name,
                                    "msgSender": obj.userinfo.user_id,
                                    "msgReceiver": msgObj.receiver,
                                    "msgDateCreated": msgObj.msgDateCreated,
                                    "senderNickName": obj.userinfo.realname || obj.userinfo.username,
                                    "receiveNickName": myObj.receiver,
                                    "msgId": msgObj.msgid
                                });
                                mainUtil.scrollBottom($target);
                            } else {
                                $.ui.alert('消息发送失败');
                            }
                        });
                        myObj.msg = '';
                    },
                    msgsFilter: function (index, item) {
                        item.avata = AVATAR_PRE + item.msgSender;
                        item.isMe = item.msgSender === obj.userinfo.user_id;
                        item.msgHtml = mainUtil.chat.formateContent(item);
                    },
                    msg: '',
                    msgs: data.msgs,
                    receiver: data.showName
                };
                $target.render(myObj);

                mainUtil.scrollBottom($target);

            }
            mainUtil.changeRole('#msg-' + id, $target);
            mainUtil.panel.setTips(data, 0);
            mainUtil.setStorage();
        },
        freshMsg: {
            'text': function freshMsgPerson(data, callback) {
                var isGroupMsg = data.msgReceiver !== obj.userinfo.user_id,
                    id = isGroupMsg ? data.msgReceiver : data.msgSender;
                msgGroup = obj.sidepanel.msgGroup;

                if (data.auditType === '4') {
                    $.ui.alert('群组[' + data.receiveNickName + ']已被解散');
                    return mainUtil.addMsgGroupQueue({
                        method: 'remove',
                        item: {
                            id: id
                        }
                    });
                } else if (data.auditType === '6' && data.msgSender === obj.userinfo.user_id) {
                    $.ui.alert('您已被踢出群[' + data.receiveNickName + ']');
                    return mainUtil.addMsgGroupQueue({
                        method: 'remove',
                        item: {
                            id: id
                        }
                    });
                } else if (data.auditType === '5' && data.msgSender === obj.userinfo.user_id) {
                    return mainUtil.addMsgGroupQueue({
                        method: 'remove',
                        item: {
                            id: id
                        }
                    });
                } else if (data.auditType === '5') {
                    mainUtil.getGroupMembers(id);
                }

                $.util.sync(function (cb) {
                    if (isGroupMsg) {
                        if (data.receiveNickName) {
                            return cb(data.receiveNickName);
                        }
                        var noName = '未知群组';
                        $.req('interface/group-info?groupId=' + id,
                            function (rs) {
                                cb((rs.data && rs.data.groupName) || noName);
                            },
                            function () {
                                cb(noName);
                            });
                    } else {
                        cb(data.senderNickName);
                    }
                }, function (name) {
                    var theItem = {
                        isGroup: isGroupMsg,
                        id: id,
                        showName: name
                    };

                    mainUtil.addMsgGroupQueue({
                        item: theItem,
                        tips: 1,
                        data: data
                    }, callback);
                });
            }
        },
        freshMsgPanel: function (data) {
            var handler = this.freshMsg[data.msgType || 'text'] || this.freshMsg['text'];
            handler && handler(data);
        },
        freshMsgPanelGroup: function (data) {
            var theItem = {
                id: data.msgReceiver,
                showName: data.receiveNickName
            };
            mainUtil.addMsgGroupQueue({
                item: theItem,
                data: data
            }, function (theItem) {
                mainUtil.setStorage();
            });
        },
        changeActive: function (e, $el) {
            mainUtil.changeRole($el);
            e.stopPropagation();
            return false;
        },
        changeRole: function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                var $el = $(arguments[i]).addClass('active').trigger('roleshow'), transitions = ($el.data('transition') || '').split(',');
                var $target = $el.siblings('.active').trigger('rolehide');

                if (transitions.length === 2) {
                    var animIn = transitions[0] + ' anim';
                    var animOut = transitions[1] + ' anim';
                    $el
                        .off(END_EVENT_NAME)
                        .on(END_EVENT_NAME, function () {
                            $el.removeClass(animIn);
                        })
                        .off('rolehide')
                        .on('rolehide', function () {
                            $el
                                .off(END_EVENT_NAME)
                                .on(END_EVENT_NAME, function () {
                                    $el.removeClass(animOut);
                                }).addClass(animOut);
                        })
                        .addClass(animIn);
                }

                $target.removeClass('active');


            }
        },
        scrollBottom: function ($el) {
            $el = $el.find('ul.chatinfo');
            setTimeout(function () {
                var bottom = $el.children(':last')[0];
                if (!bottom) return;
                var h = bottom.offsetTop;
                $el.animate({ scrollTop: h });
            }, 100);
        },
        doCheckPop: function () {
            $('#poparea').children('.active').removeClass('active').trigger('rolehide');
        },
        doLogout: function () {
            $.util.sync(function (cb) {
                $.req('interface/logout', cb, cb);
            }, function (cb) {
                typeof imUtil === 'undefined' ? cb() : imUtil.doLogout(cb);
            }, function () {
                location.href = '/';
            });
        },
        doRefresh: function () {
            location.href = 'main';
        },
        im: {
            doLogin: function () {

            },
            doMsgReceive: function (obj) {
                mainUtil.freshMsgPanel(obj);
            },
            doNoticeReceive: function (obj) {
                mainUtil.freshMsgPanel(obj);
            },
            doConnectStateChange: function (obj) {
                if (obj.code == 2 || obj.code == 3) {
                    return;
                }
                $.ui.alert('连接已断开，请重新登录', function () {
                    mainUtil.doLogout();
                });
            },

        },
        panel: {
            clearMsgActive: function () {
                $('#msgpanel .listitem.active').removeClass('active');
            },
            clickType: 'chat',// selected
            chatTo: function ($el, item) {
                /*if (mainUtil.search.isSelected) {
                    return ;
                }*/
                mainUtil.changeRole('#msgpanel', '#msgBtn');

                mainUtil.addMsgGroupQueue({
                    item: {
                        id: item.user_id,
                        showName: item.realname || item.username
                    }
                }, function (theItem) {
                    mainUtil.showMsgGroup(theItem);
                });
            },
            setTips: function (data, tips) {
                data.tips = tips;
                data.tipsHtml = tips ? '<font>' + tips + '</font>' : '';
            },
            showBiaoqing: function () {

            }
        },
        search: {
            doFilter: function (index, item) {
                var val = obj.searchbar.searchValue;
                var isShow = false;
                if (!val || item.realname.indexOf(val) > -1) {
                    isShow = true;
                }
                if (item.isShow !== isShow) {
                    item.isShow = isShow
                };
                if (!item.avata) {
                    item.avata = AVATAR_PRE + item.user_id;
                }
            },
            set isSelected(val) {
                obj.searchbar.isSelected = val;
                mainUtil.panel.clickType = val ? 'selected' : 'chat';
            },
            get isSelected() {
                return obj.searchbar.isSelected;
            },
            clearSelected: function () {
                this.isSelected = false;
                obj.searchbar.selected = [];
                $.extend(obj.searchbar.groupinfo, {
                    groupName: '',
                    declared: ''
                });
            },
            startSelected: function () {
                mainUtil.search.isSelected = true;
                if (obj.searchbar.selected.length > 0) obj.searchbar.selected = [];
            },
            doSelect: function ($el, item) {
                if ($el.hasClass('active')) {
                    for (var i = 0, len = obj.searchbar.selected.length; i < len; i++) {
                        var theItem = obj.searchbar.selected[i];
                        if (theItem.user_id === item.user_id) {
                            obj.searchbar.selected.splice(i, 1);
                            $el.removeClass('active');
                            break;
                        }
                    }
                    return;
                };
                if (item.status !== '1') {
                    return $.ui.alert('该用户尚未注册无法选择');
                }
                obj.searchbar.selected.push({
                    user_id: item.user_id,
                    realname: item.realname,
                    avata: AVATAR_PRE + item.user_id,
                    doRemove: function (index) {
                        obj.searchbar.selected.splice(index, 1);
                        $el.removeClass('active');
                    }
                });
                $el.addClass('active');
            },
            doSelected: function () {
                var groupinfo = obj.searchbar.groupinfo;
                if (!groupinfo.groupName) {
                    $.ui.alert('请填写群组名称');
                    return;
                }
                if (!groupinfo.declared) {
                    $.ui.alert('请填写群组公告');
                    return;
                }

                var config = {};
                $.extend(config, obj.searchbar.groupinfo);
                imUtil.createGroup(config, function (groupId) {
                    if (groupId) {
                        var msgGroupItem = {
                            isGroup: true,
                            admin: obj.userinfo.user_id,
                            id: groupId,
                            showName: obj.searchbar.groupinfo.groupName,
                            msgs: []
                        };

                        var users = [];
                        for (var i = 0, len = obj.searchbar.selected.length; i < len; i++) {
                            users.push(obj.searchbar.selected[i].user_id);
                        }

                        config.id = groupId;

                        mainUtil.addMsgGroupQueue({
                            item: msgGroupItem
                        }, function (msgObj) {
                            mainUtil.changeRole('#msgpanel', '#msgBtn');
                            mainUtil.showMsgGroup(msgObj);
                        });

                        if (users.length === 0) {
                            return;
                        }
                        while (users.length > 0) {
                            imUtil.inviteJoinGroup({
                                id: groupId,
                                users: users.splice(0, users.length > 5 ? 5 : users.length)
                            }, function (confirm) {
                                if (!confirm) {
                                    $.ui.alert('邀请人员失败');
                                }
                                if (users.length === 0) obj.searchbar.doHide();
                            });
                        }

                    } else {
                        $.ui.alert('创建群组失败');
                    }
                });
            }
        },
        chat: {
            imgReader: function (item, cb) {
                /*if( item && item.kind !== 'file' || item.type.match(/^image\//i) ){
                    cb&&cb(null);
                    return;
                }*/
                var file = item.getAsFile();
                //var reader = new FileReader();

                /*// 读取文件内容
                reader.onload = function (e) {
                    console.log(e);
                    cb&&cb(e.target);
                };

                reader.error = function(){
                    cb&&cb(null);
                };
                // 读取文件
                reader.readAsDataURL(file);*/
            },
            getContent: function (name) {
                return '[' + name + ']';
            },
            _emojiList: null,
            formate: {
                text: function (contentObj) {
                    var emojiList = this._emojiList;
                    if (!emojiList) {
                        emojiList = this._emojiList = {};
                        $.util.each(obj.emoji.list, function (index, item) {
                            emojiList[item.name] = item.type;
                        });
                    }
                    return (contentObj.msgContent || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\[([^\]\[]+)\]/g, function (s, s1) {
                        var type = emojiList[s1];
                        if (type) {
                            return '<img class="chat_biaoqing" alt="' + s1 + '" src="' + EMOJI_SRC + type + '.png' + '"/>';
                        }
                        return s;
                    }).replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g, function (s) {
                        return '<a class="chat_link_icon" href="' + s + '" target="_blank">' + s + '</a>';
                    });
                },
                picture: function (contentObj) {
                    return '<a href="' + contentObj.msgContent + '" target="_blank"><img class="chat_short" src="' + contentObj.msgContent + '"/></a>';
                },
                attachment: function (contentObj) {
                    return '<a class="chat_attachment_icon" href="' + contentObj.msgContent + '" target="_blank">' + contentObj.msgFileName + '</a>';
                }
            },
            formateContent: function (contentObj) {
                return (this.formate[contentObj.msgType] || this.formate['text'])(contentObj);
            }
        },
        groupSelect: {
            init: function (kw) {
                if (!kw) obj.groupuser.searchValue = '';

                var members = [];
                $.util.each(obj.groupinfo.members, function (i, member) {
                    if (member.member) members.push(member.member);
                });

                var items = $.util.copyArray(obj.sidepanel.txlGroup.enterprise.concat(obj.sidepanel.txlGroup.expert, obj.sidepanel.txlGroup.friend));
                $.util.each(items, function (index, item) {
                    if (members.indexOf(item.user_id) > -1) {
                        return null;
                    }
                    if (kw && item.realname.indexOf(kw) < 0) {
                        return null;
                    }
                });
                obj.groupuser.unselected = items;
                obj.groupuser.selected = [];

            }
        }

    };

})();