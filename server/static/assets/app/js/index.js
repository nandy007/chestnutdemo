(function(){

    var obj = {
        form : {
            username : 'huangnan',
            password : '111111',
        },
        formValidate : {
            username : {
                type : 'required',
                msg : '用户名必填'
            },
            password :{
                type : 'required',
                msg : '密码必填'
            }
        },
        func : {
            doSubmit : function(){
                var validate = obj.formValidate;
                var form = obj.form;
                for(var k in validate){
                    var info = validate[k];
                    var type = info.type;
                    var msg = info.msg;
                    if(type==='required' && !form[k]){
                        $.ui.alert(msg);
                        return;
                    }
                }

                $.req({
                    url : 'interface/login',
                    data : obj.form,
                    success : function(rs){
                        location.href = 'main';
                    }
                });
            }
        }
    };

    $('body > div:first').render(obj);

})();