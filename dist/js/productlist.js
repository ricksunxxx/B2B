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

	
	// image lazyload
	__webpack_require__(62);
	var Popup = __webpack_require__(51);

	var selectorPanel = '.ui-dl-horizontal',
		selectorItem = '.prod-selector-item';
	var isMultipleExt = false;

	var selectorWrap = $('#J_prod_selector');

	var productlist = {
		init: function(){

			selectorWrap.find('dl.ui-dl-horizontal').each(function(){
				var $this = $(this),
					panel = $this.find('dd.value');

				if(panel.height() > $this.height()){
					$this.find('.ext-more').css('visibility', 'visible');
				}
			});

			// 图片lazyload
			$('img.lazy').lazyload({
				data_attribute: 'lazy',
				threshold: 200,
				effect: 'fadeIn'
			});

			this.bindEvent();
		},
		bindEvent: function(){
			var self = this;

			// 展开更多
			selectorWrap.delegate('.ext-more', 'click', function(){
				var $this = $(this);

				$this.toggleClass('clicked');

				if($this.hasClass('clicked')){
					self.extSelectorPanel($this, function(){
						$this.text('收起');
					});					
				}else{
					self.minSelectorPanel($this, function(){
						$this.text('更多');
					});				
				}	
			});
			selectorWrap.delegate('.ext-multiple', 'click', function(){
				var $this = $(this);
					self.extSelectorPanel($this, function(wrap){
						isMultipleExt = true;
						wrap.find('.prod-selector-ext').hide();
						wrap.find('.prod-selector-btns').show();
					});	
			});
			selectorWrap.delegate(selectorItem, 'click', function(){
				var $this = $(this);

				if(isMultipleExt){
					
					$this.toggleClass('selected');

					return false;
				}
			});

			$('#J_selector_cancel').on('click', function(e){
				e.stopPropagation();
				self.minSelectorPanel($(this), function(wrap){
					isMultipleExt = false;
					wrap.find('.prod-selector-ext').show();
					wrap.find('.prod-selector-btns').hide();
					wrap.find(selectorItem).each(function(){
						$(this).removeClass('selected');
					});
					wrap.find('.ext-more').removeClass('clicked').text('更多');
				});
			});

			// 面包屑分类
			var dropboxTimer = null;
			var hoverDelay = function(e, panel){
				if(e.type === 'mouseover'){
					panel.show();
					dropboxTimer && clearTimeout(dropboxTimer);
				}else{
					dropboxTimer = setTimeout(function(){
						panel.hide();
					}, 300);
				}
			};

			$('.ui-navmini-list').delegate('>li', 'mouseover mouseleave', function(e){
				var dropbox = $(this).find('.dropbox');

				dropboxTimer && clearTimeout(dropboxTimer);
				$(this).siblings().find('.dropbox').hide();

				if(dropbox[0]){
					hoverDelay(e, dropbox);	
				}
			}).delegate('.dropbox', 'mouseover mouseleave', function(e){
				e.stopPropagation();
				hoverDelay(e, $(this));
			});

			// 面包屑搜索
			var crumbsSearchInput = $('#J_crumbs_search'),
				crumbsSearchVal = crumbsSearchInput.val();
			crumbsSearchInput.on('focus blur', function(e){
				var $this = $(this);

				if(e.type === 'focus'){
					$this.select();
				}else{
					if(!$.trim($this.val()).length){
						crumbsSearchInput.val(crumbsSearchVal);
					}
				}
			});

			// 价格dropbox
			var filterPriceEl = $('#J_filter_price');
			var pricePop = new Popup({
				trigger: '#J_filter_price .ui-input',
				element: '#J_filter_price .prod-filter-dropbox',
				triggerType: 'focus'
			});
			pricePop.before('show', function(){
				filterPriceEl.addClass('active');
			});
			pricePop.before('hide', function(){
				filterPriceEl.removeClass('active');
			});
			$('#J_filter_clear').on('click', function(e){
				e.preventDefault();
				filterPriceEl.find('.ui-input').val('');
			});
			$('#J_filter_enter').on('click', function(e){
				e.preventDefault();
				$('#J_form_filter').submit();
			});

			// 面包屑超长处理
			var crumbsSlide = $('#J_crumbs_slide'),
				crumbsNav = crumbsSlide.find('.ui-navmini-list'),
				crumbsNavLastItem = crumbsNav.find('>li:last'),
				crumbsNavWidth = parseInt(crumbsNavLastItem.position().left + crumbsNavLastItem.outerWidth(), 10),
				crumbsSlideWidth = parseInt(crumbsSlide.innerWidth(), 10),
				speed = 300,
				startPosition = 0, 
				lastPosition = 0;

			if(crumbsNavWidth > crumbsSlideWidth){
				var prevBtn = crumbsSlide.find('.prev'),
					nextBtn = crumbsSlide.find('.next');

				crumbsSlide.addClass('slide');

				var n = Math.floor(crumbsNavWidth/crumbsSlideWidth);
			
				lastPosition = -crumbsNavWidth + crumbsSlideWidth - 40;

				crumbsNav.animate({
					left: lastPosition
				}, speed);

				var index = max = n;

				prevBtn.on('click', function(){
					var $this = $(this);

					if(index === 0) return false;
					
					index -= 1;
					
					if(index < 0){
						index = 0;
					}

					var position = -(crumbsSlideWidth * index);

					if(index === 0){
						position = startPosition;
					}

					crumbsNav.animate({left: position}, speed, function(){
						if(index === 0){
							$this.hide();
						}
						nextBtn.show();
					});
				});

				nextBtn.on('click', function(){
					var $this = $(this);

					if(index === max) return false;

					index += 1;

					if(index > max){
						index = max;
					}

					var position = -(crumbsSlideWidth * index);

					if(index === max){
						position = lastPosition;
					}
					
					crumbsNav.animate({left: position}, speed, function(){
						if(index === max){
							$this.hide();
						}
						prevBtn.show();
					});
				});
			}

		},
		extSelectorPanel: function(trigger, callback){
			var thisWrap = trigger.closest(selectorPanel);
			thisWrap.addClass('opened');
			callback && callback(thisWrap);
		},
		minSelectorPanel: function(trigger, callback){
			var thisWrap = trigger.closest(selectorPanel);
			thisWrap.removeClass('opened');
			callback && callback(thisWrap);
		}	
	};

	$(function(){
		productlist.init();
	});


/***/ },

