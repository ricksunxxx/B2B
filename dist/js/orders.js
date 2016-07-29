webpackJsonp([23],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 会员中心公共部分 
	 */
	var ConfirmBox = __webpack_require__(15);
	var Selection = __webpack_require__(53);
	var templatable = __webpack_require__(10);
	var formPaginger = __webpack_require__(64);
	var loading = __webpack_require__(18);
	var AjaxUpload = __webpack_require__(65);
	var fileDownload = __webpack_require__(84);
	var Upload = __webpack_require__(207);


	// 侧边折叠菜单
	__webpack_require__(52)();

	var orders = {
	    //订单批量新增
	    index: function() {
	        var uploader = null,
	            $trigger = $('#upload-file'),
	            filename = '';

	        //上传
	        uploader = new AjaxUpload($trigger, {
	            action: '/Order/Upload',
	            responseType: 'json',
	            title: '',
	            onChange: function(file, extension) {

	                var re = /\.(xlsx|xls)$/i;
	                if (!re.test(file)) {
	                    showMessage('请上传Excel格式文件!', true);
	                    return false;
	                }
	            },
	            onSubmit: function(file, extension) {
	                loading.show();
	            },
	            onComplete: function(file, data) {
	                loading.hide();
	                if (data.Succeeded) {
	                    var uploadedTip = '<span class="uploadedTip" style="display:inline-block;color:#E4393C;padding-left:20px;">已导入:  ' + file + '</span>';
	                    $('.uploadedTip').remove();
	                    $trigger.after(uploadedTip);
	                    showMessage('订单导入成功！', false);
	                } else {
	                    var message = '订单导入部分失败，详细信息请<a class="ui-text-link" href="/Order/WriteImportOrderLog?message='+ data.Message +'">点此下载</a>';
	                    showMessage(message, true);
	                }
	            },
	            onError: function() {
	                loading.hide();
	                showMessage('网络出错，请稍后再试!', true);
	            }
	        });
	    },

	    //我的订单
	    myorders: function() {
	        var form = $('#J_form_query');
	        var order = $('.member-table-order');

	        // 是否已无信息
	        function checkHasNull(items) {
	            if (!items.length) {
	                order.append('<div class="member-table-none">无相关信息</div>');
	                $('.ui-paging').remove();
	            }
	        }

	        //点击tab
	        $('.ui-tabs-trigger').on('click', function() {
	            var $this = $(this);
	            var type = $this.find('a').data('type');

	            $('input[name="Status"]').val(type);
	            form.submit();
	        });

	        //删除所选 
	        $('.member-my-order').selection({
	            selectAllElem: '#J_select_all',
	            singleClass: '.checkbox-sub',
	            singleParentClass: '.my-order-group',
	            batchRemoveElem: '#J_batch_del',
	            async: true,
	            onSelect: function() {
	                $('#J_select_all').prop('checked') ? $('#selectAll').text('反选') : $('#selectAll').text('全选');
	            },
	            onSelectAll: function() {},
	            onBatchRemove: function(data) {
	                var that = this,
	                    selecteds = this.selecteds,
	                    datas = [];

	                if (!selecteds.length) {
	                    showMessage('请选择要删除的订单', false);
	                    return false;
	                }

	                ConfirmBox.confirm('确定要删除所选订单吗？', '提示：', function() {
	                    for (var i = 0; i < selecteds.length; i++) {
	                        var item = selecteds[i];
	                        datas.push(item.parent.data('pid'));
	                    }

	                    var pids = datas.join(',');
	                    $.ajax({
	                        url: '/Order/OrderBatchDelete',
	                        type: 'POST',
	                        dataType: 'json',
	                        data: { orderCodes: pids },
	                        success: function(data) {
	                            if (data.Succeeded) {
	                                that.batchRemove();
	                                checkHasNull(that.items);
	                                showMessage('删除成功', false, function(){
	                                    window.location.reload();
	                                });
	                            } else {
	                                showMessage('删除失败，请稍后再试！', false);
	                            }
	                        },
	                        error: function() {
	                            showMessage('网络出错，请稍后再试！', false);
	                        }
	                    });
	                });
	            }
	        });
	        $('#selectAll').on('click', function(event) {
	            event.preventDefault();

	            if ($('.my-order-group  .checkbox-sub').length > 0) {
	                var $inputSelectAll = $('#J_select_all');

	                $inputSelectAll.trigger('click');
	                $inputSelectAll.prop('checked') ? $(this).text('反选') : $(this).text('全选');
	            }
	        });


	        //批量付款  
	        var Status = $('input[name="Status"]').val();
	        if (Status == 0) { //tab至未付款才加事件
	            $('#J_batch_pay').on('click', function(event) {
	                event.preventDefault();
	                var checkboxs = $('input.checkbox-sub:checked');
	                var checkboxsLength = checkboxs.length;
	                var orderIds = '';

	                if (checkboxsLength > 0) {
	                    orderIds = checkboxs.map(function(index, elem) {
	                        return $(elem).closest('.my-order-group').data('pid');
	                    }).get().join(',');

	                    $.ajax({
	                            url: 'Order/OrderBatchWalletPay',
	                            type: 'POST',
	                            dataType: 'json',
	                            data: { orderCodes: orderIds },
	                            beforeSend: function(){
	                                loading.show();
	                            }
	                        })
	                        .done(function(data) {
	                            loading.hide();
	                            if (data.Succeeded) {
	                                if (data.Result.Status == 1) {
	                                    showMessage('订单付款成功！', false);
	                                    $('input[name="Status"]').val('1');
	                                    setTimeout(function() {
	                                        form.submit();
	                                    }, 2000);
	                                } else {
	                                    var onConfirm = function() {
	                                        window.location.href = '/Wallet?amount=' + data.Result.RechargeAmount;
	                                    };
	                                    var onCancel = function() {
	                                        return false;
	                                    };
	                                    ConfirmBox.confirm(('账户余额不足，订单还需支付' + data.Result.RechargeAmount + '元！'), '支付确认', onConfirm, onCancel);
	                                }
	                            } else {
	                                // showMessage('付款失败，请稍后再试！', true);
	                                showMessage(data.Message, true);
	                            }
	                        })
	                        .fail(function() {
	                            loading.hide();
	                            showMessage('网络出错，请稍后再试！', false);
	                        });
	                } else {
	                    showMessage('请选择要付款的订单！', false);
	                }
	            });
	        }

	        var $cancel = $('.j-cancel'),
	            $remove = $('.j-remove');

	        function getItemData(trigger, $self){
	            var parent = $self ? $self : trigger.closest('div.my-order-group', form);
	            var getData = function(name){
	                return parent.data(name) ? parent.data(name) : '';
	            };
	            
	            return {
	                element: parent,
	                pid: getData('pid')
	            };
	        }

	        function ajax(url, data, successCallback){
	            loading.show();

	            $.ajax({
	                type: 'POST',
	                dataType: 'json',
	                url: url,
	                data: data || {}, 
	            }).success(function(data){
	                loading.hide();
	                successCallback && successCallback(data);
	            }).error(function(){
	                console.log(arguments);
	                loading.hide();
	                alert('服务器繁忙，请重试');
	            });
	        }

	        // 取消订单    
	        if($cancel[0]){
	            form.on('click', '.j-cancel', function(){
	                var $this = $(this),
	                    data = getItemData($this);

	                ConfirmBox.confirm('确定要取消这个订单吗？', '提示：', function(){
	                    ajax('/Order/CancelSellerOrder', {orderCode: data.pid}, function(res){
	                        if(res.Succeeded){
	                            showMessage('取消成功', false, function(){
	                                window.location.reload();
	                            });
	                        }
	                    });                    
	                });
	            });
	        }
	        // 删除订单 
	        if($remove[0]){
	            form.on('click', '.j-remove', function(){
	                var $this = $(this),
	                    data = getItemData($this);
	                ConfirmBox.confirm('确定要删除这个订单吗？', '提示：', function(){
	                    ajax('/Order/OrderBatchDelete', {orderCodes: data.pid}, function(res){
	                        if(res.Succeeded){
	                            showMessage('删除成功', false, function(){
	                                window.location.reload();
	                            });
	                        }
	                    });                    
	                });
	            });
	        }

	        //分页
	        formPaginger('.ui-paging', '#J_form_query');

	        //日期控件
	        initRangeDate();
	    },

	    //异常订单查询
	    abnormal: function() {
	        initRangeDate();
	        formPaginger('.ui-paging', '#J_form_query');
	    },

	    detail: function() {
	        // console.log('detail');
	    }
	};

	//提示信息
	function showMessage(message, hold, hideCallback){
	    ConfirmBox.show(message, hideCallback ? hideCallback : null, {
	        title: '提示',
	        onShow: function(){
	            if(!hold){
	                var that = this;
	                setTimeout(function(){
	                    that.hide();
	                }, 2000);                           
	            }
	        }
	    });
	}
	// 日历初始化
	function initRangeDate() {
	    // 异步加载日历组件
	    __webpack_require__.e/* nsure */(0, function(require) {
	        var Calendar = __webpack_require__(63);

	        var dateStart, dateEnd;
	        // 日历开始
	        dateStart = new Calendar({
	            trigger: '#J_date_start'
	        });

	        // 日历结束
	        dateEnd = new Calendar({
	            trigger: '#J_date_end'
	        });

	        // 初始化日期
	        var dateStartVal = $('#J_date_start').val(),
	            dateEndVal = $('#J_date_end').val();

	        var date = new Date(),
	            year = date.getFullYear(),
	            month = date.getMonth() * 1 + 1,
	            day = date.getDate() * 1;

	        var today = year + '-' +
	            (month >= 10 ? month : '0' + month) + '-' +
	            (day >= 10 ? day : '0' + day);
	        // console.log(today)

	        if ($.trim(dateStartVal) === '' && $.trim(dateEndVal) === '') {
	            dateStart.range([null, today]);
	            dateEnd.range([null, today]);
	        } else {
	            dateStart.range([null, today]);
	            dateEnd.range([dateStartVal, today]);
	        }

	        // 当选日期时，调整可选日期的范围
	        dateStart.on('selectDate', function(date) {
	            dateEnd.range([date, today]);
	        });

	        dateEnd.on('selectDate', function(date) {
	            dateStart.range([null, date]);
	        });

	    });
	}

	window.orders = orders;


/***/ },

