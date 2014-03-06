(function(window,undefined){

    var $ = function(id){
            return typeof id =='string'
                ? document.getElementById(id):id;
        },
        uniq = function(){
            var uniq = +new Date;
            return function(){
                return ++uniq;
            }
        }(),
        trim = function(str){
            return typeof str =='string'
                ? typeof str.trim=='function'
                    ? str.trim()
                    : str.replace(/^(\u3000|\s|\t|\u00A0)*|(\u3000|\s|\t|\u00A0)*$/g, '')
                : false;
        },
        addEvent = function(node,event,func) {
            if ((node=$(node)) && typeof func=='function'){
                return node.attachEvent
                        ? node.attachEvent('on' + event, func)
                        : node.addEventListener
                            ? node.addEventListener(event, func, false)
                            : node['on'+event] = func;

            }
        };


    function IframeCross(){
        this.initialize();
    }

    IframeCross.prototype = {
        initialize: function(){
            var self = this;
            //事件监听
            self._Event = {};

            if ( window.postMessage ) {
                addEvent(window,'message',function(event){
                    self._hanlder(event||window.event);
                });
            } else {
                this._pollfill(window,'name');
            }
        },
        _hanlder: function(_event){
            var event = _event || window.event,
                data  = this.decode(unescape(event.data));
            this.emit('__recive');//触发全局recive事件
            this.emit(data['__method__'],data);
        },
        _pollfill: function(){
            var hash  = null,
                timer = null;
            return function(win,name){
                var self = this;
                timer = setInterval(function(){
                    var wname = win[name];
                        hash === null  && (hash = wname);

                    if (hash != wname){
                        var data = wname.split('^').pop().split("&");
                        self._hanlder({
                            domain: data[0],
                            data:  data[1]//window.unescape(data[1])
                        });
                        hash = wname;
                    }
                },100);
            }
        }(),
        /*
         * 简单的json 到query的函数
         */
        //json to query
        encode: function(json){
            var retarr = [],
                value;

            if ( typeof json =='object') {
                for ( var p in json ) {
                    //单独处理布尔字面量,转换为1，0整形
                    value = typeof(value =json[p]) =='boolean'
                                ? value ^ 0 : value;

                    if (json.hasOwnProperty(p)
                            && (value instanceof Array
                            || value.toString() == value)) {

                        retarr.push(p+'='+

                                //字符串和数组，整形
                                encodeURIComponent(
                                    //字面量
                                    //数组，前提数组里面的内容只能为一维度数组
                                    //这里做了简单处理，不考虑复杂情况
                                    json[p].toString()
                                )
                        );
                    }
                }
            }
            return retarr.join('&');
        },
        //query to json
        decode: function(query){
            var item   = null,
                index  = 0,keys,val,
                object = {};
                query = trim(query).split('&');
            while ( item = query[index++] ){
                keys = item.split('=');
                val = keys[1];

                object[keys[0]] = val ^ 0 == val//判断是否为整形
                    ? parseInt(val,10)
                    : val.split(',').length == 1 //非数字以及屏蔽单个数组
                        ? val : val.split(',')
            }
            return object;
        },
        on: function(method,handler){

            this._Event[method] || (this._Event[method]=[]);
            this._Event[method].push(handler);
        },
        emit: function(method,data,emit,retval){

            if ( (emit = this._Event[method]) && emit.length ){

                for( var i = 0, l = emit.length; i<l; i++ ) {
                    if ( retval === false ){
                        break;
                    }
                    retval = emit[i](data);
                }
            }
            return retval;
        },
        /*
         * 接收跨域传递的消息
         * @param {String} method 监听消息名
         * @param {Function} callback 回调
         */
        receive: function(method,handler){

            this.on(method,handler);
        },
        /*
         * 发送跨域消息
         * @param {Object} target iframe(iframe.contentWindow)或parent
         * @param {String} method 消息名
         * @param {String} data 传递数据
         */
        send: function(target,method,data){

            if (target && typeof target =='object') {

                data['__method__'] = method;
                data = escape(this.encode(data));

                this.emit('__send');//触发全局send事件

                window.postMessage
                    ? target.postMessage(data,'*')
                    : (target.name = uniq()+'^'+document.domain
                        +'&'+ /*window.escape(*/data/*)*/);

            }
        }
    };

    window.IframeCross = new IframeCross();

})(window);
