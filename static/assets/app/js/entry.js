(function () {
    var config = {
        //配置基准地址，请按照实际情况配置
        baseUrl: (document.currentScript.src.split('assets')[0]) + 'assets',
        paths: {

        }
    };
    require.config(config);

    $.ui.alert = function (msg, title) {
        if (!this.$alert) {
            this.$alert = $('<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title" id="mySmallModalLabel" v-html="title"></h4></div><div class="modal-body" v-html="msg"></div></div></div></div>').appendTo('body');
            this._alertObj = {
                msg: '',
                title: ''
            };
            this.$alert.render(this._alertObj);
        }
        this._alertObj.msg = msg;
        this._alertObj.title = title || '友情提示';
        this.$alert.modal();
        return this.$alert;
    };


    // 封装网络请求
    $.req = function (opts, success, error) {
        var cacheCallback = {};

        if(typeof opts==='string'){
            opts = {
                url : opts,
                success : success,
                error : error
            };
        }else{
            if(typeof opts.type==='undefined'){
                opts.type = 'post';
            }
        }

        if (!opts.url.match(/^http[s]?\:/)) {
            // opts.url = opts.url; // 必要的时候根据某种规律重新定义url地址
        }
        if (typeof opts.dataType === 'undefined') {
            opts.dataType = 'json';
        }

        cacheCallback.success = opts.success;
        opts.success = function (data) {
            if (typeof data === 'object' && data.result !== 'success') {
                opts.error && opts.error.apply(null, arguments);
                return;
            }
            cacheCallback.success && cacheCallback.success.apply(null, arguments);
        };

        cacheCallback.error = opts.error;
        opts.error = function (data) {
            $alert = $.ui.alert((data && data.msg) || '请求错误');
            $alert.on('hidden.bs.modal', function () {
                cacheCallback.error && cacheCallback.error.apply(null, arguments);
            });
        };
        $.ajax(opts);
    };

    var entry = document.querySelector('script[data-main]').getAttribute('data-entry');
    require(['app/js/' + entry]);

})();