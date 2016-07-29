var Validator = require('components/validator/index');
var MobileCode = require('modules/mobilecode');
var getValidCode = require('modules/validcode');
var ConfirmBox = require('components/confirmbox/index');
var loading = require('modules/loading/index');

// 异步验证用户名是否已被注册
Validator.addRule('asyncuname', function(option, commit){
    var val = option.element.val();
    if(PPG.reg.accout.test(val)){
        $.post('/Passport/VerifyAccount', {strAccount: val}, function(res){
            if(res.Succeeded){
                commit(false, '该用户名已被注册');
            }else{
                commit(true, '');
            }
        });
    }
});
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

// 添加用户名规则
var usernameExplain = '{{display}}以英文字母开头，4-20个字母或数字、下划线，不能用中文';
Validator.addRule('username', PPG.reg.accout, usernameExplain);
Validator.addRule('nameAndAsync', Validator.getRule('username').and('asyncuname'), usernameExplain);


// 添加密码规则
Validator.addRule('password', /^[a-zA-Z0-9]{6,20}$/, '{{display}}由6-20个字母(区分大小写)或数字组成');

// 添加身份证号码规则
Validator.addRule('idno', PPG.reg.ID, '身份证号码不正确');

// 验证码
Validator.addRule('code', PPG.reg.validcode, '{{display}}为4位数字');

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

if(typeof resultMessage !== 'undefined' && resultMessage.length){
    showMessage(resultMessage, true);
}

var RegisterValidator = Validator.extend({
    attrs: {
        showMessage: function(message, element){
            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
            
            this.getExplain(element)
                .html(message);

            this.getItem(element).addClass(this.get('itemErrorClass'));
        }
    }
});

