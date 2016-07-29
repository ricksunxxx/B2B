var Validator = require('components/validator/index');
var MobileCode = require('modules/mobilecode');
var ConfirmBox = require('components/confirmbox/index');
var loading = require('modules/loading/index');

// 异步验证手机号是否已被注册
Validator.addRule('asyncmobile', function(option, commit){
    var val = option.element.val();
    if(PPG.reg.mobile.test(val)){
        $.post('/Passport/VerifyAccount', {strAccount: val}, function(res){
            if(res.Succeeded){
                commit(false, '该用手机号码已被注册');
            }else{
                commit(true, '');
            }
        });
    }
});
Validator.addRule('mobileAndAsync', Validator.getRule('mobile').and('asyncmobile'), '请输入正确的手机号码');

// 短信验证码规则
Validator.addRule('mobilecode', PPG.reg.mobilecode, '{{display}}6位数字');

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

var mobileInput = $('#mobile_input'),
    codeInput = $('#mobile_code'),
    regetBtn = $('#J_reget'),
	getMobileCode;

var BindMoblieValidator = Validator.extend({
    attrs: {
        showMessage: function(message, element){
            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
            
            this.getExplain(element)
                .html(message);

            this.getItem(element).addClass(this.get('itemErrorClass'));
        }
    }
});

var skipUrl = $('#J_skip').attr('href'),
	postUrl = IsSupplier ? '/Member/BindMobile' : '/Home/BindMobile';

var validator = new BindMoblieValidator({
    element: '#J_bmob_form',
    failSilently: true,
    autoSubmit: false,
    onFormValidated: function(err, results, form) {
        if(!err){
            $.ajax({
                url: postUrl,
                type: 'POST',
                dataType: 'json',
                data: {
                    NewMobile: mobileInput.val(),
                    VerifyCode: codeInput.val()
                },
                beforeSend: function(){loading.show()},
                complete: function(){loading.hide()},
                success: function(data){
                    if(data.Succeeded){
                        // loading.show();
                        showMessage('绑定成功', false, function(){
                        	window.location.href = skipUrl;
                        });
                    }else{
                        showMessage(data.Message, true);
                    }
                },
                error: function(){showMessage('服务器繁忙，请重试', true)}
            });                        
        }
    }        
});

var fns = {
	init: function(){
        validator
            // 手机号码
            .addItem({
                element: '#J_mobile',
                required: true,
                rule: 'mobileAndAsync',
                display: '手机号码',
                onItemValidated: function(error, message, eleme) {
                    getMobileCode.state = error ? false : true;
                }
            })
            .addItem({
                element: '#mobile_code',
                required: true,
                rule: 'mobilecode',
                display: '短信验证码'
            });

        this.bindEvent();
	},
	bindEvent: function(){
		mobileInput.on('focus', function(){
            getMobileCode.state = false;
        });

        // 发送验证码
        getMobileCode = new MobileCode({
            input: '#mobile_input',
            trigger: '#J_reget',
            propName: 'MobileNo',
            auto: true,
            url: '/Passport/SendVerifyCode',
            sended: function(data){
                // console.log(data)
                if(!data.validated && data.message.length){
                    showMessage(data.message, true);
                }
            }
        });
	}
};

$(function(){
	fns.init();
});