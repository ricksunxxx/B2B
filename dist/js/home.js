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

	__webpack_require__(62);
	__webpack_require__(210);

	var mainBanner = $('#J_home_slider');
	var isInViewport = PPG.utils.isInViewport;

	// 图片lazyload
	$('img.lazy').lazyload({
		data_attribute: 'src',
		effect: 'fadeIn',
		load: function(){
			$(this).removeClass('lazy');
		}
	});

	$('#J_home_slider').slide({
		autoPlay: true,
		interTime: 5000,
		delayTime: 1000,
		effect: 'fold',
		switchLoad: 'data-src',
		mainCell: '#J_home_slider_content'
	});

	// 合作平台 carousel
	$('#J_partner_carousel').slide({
		vis: 5,
		scroll: 1,
		autoPlay: true,
		prevCell: '.ui-carousel-prev-btn',
		nextCell: '.ui-carousel-next-btn',
		mainCell: '.scroller .ui-carousel-content',
		trigger: 'click',
		effect: 'leftLoop',
		switchLoad: 'data-src'
	});

	// intro section slide
	$('.intro-scroller').slide({
		mainCell: '#J_intro_slider_content',
		trigger: 'click',
		effect: 'fold',
		titCell: '#J_intro_slider_nav .trigger',
		titOnClassName: 'ui-slide-active',
		switchLoad: 'data-src',
		startFun: function(index, count, slider, hanlder, panel){

			var currentPanel = panel.children().eq(index);
			currentPanel.siblings().removeClass('current');
			currentPanel.addClass('current');
		}
	});


	// 右侧工具栏
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

/***/ },