/***/ 4:
/***/ function(module, exports, __webpack_require__) {

	// Widget
	// ---------
	// Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理。
	// Widget 组件具有四个要素：描述状态的 attributes 和 properties，描述行为的 events
	// 和 methods。Widget 基类约定了这四要素创建时的基本流程和最佳实践。

	var Base = __webpack_require__(14);
	// var $ = require('jquery');

	var DELEGATE_EVENT_NS = '.delegate-events-';
	var ON_RENDER = '_onRender';
	var DATA_WIDGET_CID = 'data-widget-cid';
	var DATA_WIDGET_AUTO_RENDERED = 'data-widget-auto-rendered';

	var RE_DASH_WORD = /-([a-z])/g
	var JSON_LITERAL_PATTERN = /^\s*[\[{].*[\]}]\s*$/
	var parseJSON = window.JSON ? JSON.parse : $.parseJSON


	// 仅处理字母开头的，其他情况转换为小写："data-x-y-123-_A" --> xY-123-_a
	function camelCase(str) {
	    return str.toLowerCase().replace(RE_DASH_WORD, function(all, letter) {
	        return (letter + '').toUpperCase();
	    });
	}

	// 解析并归一化配置中的值
	function normalizeValues(data) {
	    for (var key in data) {
	        if (data.hasOwnProperty(key)) {

	            var val = data[key];
	            if (typeof val !== 'string') continue;

	            if (JSON_LITERAL_PATTERN.test(val)) {
	                val = val.replace(/'/g, '"');
	                data[key] = normalizeValues(parseJSON(val));
	            } else {
	                data[key] = normalizeValue(val);
	            }
	        }
	    }

	    return data;
	}

	// 将 'false' 转换为 false
	// 'true' 转换为 true
	// '3253.34' 转换为 3253.34
	function normalizeValue(val) {
	    if (val.toLowerCase() === 'false') {
	        val = false;
	    } else if (val.toLowerCase() === 'true') {
	        val = true;
	    } else if (/\d/.test(val) && /[^a-z]/i.test(val)) {
	        var number = parseFloat(val);
	        if (number + '' === val) {
	            val = number;
	        }
	    }

	    return val;
	}

	// DAParser
	// --------
	// data api 解析器，提供对单个 element 的解析，可用来初始化页面中的所有 Widget 组件。
	var DAParser = {
	    // 得到某个 DOM 元素的 dataset
	    parseElement: function(element, raw) {
	        element = $(element)[0];
	        var dataset = {};

	        // ref: https://developer.mozilla.org/en/DOM/element.dataset
	        if (element.dataset) {
	            // 转换成普通对象
	            dataset = $.extend({}, element.dataset);
	        } else {
	            var attrs = element.attributes;

	            for (var i = 0, len = attrs.length; i < len; i++) {
	                var attr = attrs[i];
	                var name = attr.name;

	                if (name.indexOf('data-') === 0) {
	                    name = camelCase(name.substring(5));
	                    dataset[name] = attr.value;
	                }
	            }
	        }

	        return raw === true ? dataset : normalizeValues(dataset);
	    }
	};

	var isDefaultOff = $(document.body).attr('data-api') === 'off';

	var AutoRender = {
	    // 自动渲染接口，子类可根据自己的初始化逻辑进行覆盖
	    autoRender: function(config) {
	        return new this(config).render();
	    },

	    // 根据 data-widget 属性，自动渲染所有开启了 data-api 的 widget 组件
	    autoRenderAll: function(root, callback) {
	        if (typeof root === 'function') {
	            callback = root;
	            root = null;
	        }

	        root = $(root || document.body);
	        var modules = [];
	        var elements = [];

	        root.find('[data-widget]').each(function(i, element) {
	            if (!exports.isDataApiOff(element)) {
	                modules.push(element.getAttribute('data-widget').toLowerCase());
	                elements.push(element);
	            }
	        });

	        if (modules.length) {
	            seajs.use(modules, function() {

	                for (var i = 0; i < arguments.length; i++) {
	                    var SubWidget = arguments[i];
	                    var element = $(elements[i]);

	                    // 已经渲染过
	                    if (element.attr(DATA_WIDGET_AUTO_RENDERED)) continue;

	                    var config = {
	                        initElement: element,
	                        renderType: 'auto'
	                    };

	                    // data-widget-role 是指将当前的 DOM 作为 role 的属性去实例化，默认的 role 为 element
	                    var role = element.attr('data-widget-role');
	                    config[role ? role : 'element'] = element;

	                    // 调用自动渲染接口
	                    SubWidget.autoRender && SubWidget.autoRender(config);

	                    // 标记已经渲染过
	                    element.attr(DATA_WIDGET_AUTO_RENDERED, 'true');
	                }

	                // 在所有自动渲染完成后，执行回调
	                callback && callback();
	            });
	        }
	    },
	    // 是否没开启 data-api
	    isDataApiOff: function(element) {
	        var elementDataApi = $(element).attr('data-api');

	        // data-api 默认开启，关闭只有两种方式：
	        //  1. element 上有 data-api="off"，表示关闭单个
	        //  2. document.body 上有 data-api="off"，表示关闭所有
	        return elementDataApi === 'off' ||
	            (elementDataApi !== 'on' && isDefaultOff);
	    }
	};

	// 所有初始化过的 Widget 实例
	var cachedInstances = {};

	var Widget = Base.extend({

	    // config 中的这些键值会直接添加到实例上，转换成 properties
	    propsInAttrs: ['initElement', 'element', 'events'],

	    // 与 widget 关联的 DOM 元素
	    element: null,

	    // 事件代理，格式为：
	    //   {
	    //     'mousedown .title': 'edit',
	    //     'click {{attrs.saveButton}}': 'save'
	    //     'click .open': function(ev) { ... }
	    //   }
	    events: null,

	    // 属性列表
	    attrs: {
	        // 基本属性
	        id: null,
	        className: null,
	        style: null,

	        // 默认模板
	        template: '<div></div>',

	        // 默认数据模型
	        model: null,

	        // 组件的默认父节点
	        parentNode: document.body
	    },

	    // 初始化方法，确定组件创建时的基本流程：
	    // 初始化 attrs --》 初始化 props --》 初始化 events --》 子类的初始化
	    initialize: function(config) {
	        this.cid = uniqueCid();

	        // 初始化 attrs
	        var dataAttrsConfig = this._parseDataAttrsConfig(config);
	        Widget.superclass.initialize.call(this, config ? $.extend(dataAttrsConfig, config) : dataAttrsConfig);

	        // 初始化 props
	        this.parseElement();
	        this.initProps();

	        // 初始化 events
	        this.delegateEvents();

	        // 子类自定义的初始化
	        this.setup();

	        // 保存实例信息
	        this._stamp();

	        // 是否由 template 初始化
	        this._isTemplate = !(config && config.element);
	    },

	    // 解析通过 data-attr 设置的 api
	    _parseDataAttrsConfig: function(config) {
	        var element, dataAttrsConfig;
	        if (config) {
	            element = config.initElement ? $(config.initElement) : $(config.element);
	        }

	        // 解析 data-api 时，只考虑用户传入的 element，不考虑来自继承或从模板构建的
	        if (element && element[0] && !AutoRender.isDataApiOff(element)) {
	            dataAttrsConfig = DAParser.parseElement(element);
	        }

	        return dataAttrsConfig;
	    },

	    // 构建 this.element
	    parseElement: function() {
	        var element = this.element;

	        if (element) {
	            this.element = $(element);
	        }
	        // 未传入 element 时，从 template 构建
	        else if (this.get('template')) {
	            this.parseElementFromTemplate();
	        }

	        // 如果对应的 DOM 元素不存在，则报错
	        if (!this.element || !this.element[0]) {
	            throw new Error('element is invalid');
	        }
	    },

	    // 从模板中构建 this.element
	    parseElementFromTemplate: function() {
	        this.element = $(this.get('template'));
	    },

	    // 负责 properties 的初始化，提供给子类覆盖
	    initProps: function() {},

	    // 注册事件代理
	    delegateEvents: function(element, events, handler) {
	        var argus = trimRightUndefine(Array.prototype.slice.call(arguments));

	        // widget.delegateEvents()
	        if (argus.length === 0) {
	            events = getEvents(this);
	            element = this.element;
	        }

	        // widget.delegateEvents({
	        //   'click p': 'fn1',
	        //   'click li': 'fn2'
	        // })
	        else if (argus.length === 1) {
	            events = element;
	            element = this.element;
	        }

	        // widget.delegateEvents('click p', function(ev) { ... })
	        else if (argus.length === 2) {
	            handler = events;
	            events = element;
	            element = this.element;
	        }

	        // widget.delegateEvents(element, 'click p', function(ev) { ... })
	        else {
	            element || (element = this.element);
	            this._delegateElements || (this._delegateElements = []);
	            this._delegateElements.push($(element));
	        }

	        // 'click p' => {'click p': handler}
	        if (isString(events) && isFunction(handler)) {
	            var o = {};
	            o[events] = handler;
	            events = o;
	        }

	        // key 为 'event selector'
	        for (var key in events) {
	            if (!events.hasOwnProperty(key)) continue;

	            var args = parseEventKey(key, this);
	            var eventType = args.type;
	            var selector = args.selector;

	            (function(handler, widget) {

	                var callback = function(ev) {
	                    if (isFunction(handler)) {
	                        handler.call(widget, ev);
	                    } else {
	                        widget[handler](ev);
	                    }
	                };

	                // delegate
	                if (selector) {
	                    $(element).on(eventType, selector, callback);
	                }
	                // normal bind
	                // 分开写是为了兼容 zepto，zepto 的判断不如 jquery 强劲有力
	                else {
	                    $(element).on(eventType, callback);
	                }

	            })(events[key], this);
	        }

	        return this;
	    },

	    // 卸载事件代理
	    undelegateEvents: function(element, eventKey) {
	        var argus = trimRightUndefine(Array.prototype.slice.call(arguments));

	        if (!eventKey) {
	            eventKey = element;
	            element = null;
	        }

	        // 卸载所有
	        // .undelegateEvents()
	        if (argus.length === 0) {
	            var type = DELEGATE_EVENT_NS + this.cid;

	            this.element && this.element.off(type);

	            // 卸载所有外部传入的 element
	            if (this._delegateElements) {
	                for (var de in this._delegateElements) {
	                    if (!this._delegateElements.hasOwnProperty(de)) continue;
	                    this._delegateElements[de].off(type);
	                }
	            }

	        } else {
	            var args = parseEventKey(eventKey, this);

	            // 卸载 this.element
	            // .undelegateEvents(events)
	            if (!element) {
	                this.element && this.element.off(args.type, args.selector);
	            }

	            // 卸载外部 element
	            // .undelegateEvents(element, events)
	            else {
	                $(element).off(args.type, args.selector);
	            }
	        }
	        return this;
	    },

	    // 提供给子类覆盖的初始化方法
	    setup: function() {},

	    // 将 widget 渲染到页面上
	    // 渲染不仅仅包括插入到 DOM 树中，还包括样式渲染等
	    // 约定：子类覆盖时，需保持 `return this`
	    render: function() {

	        // 让渲染相关属性的初始值生效，并绑定到 change 事件
	        if (!this.rendered) {
	            this._renderAndBindAttrs();
	            this.rendered = true;
	        }

	        // 插入到文档流中
	        var parentNode = this.get('parentNode');
	        if (parentNode && !isInDocument(this.element[0])) {
	            // 隔离样式，添加统一的命名空间
	            // https://github.com/aliceui/aliceui.org/issues/9
	            var outerBoxClass = this.constructor.outerBoxClass;
	            if (outerBoxClass) {
	                var outerBox = this._outerBox = $('<div></div>').addClass(outerBoxClass);
	                outerBox.append(this.element).appendTo(parentNode);
	            } else {
	                this.element.appendTo(parentNode);
	            }
	        }

	        return this;
	    },

	    // 让属性的初始值生效，并绑定到 change:attr 事件上
	    _renderAndBindAttrs: function() {
	        var widget = this;
	        var attrs = widget.attrs;

	        for (var attr in attrs) {
	            if (!attrs.hasOwnProperty(attr)) continue;
	            var m = ON_RENDER + ucfirst(attr);

	            if (this[m]) {
	                var val = this.get(attr);

	                // 让属性的初始值生效。注：默认空值不触发
	                if (!isEmptyAttrValue(val)) {
	                    this[m](val, undefined, attr);
	                }

	                // 将 _onRenderXx 自动绑定到 change:xx 事件上
	                (function(m) {
	                    widget.on('change:' + attr, function(val, prev, key) {
	                        widget[m](val, prev, key);
	                    });
	                })(m);
	            }
	        }
	    },

	    _onRenderId: function(val) {
	        this.element.attr('id', val);
	    },

	    _onRenderClassName: function(val) {
	        this.element.addClass(val);
	    },

	    _onRenderStyle: function(val) {
	        this.element.css(val);
	    },

	    // 让 element 与 Widget 实例建立关联
	    _stamp: function() {
	        var cid = this.cid

	        ;
	        (this.initElement || this.element).attr(DATA_WIDGET_CID, cid);
	        cachedInstances[cid] = this;
	    },

	    // 在 this.element 内寻找匹配节点
	    $: function(selector) {
	        return this.element.find(selector);
	    },

	    destroy: function() {
	        this.undelegateEvents();
	        delete cachedInstances[this.cid];

	        // For memory leak
	        if (this.element && this._isTemplate) {
	            this.element.off();
	                // 如果是 widget 生成的 element 则去除
	            if (this._outerBox) {
	                this._outerBox.remove();
	            } else {
	                this.element.remove();
	            }
	        }
	        this.element = null;

	        Widget.superclass.destroy.call(this);
	    }
	});

	// For memory leak
	$(window).unload(function() {
	    for (var cid in cachedInstances) {
	        cachedInstances[cid].destroy();
	    }
	});

	// 查询与 selector 匹配的第一个 DOM 节点，得到与该 DOM 节点相关联的 Widget 实例
	Widget.query = function(selector) {
	    var element = $(selector).eq(0);
	    var cid;

	    element && (cid = element.attr(DATA_WIDGET_CID));
	    return cachedInstances[cid];
	};

	Widget.autoRender = AutoRender.autoRender;
	Widget.autoRenderAll = AutoRender.autoRenderAll;
	Widget.StaticsWhiteList = ['autoRender'];

	// Helpers
	// ------
	var toString = Object.prototype.toString;
	var cidCounter = 0;

	function uniqueCid() {
	    return 'widget-' + cidCounter++;
	}

	function isString(val) {
	    return toString.call(val) === '[object String]';
	}

	function isFunction(val) {
	    return toString.call(val) === '[object Function]';
	}

	// Zepto 上没有 contains 方法
	var contains = $.contains || function(a, b) {
	    //noinspection JSBitwiseOperatorUsage
	    return !!(a.compareDocumentPosition(b) & 16);
	};

	function isInDocument(element) {
	    return contains(document.documentElement, element);
	}

	function ucfirst(str) {
	    return str.charAt(0).toUpperCase() + str.substring(1);
	}


	var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/;
	var EXPRESSION_FLAG = /{{([^}]+)}}/g;
	var INVALID_SELECTOR = 'INVALID_SELECTOR';

	function getEvents(widget) {
	    if (isFunction(widget.events)) {
	        widget.events = widget.events();
	    }
	    return widget.events;
	}

	function parseEventKey(eventKey, widget) {
	    var match = eventKey.match(EVENT_KEY_SPLITTER);
	    var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid;

	    // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
	    var selector = match[2] || undefined;

	    if (selector && selector.indexOf('{{') > -1) {
	        selector = parseExpressionInEventKey(selector, widget);
	    }

	    return {
	        type: eventType,
	        selector: selector
	    };
	}

	// 解析 eventKey 中的 {{xx}}, {{yy}}
	function parseExpressionInEventKey(selector, widget) {

	    return selector.replace(EXPRESSION_FLAG, function(m, name) {
	        var parts = name.split('.');
	        var point = widget,
	            part;

	        while (part = parts.shift()) {
	            if (point === widget.attrs) {
	                point = widget.get(part);
	            } else {
	                point = point[part];
	            }
	        }

	        // 已经是 className，比如来自 dataset 的
	        if (isString(point)) {
	            return point;
	        }

	        // 不能识别的，返回无效标识
	        return INVALID_SELECTOR;
	    });
	}


	// 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined
	function isEmptyAttrValue(o) {
	    return o == null || o === undefined;
	}

	function trimRightUndefine(argus) {
	    for (var i = argus.length - 1; i >= 0; i--) {
	        if (argus[i] === undefined) {
	            argus.pop();
	        } else {
	            break;
	        }
	    }
	    return argus;
	}

	module.exports = Widget;

/***/ },

