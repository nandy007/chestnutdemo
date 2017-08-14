(function () {

    var obj = {
        list: [],
        username: '',
        doLogout: function () {
            $.req('interface/logout', 
                function (rs) {
                    location.href = '/';
                });
        }
    };

    $('body').render(obj);

    $.req('interface/session-info',
        function (rs) {
            if(!rs.data||!rs.data.username){
                $.ui.alert('您尚未登录');
                return;
            }
            obj.list.push.apply(obj.list, rs.data.list);
            obj.username = rs.data.username;
        }
    );

})();