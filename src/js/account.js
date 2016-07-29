/**
 * 会员中心公共部分 
 */
var ConfirmBox = require('components/confirmbox/index');
var Selection = require('modules/selection');
var templatable = require('extend/templatable');
var formPaginger = require('modules/formpaginger');
var loading = require('modules/loading/index');

// 侧边折叠菜单
require('modules/membernav')();

var Validator = require('components/validator/index');
var MobileCode = require('modules/mobilecode');
var AjaxUpload = require('plugins/ajaxfileupload');

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

// 添加密码规则
Validator.addRule('password', /^[a-zA-Z0-9]{6,20}$/, '{{display}}由6-20个字母(区分大小写)或数字组成');

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
        loading.hide();
        alert('服务器繁忙，请重试');
    });
}

var AccountValidator = Validator.extend({
    attrs: {
        showMessage: function(message, element){
            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
            
            this.getExplain(element)
                .html(message);

            this.getItem(element).addClass(this.get('itemErrorClass'));
        }
    }
});

if(typeof resultMessage !== 'undefined' && resultMessage.length){
    showMessage(resultMessage, true);
}

var account = {
	baseinfo: function(){
		// 基本信息表单验证
		var validator = new AccountValidator({
			element: '#J_form_account',
			failSilently: true,
            onFormValidated: function(err, results, form) {
                if(!err){
                    loading.show();
                }
            }                
		});

		validator
			// 真实姓名
			.addItem({
				element: '#username',
				required: true,
				rule: 'minlength{"min":2} maxlength{"max":16}',
				display: '真实姓名'
			})
            // 经营地址
            .addItem({
                element: '#operate_address',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":80}',
                display: '经营地址'
            });

        $('.ui-upload-thumb').each(function(){
            var $this = $(this);
            var src = $this.find('.photo').attr('src');

            if(src.indexOf('blank.gif') < 0){
                $this.addClass('uploaded');
            }else{
                $this.append('<div class="ui-loading"></div>');
            }
        });

        // 上传
        function createUploader(triggerId){

            var $target = $('#' + triggerId);

            var option = {
                runtimes: 'html5,flash,html4',    //上传模式,依次退化
                browse_button: triggerId,       //上传选择的点选按钮，**必需**
                uptoken_url: '/Passport/GetUpToken',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                // uptoken : '', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
                // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
                domain: PPG.IMAGESERVER,   //bucket 域名，下载资源时用到，**必需**
                get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
                // container: 'J_upload_wrap',           //上传区域DOM ID，默认是browser_button的父元素，
                max_file_size: '100mb',           //最大文件体积限制
                // flash_swf_url: 'http://120.76.41.193:8001/dist/js/plugins/qiniu/plupload/Moxie.swf',  //引入flash,相对路径
                flash_swf_url: '/Resource/Moxie.swf',
                max_retries: 3,                   //上传失败最大重试次数
                // dragdrop: true,                   //开启可拖曳上传
                // drop_element: 'J_upload_wrap',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
                chunk_size: '4mb',                //分块上传时，每片的体积
                auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                multi_selection: false, // 是否允许多选
                // log_level: 5, 调试信息
                filters: {
                    max_file_size: '1mb',
                    mime_types: [{
                        title: "Image files ",
                        extensions: "jpg,gif,png,bmp "
                    }]
                },
                init: {
                    FilesAdded: function(uploader, files) {
                        // 文件添加进队列后,处理相关的事情
                        $(uploader.settings.browse_button)
                            .parent('.ui-upload-thumb')
                            .addClass('uploading');
                    },
                    BeforeUpload: function(uploader, file) {
                           // 每个文件上传前,处理相关的事情 
                    }, 
                    UploadProgress: function(uploader, file) {
                           // 每个文件上传时,处理相关的事情
                    },
                    FileUploaded: function(uploader, file, info) {
                        var infos = JSON.parse(info),
                            domain = uploader.getOption('domain');
                        
                       // 每个文件上传成功后,处理相关的事情
                       // 其中 info 是文件上传成功后，服务端返回的json
                        var _button = $(uploader.settings.browse_button),
                            image = domain + infos.key +'-W300H300',
                            key = infos.key;

                        // 添加图片信息
                        _button.parent('.ui-upload-thumb')
                            .removeClass('uploading')
                            .addClass('uploaded');

                        // 更改图片路径
                        _button.siblings('img.photo').attr('src', image);

                        // 保存图片路径
                        _button.find('input[type="hidden"]').val(key);

                        switch(_button[0].id){
                            case 'J_picker_front':
                                validator.query('#cardfront').execute();                                
                                break;
                            case 'J_picker_back':
                                validator.query('#cardback').execute();                                
                                break;
                            case 'J_picker_license':
                                validator.query('#license').execute();                                
                                break;        
                        }
                    },
                    Error: function(uploader, file, errTip) {
                       //上传出错时,处理相关的事情
                       var re = /png|jpg|gif|bmp/gi;
                        if (!re.test(file.name)) {
                            showMessage('请上传图片格式文件!', true);
                        }else{
                            showMessage(errTip, true);
                        }
                    },
                    UploadComplete: function() {
                        // console.log('UploadComplete')
                        // console.log(arguments)
                        //队列文件处理完毕后,处理相关的事情
                    }
                }
            };
            
            var Qiniu = new QiniuJsSDK(),
                uploader = Qiniu.uploader(option);

            $target.data('upload', true);
        }

        // 创建上传项
        ['J_picker_website','J_picker_shop'].forEach(function(item){
            createUploader(item);
        });
	},
	mobChange: function(){
		// 手机号码修改表单验证
		var validator = new AccountValidator({
			element: '#J_form_mobile_edit',
			failSilently: true,
            onFormValidated: function(err, results, form) {
                if(!err){
                    loading.show();
                }
            }                
		});

        var sendMobileBtn = $('#J_send'),
            getMobileCode;

		validator
			// 手机号码
			.addItem({
				element: '#mobile',
				required: true,
				rule: 'mobileAndAsync',
				display: '手机号码',
                onItemValidated: function(err){
                    getMobileCode.state = err ? false : true;
                }
			})
            // 短信验证码
            .addItem({
                element: '#code',
                required: true,
                rule: 'mobilecode',
                display: '短信验证码'
            });

        // 发送验证码
        getMobileCode = new MobileCode({
            input: '#mobile',
            trigger: '#J_send',
            auto: false,
            propName: 'MobileNo',
            url: '/Passport/SendVerifyCode',
            validated: function(data){
                if(!data.value){
                    validator.query('#mobile').execute();
                }
            },
            sended: function(data){
                // console.log(data)
                if(!data.validated && data.message.length){
                    showMessage(data.message, true);
                }
            }
        });
	},
	pswEdit: function(){
		// 密码修改表单验证
		var validator = new AccountValidator({
			element: '#J_form_password_edit',
			failSilently: true,
            onFormValidated: function(err, results, form) {
                if(!err){
                    loading.show();
                }
            }                
		});

		validator
			// 现用密码
			.addItem({
				element: '#psw_now',
				required: true,
				rule: '',
				display: '现用密码'
			})
            // 新密码
            .addItem({
                element: '#psw_new',
                required: true,
                rule: 'password',
                display: '新密码'
            })
            // 确认新密码
            .addItem({
                element: '#psw_now_confirm',
                required: true,
                rule: 'confirmation{target: "#psw_new"}',
                display: '密码',
                errormessageRequired: '请再重复输入一遍密码，不能留空。'
            });
	},
    apiIndex: function(){
        // 取消申请
        $('#btnCancel').click(function(){

            var deleteId = $(this).val();
            
            ConfirmBox.confirm('你确定要审核当前项吗?', '取消申请：', function(){
               
                ajax('/ApiConfig/CancelApiConfig', {
                    id: deleteId, 
                    AjaxRequest: 'true'
                }, function(res){
                    showMessage(res.Message, true, function(){
                        if(res.Succeeded){
                            window.location.reload();
                        }
                    });
                });
            });
        });
    },
    apiApply: function(){
        // API申请表单验证
        var validator = new AccountValidator({
            element: '#J_form_api',
            failSilently: true,
            onFormValidated: function(err, results, form) {
                if(!err){
                    loading.show();
                }
            }                
        });

        validator
            // 真实姓名
            .addItem({
                element: '#username',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":16}',
                display: '维护姓名'
            })
            // 邮箱
            .addItem({
                element: '#user_email',
                required: true,
                rule: 'email',
                display: '邮箱'
            })
            // 网站名称
            .addItem({
                element: '#site_name',
                required: true,
                rule: '',
                display: '网站名称'
            })
            // 网站URL
            .addItem({
                element: '#site_url',
                required: true,
                rule: 'url',
                display: '网站URL'
            });          
    }
};

window.account = account;