/***/ 5:
/***/ function(module, exports) {

	// Events
	// -----------------
	// Thanks to:
	//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
	//  - https://github.com/joyent/node/blob/master/lib/events.js


	// Regular expression used to split event strings
	var eventSplitter = /\s+/;


	// A module that can be mixed in to *any object* in order to provide it
	// with custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = new Events();
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	function Events() {}


	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	Events.prototype.on = function(events, callback, context) {
	    var cache, event, list;
	    if (!callback) return this;

	    cache = this.__events || (this.__events = {});
	    events = events.split(eventSplitter);

	    while (event = events.shift()) {
	        list = cache[event] || (cache[event] = []);
	        list.push(callback, context);
	    }

	    return this;
	};

	Events.prototype.once = function(events, callback, context) {
	    var that = this;
	    var cb = function() {
	        that.off(events, cb);
	        callback.apply(context || that, arguments);
	    };
	    return this.on(events, cb, context);
	};

	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	Events.prototype.off = function(events, callback, context) {
	    var cache, event, list, i;

	    // No events, or removing *all* events.
	    if (!(cache = this.__events)) return this;
	    if (!(events || callback || context)) {
	        delete this.__events;
	        return this;
	    }

	    events = events ? events.split(eventSplitter) : keys(cache);

	    // Loop through the callback list, splicing where appropriate.
	    while (event = events.shift()) {
	        list = cache[event];
	        if (!list) continue;

	        if (!(callback || context)) {
	            delete cache[event];
	            continue;
	        }

	        for (i = list.length - 2; i >= 0; i -= 2) {
	            if (!(callback && list[i] !== callback ||
	                    context && list[i + 1] !== context)) {
	                list.splice(i, 2);
	            }
	        }
	    }

	    return this;
	};


	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.prototype.trigger = function(events) {
	    var cache, event, all, list, i, len, rest = [],
	        args, returned = true;
	    if (!(cache = this.__events)) return this;

	    events = events.split(eventSplitter);

	    // Fill up `rest` with the callback arguments.  Since we're only copying
	    // the tail of `arguments`, a loop is much faster than Array#slice.
	    for (i = 1, len = arguments.length; i < len; i++) {
	        rest[i - 1] = arguments[i];
	    }

	    // For each event, walk through the list of callbacks twice, first to
	    // trigger the event, then to trigger any `"all"` callbacks.
	    while (event = events.shift()) {
	        // Copy callback lists to prevent modification.
	        if (all = cache.all) all = all.slice();
	        if (list = cache[event]) list = list.slice();

	        // Execute event callbacks except one named "all"
	        if (event !== 'all') {
	            returned = triggerEvents(list, rest, this) && returned;
	        }

	        // Execute "all" callbacks.
	        returned = triggerEvents(all, [event].concat(rest), this) && returned;
	    }

	    return returned;
	};

	Events.prototype.emit = Events.prototype.trigger;


	// Helpers
	// -------

	var keys = Object.keys;

	if (!keys) {
	    keys = function(o) {
	        var result = [];

	        for (var name in o) {
	            if (o.hasOwnProperty(name)) {
	                result.push(name);
	            }
	        }
	        return result;
	    };
	}

	// Mix `Events` to object instance or Class function.
	Events.mixTo = function(receiver) {
	    var proto = Events.prototype;

	    if (isFunction(receiver)) {
	        for (var key in proto) {
	            if (proto.hasOwnProperty(key)) {
	                receiver.prototype[key] = proto[key];
	            }
	        }
	        Object.keys(proto).forEach(function(key) {
	            receiver.prototype[key] = proto[key];
	        });
	    } else {
	        var event = new Events;
	        for (var key in proto) {
	            if (proto.hasOwnProperty(key)) {
	                copyProto(key);
	            }
	        }
	    }

	    function copyProto(key) {
	        receiver[key] = function() {
	            proto[key].apply(event, Array.prototype.slice.call(arguments));
	            return this;
	        };
	    }
	};

	// Execute callbacks
	function triggerEvents(list, args, context) {
	    var pass = true;

	    if (list) {
	        var i = 0,
	            l = list.length,
	            a1 = args[0],
	            a2 = args[1],
	            a3 = args[2];
	        // call is faster than apply, optimize less than 3 argu
	        // http://blog.csdn.net/zhengyinhui100/article/details/7837127
	        switch (args.length) {
	            case 0:
	                for (; i < l; i += 2) {
	                    pass = list[i].call(list[i + 1] || context) !== false && pass
	                }
	                break;
	            case 1:
	                for (; i < l; i += 2) {
	                    pass = list[i].call(list[i + 1] || context, a1) !== false && pass
	                }
	                break;
	            case 2:
	                for (; i < l; i += 2) {
	                    pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass
	                }
	                break;
	            case 3:
	                for (; i < l; i += 2) {
	                    pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass
	                }
	                break;
	            default:
	                for (; i < l; i += 2) {
	                    pass = list[i].apply(list[i + 1] || context, args) !== false && pass
	                }
	                break;
	        }
	    }
	    // trigger will return false if one of the callbacks return false
	    return pass;
	}

	function isFunction(func) {
	    return Object.prototype.toString.call(func) === '[object Function]';
	}

	module.exports = Events;


/***/ },

