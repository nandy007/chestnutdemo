(function () {

    var obj = {
        list: [],
        username: '',
        doLogout: function () {
            $.req({
                url: 'interface/logout',
                success: function (rs) {
                    location.href = '/';
                }
            });
        }
    };

    $('body').render(obj);

    $.req({
        url: 'interface/session-info',
        success: function (rs) {
            if(!rs.data||!rs.data.username){
                $.ui.alert('您尚未登录');
                return;
            }
            obj.list.push.apply(obj.list, rs.data.list);
            obj.username = rs.data.username;
        }
    });

})();