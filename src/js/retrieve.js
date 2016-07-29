/**
 * 找回密码
 */
var Validator = require('components/validator/index');
var MobileCode = require('modules/mobilecode');
var getValidCode = require('modules/validcode');
var ConfirmBox = require('components/confirmbox/index');

// 添加用户名规则
Validator.addRule('username', function(option){
	
	var value = option.element.val(),
		reg = PPG.reg;

	return reg.accout.test(value) || reg.mobile.test(value);

}, '输入用户名或手机');

// 验证码
Validator.addRule('code', PPG.reg.validcode, '{{display}}为4位数字');

// 添加密码规则
Validator.addRule('password', /^[a-zA-Z0-9]{6,20}$/, '{{display}}为6-20个字母(区分大小写)或数字组成');

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

var RetrieveValidator = Validator.extend({
    attrs: {
        showMessage: function(message, element){
            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
            
            this.getExplain(element)
                .html(message);

            this.getItem(element).addClass(this.get('itemErrorClass'));
        }
    }
});

var retrieve = {
	confirm: function(){
		//  创建表单验证
		var validator = new RetrieveValidator({
			element: '#J_form_confirm'
		});

		validator
			// 用户名/手机/邮箱
			.addItem({
				element: '#uname',
				required: true,
				rule: 'username',
				display: '帐号'
			})
			.addItem({
				element: '#code',
				required: true,
				rule: 'code',
				display: '验证码'
			});

		// 图片验证码
		getValidCode('#J_code_img');

		PPG.placeholder('#uname', {
			styles: {
				left: 180,
				top: 7
			}
		});

		if(typeof resultMsg !== 'undefined' && $.trim(resultMsg) !== ''){
			showMessage(resultMsg);
		}
	},
	authentication: function(){
		var sendBtn = $('#J_sendbtn'),
			getMobileCode;

		var validator = new RetrieveValidator({
			element: '#J_form_authentication',
			failSilently: true
		});

		validator.addItem({
			element: '#code',
			required: true,
			rule: '',
			errormessageRequired: '请输入验证码'
		});


        // 发送验证码
        getMobileCode = new MobileCode({
            input: '#J_mobile',
            trigger: '#J_sendbtn',
            propName: 'MobileNo',
            url: '/Passport/SendVerifyCode',
            sended: function(data){
                // console.log(data)
                if(!data.validated && data.message.length){
                    showMessage(data.message, true);
                }
            }
        });

		// 提交后，如果后端校验失败，则弹出失败提示
        if(typeof resultMsg !== 'undefined' && $.trim(resultMsg) !== ''){
        	showMessage(resultMsg);
        }else{
        	// 第一次时主动出发短信发送
        	sendBtn.trigger('click');        	
        }
	},
	reset: function(){
		var validator = new RetrieveValidator({
			element: '#J_form_reset',
			failSilently: true
		});

		validator
			.addItem({
				element: '#password',
				required: true,
				rule: 'password',
				display: '密码'
			})
			.addItem({
				element: '#password_confirm',
				required: true,
                rule: 'confirmation{target: "#password"}',
                errormessageRequired: '请再重复输入一遍密码'
			});

		if(typeof resultMsg !== 'undefined' && $.trim(resultMsg) !== ''){
        	showMessage(resultMsg);
        }
	}
};

window.retrieve = retrieve;