/***/ 6:
/***/ function(module, exports) {

	// Position
	// --------
	// 定位工具组件，将一个 DOM 节点相对对另一个 DOM 节点进行定位操作。
	// 代码易改，人生难得

	// var $ = require('jquery');
	var Position = exports,
	    VIEWPORT = { _id: 'VIEWPORT', nodeType: 1 },
	    isPinFixed = false,
	    ua = (window.navigator.userAgent || "").toLowerCase(),
	    isIE6 = ua.indexOf("msie 6") !== -1;


	// 将目标元素相对于基准元素进行定位
	// 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
	Position.pin = function(pinObject, baseObject) {

	    // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
	    pinObject = normalize(pinObject);
	    baseObject = normalize(baseObject);

	    // if pinObject.element is not present
	    // https://github.com/aralejs/position/pull/11
	    if (pinObject.element === VIEWPORT ||
	        pinObject.element._id === 'VIEWPORT') {
	        return;
	    }

	    // 设定目标元素的 position 为绝对定位
	    // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
	    var pinElement = $(pinObject.element);

	    if (pinElement.css('position') !== 'fixed' || isIE6) {
	        pinElement.css('position', 'absolute');
	        isPinFixed = false;
	    }
	    else {
	        // 定位 fixed 元素的标志位，下面有特殊处理
	        isPinFixed = true;
	    }

	    // 将位置属性归一化为数值
	    // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
	    //    否则获取的宽高有可能不对
	    posConverter(pinObject);
	    posConverter(baseObject);

	    var parentOffset = getParentOffset(pinElement);
	    var baseOffset = baseObject.offset();

	    // 计算目标元素的位置
	    var top = baseOffset.top + baseObject.y -
	            pinObject.y - parentOffset.top;

	    var left = baseOffset.left + baseObject.x -
	            pinObject.x - parentOffset.left;

	    // 定位目标元素
	    pinElement.css({ left: left, top: top });
	};


	// 将目标元素相对于基准元素进行居中定位
	// 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
	Position.center = function(pinElement, baseElement) {
	    Position.pin({
	        element: pinElement,
	        x: '50%',
	        y: '50%'
	    }, {
	        element: baseElement,
	        x: '50%',
	        y: '50%'
	    });
	};


	// 这是当前可视区域的伪 DOM 节点
	// 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
	Position.VIEWPORT = VIEWPORT;


	// Helpers
	// -------

	// 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }
	function normalize(posObject) {
	    posObject = toElement(posObject) || {};

	    if (posObject.nodeType) {
	        posObject = { element: posObject };
	    }

	    var element = toElement(posObject.element) || VIEWPORT;
	    if (element.nodeType !== 1) {
	        throw new Error('posObject.element is invalid.');
	    }

	    var result = {
	        element: element,
	        x: posObject.x || 0,
	        y: posObject.y || 0
	    };

	    // config 的深度克隆会替换掉 Position.VIEWPORT, 导致直接比较为 false
	    var isVIEWPORT = (element === VIEWPORT || element._id === 'VIEWPORT');

	    // 归一化 offset
	    result.offset = function() {
	        // 若定位 fixed 元素，则父元素的 offset 没有意义
	        if (isPinFixed) {
	            return {
	                left: 0,
	                top: 0
	            };
	        }
	        else if (isVIEWPORT) {
	            return {
	                left: $(document).scrollLeft(),
	                top: $(document).scrollTop()
	            };
	        }
	        else {
	            return getOffset($(element)[0]);
	        }
	    };

	    // 归一化 size, 含 padding 和 border
	    result.size = function() {
	        var el = isVIEWPORT ? $(window) : $(element);
	        return {
	            width: el.outerWidth(),
	            height: el.outerHeight()
	        };
	    };

	    return result;
	}

	// 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
	function posConverter(pinObject) {
	    pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
	    pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
	}

	// 处理 x, y 值，都转化为数字
	function xyConverter(x, pinObject, type) {
	    // 先转成字符串再说！好处理
	    x = x + '';

	    // 处理 px
	    x = x.replace(/px/gi, '');

	    // 处理 alias
	    if (/\D/.test(x)) {
	        x = x.replace(/(?:top|left)/gi, '0%')
	             .replace(/center/gi, '50%')
	             .replace(/(?:bottom|right)/gi, '100%');
	    }

	    // 将百分比转为像素值
	    if (x.indexOf('%') !== -1) {
	        //支持小数
	        x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
	            return pinObject.size()[type] * (d / 100.0);
	        });
	    }

	    // 处理类似 100%+20px 的情况
	    if (/[+\-*\/]/.test(x)) {
	        try {
	            // eval 会影响压缩
	            // new Function 方法效率高于 for 循环拆字符串的方法
	            // 参照：http://jsperf.com/eval-newfunction-for
	            x = (new Function('return ' + x))();
	        } catch (e) {
	            throw new Error('Invalid position value: ' + x);
	        }
	    }

	    // 转回为数字
	    return numberize(x);
	}

	// 获取 offsetParent 的位置
	function getParentOffset(element) {
	    var parent = element.offsetParent();

	    // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
	    // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
	    // 转为 document.body
	    if (parent[0] === document.documentElement) {
	        parent = $(document.body);
	    }

	    // 修正 ie6 下 absolute 定位不准的 bug
	    if (isIE6) {
	        parent.css('zoom', 1);
	    }

	    // 获取 offsetParent 的 offset
	    var offset;

	    // 当 offsetParent 为 body，
	    // 而且 body 的 position 是 static 时
	    // 元素并不按照 body 来定位，而是按 document 定位
	    // http://jsfiddle.net/afc163/hN9Tc/2/
	    // 因此这里的偏移值直接设为 0 0
	    if (parent[0] === document.body &&
	        parent.css('position') === 'static') {
	            offset = { top:0, left: 0 };
	    } else {
	        offset = getOffset(parent[0]);
	    }

	    // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
	    offset.top += numberize(parent.css('border-top-width'));
	    offset.left += numberize(parent.css('border-left-width'));

	    return offset;
	}

	function numberize(s) {
	    return parseFloat(s, 10) || 0;
	}

	function toElement(element) {
	    return $(element)[0];
	}

	// fix jQuery 1.7.2 offset
	// document.body 的 position 是 absolute 或 relative 时
	// jQuery.offset 方法无法正确获取 body 的偏移值
	//   -> http://jsfiddle.net/afc163/gMAcp/
	// jQuery 1.9.1 已经修正了这个问题
	//   -> http://jsfiddle.net/afc163/gMAcp/1/
	// 这里先实现一份
	// 参照 kissy 和 jquery 1.9.1
	//   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366
	//   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28
	function getOffset(element) {
	    var box = element.getBoundingClientRect(),
	        docElem = document.documentElement;

	    // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
	    return {
	        left: box.left + (window.pageXOffset || docElem.scrollLeft) -
	              (docElem.clientLeft || document.body.clientLeft  || 0),
	        top: box.top  + (window.pageYOffset || docElem.scrollTop) -
	             (docElem.clientTop || document.body.clientTop  || 0)
	    };
	}


