/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://10.10.112.5:3000/dist/js/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(61)();

/***/ },

/***/ 54:
/***/ function(module, exports) {

	module.exports = "<div class=\"m-toolbar\" id=\"J_global_toolbar\">\r\n    <ul class=\"m-toolbar-list\">\r\n        <li class=\"m-toolbar-item message\">\r\n            <a class=\"iconfont vi\" href=\"javascript:;\">&#xe62a;</a>\r\n            <div class=\"m-toolbar-panel\">\r\n                <p class=\"qq-online\">\r\n                    <a class=\"ui-button-sgreen ui-button\" id=\"toolbar_qqonline\" href=\"\" target=\"_blank\">\r\n                    <i class=\"iconfont\">&#xe610;</i>在线咨询</a>\r\n                </p>\r\n                <p class=\"telnumber\"><i class=\"iconfont\">&#xe60f;</i><em id=\"toolbar_telnumber\">400-888-4547</em></p>\r\n            </div>\r\n        </li>\r\n        <li class=\"m-toolbar-item weixin\">\r\n            <a class=\"iconfont vi\" href=\"javascript:;\">&#xe61c;</a>\r\n            <div class=\"m-toolbar-panel\">\r\n                <div class=\"qrcode\">\r\n                    <img id=\"toolbar_qr_weixin\" src=\"xxxHTMLLINKxxx0.61659618583507840.3685344292316586xxx\" alt=\"微信二维码\">\r\n                </div>\r\n                <p>扫描二维码 关注官方微信</p>\r\n            </div>\r\n        </li>\r\n<!--         <li class=\"m-toolbar-item app\">\r\n            <a class=\"iconfont vi\" href=\"javascript:;\">&#xe60a;</a>\r\n            <div class=\"m-toolbar-panel\">\r\n                <span>手机扫描下载客户端</span>\r\n                <div class=\"qrcode\">\r\n                    <img id=\"toolbar_qr_ios\" src=\"xxxHTMLLINKxxx0.131667029811069370.7540101965423673xxx\" alt=\"ios app\"> \r\n                </div>\r\n                <p class=\"btn-wrap\">\r\n                    <a class=\"ui-button-mblue ui-button\" id=\"toolbar_app_android\" href=\"\"><i class=\"iconfont\">&#xe636;</i>Android下载\r\n                    </a>    \r\n                </p>\r\n            </div>\r\n        </li> -->\r\n        <li class=\"m-toolbar-item gototop\" id=\"gototop\">\r\n            <a class=\"iconfont vi\" href=\"javascript:;\">&#xe626;</a>\r\n        </li>\r\n    </ul>\r\n</div>";

/***/ },

/***/ 59:
/***/ function(module, exports) {

	/**
	 * 减少执行频率, 多次调用，在指定的时间内，只会执行一次。
	 * ```
	 * ||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
	 * X    X    X    X    X    X      X    X    X    X    X    X
	 * ```
	 * 
	 * @method $.throttle
	 * @grammar $.throttle(delay, fn) ⇒ function
	 * @param {Number} [delay=250] 延时时间
	 * @param {Function} fn 被稀释的方法
	 * @param {Boolean} [debounce_mode=false] 是否开启防震动模式, true:start, false:end
	 * @example var touchmoveHander = function(){
	 *     //....
	 * }
	 * //绑定事件
	 * $(document).bind('touchmove', $.throttle(250, touchmoveHander));//频繁滚动，每250ms，执行一次touchmoveHandler
	 *
	 * //解绑事件
	 * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.throttle返回的function, 当然unbind那个也是一样的效果
	 *
	 */


	// var $ = require('jquery');

	$.extend($, {
	    throttle: function(delay, fn, debounce_mode) {
	        var last = 0,
	            timeId;

	        if (typeof fn !== 'function') {
	            debounce_mode = fn;
	            fn = delay;
	            delay = 250;
	        }

	        function wrapper() {
	            var that = this,
	                period = Date.now() - last,
	                args = arguments;

	            function exec() {
	                last = Date.now();
	                fn.apply(that, args);
	            };

	            function clear() {
	                timeId = undefined;
	            };

	            if (debounce_mode && !timeId) {
	                // debounce模式 && 第一次调用
	                exec();
	            }

	            timeId && clearTimeout(timeId);
	            if (debounce_mode === undefined && period > delay) {
	                // throttle, 执行到了delay时间
	                exec();
	            } else {
	                // debounce, 如果是start就clearTimeout
	                timeId = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - period : delay);
	            }
	        };
	        // for event bind | unbind
	        wrapper._zid = fn._zid = fn._zid || $.proxy(fn)._zid;
	        return wrapper;
	    },

	    /**
	     * @desc 减少执行频率, 在指定的时间内, 多次调用，只会执行一次。
	     * **options:**
	     * - ***delay***: 延时时间
	     * - ***fn***: 被稀释的方法
	     * - ***t***: 指定是在开始处执行，还是结束是执行, true:start, false:end
	     *
	     * 非at_begin模式
	     * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
	     *                         X                                X</code>
	     * at_begin模式
	     * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
	     * X                                X                        </code>
	     *
	     * @grammar $.debounce(delay, fn[, at_begin]) ⇒ function
	     * @name $.debounce
	     * @example var touchmoveHander = function(){
	     *     //....
	     * }
	     * //绑定事件
	     * $(document).bind('touchmove', $.debounce(250, touchmoveHander));//频繁滚动，只要间隔时间不大于250ms, 在一系列移动后，只会执行一次
	     *
	     * //解绑事件
	     * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.debounce返回的function, 当然unbind那个也是一样的效果
	     */
	    debounce: function(delay, fn, t) {
	        return fn === undefined ? $.throttle(250, delay, false) : $.throttle(delay, fn, t === undefined ? false : t !== false);
	    }
	});

	module.exports = $;

