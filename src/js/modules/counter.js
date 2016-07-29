function Counter(wrap, option){
    this.wrap = wrap;
    this.option = $.extend({}, Counter.defaults, option);
    this.init();
}

Counter.prototype = {
    init: function(){
        var option = this.option;
        var tip = this.wrap.data('tips'); // tips内容

        var datamax = this.wrap.data('max'),
            datamin = this.wrap.data('min');

        this.min = datamin !== undefined ? datamin : option.min;
        this.max = datamax !== undefined ? datamax : option.max;

        if(undefined !== this.max && this.min > this.max){
            return;
        }

        ['plus', 'minus', 'count'].forEach(function(key){
            this[key] = this.wrap.find(option[key]);
        }.bind(this));

        // 判断显示数量的元素是否input，是的话取value，否则取text
        var tagName = this.count.get(0).tagName,
            attr = 'val';

        if(tagName === 'INPUT'){
            this.input = this.count;
        }else{

            var input = this.count.find('input[type="text"]');
            if(input[0]){
                this.input = input;
            }else{
                this.input = this.count;
                attr = 'text';
            }
        }

        this.setCount = function(n){ this.input[attr](n); }.bind(this);
        this.getCount = function(){ return this.input[attr](); }.bind(this);

        var initVal = this.getCount();
        if(initVal == this.min*1){
            this.disable('minus');
        }else if(undefined != this.max && initVal >= this.max){
            this.disable('plus');
        }


        // tips
        this.poper = $('<div class="tips" style="display:none;">'+
                        '<div class="tips-inner"><span class="tips-arrow"></span><div class="tips-content"></div>'+
                        '</div></div>');
        this.poper.appendTo(this.wrap);

        // 如果已经设置了tip，则显示
        if(undefined !== tip && tip.trim().length){
            this.tips(tip, true);
        }

        // 校验方法
        this.validate = (function(){
            var self = this;
            var min = this.min * 1,
                max = this.max;

            var ret = {};

            [{
                type: 'notEmpty',
                rule: function(value){ return value.trim().length > 0; }
            },
            {
                type: 'isNumber',
                rule: function(value){ return !isNaN(value); }
            },{
                type: 'max',
                rule: function(value){ 
                    if(max == undefined){
                        return true;
                    }else{
                        return value <= max * 1;    
                    }
                }
            },{
                type: 'min',
                rule: function(value){ return value >= min; }
            }
            ].forEach(function(item){
                ret[item.type] = function(count, success, error){
                    var flag = item.rule(count);
                    if(flag){
                        success && success.call(self, count);
                    }else{
                        error && error.call(self, count);
                    }
                    return flag;
                };
            });
            return ret;
        }).call(this);

        // 事件绑定
        this.bindEvent();
    },
    bindEvent: function(){
        var self = this;
        var option = this.option,
            min = this.min * 1,
            max = this.max,
            validate = this.validate,
            setCount = this.setCount,
            getCount = this.getCount,
            hasMax = undefined !== max;

        var callbackData = {
            type: '',
            count: '',
            errorCount: ''
        };

        var successCallback = function(value, data){
            setCount(value);
            option.onChange && option.onChange.call(self, data);
        };

        var errorCallback = function(value, data){
            setCount(value);
            option.onError && option.onError.call(self, data);
        };

        this.wrap.on('click', option.plus, function(){
            var val = self.getCount() * 1,
                data = $.extend({}, callbackData);

            var nextCount = val + 1;

            data.type = 'plus';

            validate.max(nextCount, function(v){
                if(hasMax && nextCount == max){
                    self.disable('plus');
                }
                self.enable('minus');

                data.count = v;
                successCallback(v, data);

            }, function(v){
                self.disable('plus');
                data.count = val;
                data.errorCount = v;                
                errorCallback(val, data); 
            });
        });

        this.wrap.on('click', option.minus, function(){

            var val = self.getCount() * 1,
                data = $.extend({}, callbackData);

            var nextCount = val - 1;

            data.type = 'minus';

            if(hasMax && val > max){
                setCount(max);

                data.count = max;
                successCallback(max, data);
            }else{
                validate.min(nextCount, function(v){
                    if(nextCount == min){
                        self.disable('minus');
                    }                   
                    self.enable('plus');

                    data.count = v;
                    successCallback(v, data);

                }, function(v){
                    data.count = val;
                    data.errorCount = v;                
                    errorCallback(val, data);
                });                     
            }
        });
        
        if(this.input.get(0).tagName === 'INPUT'){
            // 保持原键盘左右功能
            this.input.on({
                keyup: function(e){
                    var $this = $(this),
                        val = $this.val(),
                        data = $.extend({}, callbackData);

                    var kcode = e.keyCode;

                    data.type = 'keyup';

                    if(kcode !== 37 && kcode !== 39){
                        if(validate.notEmpty(val)){
                            var valParse = parseInt(val, 10);

                            if(isNaN(valParse) || valParse === 0){
                                $this.val(min);
                                self.disable('minus');
                            }else{
                                $this.val(valParse);
                                data.count = valParse;
                                validate.max(valParse, function(v){
                                    if(hasMax && valParse == max){
                                        self.disable('plus');
                                    }                               
                                    self.enable('minus');
                                    option.onChange && option.onChange.call(self, data);
                                }, function(v){
                                    self.disable('plus');
                                    data.errorCount = v;
                                    option.onError && option.onError.call(self, data);
                                });
                            }
                            
                        }else{
                            self.enable('plus');
                            self.enable('minus');
                        }                       
                    }
                },
                blur: function(){
                    var $this = $(this);
                        val = $this.val();

                    if(!validate.notEmpty(val)){
                        $this.val(min);
                        data = $.extend({}, callbackData);
                        data.type = 'blur';
                        data.count = min;
                        option.onChange && option.onChange.call(self, data);
                        self.disable('minus');
                    }
                }
            });
        }
    },
    tips: function(message, hold){
        var poper = this.poper,
            elem = poper.find('.tips-content');

        function show(){
            elem.html(message);
            poper.show();
        }
        function hide(){
            poper.hide();
            elem.html('');
        }

        if(typeof message === 'string' && message.trim().length){
            
            this.poptimer && clearTimeout(this.poptimer);
            show();

            if(!hold){
                this.poptimer = setTimeout(function(){
                    hide();
                }, 2000);
            }
        }else{
            hide();
        }
    },
    enable: function(type){
        if(type === 'plus'){
            enable(this.plus);
        }else if(type === 'minus'){
            enable(this.minus);
        }
    },
    disable: function(type){
        if(type === 'plus'){
            disable(this.plus);
        }else if(type === 'minus'){
            disable(this.minus);
        }
    },
    constructor: Counter
};

function enable(elem){
    elem.removeClass('disable');
}

function disable(elem){
    elem.addClass('disable');
}

Counter.defaults = {
    min: 1,
    max: undefined,
    count: '.m-counter-count',
    minus: '.m-counter-minus',
    plus: '.m-counter-plus',
    onChange: function(){},
    onError: function(){}
};

$.fn.counter = function(option){
    return this.each(function(){
        var $this = $(this);
        if(undefined === $this.data('counter')){
            $this.data('counter', new Counter($this, option));
        }
    });
};

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Counter;
}