/***/ },

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Position = __webpack_require__(6),
	    Shim = __webpack_require__(21),
	    Widget = __webpack_require__(4);


	// Overlay
	// -------
	// Overlay 组件的核心特点是可定位（Positionable）和可层叠（Stackable）
	// 是一切悬浮类 UI 组件的基类
	var Overlay = Widget.extend({

	  attrs: {
	    // 基本属性
	    width: null,
	    height: null,
	    zIndex: 99,
	    visible: false,

	    // 定位配置
	    align: {
	      // element 的定位点，默认为左上角
	      selfXY: [0, 0],
	      // 基准定位元素，默认为当前可视区域
	      baseElement: Position.VIEWPORT,
	      // 基准定位元素的定位点，默认为左上角
	      baseXY: [0, 0]
	    },

	    // 父元素
	    parentNode: document.body
	  },

	  show: function () {
	    // 若从未渲染，则调用 render
	    if (!this.rendered) {
	      this.render();
	    }
	    this.set('visible', true);
	    return this;
	  },

	  hide: function () {
	    this.set('visible', false);
	    return this;
	  },

	  setup: function () {
	    var that = this;
	    // 加载 iframe 遮罩层并与 overlay 保持同步
	    this._setupShim();
	    // 窗口resize时，重新定位浮层
	    this._setupResize();

	    this.after('render', function () {
	      var _pos = this.element.css('position');
	      if (_pos === 'static' || _pos === 'relative') {
	        this.element.css({
	          position: 'absolute',
	          left: '-9999px',
	          top: '-9999px'
	        });
	      }
	    });
	    // 统一在显示之后重新设定位置
	    this.after('show', function () {
	      that._setPosition();
	    });
	  },

	  destroy: function () {
	    // 销毁两个静态数组中的实例
	    erase(this, Overlay.allOverlays);
	    erase(this, Overlay.blurOverlays);
	    return Overlay.superclass.destroy.call(this);
	  },

	  // 进行定位
	  _setPosition: function (align) {
	    // 不在文档流中，定位无效
	    if (!isInDocument(this.element[0])) return;

	    align || (align = this.get('align'));

	    // 如果align为空，表示不需要使用js对齐
	    if (!align) return;

	    var isHidden = this.element.css('display') === 'none';

	    // 在定位时，为避免元素高度不定，先显示出来
	    if (isHidden) {
	      this.element.css({
	        visibility: 'hidden',
	        display: 'block'
	      });
	    }

	    Position.pin({
	      element: this.element,
	      x: align.selfXY[0],
	      y: align.selfXY[1]
	    }, {
	      element: align.baseElement,
	      x: align.baseXY[0],
	      y: align.baseXY[1]
	    });

	    // 定位完成后，还原
	    if (isHidden) {
	      this.element.css({
	        visibility: '',
	        display: 'none'
	      });
	    }

	    return this;
	  },

	  // 加载 iframe 遮罩层并与 overlay 保持同步
	  _setupShim: function () {
	    var shim = new Shim(this.element);

	    // 在隐藏和设置位置后，要重新定位
	    // 显示后会设置位置，所以不用绑定 shim.sync
	    this.after('hide _setPosition', shim.sync, shim);

	    // 除了 parentNode 之外的其他属性发生变化时，都触发 shim 同步
	    var attrs = ['width', 'height'];
	    for (var attr in attrs) {
	      if (attrs.hasOwnProperty(attr)) {
	        this.on('change:' + attr, shim.sync, shim);
	      }
	    }

	    // 在销魂自身前要销毁 shim
	    this.before('destroy', shim.destroy, shim);
	  },

	  // resize窗口时重新定位浮层，用这个方法收集所有浮层实例
	  _setupResize: function () {
	    Overlay.allOverlays.push(this);
	  },

	  // 除了 element 和 relativeElements，点击 body 后都会隐藏 element
	  _blurHide: function (arr) {
	    arr = $.makeArray(arr);
	    arr.push(this.element);
	    this._relativeElements = arr;
	    Overlay.blurOverlays.push(this);
	  },

	  // 用于 set 属性后的界面更新
	  _onRenderWidth: function (val) {
	    this.element.css('width', val);
	  },

	  _onRenderHeight: function (val) {
	    this.element.css('height', val);
	  },

	  _onRenderZIndex: function (val) {
	    this.element.css('zIndex', val);
	  },

	  _onRenderAlign: function (val) {
	    this._setPosition(val);
	  },

	  _onRenderVisible: function (val) {
	    this.element[val ? 'show' : 'hide']();
	  }

	});

	// 绑定 blur 隐藏事件
	Overlay.blurOverlays = [];
	$(document).on('click', function (e) {
	  hideBlurOverlays(e);
	});

	// 绑定 resize 重新定位事件
	var timeout;
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	Overlay.allOverlays = [];

	$(window).resize(function () {
	  timeout && clearTimeout(timeout);
	  timeout = setTimeout(function () {
	    var winNewWidth = $(window).width();
	    var winNewHeight = $(window).height();

	    // IE678 莫名其妙触发 resize
	    // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
	    if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
	      $(Overlay.allOverlays).each(function (i, item) {
	        // 当实例为空或隐藏时，不处理
	        if (!item || !item.get('visible')) {
	          return;
	        }
	        item._setPosition();
	      });
	    }

	    winWidth = winNewWidth;
	    winHeight = winNewHeight;
	  }, 80);
	});

	module.exports = Overlay;


	// Helpers
	// -------

	function isInDocument(element) {
	  return $.contains(document.documentElement, element);
	}

	function hideBlurOverlays(e) {
	  $(Overlay.blurOverlays).each(function (index, item) {
	    // 当实例为空或隐藏时，不处理
	    if (!item || !item.get('visible')) {
	      return;
	    }

	    // 遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理
	    for (var i = 0; i < item._relativeElements.length; i++) {
	      var el = $(item._relativeElements[i])[0];
	      if (el === e.target || $.contains(el, e.target)) {
	        return;
	      }
	    }

	    // 到这里，判断触发了元素的 blur 事件，隐藏元素
	    item.hide();
	  });
	}

	// 从数组中删除对应元素


	function erase(target, array) {
	  for (var i = 0; i < array.length; i++) {
	    if (target === array[i]) {
	      array.splice(i, 1);
	      return array;
	    }
	  }
	}


/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7);
	module.exports.Mask = __webpack_require__(23);


/***/ },