/***/ 62:
/***/ function(module, exports) {

	/*!
	 * Lazy Load - jQuery plugin for lazy loading images
	 *
	 * Copyright (c) 2007-2015 Mika Tuupola
	 *
	 * Licensed under the MIT license:
	 *   http://www.opensource.org/licenses/mit-license.php
	 *
	 * Project home:
	 *   http://www.appelsiini.net/projects/lazyload
	 *
	 * Version:  1.9.7
	 *
	 */

	(function($){
	    var $window = $(window);

	    $.fn.lazyload = function(options) {
	        var elements = this;
	        var $container;
	        var settings = {
	            threshold       : 0,
	            failure_limit   : 0,
	            event           : "scroll",
	            effect          : "show",
	            container       : window,
	            data_attribute  : "original",
	            skip_invisible  : false,
	            appear          : null,
	            load            : null,
	            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
	        };

	        function update() {
	            var counter = 0;

	            elements.each(function() {
	                var $this = $(this);
	                if (settings.skip_invisible && !$this.is(":visible")) {
	                    return;
	                }
	                if ($.abovethetop(this, settings) ||
	                    $.leftofbegin(this, settings)) {
	                        /* Nothing. */
	                } else if (!$.belowthefold(this, settings) &&
	                    !$.rightoffold(this, settings)) {
	                        $this.trigger("appear");
	                        /* if we found an image we'll load, reset the counter */
	                        counter = 0;
	                } else {
	                    if (++counter > settings.failure_limit) {
	                        return false;
	                    }
	                }
	            });

	        }

	        if(options) {
	            /* Maintain BC for a couple of versions. */
	            if (undefined !== options.failurelimit) {
	                options.failure_limit = options.failurelimit;
	                delete options.failurelimit;
	            }
	            if (undefined !== options.effectspeed) {
	                options.effect_speed = options.effectspeed;
	                delete options.effectspeed;
	            }

	            $.extend(settings, options);
	        }

	        /* Cache container as jQuery as object. */
	        $container = (settings.container === undefined ||
	                      settings.container === window) ? $window : $(settings.container);

	        /* Fire one scroll event per scroll. Not one scroll event per image. */
	        if (0 === settings.event.indexOf("scroll")) {
	            $container.bind(settings.event, function() {
	                return update();
	            });
	        }

	        this.each(function() {
	            var self = this;
	            var $self = $(self);

	            self.loaded = false;

	            /* If no src attribute given use data:uri. */
	            if ($self.attr("src") === undefined || $self.attr("src") === false) {
	                if ($self.is("img")) {
	                    $self.attr("src", settings.placeholder);
	                }
	            }

	            /* When appear is triggered load original image. */
	            $self.one("appear", function() {
	                if (!this.loaded) {
	                    if (settings.appear) {
	                        var elements_left = elements.length;
	                        settings.appear.call(self, elements_left, settings);
	                    }
	                    $("<img />")
	                        .bind("load", function() {

	                            var original = $self.attr("data-" + settings.data_attribute);
	                            $self.hide();
	                            if ($self.is("img")) {
	                                $self.attr("src", original);
	                            } else {
	                                $self.css("background-image", "url('" + original + "')");
	                            }
	                            $self[settings.effect](settings.effect_speed);

	                            self.loaded = true;

	                            /* Remove image from array so it is not looped next time. */
	                            var temp = $.grep(elements, function(element) {
	                                return !element.loaded;
	                            });
	                            elements = $(temp);

	                            if (settings.load) {
	                                var elements_left = elements.length;
	                                settings.load.call(self, elements_left, settings);
	                            }
	                        })
	                        .attr("src", $self.attr("data-" + settings.data_attribute));
	                }
	            });

	            /* When wanted event is triggered load original image */
	            /* by triggering appear.                              */
	            if (0 !== settings.event.indexOf("scroll")) {
	                $self.bind(settings.event, function() {
	                    if (!self.loaded) {
	                        $self.trigger("appear");
	                    }
	                });
	            }
	        });

	        /* Check if something appears when window is resized. */
	        $window.bind("resize", function() {
	            update();
	        });

	        /* With IOS5 force loading images when navigating with back button. */
	        /* Non optimal workaround. */
	        if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
	            $window.bind("pageshow", function(event) {
	                if (event.originalEvent && event.originalEvent.persisted) {
	                    elements.each(function() {
	                        $(this).trigger("appear");
	                    });
	                }
	            });
	        }

	        /* Force initial check if images should appear. */
	        $(document).ready(function() {
	            update();
	        });

	        return this;
	    };

	    /* Convenience methods in jQuery namespace.           */
	    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

	    $.belowthefold = function(element, settings) {
	        var fold;

	        if (settings.container === undefined || settings.container === window) {
	            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
	        } else {
	            fold = $(settings.container).offset().top + $(settings.container).height();
	        }

	        return fold <= $(element).offset().top - settings.threshold;
	    };

	    $.rightoffold = function(element, settings) {
	        var fold;

	        if (settings.container === undefined || settings.container === window) {
	            fold = $window.width() + $window.scrollLeft();
	        } else {
	            fold = $(settings.container).offset().left + $(settings.container).width();
	        }

	        return fold <= $(element).offset().left - settings.threshold;
	    };

	    $.abovethetop = function(element, settings) {
	        var fold;

	        if (settings.container === undefined || settings.container === window) {
	            fold = $window.scrollTop();
	        } else {
	            fold = $(settings.container).offset().top;
	        }

	        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
	    };

	    $.leftofbegin = function(element, settings) {
	        var fold;

	        if (settings.container === undefined || settings.container === window) {
	            fold = $window.scrollLeft();
	        } else {
	            fold = $(settings.container).offset().left;
	        }

	        return fold >= $(element).offset().left + settings.threshold + $(element).width();
	    };

	    $.inviewport = function(element, settings) {
	         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
	                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
	     };

	    /* Custom selectors for your convenience.   */
	    /* Use as $("img:below-the-fold").something() or */
	    /* $("img").filter(":below-the-fold").something() which is faster */

	    $.extend($.expr[":"], {
	        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
	        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
	        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
	        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
	        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
	        /* Maintain BC for couple of versions. */
	        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
	        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
	        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
	    });

	})(jQuery);

	if(typeof module != 'undefined' && typeof module.exports != 'undefined'){
	    module.exports = $ = jQuery; 
	}