/***/ },

/***/ 60:
/***/ function(module, exports) {

	var config = {
		qqOnlineUrl: 'http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzkzODAyNjUxNF8yMzkzODFfNDAwODg4NDU0N18yXw',
		telNumber: '400-888-4547',
		weixinQRUrl: 'http://120.76.41.193:8001/photos/qr_weixin.png',
		appIOSUrl: 'http://120.76.41.193:8001/photos/qr_app.png',
		appAndroidUrl: 'http://www.papago.hk/download/com.fpx.ppg_100704.apk'
	};

	module.exports = config;

/***/ },

/***/ 61:
/***/ function(module, exports, __webpack_require__) {

	// 样式已移到公共样式
	// require('./toolbar.scss');
	__webpack_require__(59);

	var template = __webpack_require__(54),
		config = __webpack_require__(60);

	var $win = $(window),
		$doc = $(document),
		$toolbar,
		$gototop;

	var toolbarItem = 'li.m-toolbar-item',
		toolbarItemPanel = 'div.m-toolbar-panel',
		toolbarGotoTop = '#gototop',
		itemEvent = 'mouseenter mouseleave';

	var critical = $win.height(),
		throttle = 200;

	var fn = {
		init: function(){
			// 插入模板
			$('body').append(template);

			$toolbar = $('#J_global_toolbar');
			$gototop = $(toolbarGotoTop);

			// 赋值
			$('#toolbar_qqonline').attr('href', config.qqOnlineUrl);
			$('#toolbar_telnumber').text(config.telnumber);
			$('#toolbar_qr_weixin').attr('src', config.weixinQRUrl);
			// $('#toolbar_qr_ios').attr('src', config.appIOSUrl);
			// $('#toolbar_app_android').attr('href', config.appAndroidUrl);
		},
		bindEvent: function(){
			// 事件
			var dropTimer = null;
			var hoverDelay = function(e, panel){
				if(panel[0]){
					if(e.type === 'mouseenter'){
						$toolbar.find(toolbarItemPanel).hide();
						panel.show();
						dropTimer && clearTimeout(dropTimer);
					}else{
						dropTimer = setTimeout(function(){
							panel.hide();
						}, 100);
					}
				}
			};

			$toolbar
				.on(itemEvent, toolbarItem, function(e){
					hoverDelay(e, $(this).find(toolbarItemPanel));
				})
				.on(itemEvent, toolbarItemPanel, function(e){
					e.stopPropagation();
					hoverDelay(e, $(this));
				})
				.on('click', toolbarGotoTop, $.proxy(this.gototop, this));

			$win.on('scroll', $.throttle(throttle, $.proxy(this.toggleGototopState, this)));
		},
		toggleGototopState: function(){
			$doc.scrollTop() > critical ?
				$gototop.fadeIn() :
				$gototop.fadeOut();
		},
		gototop: function(){
			$('html,body').animate({scrollTop: 0}, 300);
		}
	};

	function toolbar(){

		fn.init();
		fn.bindEvent();
	}

	module.exports = toolbar;

/***/ }

/******/ });