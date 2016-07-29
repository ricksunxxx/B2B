;(function(exports){

    var PPG = {};

    /**
     * 一些正则
     */
    PPG.reg = {
        mobile: /^0?(13|15|18|14|17)[0-9]{9}$/,
        email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        QQ: /^[1-9]\d{4,11}$/,
        tel: /(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,8}/,
        ID: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        date: /^\d{4}-\d{1,2}-\d{1,2}$/,
        postCode: /^[0-9]\d{5}$/,
        accout: /^[a-zA-Z]\w{3,19}$/,
        mobilecode: /^\d{6}$/,
        validcode: /^\d{4}$/,
        password: /((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))^.{6,20}$/,
        truename: /(?!.*先生.*|.*小姐.*|.*男士.*|.*女士.*|.*太太.*)^([\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[a-zA-Z\.\·]){2,26}$/,
        nogb: /^[\u0000-\u00FF]+$/ // 不含中文
    };

    /**
     * validate
     */
    PPG.validate = {
        isEmpty: function(value) {
            return $.trim(value) === '';
        },
        min: function(value, n) {
            return $.trim(value).length >= n;
        },
        max: function(value, n) {
            return $.trim(value).length <= n;
        },
        range: function(value, range) {
            var vl = $.trim(value).length;
            return vl >= range[0] && vl <= range[1];
        },
        bytesRange: function(value, range) {
            var vl = value.replace(/[^\x00-\xff]/gi, '--').length;
            return vl >= range[0] && vl <= range[1];
        },
        isTrueName: function(value){
            return PPG.reg.truename.test(value);
        },
        isMobile: function(value) {
            return PPG.reg.mobile.test(value);
        },
        isPostCode: function(value) {
            return PPG.reg.postCode.test(value);
        },
        isTel: function(value) {
            return PPG.reg.tel.test(value);
        },
        isEmail: function(value) {
            return PPG.reg.email.test(value);
        },
        isQQ: function(value) {
            return PPG.reg.QQ.test(value);
        },
        isID: function(value) {
            return PPG.reg.ID.test(value);
        },
        isDate: function(value) {
            return PPG.reg.date.test(value);
        },
        password: function(value) {
            return PPG.reg.nobg && PPG.reg.password.test(value);
        }
    };

    /**
     * [validateItem 校验]
     * @param  {object} {element: $elem, required: true, rule: isMobile, display: '手机号码', errorMessage: '手机号码格式不对哦'}
     * @return {object} {valided: false, element: $elem, message: '手机号码格式不对哦'}
     */
    PPG.validateItem = function (item){
        var $element = item.element,
            value = $element.val(),
            rule = item.rule,
            required = undefined === item.required ? true : item.required,
            validate = PPG.validate;

        var ret = {
            valided: true,
            element: $element,
            message: ''
        };

        var tag = $element.get(0).tagName,
            requiredPrefix = (tag === 'INPUT' || tag === 'TEXTAREA') ? '请输入' : '请选择',
            formatError = item.errorMessage ? item.errorMessage : (item.display + '格式不正确');

        var validateRule = null;

        if(validate.hasOwnProperty(rule)){
            validateRule = validate[rule];
        }else if($.isFunction(rule)){
            validateRule = rule;
        }

        if(required && validate.isEmpty(value)){
            ret.valided = false;
            ret.message = requiredPrefix + item.display;

        }else if(validateRule){
            if(!validateRule(value)){
                ret.valided = false;
                ret.message = formatError;      
            }
        }

        return ret;
    };

    /**
     * 图片相关
     */
    PPG.IMAGESERVER = (typeof imgDomain !== 'undefined' ? imgDomain : '') + '/';
    PPG.RESOURCE_DOMAIN = (typeof resourceDomain !== 'undefined' ? resourceDomain : '') + '/';


    /**
     * cookie
     * 只传name时为取值，同时传name和value时为设值
     * @param  {string} name    [cookie name]
     * @param  {string} value   [cookie value]
     * @param  {object} options [cookie options]
     */
    PPG.cookie = function(name, value, options) {
        if (typeof value === 'undefined') {
            var n, v,
                cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                n = $.trim(cookies[i].substr(0, cookies[i].indexOf('=')));
                v = cookies[i].substr(cookies[i].indexOf('=') + 1);
                if (n === name) {
                    return unescape(v);
                }
            }
        } else {
            options = options || {};
            if (!value) {
                value = '';
                options.expires = -365;
            } else {
                value = escape(value);
            }
            if (options.expires) {
                var d = new Date();
                d.setDate(d.getDate() + options.expires);
                value += '; expires=' + d.toUTCString();
            }
            if (options.domain) {
                value += '; domain=' + options.domain;
            }
            if (options.path) {
                value += '; path=' + options.path;
            }
            document.cookie = name + '=' + value;
        }
    };

    /**
     * 一些辅助工具
     */
    PPG.utils = {
        /**
         * 检测元素是否在可视区域
         * @param {dom}
         */
        isInViewport: function(element){
            var rect = element.getBoundingClientRect();

            return rect.bottom > 0 &&
                rect.right > 0 &&
                rect.left < (window.innerWidth || document. documentElement.clientWidth) &&
                rect.top < (window.innerHeight || document. documentElement.clientHeight);        
        },
        /**
         * 检测是否小于IE10
         * 利用IE10+不支持IE条件注释的原理
         */
        isLtIE10: (function(){// 仅适用9及以下
            var v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i'); 
            while ( 
                div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', 
                all[0] 
            ); 
            return v > 4 ? v : false ; 
        }())
    };

    PPG.placeholder = function(element, option){
        var isSupportPlaceholder = 'placeholder' in document.createElement('input');
        
        if(!isSupportPlaceholder){

            var args = arguments;
            var settings = {
                styles: {
                    position: 'absolute',
                    left: 5,
                    top: 5,
                    color: '#ccc',
                    cursor: 'text'
                }
            };

            var $body = $('body'),
                $element = $(element),
                option = option || {},
                styles = settings.styles,
                options =  null,
                tagName;

            if(!args.length){
                $element = $body;
            }else if($.isPlainObject(args[0])){
                option = args[0];
                $element = $body;
            }

            options = $.extend({}, settings, option);
            styles = $.extend({}, settings.styles, options.styles);

            tagName = $element[0].tagName.toLowerCase();

            if(tagName === 'input' || tagName === 'textarea'){
                setPlaceholder($element);
            }else{

                $element.find('input,textarea').each(function(){
                    setPlaceholder($(this));
                });
            }

            function setPlaceholder(element){
                var _id = '', 
                    $label;

                var hasPlaceholder = !!element.attr('placeholder');

                if(hasPlaceholder){
                    if(element[0].id){
                        _id = element[0].id;
                    } else {
                        _id = '_' + new Date().getTime();
                        element[0].id = _id;
                    }

                    $label = $('<label for="'+ _id +'" class="placeholder">'+ (element.attr('placeholder') || '') +'</label>');

                    element.before($label).end()
                        .attr('data-placeholder');

                    if($.trim(element.val()) !== ''){
                        $label.hide();
                    }
                    
                    
                    $label.css(styles);

                    element.on({
                        'focus': function(e){$label.hide();},
                        'blur': function(e){
                            $.trim($(this).val()) !== '' ? 
                                $label.hide() : 
                                $label.show();
                        }
                    });
                }
            }
        }
    };

    // 时间格式化
    PPG.formatDate = function (val) { 
        if (val == null) return '';

        var pa = /.*\((.*)\)/;
        var unixtime = val.match(pa)[1].substring(0, 10);

        var getTime = function () {
            var ts = arguments[0] || 0;
            var t, y, m, d, h, i, s;
            t = ts ? new Date(ts * 1000) : new Date();
            y = t.getFullYear();
            m = t.getMonth() + 1;
            d = t.getDate();
            h = t.getHours();
            i = t.getMinutes();
            s = t.getSeconds();

            // 可根据需要在这里定义时间格式
            return y + '/' + (m < 10 ? '0' + m : m) + '/' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (i < 10 ? '0' + i : i) + ':' + (s < 10 ? '0' + s : s);
        };

        return getTime(unixtime);
    };
    
    
    var isLtIE10 = PPG.utils.isLtIE10;
    // 针对IE，如果小于ie10，在html上加标识
    if(isLtIE10){
        var v = isLtIE10;
        $('html').addClass('ltie10 ie'+ v);
    }

    // 头部在页面滚动时的展开收缩效果
    (function(){
        var $doc = $(document),
            $win = $(window),
            $globalHeader = $('#J_global_header');

        $globalHeader.find('.m-header-info-item:last').addClass('last');

        if($globalHeader[0] && $globalHeader.hasClass('ui-fixed')){

            var headerHeight = $globalHeader.height(),
                animateSpeed = 260,
                imgBigSize = 58,
                imgSmallSize = 39,
                timer = null;

            var infobar = $globalHeader.find('div.m-header-info'),
                logoEl = $('#J_mlogo'),
                logoImg = logoEl.find('img');

            var spreadImgUrl = logoImg.attr('src'),
                pinchedImgUrl = spreadImgUrl.replace('logo_m', 'logo_s');

            // 展开
            var spread = function(){
                $globalHeader.removeClass('pinched');
                infobar.slideDown(animateSpeed);
                logoImg.stop().animate({height: imgBigSize}, animateSpeed);
                logoImg.attr('src', spreadImgUrl);
            };

            // 收起
            var pinched = function(){
                $globalHeader.addClass('pinched');
                infobar.slideUp(animateSpeed);
                logoImg.stop().animate({height: imgSmallSize}, animateSpeed);
                logoImg.attr('src', pinchedImgUrl);
            };

            $win.on('scroll', function(){
                timer && clearTimeout(timer);
                timer = setTimeout(function(){
                    $doc.scrollTop() >= headerHeight ? pinched() : spread();         
                }, 16);

            });    
        }    
    })();

    // 头部搜索
    var globalSearchForm = $('#J_form_search');
    if(globalSearchForm[0]){
        var keyword = $('#J_search_kw');
        globalSearchForm.on('submit', function(){
            if($.trim(keyword.val()) === '') return false;
        });
        try{
            PPG.placeholder('#J_search_kw', {styles: {left:25, top:0}});
        }catch(e){}
    }

    // 如果小于IE8，给弹出层提示
    if(isLtIE10 && isLtIE10 < 8){
        var lowVersionDialog = '<div class="g-browser-dialog">'+
                                    '<div class="browser-dialog-main">'+
                                       ' <div class="browser-dialog-content">'+
                                            '<p class="message">Hi，您当前的浏览器版本过低，可能导致网站不能<br>正常访问，建议升级浏览器，以获得更好的体验</p>'+
                                            '<dl class="browsers">'+
                                                '<dt class="hd"><span class="text">推荐以下浏览器或浏览器版本</span></dt>'+
                                                '<dd class="item"><a class="chrome" href="https://www.google.cn/intl/zh-CN/chrome/browser/desktop/" target="_blank">Chrome</a></dd>'+
                                                '<dd class="item"><a class="firefox" href="http://www.firefox.com.cn/" target="_blank">Firefox</a></dd>'+
                                                '<dd class="item"><a class="ie" href="http://windows.microsoft.com/zh-cn/internet-explorer/download-ie" target="_blank">IE9及以上</a></dd>'+
                                            '</dl>'+
                                        '</div>'+          
                                    '</div>'+
                                    '<div class="browser-dialog-mask"></div>'+
                                '</div>';
        $('body').append(lowVersionDialog);
    }

    if(!exports.console){
        exports.console = {};
        exports.console.log = function(){};
    }

    exports.PPG = PPG;

})(window);


