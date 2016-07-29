// 获取短信验证码

function MobileCode(option){
    this.option = $.extend({}, MobileCode.defualts, option);
    this.state = true;
    this.timer = null;
    this.button = $(this.option.trigger);
    this.input = $(this.option.input);
    this.init();
}

MobileCode.prototype = {
    init: function(){
        var option = this.option;

        this.bindEvent();

        if(option.auto){
            this.button.trigger('click');
        }
    },
    bindEvent: function(){
        var self = this,
            option = this.option;

        var postData = $.extend({}, option.data),
            propName = option.propName ? option.propName : 'Mobile';

        this.button.on('click', function(){

            var $this = $(this);
            var value = self.input.val();
            var result = {
                validated: false,
                value: value,
                message: ''
            };

            postData[propName] = value;

            if(self.state){
                // 如果正在倒计时，不往下走
                if($this.data('disabled')) return false;

                // 检测前回调
                option.validate && option.validate.call(self, result);

                // 验证手机格式
                // 验证通过
                if(/^0?(13|15|18|14|17)[0-9]{9}$/.test(value)){

                    result.validated = true;
                    result.message = '手机格式正确';

                    // 检测后回调
                    option.validated && option.validated.call(self, result);

                    $this.text('正在获取...').data('disabled', true);

                    $.ajax({
                        type: 'POST',
                        url: option.url,
                        data: postData,
                        success: function(data){

                            // 如果成功，执行倒计时
                            if(data.Succeeded){
                                self.countdown();

                            // 如果失败，重置
                            }else{
                                self.reset();
                            }

                            result.validated = data.Succeeded;
                            result.message = data.Message;

                            option.sended && option.sended.call(self, result);
                        },
                        error: function() {
                            result.validated = false;
                            result.message = '网络请求出错了';
                            self.reset();
                            option.sended && option.sended.call(self, result);
                        }
                    });

                // 验证未通过
                }else{
                    result.message = '手机格式不正确';
                    self.reset();
                    option.validated && option.validated.call(self, result);
                }
            }
        });
    },
    // 可用
    enable: function(){
        this.state = true;
        this.button.text('获取短信验证码')
            .prop('disabled', false)
            .data('disabled', false)
            .removeClass('ui-button-ldisable')
            .addClass('ui-button-lwhite');
    },
    // 禁用
    disable: function(){
        this.state = false;
        this.button.prop('disabled', true)
            .removeClass('ui-button-lwhite')
            .addClass('ui-button-ldisable');        
    },
    countdown: function(time){
        var delay = this.option.delay;
        var count = _time = delay;

        if(typeof time !== 'undefined' && !isNaN(time)){
            count = _time = parseInt(time, 10);
        }

        this.timer = setInterval(function(){

            _time -= 1;

            // 倒计时结束
            if(_time < 0){
                this.reset();

            // 倒计时中
            }else{
                this.button.text('重新获取(' + _time + ')');
                this.disable();
            }
        }.bind(this), 1000);
    },
    // 重置
    reset: function(){
        clearInterval(this.timer);
        this.enable();
    },
    constructor: MobileCode
};

MobileCode.defualts = {
    input: '', // 输入框(必须)
    trigger: '', // 触发发送短信的按钮
    delay: 120, // 时间间隔(倒计时)
    auto: false, // 页面加载后自动发送短信请求
    url: '',
    data: {}, // ajax需传的数据
    propName: '', // 用来替换data中Mobile属性，有时需要传给后端的属性不一定叫`Mobile`
    validate: undefined, // 手机格式检验前
    validated: undefined, // 手机格式检验后
    sended: undefined // ajax回调
};

module.exports = MobileCode;