/***/ 65:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	* AJAX Upload ( http://valums.com/ajax-upload/ ) 
	* Copyright (c) Andrew Valums
	* Licensed under the MIT license 
	*/

	/**
	* Attaches event to a dom element.
	* @param {Element} el
	* @param type event name
	* @param fn callback This refers to the passed element
	*/

	(function (factory) {

	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
	        module.exports = factory();
	    }
	    else if (typeof Package !== 'undefined') {
	        AjaxUpload = factory();  // export for Meteor.js
	    }
	    else {
	        /* jshint sub:true */
	        window['AjaxUpload'] = factory();
	    }
	})(function () {

	    function addEvent(el, type, fn) {
	        if (el.addEventListener) {
	            el.addEventListener(type, fn, false);
	        } else if (el.attachEvent) {
	            el.attachEvent('on' + type, function () {
	                fn.call(el);
	            });
	        } else {
	            throw new Error('not supported or DOM not loaded');
	        }
	    }

	    /**
	    * Attaches resize event to a window, limiting
	    * number of event fired. Fires only when encounteres
	    * delay of 100 after series of events.
	    * 
	    * Some browsers fire event multiple times when resizing
	    * http://www.quirksmode.org/dom/events/resize.html
	    * 
	    * @param fn callback This refers to the passed element
	    */
	    function addResizeEvent(fn) {
	        var timeout;

	        addEvent(window, 'resize', function () {
	            if (timeout) {
	                clearTimeout(timeout);
	            }
	            timeout = setTimeout(fn, 100);
	        });
	    }

	    // Needs more testing, will be rewriten for next version        
	    // getOffset function copied from jQuery lib (http://jquery.com/)
	    if (document.documentElement.getBoundingClientRect) {
	        // Get Offset using getBoundingClientRect
	        // http://ejohn.org/blog/getboundingclientrect-is-awesome/
	        var getOffset = function (el) {
	            var box = el.getBoundingClientRect();
	            var doc = el.ownerDocument;
	            var body = doc.body;
	            var docElem = doc.documentElement; // for ie 
	            var clientTop = docElem.clientTop || body.clientTop || 0;
	            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

	            // In Internet Explorer 7 getBoundingClientRect property is treated as physical,
	            // while others are logical. Make all logical, like in IE8.	
	            var zoom = 1;
	            if (body.getBoundingClientRect) {
	                var bound = body.getBoundingClientRect();
	                zoom = (bound.right - bound.left) / body.clientWidth;
	            }

	            if (zoom > 1) {
	                clientTop = 0;
	                clientLeft = 0;
	            }

	            var top = box.top / zoom + (window.pageYOffset || docElem && docElem.scrollTop / zoom || body.scrollTop / zoom) - clientTop, left = box.left / zoom + (window.pageXOffset || docElem && docElem.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;

	            return {
	                top: top,
	                left: left
	            };
	        };
	    } else {
	        // Get offset adding all offsets 
	        var getOffset = function (el) {
	            var top = 0, left = 0;
	            do {
	                top += el.offsetTop || 0;
	                left += el.offsetLeft || 0;
	                el = el.offsetParent;
	            } while (el);

	            return {
	                left: left,
	                top: top
	            };
	        };
	    }

	    /**
	    * Returns left, top, right and bottom properties describing the border-box,
	    * in pixels, with the top-left relative to the body
	    * @param {Element} el
	    * @return {Object} Contains left, top, right,bottom
	    */
	    function getBox(el) {
	        var left, right, top, bottom;
	        var offset = getOffset(el);
	        left = offset.left;
	        top = offset.top;

	        right = left + el.offsetWidth;
	        bottom = top + el.offsetHeight;

	        return {
	            left: left,
	            right: right,
	            top: top,
	            bottom: bottom
	        };
	    }

	    /**
	    * Helper that takes object literal
	    * and add all properties to element.style
	    * @param {Element} el
	    * @param {Object} styles
	    */
	    function addStyles(el, styles) {
	        for (var name in styles) {
	            if (styles.hasOwnProperty(name)) {
	                el.style[name] = styles[name];
	            }
	        }
	    }

	    /**
	    * Function places an absolutely positioned
	    * element on top of the specified element
	    * copying position and dimentions.
	    * @param {Element} from
	    * @param {Element} to
	    */
	    function copyLayout(from, to) {
	        var box = getBox(from);

	        addStyles(to, {
	            position: 'absolute',
	            left: box.left + 'px',
	            top: box.top + 'px',
	            width: from.offsetWidth + 'px',
	            height: from.offsetHeight + 'px'
	        });
	    }

	    /**
	    * Creates and returns element from html chunk
	    * Uses innerHTML to create an element
	    */
	    var toElement = (function () {
	        var div = document.createElement('div');
	        return function (html) {
	            div.innerHTML = html;
	            var el = div.firstChild;
	            return div.removeChild(el);
	        };
	    })();

	    /**
	    * Function generates unique id
	    * @return unique id 
	    */
	    var getUID = (function () {
	        var id = 0;
	        return function () {
	            return 'ValumsAjaxUpload' + id++;
	        };
	    })();

	    /**
	    * Get file name from path
	    * @param {String} file path to file
	    * @return filename
	    */
	    function fileFromPath(file) {
	        return file.replace(/.*(\/|\\)/, "");
	    }

	    /**
	    * Get file extension lowercase
	    * @param {String} file name
	    * @return file extenstion
	    */
	    function getExt(file) {
	        return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
	    }

	    function hasClass(el, name) {
	        var re = new RegExp('\\b' + name + '\\b');
	        return re.test(el.className);
	    }
	    function addClass(el, name) {
	        if (!hasClass(el, name)) {
	            el.className += ' ' + name;
	        }
	    }
	    function removeClass(el, name) {
	        var re = new RegExp('\\b' + name + '\\b');
	        el.className = el.className.replace(re, '');
	    }

	    function removeNode(el) {
	        el.parentNode.removeChild(el);
	    }

	    /**
	    * Easy styling and uploading
	    * @constructor
	    * @param button An element you want convert to 
	    * upload button. Tested dimentions up to 500x500px
	    * @param {Object} options See defaults below.
	    */
	    window.AjaxUpload = function (button, options) {
	        this._settings = {
	            // Location of the server-side upload script
	            action: 'upload.php',
	            // File upload name
	            name: 'userfile',
	            // Select & upload multiple files at once FF3.6+, Chrome 4+
	            multiple: false,
	            // Additional data to send
	            data: {},
	            // Submit file as soon as it's selected
	            autoSubmit: true,
	            // The type of data that you're expecting back from the server.
	            // html and xml are detected automatically.
	            // Only useful when you are using json data as a response.
	            // Set to "json" in that case. 
	            responseType: false,
	            // Class applied to button when mouse is hovered
	            hoverClass: 'hover',
	            // Class applied to button when button is focused
	            focusClass: 'focus',
	            // Class applied to button when AU is disabled
	            disabledClass: 'disabled',
	            // When user selects a file, useful with autoSubmit disabled
	            // You can return false to cancel upload			
	            onChange: function (file, extension) {
	            },
	            // Callback to fire before file is uploaded
	            // You can return false to cancel upload
	            onSubmit: function (file, extension) {
	            },
	            // Fired when file upload is completed
	            // WARNING! DO NOT USE "FALSE" STRING AS A RESPONSE!
	            onComplete: function (file, response) {
	            },
	            onError: function(file, response){}
	        };

	        // Merge the users options with our defaults
	        for (var i in options) {
	            if (options.hasOwnProperty(i)) {
	                this._settings[i] = options[i];
	            }
	        }

	        // button isn't necessary a dom element
	        if (button.jquery) {
	            // jQuery object was passed
	            button = button[0];
	        } else if (typeof button == "string") {
	            if (/^#.*/.test(button)) {
	                // If jQuery user passes #elementId don't break it					
	                button = button.slice(1);
	            }

	            button = document.getElementById(button);
	        }

	        if (!button || button.nodeType !== 1) {
	            throw new Error("Please make sure that you're passing a valid element");
	        }

	        if (button.nodeName.toUpperCase() == 'A') {
	            // disable link                       
	            addEvent(button, 'click', function (e) {
	                if (e && e.preventDefault) {
	                    e.preventDefault();
	                } else if (window.event) {
	                    window.event.returnValue = false;
	                }
	            });
	        }

	        // DOM element
	        this._button = button;
	        // DOM element                 
	        this._input = null;
	        // If disabled clicking on button won't do anything
	        this._disabled = false;

	        // if the button was disabled before refresh if will remain
	        // disabled in FireFox, let's fix it
	        this.enable();

	        this._rerouteClicks();
	    };

	    // assigning methods to our class
	    AjaxUpload.prototype = {
	        setData: function (data) {
	            this._settings.data = data;
	        },
	        disable: function () {
	            addClass(this._button, this._settings.disabledClass);
	            this._disabled = true;

	            var nodeName = this._button.nodeName.toUpperCase();
	            if (nodeName == 'INPUT' || nodeName == 'BUTTON') {
	                this._button.setAttribute('disabled', 'disabled');
	            }

	            // hide input
	            if (this._input) {
	                if (this._input.parentNode) {
	                    // We use visibility instead of display to fix problem with Safari 4
	                    // The problem is that the value of input doesn't change if it 
	                    // has display none when user selects a file
	                    this._input.parentNode.style.visibility = 'hidden';
	                }
	            }
	        },
	        enable: function () {
	            removeClass(this._button, this._settings.disabledClass);
	            this._button.removeAttribute('disabled');
	            this._disabled = false;

	        },
	        /**
	        * Creates invisible file input 
	        * that will hover above the button
	        * <div><input type='file' /></div>
	        */
	        _createInput: function () {
	            var self = this;

	            var input = document.createElement("input");
	            input.setAttribute('type', 'file');
	            input.setAttribute('title', this._settings.title);
	            input.setAttribute('name', this._settings.name);
	            if (this._settings.multiple) input.setAttribute('multiple', 'multiple');

	            addStyles(input, {
	                'position': 'absolute',
	                // in Opera only 'browse' button
	                // is clickable and it is located at
	                // the right side of the input
	                'right': 0,
	                'margin': 0,
	                'padding': 0,
	                'fontSize': '480px',
	                // in Firefox if font-family is set to
	                // 'inherit' the input doesn't work
	                'fontFamily': 'sans-serif',
	                'cursor': 'pointer'
	            });

	            var div = document.createElement("div");
	            addStyles(div, {
	                'display': 'block',
	                'position': 'absolute',
	                'overflow': 'hidden',
	                'margin': 0,
	                'padding': 0,
	                'opacity': 0,
	                // Make sure browse button is in the right side
	                // in Internet Explorer
	                'direction': 'ltr',
	                //Max zIndex supported by Opera 9.0-9.2
	                'zIndex': 2147483583
	            });

	            // Make sure that element opacity exists.
	            // Otherwise use IE filter            
	            if (div.style.opacity !== "0") {
	                if (typeof (div.filters) == 'undefined') {
	                    throw new Error('Opacity not supported by the browser');
	                }
	                div.style.filter = "alpha(opacity=0)";
	            }

	            addEvent(input, 'change', function () {

	                if (!input || input.value === '') {
	                    return;
	                }

	                // Get filename from input, required                
	                // as some browsers have path instead of it          
	                var file = fileFromPath(input.value);

	                if (false === self._settings.onChange.call(self, file, getExt(file))) {
	                    self._clearInput();
	                    return;
	                }

	                // Submit form when value is changed
	                if (self._settings.autoSubmit) {
	                    self.submit();
	                }
	            });

	            addEvent(input, 'mouseover', function () {
	                addClass(self._button, self._settings.hoverClass);
	            });

	            addEvent(input, 'mouseout', function () {
	                removeClass(self._button, self._settings.hoverClass);
	                removeClass(self._button, self._settings.focusClass);

	                if (input.parentNode) {
	                    // We use visibility instead of display to fix problem with Safari 4
	                    // The problem is that the value of input doesn't change if it 
	                    // has display none when user selects a file
	                    input.parentNode.style.visibility = 'hidden';
	                }
	            });

	            addEvent(input, 'focus', function () {
	                addClass(self._button, self._settings.focusClass);
	            });

	            addEvent(input, 'blur', function () {
	                removeClass(self._button, self._settings.focusClass);
	            });

	            div.appendChild(input);
	            document.body.appendChild(div);

	            this._input = input;
	        },
	        _clearInput: function () {
	            if (!this._input) {
	                return;
	            }

	            // this._input.value = ''; Doesn't work in IE6                               
	            removeNode(this._input.parentNode);
	            this._input = null;
	            this._createInput();

	            removeClass(this._button, this._settings.hoverClass);
	            removeClass(this._button, this._settings.focusClass);
	        },
	        /**
	        * Function makes sure that when user clicks upload button,
	        * the this._input is clicked instead
	        */
	        _rerouteClicks: function () {
	            var self = this;

	            // IE will later display 'access denied' error
	            // if you use using self._input.click()
	            // other browsers just ignore click()

	            addEvent(self._button, 'mouseover', function () {
	                if (self._disabled) {
	                    return;
	                }

	                if (!self._input) {
	                    self._createInput();
	                }

	                var div = self._input.parentNode;
	                copyLayout(self._button, div);
	                div.style.visibility = 'visible';

	            });


	            // commented because we now hide input on mouseleave
	            /**
	            * When the window is resized the elements 
	            * can be misaligned if button position depends
	            * on window size
	            */
	            //addResizeEvent(function(){
	            //    if (self._input){
	            //        copyLayout(self._button, self._input.parentNode);
	            //    }
	            //});            

	        },
	        /**
	        * Creates iframe with unique name
	        * @return {Element} iframe
	        */
	        _createIframe: function () {
	            // We can't use getTime, because it sometimes return
	            // same value in safari :(
	            var id = getUID();

	            // We can't use following code as the name attribute
	            // won't be properly registered in IE6, and new window
	            // on form submit will open
	            // var iframe = document.createElement('iframe');
	            // iframe.setAttribute('name', id);                        

	            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
	            // src="javascript:false; was added
	            // because it possibly removes ie6 prompt 
	            // "This page contains both secure and nonsecure items"
	            // Anyway, it doesn't do any harm.            
	            iframe.setAttribute('id', id);

	            iframe.style.display = 'none';
	            document.body.appendChild(iframe);

	            return iframe;
	        },
	        /**
	        * Creates form, that will be submitted to iframe
	        * @param {Element} iframe Where to submit
	        * @return {Element} form
	        */
	        _createForm: function (iframe) {
	            var settings = this._settings;

	            // We can't use the following code in IE6
	            // var form = document.createElement('form');
	            // form.setAttribute('method', 'post');
	            // form.setAttribute('enctype', 'multipart/form-data');
	            // Because in this case file won't be attached to request                    
	            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');

	            form.setAttribute('action', settings.action);
	            form.setAttribute('target', iframe.name);
	            form.style.display = 'none';
	            document.body.appendChild(form);

	            // Create hidden input element for each data key
	            for (var prop in settings.data) {
	                if (settings.data.hasOwnProperty(prop)) {
	                    var el = document.createElement("input");
	                    el.setAttribute('type', 'hidden');
	                    el.setAttribute('name', prop);
	                    el.setAttribute('value', settings.data[prop]);
	                    form.appendChild(el);
	                }
	            }
	            return form;
	        },
	        /**
	        * Gets response from iframe and fires onComplete event when ready
	        * @param iframe
	        * @param file Filename to use in onComplete callback 
	        */
	        _getResponse: function (iframe, file) {
	            // getting response
	            var toDeleteFlag = false, self = this, settings = this._settings;

	            addEvent(iframe, 'load', function () {
	                if (// For Safari 
	                    iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" ||
	                // For FF, IE
	                    iframe.src == "javascript:'<html></html>';") {
	                    // First time around, do not delete.
	                    // We reload to blank page, so that reloading main page
	                    // does not re-submit the post.

	                    if (toDeleteFlag) {
	                        // Fix busy state in FF3
	                        setTimeout(function () {
	                            removeNode(iframe);
	                        }, 0);
	                    }

	                    return;
	                }

	                var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;

	                // fixing Opera 9.26,10.00
	                if (doc.readyState && doc.readyState != 'complete') {
	                    // Opera fires load event multiple times
	                    // Even when the DOM is not ready yet
	                    // this fix should not affect other browsers
	                    return;
	                }

	                // fixing Opera 9.64
	                if (doc.body && doc.body.innerHTML == "false") {
	                    // In Opera 9.64 event was fired second time
	                    // when body.innerHTML changed from false 
	                    // to server response approx. after 1 sec
	                    return;
	                }

	                var response;

	                if (doc.XMLDocument) {
	                    // response is a xml document Internet Explorer property
	                    response = doc.XMLDocument;
	                } else if (doc.body) {

	                    // response is html document or plain text
	                    response = doc.body.innerHTML;
	                    
	                    // 添加error回调
	                    // 妈蛋，表单提交拿不到http状态码，这里根据返回的页面内容处理
	                    // 只针对当前ppg平台
	                    if(doc.body.firstChild.nodeName.toUpperCase() !== 'PRE' &&
	                        doc.body.firstChild.nextSibling){
	                        settings.onError.call(self, file, response);
	                        return;
	                    }

	                    if (settings.responseType && settings.responseType.toLowerCase() == 'json') {
	                        // If the document was sent as 'application/javascript' or
	                        // 'text/javascript', then the browser wraps the text in a <pre>
	                        // tag and performs html encoding on the contents.  In this case,
	                        // we need to pull the original text content from the text node's
	                        // nodeValue property to retrieve the unmangled content.
	                        // Note that IE6 only understands text/html
	                        if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
	                            doc.normalize();
	                            response = doc.body.firstChild.firstChild.nodeValue;
	                        }

	                        if (response) {
	                            response = eval("(" + response + ")");
	                        } else {
	                            response = {};
	                        }
	                    }
	                } else {
	                    // response is a xml document
	                    response = doc;
	                }

	                settings.onComplete.call(self, file, response);

	                // Reload blank page, so that reloading main page
	                // does not re-submit the post. Also, remember to
	                // delete the frame
	                toDeleteFlag = true;

	                // Fix IE mixed content issue
	                iframe.src = "javascript:'<html></html>';";
	            });
	        },
	        /**
	        * Upload file contained in this._input
	        */
	        submit: function () {
	            var self = this, settings = this._settings;

	            if (!this._input || this._input.value === '') {
	                return;
	            }

	            var file = fileFromPath(this._input.value);

	            // user returned false to cancel upload
	            if (false === settings.onSubmit.call(this, file, getExt(file))) {
	                this._clearInput();
	                return;
	            }

	            // sending request    
	            var iframe = this._createIframe();
	            var form = this._createForm(iframe);

	            // assuming following structure
	            // div -> input type='file'
	            removeNode(this._input.parentNode);
	            removeClass(self._button, self._settings.hoverClass);
	            removeClass(self._button, self._settings.focusClass);

	            form.appendChild(this._input);

	            form.submit();

	            // request set, clean up                
	            removeNode(form); form = null;
	            removeNode(this._input); this._input = null;

	            // Get response from iframe and fire onComplete event when ready
	            this._getResponse(iframe, file);

	            // get ready for next request            
	            this._createInput();
	        }
	    };

	    return AjaxUpload;

	});