/***/ 14:
/***/ function(module, exports, __webpack_require__) {

	// Base
	// ---------
	// Base 是一个基础类，提供 Class、Events、Attrs 和 Aspect 支持。

	var Class = __webpack_require__(17);
	var Events = __webpack_require__(5);
	var Aspect, Attribute;


	// Helpers
	// -------
	var eventSplitter = /\s+/;

	function weave(when, methodName, callback, context) {
	    var names = methodName.split(eventSplitter);
	    var name, method;

	    while (name = names.shift()) {
	        method = getMethod(this, name);
	        if (!method.__isAspected) {
	            wrap.call(this, name);
	        }
	        this.on(when + ':' + name, callback, context);
	    }

	    return this;
	}


	function getMethod(host, methodName) {
	    var method = host[methodName];
	    if (!method) {
	        throw new Error('Invalid method name: ' + methodName);
	    }
	    return method;
	}


	function wrap(methodName) {
	    var old = this[methodName];

	    this[methodName] = function() {
	        var args = Array.prototype.slice.call(arguments);
	        var beforeArgs = ['before:' + methodName].concat(args);

	        // prevent if trigger return false
	        if (this.trigger.apply(this, beforeArgs) === false) return;

	        var ret = old.apply(this, arguments);
	        var afterArgs = ['after:' + methodName, ret].concat(args);
	        this.trigger.apply(this, afterArgs);

	        return ret;
	    };

	    this[methodName].__isAspected = true;
	}


	var toString = Object.prototype.toString;
	var hasOwn = Object.prototype.hasOwnProperty;

	/**
	 * Detect the JScript [[DontEnum]] bug:
	 * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
	 * made non-enumerable as well.
	 * https://github.com/bestiejs/lodash/blob/7520066fc916e205ef84cb97fbfe630d7c154158/lodash.js#L134-L144
	 */
	/** Detect if own properties are iterated after inherited properties (IE < 9) */
	var iteratesOwnLast;
	(function() {
	    var props = [];

	    function Ctor() {
	        this.x = 1;
	    }
	    Ctor.prototype = {
	        'valueOf': 1,
	        'y': 1
	    };
	    for (var prop in new Ctor()) {
	        props.push(prop);
	    }
	    iteratesOwnLast = props[0] !== 'x';
	}());

	var isArray = Array.isArray || function(val) {
	    return toString.call(val) === '[object Array]';
	};

	function isString(val) {
	    return toString.call(val) === '[object String]';
	}

	function isFunction(val) {
	    return toString.call(val) === '[object Function]';
	}

	function isWindow(o) {
	    return o != null && o == o.window;
	}

	function isPlainObject(o) {
	    // Must be an Object.
	    // Because of IE, we also have to check the presence of the constructor
	    // property. Make sure that DOM nodes and window objects don't
	    // pass through, as well
	    if (!o || toString.call(o) !== "[object Object]" ||
	        o.nodeType || isWindow(o)) {
	        return false;
	    }

	    try {
	        // Not own constructor property must be Object
	        if (o.constructor &&
	            !hasOwn.call(o, "constructor") &&
	            !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) {
	            return false;
	        }
	    } catch (e) {
	        // IE8,9 Will throw exceptions on certain host objects #9897
	        return false;
	    }

	    var key;

	    // Support: IE<9
	    // Handle iteration over inherited properties before own properties.
	    // http://bugs.jquery.com/ticket/12199
	    if (iteratesOwnLast) {
	        for (key in o) {
	            return hasOwn.call(o, key);
	        }
	    }

	    // Own properties are enumerated firstly, so to speed up,
	    // if last one is own, then all properties are own.
	    for (key in o) {}

	    return key === undefined || hasOwn.call(o, key);
	}

	function isEmptyObject(o) {
	    if (!o || toString.call(o) !== "[object Object]" ||
	        o.nodeType || isWindow(o) || !o.hasOwnProperty) {
	        return false;
	    }

	    for (var p in o) {
	        if (o.hasOwnProperty(p)) return false;
	    }
	    return true;
	}

	function merge(receiver, supplier) {
	    var key, value;

	    for (key in supplier) {
	        if (supplier.hasOwnProperty(key)) {
	            receiver[key] = cloneValue(supplier[key], receiver[key]);
	        }
	    }

	    return receiver;
	}

	// 只 clone 数组和 plain object，其他的保持不变
	function cloneValue(value, prev) {
	    if (isArray(value)) {
	        value = value.slice();
	    } else if (isPlainObject(value)) {
	        isPlainObject(prev) || (prev = {});

	        value = merge(prev, value);
	    }

	    return value;
	}

	var keys = Object.keys;

	if (!keys) {
	    keys = function(o) {
	        var result = [];

	        for (var name in o) {
	            if (o.hasOwnProperty(name)) {
	                result.push(name);
	            }
	        }
	        return result;
	    };
	}

	function mergeInheritedAttrs(attrs, instance, specialProps) {
	    var inherited = [];
	    var proto = instance.constructor.prototype;

	    while (proto) {
	        // 不要拿到 prototype 上的
	        if (!proto.hasOwnProperty('attrs')) {
	            proto.attrs = {};
	        }

	        // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
	        copySpecialProps(specialProps, proto.attrs, proto);

	        // 为空时不添加
	        if (!isEmptyObject(proto.attrs)) {
	            inherited.unshift(proto.attrs);
	        }

	        // 向上回溯一级
	        proto = proto.constructor.superclass;
	    }

	    // Merge and clone default values to instance.
	    for (var i = 0, len = inherited.length; i < len; i++) {
	        mergeAttrs(attrs, normalize(inherited[i]));
	    }
	}

	function mergeUserValue(attrs, config) {
	    mergeAttrs(attrs, normalize(config, true), true);
	}

	function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop) {
	    for (var i = 0, len = specialProps.length; i < len; i++) {
	        var key = specialProps[i];

	        if (supplier.hasOwnProperty(key)) {
	            receiver[key] = isAttr2Prop ? receiver.get(key) : supplier[key];
	        }
	    }
	}


	var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
	var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;

	function parseEventsFromAttrs(host, attrs) {
	    for (var key in attrs) {
	        if (attrs.hasOwnProperty(key)) {
	            var value = attrs[key].value,
	                m;

	            if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
	                host[m[1]](getEventName(m[2]), value);
	                delete attrs[key];
	            }
	        }
	    }
	}

	// Converts `Show` to `show` and `ChangeTitle` to `change:title`
	function getEventName(name) {
	    var m = name.match(EVENT_NAME_PATTERN);
	    var ret = m[1] ? 'change:' : '';
	    ret += m[2].toLowerCase() + m[3];
	    return ret;
	}


	function setSetterAttrs(host, attrs, config) {
	    var options = {
	        silent: true
	    };
	    host.__initializingAttrs = true;

	    for (var key in config) {
	        if (config.hasOwnProperty(key)) {
	            if (attrs[key].setter) {
	                host.set(key, config[key], options);
	            }
	        }
	    }

	    delete host.__initializingAttrs;
	}


	var ATTR_SPECIAL_KEYS = ['value', 'getter', 'setter', 'readOnly'];

	// normalize `attrs` to
	//
	//   {
	//      value: 'xx',
	//      getter: fn,
	//      setter: fn,
	//      readOnly: boolean
	//   }
	//
	function normalize(attrs, isUserValue) {
	    var newAttrs = {};

	    for (var key in attrs) {
	        var attr = attrs[key];

	        if (!isUserValue &&
	            isPlainObject(attr) &&
	            hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
	            newAttrs[key] = attr;
	            continue;
	        }

	        newAttrs[key] = {
	            value: attr
	        };
	    }

	    return newAttrs;
	}

	var ATTR_OPTIONS = ['setter', 'getter', 'readOnly'];
	// 专用于 attrs 的 merge 方法
	function mergeAttrs(attrs, inheritedAttrs, isUserValue) {
	    var key, value;
	    var attr;

	    for (key in inheritedAttrs) {
	        if (inheritedAttrs.hasOwnProperty(key)) {
	            value = inheritedAttrs[key];
	            attr = attrs[key];

	            if (!attr) {
	                attr = attrs[key] = {};
	            }

	            // 从严谨上来说，遍历 ATTR_SPECIAL_KEYS 更好
	            // 从性能来说，直接 人肉赋值 更快
	            // 这里还是选择 性能优先

	            // 只有 value 要复制原值，其他的直接覆盖即可
	            (value['value'] !== undefined) && (attr['value'] = cloneValue(value['value'], attr['value']));

	            // 如果是用户赋值，只要考虑value
	            if (isUserValue) continue;

	            for (var i in ATTR_OPTIONS) {
	                var option = ATTR_OPTIONS[i];
	                if (value[option] !== undefined) {
	                    attr[option] = value[option];
	                }
	            }
	        }
	    }

	    return attrs;
	}

	function hasOwnProperties(object, properties) {
	    for (var i = 0, len = properties.length; i < len; i++) {
	        if (object.hasOwnProperty(properties[i])) {
	            return true;
	        }
	    }
	    return false;
	}


	// 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
	function isEmptyAttrValue(o) {
	    return o == null || // null, undefined
	        (isString(o) || isArray(o)) && o.length === 0 || // '', []
	        isEmptyObject(o); // {}
	}

	// 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
	function isEqual(a, b) {
	    if (a === b) return true;

	    if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;

	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className != toString.call(b)) return false;

	    switch (className) {

	        // Strings, numbers, dates, and booleans are compared by value.
	        case '[object String]':
	            // Primitives and their corresponding object wrappers are
	            // equivalent; thus, `"5"` is equivalent to `new String("5")`.
	            return a == String(b);

	        case '[object Number]':
	            // `NaN`s are equivalent, but non-reflexive. An `equal`
	            // comparison is performed for other numeric values.
	            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);

	        case '[object Date]':
	        case '[object Boolean]':
	            // Coerce dates and booleans to numeric primitive values.
	            // Dates are compared by their millisecond representations.
	            // Note that invalid dates with millisecond representations
	            // of `NaN` are not equivalent.
	            return +a == +b;

	            // RegExps are compared by their source patterns and flags.
	        case '[object RegExp]':
	            return a.source == b.source &&
	                a.global == b.global &&
	                a.multiline == b.multiline &&
	                a.ignoreCase == b.ignoreCase;

	            // 简单判断数组包含的 primitive 值是否相等
	        case '[object Array]':
	            var aString = a.toString();
	            var bString = b.toString();

	            // 只要包含非 primitive 值，为了稳妥起见，都返回 false
	            return aString.indexOf('[object') === -1 &&
	                bString.indexOf('[object') === -1 &&
	                aString === bString;
	    }

	    if (typeof a != 'object' || typeof b != 'object') return false;

	    // 简单判断两个对象是否相等，只判断第一层
	    if (isPlainObject(a) && isPlainObject(b)) {

	        // 键值不相等，立刻返回 false
	        if (!isEqual(keys(a), keys(b))) {
	            return false;
	        }

	        // 键相同，但有值不等，立刻返回 false
	        for (var p in a) {
	            if (a[p] !== b[p]) return false;
	        }

	        return true;
	    }

	    // 其他情况返回 false, 以避免误判导致 change 事件没发生
	    return false;
	}

	Aspect = {
	    before: function(methodName, callback, context) {
	        return weave.call(this, 'before', methodName, callback, context);
	    },
	    after: function(methodName, callback, context) {
	        return weave.call(this, 'after', methodName, callback, context);
	    }
	};

	Attribute = {
	    // 负责 attributes 的初始化
	    // attributes 是与实例相关的状态信息，可读可写，发生变化时，会自动触发相关事件
	    initAttrs: function(config) {
	        // initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
	        var attrs = this.attrs = {};

	        // Get all inherited attributes.
	        var specialProps = this.propsInAttrs || [];
	        mergeInheritedAttrs(attrs, this, specialProps);

	        // Merge user-specific attributes from config.
	        if (config) {
	            mergeUserValue(attrs, config);
	        }

	        // 对于有 setter 的属性，要用初始值 set 一下，以保证关联属性也一同初始化
	        setSetterAttrs(this, attrs, config);

	        // Convert `on/before/afterXxx` config to event handler.
	        parseEventsFromAttrs(this, attrs);

	        // 将 this.attrs 上的 special properties 放回 this 上
	        copySpecialProps(specialProps, this, attrs, true);
	    },

	    // Get the value of an attribute.
	    get: function(key) {
	        var attr = this.attrs[key] || {};
	        var val = attr.value;
	        return attr.getter ? attr.getter.call(this, val, key) : val;
	    },

	    // Set a hash of model attributes on the object, firing `"change"` unless
	    // you choose to silence it.
	    set: function(key, val, options) {
	        var attrs = {};

	        // set("key", val, options)
	        if (isString(key)) {
	            attrs[key] = val;
	        }
	        // set({ "key": val, "key2": val2 }, options)
	        else {
	            attrs = key;
	            options = val;
	        }

	        options || (options = {});
	        var silent = options.silent;
	        var override = options.override;

	        var now = this.attrs;
	        var changed = this.__changedAttrs || (this.__changedAttrs = {});

	        for (key in attrs) {
	            if (!attrs.hasOwnProperty(key)) continue;

	            var attr = now[key] || (now[key] = {});
	            val = attrs[key];

	            if (attr.readOnly) {
	                throw new Error('This attribute is readOnly: ' + key);
	            }

	            // invoke setter
	            if (attr.setter) {
	                val = attr.setter.call(this, val, key);
	            }

	            // 获取设置前的 prev 值
	            var prev = this.get(key);

	            // 获取需要设置的 val 值
	            // 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
	            // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
	            if (!override && isPlainObject(prev) && isPlainObject(val)) {
	                val = merge(merge({}, prev), val);
	            }

	            // set finally
	            now[key].value = val;

	            // invoke change event
	            // 初始化时对 set 的调用，不触发任何事件
	            if (!this.__initializingAttrs && !isEqual(prev, val)) {
	                if (silent) {
	                    changed[key] = [val, prev];
	                } else {
	                    this.trigger('change:' + key, val, prev, key);
	                }
	            }
	        }

	        return this;
	    },

	    // Call this method to manually fire a `"change"` event for triggering
	    // a `"change:attribute"` event for each changed attribute.
	    change: function() {
	        var changed = this.__changedAttrs;

	        if (changed) {
	            for (var key in changed) {
	                if (changed.hasOwnProperty(key)) {
	                    var args = changed[key];
	                    this.trigger('change:' + key, args[0], args[1], key);
	                }
	            }
	            delete this.__changedAttrs;
	        }

	        return this;
	    },
	    _isPlainObject: isPlainObject
	};


	module.exports = Class.create({
	    Implements: [Events, Aspect, Attribute],

	    initialize: function(config) {
	        this.initAttrs(config);

	        // Automatically register `this._onChangeAttr` method as
	        // a `change:attr` event handler.
	        parseEventsFromInstance(this, this.attrs);
	    },

	    destroy: function() {
	        this.off();

	        for (var p in this) {
	            if (this.hasOwnProperty(p)) {
	                delete this[p];
	            }
	        }

	        // Destroy should be called only once, generate a fake destroy after called
	        // https://github.com/aralejs/widget/issues/50
	        this.destroy = function() {};
	    }
	});


	function parseEventsFromInstance(host, attrs) {
	    for (var attr in attrs) {
	        if (attrs.hasOwnProperty(attr)) {
	            var m = '_onChange' + ucfirst(attr);
	            if (host[m]) {
	                host.on('change:' + attr, host[m]);
	            }
	        }
	    }
	}

	function ucfirst(str) {
	    return str.charAt(0).toUpperCase() + str.substring(1);
	}