var register = {
    step1: function() {

        // 滚动到指定位置
        function scroll2there(target){
            $('html,body').animate({
                scrollTop: target.offset().top - 50
            }, 100);
        }

        /**
         * 验证 
         */
        var validator = new RegisterValidator({
            element: '#J_register_form_step1',
            onFormValidated: function(err, results, form) {
                if(!err){
                    loading.show();
                }else{
                    for(var i = 0; i < results.length; i++){
                        var item = results[i],
                            elem = item[2],
                            elemId = elem.get(0).id;

                        if(item[0]){
                            scroll2there(elem.closest('.ui-form-item'));
                            break;
                        }
                    }
                }
            },
            failSilently: true
        });

        validator
            // 用户名
            .addItem({
                element: '#username',
                required: true,
                rule: 'nameAndAsync',
                display: '用户名',
                onItemValidated: function(){}
            })
            // 密码
            .addItem({
                element: '#user_password',
                required: true,
                rule: 'password',
                display: '密码'
            })
            // 确认密码
            .addItem({
                element: '#user_password_confirm',
                required: true,
                rule: 'confirmation{target: "#user_password"}',
                errormessageRequired: '请再重复输入一遍密码，不能留空。'
            })
            // 真实姓名
            .addItem({
                element: '#truename',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":16}',
                display: '真实姓名'
            })
            // 手机号码
            .addItem({
                element: '#user_phone',
                required: true,
                rule: 'mobileAndAsync',
                display: '手机号码'
            })
            // 邮箱
            .addItem({
                element: '#user_email',
                required: true,
                rule: 'email',
                display: '邮箱'
            })
            // 经营地址
            .addItem({
                element: '#operate_address',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":80}',
                display: '经营地址'
            })
            // 验证码
            .addItem({
                element: '#code',
                required: true,
                rule: 'code',
                display: '验证码'
            });   

        var personValidItems = [
            // 个人姓名
            {
                element: '#user_name',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":16}',
                display: '姓名'
            },
            // 身份证号码
            {
                element: '#user_id',
                required: true,
                rule: 'idno',
                display: '身份证号码'
            },
            // 身份证正面
            {
                element: '#cardfront',
                required: true,
                rule: '',
                display: '身份证正面',
                errormessageRequired: '请上传身份正面',
                showMessage: function(message, element){
                    element
                        .closest('div.left')
                        .find('span.ui-form-explain')
                        .addClass('failed')
                        .html('<i class="iconfont">&#xe62e;</i>' + message);
                },
                hideMessage: function(message, element){
                    element
                        .closest('div.left')
                        .find('span.ui-form-explain')
                        .removeClass('failed')
                        .html('<span class="ui-form-explain">身份证正面</span>');    
                }               
            },
            // 身份证背面
            {
                element: '#cardback',
                required: true,
                rule: '',
                display: '身份证背面',
                errormessageRequired: '请上传身份证背面',
                showMessage: function(message, element){
                    element
                        .closest('div.right')
                        .find('span.ui-form-explain')
                        .addClass('failed')
                        .html('<i class="iconfont">&#xe62e;</i>' + message);
                },
                hideMessage: function(message, element){
                    element
                        .closest('div.right')
                        .find('span.ui-form-explain')
                        .removeClass('failed')
                        .html('<span class="ui-form-explain">身份证背面</span>');   
                }
            }
        ];

        var companyValidItems = [
            // 企业名称
            {
                element: '#company_name',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":16}',
                display: '企业名称'
            },
            // 营业执照
            {
                element: '#license',
                required: true,
                rule: '',
                display: '营业执照'
            }        
        ];

        var groupItems = [
            '#user_name',
            '#user_id',
            '#company_name',
            '#license',
            '#cardfront',
            '#cardback'
        ];

        function validGroup(type){

            groupItems.forEach(function(item){
                validator.removeItem(item);
            });

            var validItem = {
                '0': companyValidItems,
                '1': personValidItems
            }[type];

            validItem.forEach(function(item){
                validator.addItem(item);
            });
        }

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
        [// 'J_picker_front',
        // 'J_picker_back',
        'J_picker_license',
        'J_picker_website',
        'J_picker_shop'
        ].forEach(function(item){
            createUploader(item);
        });

        // 同意协议
        var submitBtn = $('#J_submitbtn'),
            ruleCheckbox = $('#rule');
        
        ruleCheckbox.on('change', function(e) {

            // 勾选了同意协议后，提交按钮才高亮
            if ($(this).is(':checked')) {
                submitBtn
                    .prop('disabled', false)
                    .removeClass('ui-button-ldisable')
                    .addClass('ui-button-lorange');
            } else {
                submitBtn
                    .prop('disabled', true)
                    .removeClass('ui-button-lorange')
                    .addClass('ui-button-ldisable');
            }
        });

        // 经营主体的企业与个人切换
        var operateGroupPanel = $('#operate_group_panel'),
            handle = $('#operate_group_handle'),
            currentIndex = handle.find('input[type="radio"]:checked').data('index');

        validGroup(currentIndex);

        handle.find('input[type="radio"]').on('change', function(){
            var index = $(this).data('index'),
                panel = operateGroupPanel.find('.panel').eq(index);

            panel.siblings().hide();
            panel.show();

            validGroup(index);

            setTimeout(function(){
                panel.find('div.picker').each(function(){
                    if(!$(this).data('upload')){
                        createUploader(this.id);
                    }
                });
            }, 50);
        });

        // 图片验证码
        getValidCode('#J_code_img');

        // 检测是否已上传，并为每个上传添加loading
        $('.ui-upload-thumb').each(function(){
            var $this = $(this);
            var src = $this.find('.photo').attr('src');

            if(src.indexOf('blank.gif') < 0){
                $this.addClass('uploaded');
            }
            
            $this.append('<div class="ui-loading"></div>');
        });

        if(typeof sellerType !== 'undefined' && sellerType.length){
            $('input[name="SellerType"]').each(function(){
                var $this = $(this);

                if($this.data('index') == sellerType) {
                    $this.trigger('click').prop('checked', true);
                    return false;
                }
            });
        }
    },
    step2: function() {
        // console.log('register step 2');
        var textDisplay = $('#J_display'),
            eidtDisplay = $('#J_input_wrap'),
            mobileText = $('#J_mobile_text'),
            mobileInput = $('#J_mobile'),
            codeInput = $('#mobile_code'),
            regetBtn = $('#J_reget');

        var currentMobile = mobileInput.val();
        var mobileValidated = true,
            getMobileCode;

        var validator = new RegisterValidator({
            element: '#J_register_form_step2',
            failSilently: true,
            autoSubmit: false,
            onFormValidated: function(err, results, form) {
                if(!err){
                    $.ajax({
                        url: '/Passport/BindMobile',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            MobileNo:mobileInput.val(),
                            VerifyCode: codeInput.val()
                        },
                        beforeSend: function(){loading.show()},
                        complete: function(){loading.hide()},
                        success: function(data){
                            if(data.Succeeded){
                                loading.show();
                                window.location.href = '/Passport/RegisterOk';
                            }else{
                                showMessage(data.Message, true);
                            }
                        },
                        error: function(){showMessage('服务器繁忙，请重试', true)}
                    });                        
                }
            }        
        });

        var todo = {
            init: function(){

                validator
                    // 手机号码
                    .addItem({
                        element: '#J_mobile',
                        required: true,
                        rule: 'mobileAndAsync',
                        display: '手机号码',
                        onItemValidated: function(error, message, eleme) {
                            mobileValidated = error ? false : true;
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

                function clearErrorStyle(trigger, self){
                    var item = self ? self : trigger.closest('.ui-form-item');
                    item.removeClass('ui-form-item-error');
                    item.find('.ui-form-explain').empty();
                }

                // 显示编辑界面
                $('#J_change').on('click', function(){
                    todo.showDisplay('edit');
                });

                // 取消
                $('#J_cancel').on('click', function(){
                    todo.showDisplay('text');
                    mobileInput.val(currentMobile);
                    clearErrorStyle($(this));
                    getMobileCode.state = true; 
                });

                // 确认
                $('#J_ok').on('click', function(){
                    // 如果验证为手机格式
                    if(mobileValidated){

                        var v = mobileInput.val();

                        mobileText.text(v);
                        todo.showDisplay('text');
                        currentMobile = v;
                        // 触发校验
                        // validator.query('#J_mobile').execute();
                        getMobileCode.reset();                        
                    }
                });

                mobileInput.on('focus', function(){
                    getMobileCode.state = false;
                });

                // 发送验证码
                getMobileCode = new MobileCode({
                    input: '#J_mobile',
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
            },
            showDisplay: function(type){
                return {
                    text: function(){
                        textDisplay.show();
                        eidtDisplay.hide();
                    },
                    edit: function(){
                        textDisplay.hide();
                        eidtDisplay.show();
                    }
                }[type]();
            }
        };

        todo.init();
    }
};

window.register = register;