/***/ },

/***/ 84:
/***/ function(module, exports) {

	/*
	 * jQuery File Download Plugin v1.4.4
	 *
	 * http://www.johnculviner.com
	 *
	 * Copyright (c) 2013 - John Culviner
	 *
	 * Licensed under the MIT license:
	 *   http://www.opensource.org/licenses/mit-license.php
	 *
	 * !!!!NOTE!!!!
	 * You must also write a cookie in conjunction with using this plugin as mentioned in the orignal post:
	 * http://johnculviner.com/jquery-file-download-plugin-for-ajax-like-feature-rich-file-downloads/
	 * !!!!NOTE!!!!
	 */

	(function($){
	    // i'll just put them here to get evaluated on script load
	    var htmlSpecialCharsRegEx = /[<>&\r\n"']/gm;
	    var htmlSpecialCharsPlaceHolders = {
	        '<': 'lt;',
	        '>': 'gt;',
	        '&': 'amp;',
	        '\r': "#13;",
	        '\n': "#10;",
	        '"': 'quot;',
	        "'": '#39;' /*single quotes just to be safe, IE8 doesn't support &apos;, so use &#39; instead */
	    };

	    $.extend({
	        //
	        //$.fileDownload('/path/to/url/', options)
	        //  see directly below for possible 'options'
	        fileDownload: function(fileUrl, options) {

	            //provide some reasonable defaults to any unspecified options below
	            var settings = $.extend({

	                //
	                //Requires jQuery UI: provide a message to display to the user when the file download is being prepared before the browser's dialog appears
	                //
	                preparingMessageHtml: null,

	                //
	                //Requires jQuery UI: provide a message to display to the user when a file download fails
	                //
	                failMessageHtml: null,

	                //
	                //the stock android browser straight up doesn't support file downloads initiated by a non GET: http://code.google.com/p/android/issues/detail?id=1780
	                //specify a message here to display if a user tries with an android browser
	                //if jQuery UI is installed this will be a dialog, otherwise it will be an alert
	                //Set to null to disable the message and attempt to download anyway
	                //
	                androidPostUnsupportedMessageHtml: "Unfortunately your Android browser doesn't support this type of file download. Please try again with a different browser.",

	                //
	                //Requires jQuery UI: options to pass into jQuery UI Dialog
	                //
	                dialogOptions: { modal: true },

	                //
	                //a function to call while the dowload is being prepared before the browser's dialog appears
	                //Args:
	                //  url - the original url attempted
	                //
	                prepareCallback: function(url) {},

	                //
	                //a function to call after a file download dialog/ribbon has appeared
	                //Args:
	                //  url - the original url attempted
	                //
	                successCallback: function(url) {},

	                //
	                //a function to call after a file download dialog/ribbon has appeared
	                //Args:
	                //  responseHtml    - the html that came back in response to the file download. this won't necessarily come back depending on the browser.
	                //                      in less than IE9 a cross domain error occurs because 500+ errors cause a cross domain issue due to IE subbing out the
	                //                      server's error message with a "helpful" IE built in message
	                //  url             - the original url attempted
	                //  error           - original error cautch from exception
	                //
	                failCallback: function(responseHtml, url, error) {},

	                //
	                // the HTTP method to use. Defaults to "GET".
	                //
	                httpMethod: "GET",

	                //
	                // if specified will perform a "httpMethod" request to the specified 'fileUrl' using the specified data.
	                // data must be an object (which will be $.param serialized) or already a key=value param string
	                //
	                data: null,

	                //
	                //a period in milliseconds to poll to determine if a successful file download has occured or not
	                //
	                checkInterval: 100,

	                //
	                //the cookie name to indicate if a file download has occured
	                //
	                cookieName: "fileDownload",

	                //
	                //the cookie value for the above name to indicate that a file download has occured
	                //
	                cookieValue: "true",

	                //
	                //the cookie path for above name value pair
	                //
	                cookiePath: "/",

	                //
	                //if specified it will be used when attempting to clear the above name value pair
	                //useful for when downloads are being served on a subdomain (e.g. downloads.example.com)
	                //
	                cookieDomain: null,

	                //
	                //the title for the popup second window as a download is processing in the case of a mobile browser
	                //
	                popupWindowTitle: "Initiating file download...",

	                //
	                //Functionality to encode HTML entities for a POST, need this if data is an object with properties whose values contains strings with quotation marks.
	                //HTML entity encoding is done by replacing all &,<,>,',",\r,\n characters.
	                //Note that some browsers will POST the string htmlentity-encoded whilst others will decode it before POSTing.
	                //It is recommended that on the server, htmlentity decoding is done irrespective.
	                //
	                encodeHTMLEntities: true

	            }, options);

	            var deferred = new $.Deferred();

	            //Setup mobile browser detection: Partial credit: http://detectmobilebrowser.com/
	            var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();

	            var isIos; //has full support of features in iOS 4.0+, uses a new window to accomplish this.
	            var isAndroid; //has full support of GET features in 4.0+ by using a new window. Non-GET is completely unsupported by the browser. See above for specifying a message.
	            var isOtherMobileBrowser; //there is no way to reliably guess here so all other mobile devices will GET and POST to the current window.

	            if (/ip(ad|hone|od)/.test(userAgent)) {

	                isIos = true;

	            } else if (userAgent.indexOf('android') !== -1) {

	                isAndroid = true;

	            } else {

	                isOtherMobileBrowser = /avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|playbook|silk|iemobile|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4));

	            }

	            var httpMethodUpper = settings.httpMethod.toUpperCase();

	            if (isAndroid && httpMethodUpper !== "GET" && settings.androidPostUnsupportedMessageHtml) {
	                //the stock android browser straight up doesn't support file downloads initiated by non GET requests: http://code.google.com/p/android/issues/detail?id=1780

	                if ($().dialog) {
	                    $("<div>").html(settings.androidPostUnsupportedMessageHtml).dialog(settings.dialogOptions);
	                } else {
	                    alert(settings.androidPostUnsupportedMessageHtml);
	                }

	                return deferred.reject();
	            }

	            var $preparingDialog = null;

	            var internalCallbacks = {

	                onPrepare: function(url) {

	                    //wire up a jquery dialog to display the preparing message if specified
	                    if (settings.preparingMessageHtml) {

	                        $preparingDialog = $("<div>").html(settings.preparingMessageHtml).dialog(settings.dialogOptions);

	                    } else if (settings.prepareCallback) {

	                        settings.prepareCallback(url);

	                    }

	                },

	                onSuccess: function(url) {

	                    //remove the perparing message if it was specified
	                    if ($preparingDialog) {
	                        $preparingDialog.dialog('close');
	                    }

	                    settings.successCallback(url);

	                    deferred.resolve(url);
	                },

	                onFail: function(responseHtml, url, error) {

	                    //remove the perparing message if it was specified
	                    if ($preparingDialog) {
	                        $preparingDialog.dialog('close');
	                    }

	                    //wire up a jquery dialog to display the fail message if specified
	                    if (settings.failMessageHtml) {
	                        $("<div>").html(settings.failMessageHtml).dialog(settings.dialogOptions);
	                    }

	                    settings.failCallback(responseHtml, url, error);

	                    deferred.reject(responseHtml, url);
	                }
	            };

	            internalCallbacks.onPrepare(fileUrl);

	            //make settings.data a param string if it exists and isn't already
	            if (settings.data !== null && typeof settings.data !== "string") {
	                settings.data = $.param(settings.data);
	            }


	            var $iframe,
	                downloadWindow,
	                formDoc,
	                $form;

	            if (httpMethodUpper === "GET") {

	                if (settings.data !== null) {
	                    //need to merge any fileUrl params with the data object

	                    var qsStart = fileUrl.indexOf('?');

	                    if (qsStart !== -1) {
	                        //we have a querystring in the url

	                        if (fileUrl.substring(fileUrl.length - 1) !== "&") {
	                            fileUrl = fileUrl + "&";
	                        }
	                    } else {

	                        fileUrl = fileUrl + "?";
	                    }

	                    fileUrl = fileUrl + settings.data;
	                }

	                if (isIos || isAndroid) {

	                    downloadWindow = window.open(fileUrl);
	                    downloadWindow.document.title = settings.popupWindowTitle;
	                    window.focus();

	                } else if (isOtherMobileBrowser) {

	                    window.location(fileUrl);

	                } else {

	                    //create a temporary iframe that is used to request the fileUrl as a GET request
	                    $iframe = $("<iframe>")
	                        .hide()
	                        .prop("src", fileUrl)
	                        .appendTo("body");
	                }

	            } else {

	                var formInnerHtml = "";

	                if (settings.data !== null) {

	                    $.each(settings.data.replace(/\+/g, ' ').split("&"), function() {

	                        var kvp = this.split("=");

	                        //Issue: When value contains sign '=' then the kvp array does have more than 2 items. We have to join value back
	                        var k = kvp[0];
	                        kvp.shift();
	                        var v = kvp.join("=");
	                        kvp = [k, v];

	                        var key = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[0])) : decodeURIComponent(kvp[0]);
	                        if (key) {
	                            var value = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[1])) : decodeURIComponent(kvp[1]);
	                            formInnerHtml += '<input type="hidden" name="' + key + '" value="' + value + '" />';
	                        }
	                    });
	                }

	                if (isOtherMobileBrowser) {

	                    $form = $("<form>").appendTo("body");
	                    $form.hide()
	                        .prop('method', settings.httpMethod)
	                        .prop('action', fileUrl)
	                        .html(formInnerHtml);

	                } else {

	                    if (isIos) {

	                        downloadWindow = window.open("about:blank");
	                        downloadWindow.document.title = settings.popupWindowTitle;
	                        formDoc = downloadWindow.document;
	                        window.focus();

	                    } else {

	                        $iframe = $("<iframe style='display: none' src='about:blank'></iframe>").appendTo("body");
	                        formDoc = getiframeDocument($iframe);
	                    }

	                    formDoc.write("<html><head></head><body><form method='" + settings.httpMethod + "' action='" + fileUrl + "'>" + formInnerHtml + "</form>" + settings.popupWindowTitle + "</body></html>");
	                    $form = $(formDoc).find('form');
	                }

	                $form.submit();
	            }


	            //check if the file download has completed every checkInterval ms
	            setTimeout(checkFileDownloadComplete, settings.checkInterval);


	            function checkFileDownloadComplete() {
	                //has the cookie been written due to a file download occuring?

	                var cookieValue = settings.cookieValue;
	                if (typeof cookieValue == 'string') {
	                    cookieValue = cookieValue.toLowerCase();
	                }

	                var lowerCaseCookie = settings.cookieName.toLowerCase() + "=" + cookieValue;

	                if (document.cookie.toLowerCase().indexOf(lowerCaseCookie) > -1) {

	                    //execute specified callback
	                    internalCallbacks.onSuccess(fileUrl);

	                    //remove cookie
	                    var cookieData = settings.cookieName + "=; path=" + settings.cookiePath + "; expires=" + new Date(0).toUTCString() + ";";
	                    if (settings.cookieDomain) cookieData += " domain=" + settings.cookieDomain + ";";
	                    document.cookie = cookieData;

	                    //remove iframe
	                    cleanUp(false);

	                    return;
	                }

	                //has an error occured?
	                //if neither containers exist below then the file download is occuring on the current window
	                if (downloadWindow || $iframe) {

	                    //has an error occured?
	                    try {

	                        var formDoc = downloadWindow ? downloadWindow.document : getiframeDocument($iframe);

	                        if (formDoc && formDoc.body !== null && formDoc.body.innerHTML.length) {

	                            var isFailure = true;

	                            if ($form && $form.length) {
	                                var $contents = $(formDoc.body).contents().first();

	                                try {
	                                    if ($contents.length && $contents[0] === $form[0]) {
	                                        isFailure = false;
	                                    }
	                                } catch (e) {
	                                    if (e && e.number == -2146828218) {
	                                        // IE 8-10 throw a permission denied after the form reloads on the "$contents[0] === $form[0]" comparison
	                                        isFailure = true;
	                                    } else {
	                                        throw e;
	                                    }
	                                }
	                            }

	                            if (isFailure) {
	                                // IE 8-10 don't always have the full content available right away, they need a litle bit to finish
	                                setTimeout(function() {
	                                    internalCallbacks.onFail(formDoc.body.innerHTML, fileUrl);
	                                    cleanUp(true);
	                                }, 100);

	                                return;
	                            }
	                        }
	                    } catch (err) {

	                        //500 error less than IE9
	                        internalCallbacks.onFail('', fileUrl, err);

	                        cleanUp(true);

	                        return;
	                    }
	                }


	                //keep checking...
	                setTimeout(checkFileDownloadComplete, settings.checkInterval);
	            }

	            //gets an iframes document in a cross browser compatible manner
	            function getiframeDocument($iframe) {
	                var iframeDoc = $iframe[0].contentWindow || $iframe[0].contentDocument;
	                if (iframeDoc.document) {
	                    iframeDoc = iframeDoc.document;
	                }
	                return iframeDoc;
	            }

	            function cleanUp(isFailure) {

	                setTimeout(function() {

	                    if (downloadWindow) {

	                        if (isAndroid) {
	                            downloadWindow.close();
	                        }

	                        if (isIos) {
	                            if (downloadWindow.focus) {
	                                downloadWindow.focus(); //ios safari bug doesn't allow a window to be closed unless it is focused
	                                if (isFailure) {
	                                    downloadWindow.close();
	                                }
	                            }
	                        }
	                    }

	                    //iframe cleanup appears to randomly cause the download to fail
	                    //not doing it seems better than failure...
	                    //if ($iframe) {
	                    //    $iframe.remove();
	                    //}

	                }, 0);
	            }


	            function htmlSpecialCharsEntityEncode(str) {
	                return str.replace(htmlSpecialCharsRegEx, function(match) {
	                    return '&' + htmlSpecialCharsPlaceHolders[match];
	                });
	            }
	            var promise = deferred.promise();
	            promise.abort = function() {
	                cleanUp();
	                $iframe.remove();
	            };
	            return promise;
	        }
	    });
	})(jQuery);

	if(typeof module != 'undefined' && typeof module.exports != 'undefined'){
	    module.exports = $ = jQuery; 
	}