/***/ },

/***/ 17:
/***/ function(module, exports) {

	// Class
	// -----------------
	// Thanks to:
	//  - http://mootools.net/docs/core/Class/Class
	//  - http://ejohn.org/blog/simple-javascript-inheritance/
	//  - https://github.com/ded/klass
	//  - http://documentcloud.github.com/backbone/#Model-extend
	//  - https://github.com/joyent/node/blob/master/lib/util.js
	//  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js


	// The base Class implementation.
	function Class(o) {
	    // Convert existed function to Class.
	    if (!(this instanceof Class) && isFunction(o)) {
	        return classify(o);
	    }
	}

	module.exports = Class;


	// Create a new Class.
	//
	//  var SuperPig = Class.create({
	//    Extends: Animal,
	//    Implements: Flyable,
	//    initialize: function() {
	//      SuperPig.superclass.initialize.apply(this, arguments)
	//    },
	//    Statics: {
	//      COLOR: 'red'
	//    }
	// })
	//
	Class.create = function(parent, properties) {
	    if (!isFunction(parent)) {
	        properties = parent;
	        parent = null;
	    }

	    properties || (properties = {});
	    parent || (parent = properties.Extends || Class);
	    properties.Extends = parent;

	    // The created class constructor
	    function SubClass() {
	        // Call the parent constructor.
	        parent.apply(this, arguments);

	        // Only call initialize in self constructor.
	        if (this.constructor === SubClass && this.initialize) {
	            this.initialize.apply(this, arguments);
	        }
	    }

	    // Inherit class (static) properties from parent.
	    if (parent !== Class) {
	        mix(SubClass, parent, parent.StaticsWhiteList);
	    }

	    // Add instance properties to the subclass.
	    implement.call(SubClass, properties);

	    // Make subclass extendable.
	    return classify(SubClass);
	};


	function implement(properties) {
	    var key, value;

	    for (key in properties) {
	        value = properties[key];

	        if (Class.Mutators.hasOwnProperty(key)) {
	            Class.Mutators[key].call(this, value);
	        } else {
	            this.prototype[key] = value;
	        }
	    }
	}


	// Create a sub Class based on `Class`.
	Class.extend = function(properties) {
	    properties || (properties = {});
	    properties.Extends = this;

	    return Class.create(properties);
	};


	function classify(cls) {
	    cls.extend = Class.extend;
	    cls.implement = implement;
	    return cls;
	}


	// Mutators define special properties.
	Class.Mutators = {

	    'Extends': function(parent) {
	        var existed = this.prototype;
	        var proto = createProto(parent.prototype);

	        // Keep existed properties.
	        mix(proto, existed);

	        // Enforce the constructor to be what we expect.
	        proto.constructor = this;

	        // Set the prototype chain to inherit from `parent`.
	        this.prototype = proto;

	        // Set a convenience property in case the parent's prototype is
	        // needed later.
	        this.superclass = parent.prototype;
	    },

	    'Implements': function(items) {
	        isArray(items) || (items = [items]);
	        var proto = this.prototype,
	            item;
	        while (item = items.shift()) {
	            mix(proto, item.prototype || item);
	        }
	    },

	    'Statics': function(staticProperties) {
	        mix(this, staticProperties);
	    }
	};


	// Shared empty constructor function to aid in prototype-chain creation.
	function Ctor() {}

	// See: http://jsperf.com/object-create-vs-new-ctor
	var createProto = Object.__proto__ ?
	    function(proto) {
	        return {
	            __proto__: proto
	        };
	    } :
	    function(proto) {
	        Ctor.prototype = proto;
	        return new Ctor();
	    };


	// Helpers
	// ------------

	function mix(r, s, wl) {
	    // Copy "all" properties including inherited ones.
	    for (var p in s) {
	        if (s.hasOwnProperty(p)) {
	            if (wl && indexOf(wl, p) === -1) continue;

	            // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
	            if (p !== 'prototype') {
	                r[p] = s[p];
	            }
	        }
	    }
	}


	var toString = Object.prototype.toString;

	var isArray = Array.isArray || function(val) {
	    return toString.call(val) === '[object Array]';
	};

	var isFunction = function(val) {
	    return toString.call(val) === '[object Function]';
	};

	var indexOf = Array.prototype.indexOf ?
	    function(arr, item) {
	        return arr.indexOf(item);
	    } :
	    function(arr, item) {
	        for (var i = 0, len = arr.length; i < len; i++) {
	            if (arr[i] === item) {
	                return i;
	            }
	        }
	        return -1;
	    };


/***/ },

/***/ 21:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Position = __webpack_require__(6);

	var isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1;

	// target 是需要添加垫片的目标元素，可以传 `DOM Element` 或 `Selector`
	function Shim(target) {
	    // 如果选择器选了多个 DOM，则只取第一个
	    this.target = $(target).eq(0);
	}

	// 根据目标元素计算 iframe 的显隐、宽高、定位
	Shim.prototype.sync = function() {
	    var target = this.target;
	    var iframe = this.iframe;

	    // 如果未传 target 则不处理
	    if (!target.length) return this;

	    var height = target.outerHeight();
	    var width = target.outerWidth();

	    // 如果目标元素隐藏，则 iframe 也隐藏
	    // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
	    // http://api.jquery.com/hidden-selector/
	    if (!height || !width || target.is(':hidden')) {
	        iframe && iframe.hide();
	    } else {
	        // 第一次显示时才创建：as lazy as possible
	        iframe || (iframe = this.iframe = createIframe(target));

	        iframe.css({
	            'height': height,
	            'width': width
	        });

	        Position.pin(iframe[0], target[0]);
	        iframe.show();
	    }

	    return this;
	};

	// 销毁 iframe 等
	Shim.prototype.destroy = function() {
	    if (this.iframe) {
	        this.iframe.remove();
	        delete this.iframe;
	    }
	    delete this.target;
	};

	if (isIE6) {
	    module.exports = Shim;
	} else {
	    // 除了 IE6 都返回空函数
	    function Noop() {}

	    Noop.prototype.sync = function() {
	        return this;
	    };
	    Noop.prototype.destroy = Noop;

	    module.exports = Noop;
	}

	// Helpers

	// 在 target 之前创建 iframe，这样就没有 z-index 问题
	// iframe 永远在 target 下方
	function createIframe(target) {
	    var css = {
	        display: 'none',
	        border: 'none',
	        opacity: 0,
	        position: 'absolute'
	    };

	    // 如果 target 存在 zIndex 则设置
	    var zIndex = target.css('zIndex');
	    if (zIndex && zIndex > 0) {
	        css.zIndex = zIndex - 1;
	    }

	    return $('<iframe>', {
	        src: 'javascript:\'\'', // 不加的话，https 下会弹警告
	        frameborder: 0,
	        css: css
	    }).insertBefore(target);
	}


/***/ },