/***/ },

/***/ 210:
/***/ function(module, exports) {

	/*!
	 * SuperSlide v2.1.1 
	 * 轻松解决网站大部分特效展示问题
	 * 详尽信息请看官网：http://www.SuperSlide2.com/
	 *
	 * Copyright 2011-2013, 大话主席
	 *
	 * 请尊重原创，保留头部版权
	 * 在保留版权的前提下可应用于个人或商业用途

	 * v2.1.1：修复当调用多个SuperSlide，并设置returnDefault:true 时返回defaultIndex索引错误

	 */


	$.fn.slide=function(options){
		$.fn.slide.defaults={
		type:"slide", 
		effect:"fade", 
		autoPlay:false, 
		delayTime:500, 
		interTime:2500,
		triggerTime:150,
		defaultIndex:0,
		titCell:".hd li",
		mainCell:".bd",
		targetCell:null,
		trigger:"mouseover",
		scroll:1,
		vis:1,
		titOnClassName:"on",
		autoPage:false, 
		prevCell:".prev",
		nextCell:".next",
		pageStateCell:".pageState",
		opp: false, 
		pnLoop:true, 
		easing:"swing", 
		startFun:null,
		endFun:null,
		switchLoad:null,

		playStateCell:".playState",
		mouseOverStop:true,
		defaultPlay:true,
		returnDefault:false 
		};

		return this.each(function() {

			var opts = $.extend({},$.fn.slide.defaults,options);
			var slider = $(this);
			var effect = opts.effect;
			var prevBtn = $(opts.prevCell, slider);
			var nextBtn = $(opts.nextCell, slider);
			var pageState = $(opts.pageStateCell, slider);
			var playState = $(opts.playStateCell, slider);

			var navObj = $(opts.titCell, slider);//导航子元素结合
			var navObjSize = navObj.size();
			var conBox = $(opts.mainCell , slider);//内容元素父层对象
			var conBoxSize=conBox.children().size();
			var sLoad=opts.switchLoad;
			var tarObj = $(opts.targetCell, slider);

			/*字符串转换*/
			var index=parseInt(opts.defaultIndex);
			var delayTime=parseInt(opts.delayTime);
			var interTime=parseInt(opts.interTime);
			var triggerTime=parseInt(opts.triggerTime);
			var scroll=parseInt(opts.scroll);
			var vis=parseInt(opts.vis);
			var autoPlay = (opts.autoPlay=="false"||opts.autoPlay==false)?false:true;
			var opp = (opts.opp=="false"||opts.opp==false)?false:true;
			var autoPage = (opts.autoPage=="false"||opts.autoPage==false)?false:true;
			var pnLoop = (opts.pnLoop=="false"||opts.pnLoop==false)?false:true;
			var mouseOverStop = (opts.mouseOverStop=="false"||opts.mouseOverStop==false)?false:true;
			var defaultPlay = (opts.defaultPlay=="false"||opts.defaultPlay==false)?false:true;
			var returnDefault = (opts.returnDefault=="false"||opts.returnDefault==false)?false:true;

			var slideH=0;
			var slideW=0;
			var selfW=0;
			var selfH=0;
			var easing=opts.easing;
			var inter=null;//autoPlay-setInterval 
			var mst =null;//trigger-setTimeout
			var rtnST=null;//returnDefault-setTimeout
			var titOn = opts.titOnClassName;

			var onIndex = navObj.index( slider.find( "."+titOn) );
			var oldIndex = index = onIndex==-1?index:onIndex;
			var defaultIndex = index;


			var _ind = index;
			var cloneNum = conBoxSize>=vis?( conBoxSize%scroll!=0?conBoxSize%scroll:scroll):0; 
			var _tar;
			var isMarq = effect=="leftMarquee" || effect=="topMarquee"?true:false;

			var doStartFun=function(){ if ( $.isFunction( opts.startFun) ){ opts.startFun( index,navObjSize,slider,$(opts.titCell, slider),conBox,tarObj,prevBtn,nextBtn ) } }
			var doEndFun=function(){ if ( $.isFunction( opts.endFun ) ){ opts.endFun( index,navObjSize,slider,$(opts.titCell, slider),conBox,tarObj,prevBtn,nextBtn ) } }
			var resetOn=function(){ navObj.removeClass(titOn); if( defaultPlay ) navObj.eq(defaultIndex).addClass(titOn)  }



			//单独处理菜单效果
			if( opts.type=="menu" ){

				if( defaultPlay ){ navObj.removeClass(titOn).eq(index).addClass(titOn); }
				navObj.hover(
						function(){
							_tar=$(this).find( opts.targetCell );
							var hoverInd =navObj.index($(this));
						
							mst = setTimeout(function(){  
								index=hoverInd;
								navObj.removeClass(titOn).eq	(index).addClass(titOn);
								doStartFun();
								switch (effect)
								{
									case "fade":_tar.stop(true,true).animate({opacity:"show"}, delayTime,easing,doEndFun ); break;
									case "slideDown":_tar.stop(true,true).animate({height:"show"}, delayTime,easing,doEndFun ); break;
								}
							} ,opts.triggerTime);

						},function(){
							clearTimeout(mst);
							switch (effect){ case "fade":_tar.animate( {opacity:"hide"},delayTime,easing ); break; case "slideDown":_tar.animate( {height:"hide"},delayTime,easing ); break; }
						}
				);

				if (returnDefault){ 
					slider.hover(function(){clearTimeout(rtnST);},function(){ rtnST = setTimeout( resetOn,delayTime ); });
				}
				

				return;
			}

			
			//处理分页
			if( navObjSize==0 )navObjSize=conBoxSize;//只有左右按钮
			if( isMarq ) navObjSize=2;
			if( autoPage ){
				if(conBoxSize>=vis){
					if( effect=="leftLoop" || effect=="topLoop" ){ navObjSize=conBoxSize%scroll!=0?(conBoxSize/scroll^0)+1:conBoxSize/scroll; }
					else{ 
							var tempS = conBoxSize-vis;
							navObjSize=1+parseInt(tempS%scroll!=0?(tempS/scroll+1):(tempS/scroll)); 
							if(navObjSize<=0)navObjSize=1; 
					}
				}
				else{ navObjSize=1 }
				
				navObj.html(""); 
				var str="";

				if( opts.autoPage==true || opts.autoPage=="true" ){ for( var i=0; i<navObjSize; i++ ){ str+="<li>"+(i+1)+"</li>" } }
				else{ for( var i=0; i<navObjSize; i++ ){ str+=opts.autoPage.replace("$",(i+1))  } }
				navObj.html(str); 
				
				var navObj = navObj.children();//重置导航子元素对象
			}


			if(conBoxSize>=vis){ //当内容个数少于可视个数，不执行效果。
				conBox.children().each(function(){ //取最大值
					if( $(this).width()>selfW ){ selfW=$(this).width(); slideW=$(this).outerWidth(true);  }
					if( $(this).height()>selfH ){ selfH=$(this).height(); slideH=$(this).outerHeight(true);  }
				});

				var _chr = conBox.children();
				var cloneEle = function(){ 
					for( var i=0; i<vis ; i++ ){ _chr.eq(i).clone().addClass("clone").appendTo(conBox); } 
					for( var i=0; i<cloneNum ; i++ ){ _chr.eq(conBoxSize-i-1).clone().addClass("clone").prependTo(conBox); }
				}
				
				switch(effect)
				{
					case "fold": conBox.css({"position":"relative","width":slideW,"height":slideH}).children().css( {"position":"absolute","width":selfW,"left":0,"top":0,"display":"none"} ); break;
					case "top": conBox.wrap('<div class="tempWrap" style="overflow:hidden; position:relative; height:'+vis*slideH+'px"></div>').css( { "top":-(index*scroll)*slideH, "position":"relative","padding":"0","margin":"0"}).children().css( {"height":selfH} ); break;
					case "left": conBox.wrap('<div class="tempWrap" style="overflow:hidden; position:relative; width:'+vis*slideW+'px"></div>').css( { "width":conBoxSize*slideW,"left":-(index*scroll)*slideW,"position":"relative","overflow":"hidden","padding":"0","margin":"0"}).children().css( {"float":"left","width":selfW} ); break;
					case "leftLoop":
					case "leftMarquee":
						cloneEle();
						conBox.wrap('<div class="tempWrap" style="overflow:hidden; position:relative; width:'+vis*slideW+'px"></div>').css( { "width":(conBoxSize+vis+cloneNum)*slideW,"position":"relative","overflow":"hidden","padding":"0","margin":"0","left":-(cloneNum+index*scroll)*slideW}).children().css( {"float":"left","width":selfW}  ); break;
					case "topLoop":
					case "topMarquee":
						cloneEle();
						conBox.wrap('<div class="tempWrap" style="overflow:hidden; position:relative; height:'+vis*slideH+'px"></div>').css( { "height":(conBoxSize+vis+cloneNum)*slideH,"position":"relative","padding":"0","margin":"0","top":-(cloneNum+index*scroll)*slideH}).children().css( {"height":selfH} ); break;
				}
			}



			//针对leftLoop、topLoop的滚动个数
			var scrollNum=function(ind){ 
				var _tempCs= ind*scroll; 
				if( ind==navObjSize ){ _tempCs=conBoxSize; }else if( ind==-1 && conBoxSize%scroll!=0){ _tempCs=-conBoxSize%scroll; }
				return _tempCs;
			}

			//切换加载
			var doSwitchLoad=function(objs){ 

					var changeImg=function(t){
						for ( var i= t; i<( vis+ t); i++ ){
								objs.eq(i).find("img["+sLoad+"]").each(function(){ 
									var _this =  $(this);
									_this.attr("src",_this.attr(sLoad)).removeAttr(sLoad);
									if( conBox.find(".clone")[0] ){ //如果存在.clone
										var chir = conBox.children();
										for ( var j=0 ; j< chir.size() ; j++ )
										{
											chir.eq(j).find("img["+sLoad+"]").each(function(){
												if( $(this).attr(sLoad)==_this.attr("src") ) $(this).attr("src",$(this).attr(sLoad)).removeAttr(sLoad) 
											})
										}
									}
								})
							}
					}

					switch(effect)
					{
						case "fade": case "fold": case "top": case "left": case "slideDown":
							changeImg( index*scroll );
							break;
						case "leftLoop": case "topLoop":
							changeImg( cloneNum+scrollNum(_ind) );
							break;
						case "leftMarquee":case "topMarquee": 
							var curS = effect=="leftMarquee"? conBox.css("left").replace("px",""):conBox.css("top").replace("px",""); 
							var slideT = effect=="leftMarquee"? slideW:slideH; 
							var mNum=cloneNum;
							if( curS%slideT!=0 ){
								var curP = Math.abs(curS/slideT^0);
								if( index==1 ){ mNum=cloneNum+curP }else{  mNum=cloneNum+curP-1  }
							}
							changeImg( mNum );
							break;
					}
			}//doSwitchLoad end


			//效果函数
			var doPlay=function(init){
				 // 当前页状态不触发效果
				if( defaultPlay && oldIndex==index && !init && !isMarq ) return;
				
				//处理页码
				if( isMarq ){ if ( index>= 1) { index=1; } else if( index<=0) { index = 0; } }
				else{ 
					_ind=index; if ( index >= navObjSize) { index = 0; } else if( index < 0) { index = navObjSize-1; }
				}

				doStartFun();

				//处理切换加载
				if( sLoad!=null ){ doSwitchLoad( conBox.children() ) }

				//处理targetCell
				if(tarObj[0]){ 
					_tar = tarObj.eq(index);
					if( sLoad!=null ){ doSwitchLoad( tarObj ) }
					if( effect=="slideDown" ){
							tarObj.not(_tar).stop(true,true).slideUp(delayTime); 
							_tar.slideDown( delayTime,easing,function(){ if(!conBox[0]) doEndFun() }); 
					}
					else{
							tarObj.not(_tar).stop(true,true).hide();
							_tar.animate({opacity:"show"},delayTime,function(){ if(!conBox[0]) doEndFun() }); 
					}
				}
				
				if(conBoxSize>=vis){ //当内容个数少于可视个数，不执行效果。
					switch (effect)
					{
						case "fade":conBox.children().stop(true,true).eq(index).animate({opacity:"show"},delayTime,easing,function(){doEndFun()}).siblings().hide(); break;
						case "fold":conBox.children().stop(true,true).eq(index).animate({opacity:"show"},delayTime,easing,function(){doEndFun()}).siblings().animate({opacity:"hide"},delayTime,easing);break;
						case "top":conBox.stop(true,false).animate({"top":-index*scroll*slideH},delayTime,easing,function(){doEndFun()});break;
						case "left":conBox.stop(true,false).animate({"left":-index*scroll*slideW},delayTime,easing,function(){doEndFun()});break;
						case "leftLoop":
							var __ind = _ind;
							conBox.stop(true,true).animate({"left":-(scrollNum(_ind)+cloneNum)*slideW},delayTime,easing,function(){
								if( __ind<=-1 ){ conBox.css("left",-(cloneNum+(navObjSize-1)*scroll)*slideW);  }else if( __ind>=navObjSize ){ conBox.css("left",-cloneNum*slideW); }
								doEndFun();
							});
							break;//leftLoop end

						case "topLoop":
							var __ind = _ind;
							conBox.stop(true,true).animate({"top":-(scrollNum(_ind)+cloneNum)*slideH},delayTime,easing,function(){
								if( __ind<=-1 ){ conBox.css("top",-(cloneNum+(navObjSize-1)*scroll)*slideH);  }else if( __ind>=navObjSize ){ conBox.css("top",-cloneNum*slideH); }
								doEndFun();
							});
							break;//topLoop end

						case "leftMarquee":
							var tempLeft = conBox.css("left").replace("px",""); 
							if(index==0 ){
									conBox.animate({"left":++tempLeft},0,function(){
										if( conBox.css("left").replace("px","")>= 0){ conBox.css("left",-conBoxSize*slideW) }
									});
							}
							else{
									conBox.animate({"left":--tempLeft},0,function(){
										if(  conBox.css("left").replace("px","")<= -(conBoxSize+cloneNum)*slideW){ conBox.css("left",-cloneNum*slideW) }
									});
							}break;// leftMarquee end

							case "topMarquee":
							var tempTop = conBox.css("top").replace("px",""); 
							if(index==0 ){
									conBox.animate({"top":++tempTop},0,function(){
										if( conBox.css("top").replace("px","")>= 0){ conBox.css("top",-conBoxSize*slideH) }
									});
							}
							else{
									conBox.animate({"top":--tempTop},0,function(){
										if(  conBox.css("top").replace("px","")<= -(conBoxSize+cloneNum)*slideH){ conBox.css("top",-cloneNum*slideH) }
									});
							}break;// topMarquee end

					}//switch end
				}

					navObj.removeClass(titOn).eq(index).addClass(titOn);
					oldIndex=index;
					if( !pnLoop ){ //pnLoop控制前后按钮是否继续循环
						nextBtn.removeClass("nextStop"); prevBtn.removeClass("prevStop");
						if (index==0 ){ prevBtn.addClass("prevStop"); }
						if (index==navObjSize-1 ){ nextBtn.addClass("nextStop"); }
					}

					pageState.html( "<span>"+(index+1)+"</span>/"+navObjSize);

			};// doPlay end

			//初始化执行
			if( defaultPlay ){ doPlay(true); }

			if (returnDefault)//返回默认状态
			{
				slider.hover(function(){ clearTimeout(rtnST) },function(){
						rtnST = setTimeout( function(){
							index=defaultIndex;
							if(defaultPlay){ doPlay(); }
							else{
								if( effect=="slideDown" ){ _tar.slideUp( delayTime, resetOn ); }
								else{ _tar.animate({opacity:"hide"},delayTime,resetOn ); }
							}
							oldIndex=index;
						},300 );
				});
			}
			
			///自动播放函数
			var setInter = function(time){ inter=setInterval(function(){  opp?index--:index++; doPlay() }, !!time?time:interTime);  }
			var setMarInter = function(time){ inter = setInterval(doPlay, !!time?time:interTime);  }
			// 处理mouseOverStop
			var resetInter = function(){ if( !mouseOverStop ){clearInterval(inter); setInter() } }
			// 前后按钮触发
			var nextTrigger = function(){ if ( pnLoop || index!=navObjSize-1 ){ index++; doPlay(); if(!isMarq)resetInter(); } }
			var prevTrigger = function(){ if ( pnLoop || index!=0 ){ index--; doPlay(); if(!isMarq)resetInter(); } }
			//处理playState
			var playStateFun = function(){ clearInterval(inter); isMarq?setMarInter():setInter(); playState.removeClass("pauseState") }
			var pauseStateFun = function(){ clearInterval(inter);playState.addClass("pauseState"); }

			//自动播放
			if (autoPlay) {
					if( isMarq ){ 
						opp?index--:index++; setMarInter();
						if(mouseOverStop) conBox.hover(pauseStateFun,playStateFun);
					}else{
						setInter();
						if(mouseOverStop) slider.hover( pauseStateFun,playStateFun );
					}
			}
			else{ if( isMarq ){ opp?index--:index++; } playState.addClass("pauseState"); }

			playState.click(function(){  playState.hasClass("pauseState")?playStateFun():pauseStateFun()  });

			//titCell事件
			if(opts.trigger=="mouseover"){
				navObj.hover(function(){ var hoverInd = navObj.index(this);  mst = setTimeout(function(){  index=hoverInd; doPlay(); resetInter();  },opts.triggerTime); }, function(){ clearTimeout(mst) });
			}else{ navObj.click(function(){ index=navObj.index(this); doPlay(); resetInter(); })  }

			//前后按钮事件
			if (isMarq){
				
				nextBtn.mousedown(nextTrigger);
				prevBtn.mousedown(prevTrigger);
				//前后按钮长按10倍加速
				if (pnLoop)
				{	
					var st;
					var marDown = function(){ st=setTimeout(function(){ clearInterval(inter); setMarInter( interTime/10^0 ) },150) }
					var marUp = function(){ clearTimeout(st); clearInterval(inter); setMarInter() }
					nextBtn.mousedown(marDown); nextBtn.mouseup(marUp);
					prevBtn.mousedown(marDown); prevBtn.mouseup(marUp);
				}
				//前后按钮mouseover事件
				if( opts.trigger=="mouseover"  ){ nextBtn.hover(nextTrigger,function(){}); prevBtn.hover(prevTrigger,function(){}); }
			}else{
				nextBtn.click(nextTrigger);
				prevBtn.click(prevTrigger);
			}

		});//each End

	};//slide End


	if(typeof module != 'undefined' && typeof module.exports != 'undefined'){
		module.exports = $;	
	}

	jQuery.easing['jswing'] = jQuery.easing['swing'];
	jQuery.extend( jQuery.easing,
	{
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) { return jQuery.easing[jQuery.easing.def](x, t, b, c, d); },
		easeInQuad: function (x, t, b, c, d) {return c*(t/=d)*t + b;},
		easeOutQuad: function (x, t, b, c, d) {return -c *(t/=d)*(t-2) + b},
		easeInOutQuad: function (x, t, b, c, d) {if ((t/=d/2) < 1) return c/2*t*t + b;return -c/2 * ((--t)*(t-2) - 1) + b},
		easeInCubic: function (x, t, b, c, d) {return c*(t/=d)*t*t + b},
		easeOutCubic: function (x, t, b, c, d) {return c*((t=t/d-1)*t*t + 1) + b},
		easeInOutCubic: function (x, t, b, c, d) {if ((t/=d/2) < 1) return c/2*t*t*t + b;return c/2*((t-=2)*t*t + 2) + b},
		easeInQuart: function (x, t, b, c, d) {return c*(t/=d)*t*t*t + b},
		easeOutQuart: function (x, t, b, c, d) {return -c * ((t=t/d-1)*t*t*t - 1) + b},
		easeInOutQuart: function (x, t, b, c, d) {if ((t/=d/2) < 1) return c/2*t*t*t*t + b;return -c/2 * ((t-=2)*t*t*t - 2) + b},
		easeInQuint: function (x, t, b, c, d) {return c*(t/=d)*t*t*t*t + b},
		easeOutQuint: function (x, t, b, c, d) {return c*((t=t/d-1)*t*t*t*t + 1) + b},
		easeInOutQuint: function (x, t, b, c, d) {if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;return c/2*((t-=2)*t*t*t*t + 2) + b},
		easeInSine: function (x, t, b, c, d) {return -c * Math.cos(t/d * (Math.PI/2)) + c + b},
		easeOutSine: function (x, t, b, c, d) {return c * Math.sin(t/d * (Math.PI/2)) + b},
		easeInOutSine: function (x, t, b, c, d) {return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b},
		easeInExpo: function (x, t, b, c, d) {return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b},
		easeOutExpo: function (x, t, b, c, d) {return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b},
		easeInOutExpo: function (x, t, b, c, d) {if (t==0) return b;if (t==d) return b+c;if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;return c/2 * (-Math.pow(2, -10 * --t) + 2) + b},
		easeInCirc: function (x, t, b, c, d) {return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b},
		easeOutCirc: function (x, t, b, c, d) {return c * Math.sqrt(1 - (t=t/d-1)*t) + b},
		easeInOutCirc: function (x, t, b, c, d) {if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b},
		easeInElastic: function (x, t, b, c, d) {var s=1.70158;var p=0;var a=c;if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b},
		easeOutElastic: function (x, t, b, c, d) {var s=1.70158;var p=0;var a=c;if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b},
		easeInOutElastic: function (x, t, b, c, d) {var s=1.70158;var p=0;var a=c;if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b},
		easeInBack: function (x, t, b, c, d, s) {if (s == undefined) s = 1.70158;return c*(t/=d)*t*((s+1)*t - s) + b},
		easeOutBack: function (x, t, b, c, d, s) {if (s == undefined) s = 1.70158;return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b},
		easeInOutBack: function (x, t, b, c, d, s) {if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b},
		easeInBounce: function (x, t, b, c, d) {return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b},
		easeOutBounce: function (x, t, b, c, d) {if ((t/=d) < (1/2.75)) {	return c*(7.5625*t*t) + b;} else if (t < (2/2.75)) {	return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;} else if (t < (2.5/2.75)) {	return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;} else {	return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;}},
		easeInOutBounce: function (x, t, b, c, d) {if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;}
	});

/***/ }

/******/ });