/***/ },

/***/ 207:
/***/ function(module, exports) {

	
	;(function (factory) {
	  "use strict";
	  if(typeof module != 'undefined' && typeof module.exports != 'undefined') {
	    module.exports = factory();
	  }else{
	    window['Uploader'] = factory();
	  }
	})(function(){

	  var iframeCount = 0;

	  function Uploader(options) {
	    if (!(this instanceof Uploader)) {
	      return new Uploader(options);
	    }
	    if (isString(options)) {
	      options = {trigger: options};
	    }

	    var settings = {
	      trigger: null,
	      name: null,
	      action: null,
	      data: null,
	      accept: null,
	      change: null,
	      error: null,
	      multiple: true,
	      success: null
	    };
	    if (options) {
	      $.extend(settings, options);
	    }
	    var $trigger = $(settings.trigger);

	    settings.action = settings.action || $trigger.data('action') || '/upload';
	    settings.name = settings.name || $trigger.attr('name') || $trigger.data('name') || 'file';
	    settings.data = settings.data || parse($trigger.data('data'));
	    settings.accept = settings.accept || $trigger.data('accept');
	    settings.success = settings.success || $trigger.data('success');
	    this.settings = settings;

	    this.setup();
	    this.bind();
	  }

	  // initialize
	  // create input, form, iframe
	  Uploader.prototype.setup = function() {
	    this.form = $(
	      '<form method="post" enctype="multipart/form-data"'
	      + 'target="" action="' + this.settings.action + '" />'
	    );

	    this.iframe = newIframe();
	    this.form.attr('target', this.iframe.attr('name'));

	    var data = this.settings.data;
	    this.form.append(createInputs(data));
	    if (window.FormData) {
	      this.form.append(createInputs({'_uploader_': 'formdata'}));
	    } else {
	      this.form.append(createInputs({'_uploader_': 'iframe'}));
	    }

	    var input = document.createElement('input');
	    input.type = 'file';
	    input.name = this.settings.name;
	    if (this.settings.accept) {
	      input.accept = this.settings.accept;
	    }
	    if (this.settings.multiple) {
	      input.multiple = true;
	      input.setAttribute('multiple', 'multiple');
	    }
	    this.input = $(input);

	    var $trigger = $(this.settings.trigger);
	    this.input.attr('hidefocus', true).css({
	      position: 'absolute',
	      top: 0,
	      right: 0,
	      opacity: 0,
	      outline: 0,
	      cursor: 'pointer',
	      height: $trigger.outerHeight(),
	      fontSize: Math.max(64, $trigger.outerHeight() * 5)
	    });
	    this.form.append(this.input);
	    this.form.css({
	      position: 'absolute',
	      top: $trigger.offset().top,
	      left: $trigger.offset().left,
	      overflow: 'hidden',
	      width: $trigger.outerWidth(),
	      height: $trigger.outerHeight(),
	      zIndex: findzIndex($trigger) + 10
	    }).appendTo('body');
	    return this;
	  };

	  // bind events
	  Uploader.prototype.bind = function() {
	    var self = this;
	    var $trigger = $(self.settings.trigger);
	    $trigger.mouseenter(function() {
	      self.form.css({
	        top: $trigger.offset().top,
	        left: $trigger.offset().left,
	        width: $trigger.outerWidth(),
	        height: $trigger.outerHeight()
	      });
	    });
	    self.bindInput();
	  };

	  Uploader.prototype.bindInput = function() {
	    var self = this;
	    self.input.change(function(e) {
	      // ie9 don't support FileList Object
	      // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
	      self._files = this.files || [{
	        name: e.target.value
	      }];
	      var file = self.input.val();
	      if (self.settings.change) {
	        self.settings.change.call(self, self._files);
	      } else if (file) {
	        return self.submit();
	      }
	    });
	  };

	  // handle submit event
	  // prepare for submiting form
	  Uploader.prototype.submit = function() {
	    var self = this;
	    if (window.FormData && self._files) {
	      // build a FormData
	      var form = new FormData(self.form.get(0));
	      // use FormData to upload
	      form.append(self.settings.name, self._files);

	      var optionXhr;
	      if (self.settings.progress) {
	        // fix the progress target file
	        var files = self._files;
	        optionXhr = function() {
	          var xhr = $.ajaxSettings.xhr();
	          if (xhr.upload) {
	            xhr.upload.addEventListener('progress', function(event) {
	              var percent = 0;
	              var position = event.loaded || event.position; /*event.position is deprecated*/
	              var total = event.total;
	              if (event.lengthComputable) {
	                  percent = Math.ceil(position / total * 100);
	              }
	              self.settings.progress(event, position, total, percent, files);
	            }, false);
	          }
	          return xhr;
	        };
	      }
	      $.ajax({
	        url: self.settings.action,
	        type: 'post',
	        processData: false,
	        contentType: false,
	        data: form,
	        xhr: optionXhr,
	        context: this,
	        success: self.settings.success,
	        error: self.settings.error
	      });
	      return this;
	    } else {
	      // iframe upload
	      self.iframe = newIframe();
	      self.form.attr('target', self.iframe.attr('name'));
	      $('body').append(self.iframe);
	      self.iframe.one('load', function() {
	        // https://github.com/blueimp/jQuery-File-Upload/blob/9.5.6/js/jquery.iframe-transport.js#L102
	        // Fix for IE endless progress bar activity bug
	        // (happens on form submits to iframe targets):
	        $('<iframe src="javascript:false;"></iframe>')
	          .appendTo(self.form)
	          .remove();
	        var response;
	        try {
	          response = $(this).contents().find("body").html();
	        } catch (e) {
	          response = "cross-domain";
	        }
	        $(this).remove();
	        if (!response) {
	          if (self.settings.error) {
	            self.settings.error(self.input.val());
	          }
	        } else {
	          if (self.settings.success) {
	            self.settings.success(response);
	          }
	        }
	      });
	      self.form.submit();
	    }
	    return this;
	  };

	  Uploader.prototype.refreshInput = function() {
	    //replace the input element, or the same file can not to be uploaded
	    var newInput = this.input.clone();
	    this.input.before(newInput);
	    this.input.off('change');
	    this.input.remove();
	    this.input = newInput;
	    this.bindInput();
	  };

	  // handle change event
	  // when value in file input changed
	  Uploader.prototype.change = function(callback) {
	    if (!callback) {
	      return this;
	    }
	    this.settings.change = callback;
	    return this;
	  };

	  // handle when upload success
	  Uploader.prototype.success = function(callback) {
	    var me = this;
	    this.settings.success = function(response) {
	      me.refreshInput();
	      if (callback) {
	        callback(response);
	      }
	    };

	    return this;
	  };

	  // handle when upload success
	  Uploader.prototype.error = function(callback) {
	    var me = this;
	    this.settings.error = function(response) {
	      if (callback) {
	        me.refreshInput();
	        callback(response);
	      }
	    };
	    return this;
	  };

	  // enable
	  Uploader.prototype.enable = function(){
	    this.input.prop('disabled', false);
	    this.input.css('cursor', 'pointer');
	  };

	  // disable
	  Uploader.prototype.disable = function(){
	    this.input.prop('disabled', true);
	    this.input.css('cursor', 'not-allowed');
	  };

	  // Helpers
	  // -------------

	  function isString(val) {
	    return Object.prototype.toString.call(val) === '[object String]';
	  }

	  function createInputs(data) {
	    if (!data) return [];

	    var inputs = [], i;
	    for (var name in data) {
	      i = document.createElement('input');
	      i.type = 'hidden';
	      i.name = name;
	      i.value = data[name];
	      inputs.push(i);
	    }
	    return inputs;
	  }

	  function parse(str) {
	    if (!str) return {};
	    var ret = {};

	    var pairs = str.split('&');
	    var unescape = function(s) {
	      return decodeURIComponent(s.replace(/\+/g, ' '));
	    };

	    for (var i = 0; i < pairs.length; i++) {
	      var pair = pairs[i].split('=');
	      var key = unescape(pair[0]);
	      var val = unescape(pair[1]);
	      ret[key] = val;
	    }

	    return ret;
	  }

	  function findzIndex($node) {
	    var parents = $node.parentsUntil('body');
	    var zIndex = 0;
	    for (var i = 0; i < parents.length; i++) {
	      var item = parents.eq(i);
	      if (item.css('position') !== 'static') {
	        zIndex = parseInt(item.css('zIndex'), 10) || zIndex;
	      }
	    }
	    return zIndex;
	  }

	  function newIframe() {
	    var iframeName = 'iframe-uploader-' + iframeCount;
	    var iframe = $('<iframe name="' + iframeName + '" />').hide();
	    iframeCount += 1;
	    return iframe;
	  }

	  function MultipleUploader(options) {
	    if (!(this instanceof MultipleUploader)) {
	      return new MultipleUploader(options);
	    }

	    if (isString(options)) {
	      options = {trigger: options};
	    }
	    var $trigger = $(options.trigger);

	    var uploaders = [];
	    $trigger.each(function(i, item) {
	      options.trigger = item;
	      uploaders.push(new Uploader(options));
	    });
	    this._uploaders = uploaders;
	  }
	  MultipleUploader.prototype.submit = function() {
	    $.each(this._uploaders, function(i, item) {
	      item.submit();
	    });
	    return this;
	  };
	  MultipleUploader.prototype.change = function(callback) {
	    $.each(this._uploaders, function(i, item) {
	      item.change(callback);
	    });
	    return this;
	  };
	  MultipleUploader.prototype.success = function(callback) {
	    $.each(this._uploaders, function(i, item) {
	      item.success(callback);
	    });
	    return this;
	  };
	  MultipleUploader.prototype.error = function(callback) {
	    $.each(this._uploaders, function(i, item) {
	      item.error(callback);
	    });
	    return this;
	  };
	  MultipleUploader.prototype.enable = function (){
	    $.each(this._uploaders, function (i, item){
	      item.enable();
	    });
	    return this;
	  };
	  MultipleUploader.prototype.disable = function (){
	    $.each(this._uploaders, function (i, item){
	      item.disable();
	    });
	    return this;
	  };
	  MultipleUploader.Uploader = Uploader;
	  return MultipleUploader;
	});


/***/ }

});