/***/ 23:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Overlay = __webpack_require__(7);
	    
	    
	    ua = (window.navigator.userAgent || "").toLowerCase(),
	    isIE6 = ua.indexOf("msie 6") !== -1,
	    
	    
	    body = $(document.body),
	    doc = $(document);


	// Mask
	// ----------
	// 全屏遮罩层组件
	var Mask = Overlay.extend({

	  attrs: {
	    width: isIE6 ? doc.outerWidth(true) : '100%',
	    height: isIE6 ? doc.outerHeight(true) : '100%',

	    className: 'ui-mask',
	    opacity: 0.2,
	    backgroundColor: '#000',
	    style: {
	      position: isIE6 ? 'absolute' : 'fixed',
	      top: 0,
	      left: 0
	    },

	    align: {
	      // undefined 表示相对于当前可视范围定位
	      baseElement: isIE6 ? body : undefined
	    }
	  },

	  show: function () {
	    if (isIE6) {
	      this.set('width', doc.outerWidth(true));
	      this.set('height', doc.outerHeight(true));
	    }
	    return Mask.superclass.show.call(this);
	  },

	  _onRenderBackgroundColor: function (val) {
	    this.element.css('backgroundColor', val);
	  },

	  _onRenderOpacity: function (val) {
	    this.element.css('opacity', val);
	  }
	});

	// 单例
	module.exports = new Mask();

/***/ },

/***/ 51:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Overlay = __webpack_require__(13);

	// Popup 是可触发 Overlay 型 UI 组件
	var Popup = Overlay.extend({

	  attrs: {
	    // 触发元素
	    trigger: {
	      value: null,
	      // required
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 触发类型
	    triggerType: 'hover',
	    // or click or focus
	    // 触发事件委托的对象
	    delegateNode: {
	      value: null,
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 默认的定位参数
	    align: {
	      value: {
	        baseXY: [0, '100%'],
	        selfXY: [0, 0]
	      },
	      setter: function (val) {
	        if (!val) {
	          return;
	        }
	        if (val.baseElement) {
	          this._specifiedBaseElement = true;
	        } else if (this.activeTrigger) {
	          // 若给的定位元素未指定基准元素
	          // 就给一个...
	          val.baseElement = this.activeTrigger;
	        }
	        return val;
	      },
	      getter: function (val) {
	        // 若未指定基准元素，则按照当前的触发元素进行定位
	        return $.extend({}, val, this._specifiedBaseElement ? {} : {
	          baseElement: this.activeTrigger
	        });
	      }
	    },

	    // 延迟触发和隐藏时间
	    delay: 70,

	    // 是否能够触发
	    // 可以通过set('disabled', true)关闭
	    disabled: false,

	    // 基本的动画效果，可选 fade|slide
	    effect: '',

	    // 动画的持续时间
	    duration: 250

	  },

	  setup: function () {
	    Popup.superclass.setup.call(this);
	    this._bindTrigger();
	    this._blurHide(this.get('trigger'));

	    // 默认绑定activeTrigger为第一个元素
	    // for https://github.com/aralejs/popup/issues/6
	    this.activeTrigger = this.get('trigger').eq(0);

	    // 当使用委托事件时，_blurHide 方法对于新添加的节点会失效
	    // 这时需要重新绑定
	    var that = this;
	    if (this.get('delegateNode')) {
	      this.before('show', function () {
	        that._relativeElements = that.get('trigger');
	        that._relativeElements.push(that.element);
	      });
	    }
	  },

	  render: function () {
	    Popup.superclass.render.call(this);

	    // 通过 template 生成的元素默认也应该是不可见的
	    // 所以插入元素前强制隐藏元素，#20
	    this.element.hide();
	    return this;
	  },

	  show: function () {
	    if (this.get('disabled')) {
	      return;
	    }
	    return Popup.superclass.show.call(this);
	  },

	  // triggerShimSync 为 true 时
	  // 表示什么都不做，只是触发 hide 的 before/after 绑定方法
	  hide: function (triggerShimSync) {
	    if (!triggerShimSync) {
	      return Popup.superclass.hide.call(this);
	    }
	    return this;
	  },

	  _bindTrigger: function () {
	    var triggerType = this.get('triggerType');

	    if (triggerType === 'click') {
	      this._bindClick();
	    } else if (triggerType === 'focus') {
	      this._bindFocus();
	    } else {
	      // 默认是 hover
	      this._bindHover();
	    }
	  },

	  _bindClick: function () {
	    var that = this;

	    bindEvent('click', this.get('trigger'), function (e) {
	      // this._active 这个变量表明了当前触发元素是激活状态
	      if (this._active === true) {
	        that.hide();
	      } else {
	        // 将当前trigger标为激活状态
	        makeActive(this);
	        that.show();
	      }
	    }, this.get('delegateNode'), this);

	    // 隐藏前清空激活状态
	    this.before('hide', function () {
	      makeActive();
	    });

	    // 处理所有trigger的激活状态
	    // 若 trigger 为空，相当于清除所有元素的激活状态
	    function makeActive(trigger) {
	      if (that.get('disabled')) {
	        return;
	      }
	      that.get('trigger').each(function (i, item) {
	        if (trigger == item) {
	          item._active = true;
	          // 标识当前点击的元素
	          that.activeTrigger = $(item);
	        } else {
	          item._active = false;
	        }
	      });
	    }
	  },

	  _bindFocus: function () {
	    var that = this;

	    bindEvent('focus', this.get('trigger'), function () {
	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      that.show();
	    }, this.get('delegateNode'), this);

	    bindEvent('blur', this.get('trigger'), function () {
	      var blurTrigger = this;
	      setTimeout(function () {
	        // 当 blur 的触发元素和当前的 activeTrigger 一样时才能干掉
	        // 修复 https://github.com/aralejs/popup/issues/27
	        if (!that._downOnElement && that.activeTrigger[0] === blurTrigger) {
	          that.hide();
	        }
	        that._downOnElement = false;
	      }, that.get('delay'));
	    }, this.get('delegateNode'), this);

	    // 为了当input blur时能够选择和操作弹出层上的内容
	    this.delegateEvents("mousedown", function (e) {
	      this._downOnElement = true;
	    });
	  },

	  _bindHover: function () {
	    var trigger = this.get('trigger');
	    var delegateNode = this.get('delegateNode');
	    var delay = this.get('delay');

	    var showTimer, hideTimer;
	    var that = this;

	    // 当 delay 为负数时
	    // popup 变成 tooltip 的效果
	    if (delay < 0) {
	      this._bindTooltip();
	      return;
	    }

	    bindEvent('mouseenter', trigger, function () {
	      clearTimeout(hideTimer);
	      hideTimer = null;

	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      showTimer = setTimeout(function () {
	        that.show();
	      }, delay);
	    }, delegateNode, this);

	    bindEvent('mouseleave', trigger, leaveHandler, delegateNode, this);

	    // 鼠标在悬浮层上时不消失
	    this.delegateEvents("mouseenter", function () {
	      clearTimeout(hideTimer);
	    });
	    this.delegateEvents("mouseleave", leaveHandler);

	    this.element.on('mouseleave', 'select', function (e) {
	      e.stopPropagation();
	    });

	    function leaveHandler(e) {
	      clearTimeout(showTimer);
	      showTimer = null;

	      if (that.get('visible')) {
	        hideTimer = setTimeout(function () {
	          that.hide();
	        }, delay);
	      }
	    }
	  },

	  _bindTooltip: function () {
	    var trigger = this.get('trigger');
	    var delegateNode = this.get('delegateNode');
	    var that = this;

	    bindEvent('mouseenter', trigger, function () {
	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      that.show();
	    }, delegateNode, this);

	    bindEvent('mouseleave', trigger, function () {
	      that.hide();
	    }, delegateNode, this);
	  },

	  _onRenderVisible: function (val, originVal) {
	    // originVal 为 undefined 时不继续执行
	    if (val === !!originVal) {
	      return;
	    }

	    var fade = (this.get('effect').indexOf('fade') !== -1);
	    var slide = (this.get('effect').indexOf('slide') !== -1);
	    var animConfig = {};
	    slide && (animConfig.height = (val ? 'show' : 'hide'));
	    fade && (animConfig.opacity = (val ? 'show' : 'hide'));

	    // 需要在回调时强制调一下 hide
	    // 来触发 iframe-shim 的 sync 方法
	    // 修复 ie6 下 shim 未隐藏的问题
	    // visible 只有从 true 变为 false 时，才调用这个 hide
	    var that = this;
	    var hideComplete = val ?
	    function () {
	      that.trigger('animated');
	    } : function () {
	      // 参数 true 代表只是为了触发 shim 方法
	      that.hide(true);
	      that.trigger('animated');
	    };

	    if (fade || slide) {
	      this.element.stop(true, true).animate(animConfig, this.get('duration'), hideComplete).css({
	        'visibility': 'visible'
	      });
	    } else {
	      this.element[val ? 'show' : 'hide']();
	    }
	  }

	});

	module.exports = Popup;

	// 一个绑定事件的简单封装
	function bindEvent(type, element, fn, delegateNode, context) {
	  var hasDelegateNode = delegateNode && delegateNode[0];

	  context.delegateEvents(
	  hasDelegateNode ? delegateNode : element, hasDelegateNode ? type + " " + element.selector : type, function (e) {
	    fn.call(e.currentTarget, e);
	  });
	}


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




/***/ }

/******/ });