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

// debugger

// if(typeof resultMessage !== 'undefined' && resultMessage.length){
//     showMessage(resultMessage, true);
// }

var account = {
	baseInfo: function(){
        if(typeof resultMessage !== 'undefined' && resultMessage.length){
            showMessage(resultMessage, true);
        }

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
            })
            // 品牌产品
            .addItem({
                element: '#operate_product',
                required: true,
                rule: 'minlength{"min":1} maxlength{"max":300}',
                display: '品牌或产品'
            });

        // 上传
        function createUploader(triggerId){
            var $target = $('#' + triggerId);

            var option = {
                runtimes: 'html5,flash,html4',    //上传模式,依次退化
                browse_button: triggerId,       //上传选择的点选按钮，**必需**
                uptoken_url: '/Member/GetUpToken',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
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
        ['J_picker_logo',
        'J_picker_licensed',
        'J_picker_authen'
        ].forEach(function(item){
            createUploader(item);
        });

        $('.ui-upload-thumb').each(function(){
            var $this = $(this);
            var src = $this.find('.photo').attr('src');

            if(src.indexOf('blank.gif') < 0){
                $this.addClass('uploaded');
            }
            
            $this.append('<div class="ui-loading"></div>');
        });
	},
	mobChange: function(){
        if(typeof resultMessage !== 'undefined' && resultMessage.length){
            showMessage(resultMessage, true);
        }
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
        if(typeof resultMessage !== 'undefined' && resultMessage.length){
            showMessage(resultMessage, true);
        }      
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
    contactEdit: function(){
        if(typeof resultMessage !== 'undefined' && resultMessage.length){
            showMessage(resultMessage, true);
        }      
        // 联系人信息修改表单验证
        var validator = new AccountValidator({
            element: '#J_form_contact_edit',
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
                element: '#truename',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":16}',
                display: '真实姓名'
            })
            // 手机号码
            .addItem({
                element: '#user_phone',
                required: true,
                rule: 'mobile',
                display: '手机号码'                
            })
            // 邮箱
            .addItem({
                element: '#user_email',
                required: true,
                rule: 'email',
                display: '邮箱'
            });
    },
    message: function(){
        var messageWrap = $('#J_member_message'),
            messageList = $('#J_message_list'),
            $messageCount = $('#J_message_count'),
            $unreadNum = $('#J_unread_num'),
            allCount = $messageCount.text() * 1,
            unReadCount = $unreadNum.text() * 1;

        var itemClass = '.member-message-item';

        var checkboxSize = messageList.find('input[type="checkbox"]').size();

        // 是否已无信息
        function checkHasNull(items){
            if(!items.length){
                // messageList.append('<li class="null member-message-item">无相关信息</li>');
                // $('.ui-paging').remove();
                window.location.reload();
            }
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

        var getItemData = function(trigger, _self){
            var item = _self ? _self : trigger.closest('.member-message-item');
            var getData = function(name){
                return item.data(name) ? item.data(name) : '';
            };
            
            return {
                element: item,
                id: getData('id'),
                isReaded: !item.hasClass('unread')
            };
        };

        var removeMessageItem = function(id, items, count, fn){
            
            ajax('/Member/BatchDeleteMessage', {
                messageIds: id
            }, function(res){
                if(res.Succeeded){

                    // 更新信息总数
                    allCount -= count;
                    var m = allCount < 0 ? 0 : allCount;
                    $messageCount.text(m);
                    
                    // 更新未读数
                    if(unReadCount){
                        var n = 0;
                        items.forEach(function(item){
                            var isReadedItem = getItemData(null, item.parent).isReaded;
                            if(!isReadedItem){
                                n += 1;
                            }
                        });
                        unReadCount = n;
                        $unreadNum.text(n);                        
                    }

                    showMessage('删除成功', false, function(){
                        checkHasNull(items); 
                    });

                    fn && fn();
                }
            });
        };

        if(checkboxSize === 0){
            $('#J_checkall').prop('disabled', true);
            $('#J_del_batch').remove();
        }else{
            // 全选·单选·删除·批量删除
            $('#J_member_message').selection({
                selectAllElem: '#J_checkall',
                singleClass: '.checkbox-sub',
                singleParentClass: '.member-message-item',
                singleRemoveClass: '.remove',
                batchRemoveElem: '#J_del_batch',
                async: true,
                onSelect: function(){},
                onSingleRemove: function(data){
                    var that = this,
                        item = data,
                        timestamp = data.timestamp;
                    
                    ConfirmBox.confirm('确定要删除这个商品吗？', '提示：', function(){

                        removeMessageItem(
                            item.parent.data('id'),
                            that.items,
                            1,
                            that.itemRemove(timestamp)
                        );
                    });
                },
                onBatchRemove: function(data){
                    var that = this,
                        selecteds = this.selecteds;
                    
                    if(!selecteds.length) return false;

                    ConfirmBox.confirm('确定要删除所选吗？', '提示：', function(){
                        var ids = [];
                        for(var i = 0; i < selecteds.length; i++){
                            var currentItem = selecteds[i];
                            ids.push(currentItem.parent.data('id'));
                        }
                        
                        removeMessageItem(
                            ids.join(','), 
                            that.items,
                            ids.length,
                            that.batchRemove()
                        );
                    });
                }
            });

            // 展开收起
            $('#J_member_message').delegate('.read,.title', 'click', function(e){
                var $this = $(this),
                    parent = $this.closest('.member-message-item '),
                    panel = $this.siblings('div.content'),
                    openBtn = parent.find('.read'),
                    both = parent.find('.read,.title');

                var toggleStyle = function(type){
                    return {
                        open: function(){
                            openBtn.text('收起');
                            panel.show();
                            both.addClass('active');
                        },
                        close: function(){
                            openBtn.text('展开');
                            panel.hide();
                            both.removeClass('active');
                        }
                    }[type]();
                };

                $this.toggleClass('active');

                if($this.hasClass('active')){
                    var thisData = getItemData($this),
                        item = thisData.element;

                    if(!thisData.isReaded){
                        $.ajax({
                            url: '/Member/ReadMessage', 
                            type: 'POST',
                            dataType: 'json',
                            data: {messageIds: thisData.id}, 
                            success: function(res){
                                
                                if(res.Succeeded){
                                    unReadCount--;

                                    var n = unReadCount < 0 ? 0 : unReadCount;
                                    
                                    item.removeClass('unread');
                                    $unreadNum.text(n);
                                }
                            }
                        });
                    }
                    
                    toggleStyle('open');
                }else{
                    toggleStyle('close');
                }
            });

            // 页码操作
            formPaginger('.ui-paging', '#J_form_message');            
        }

    }
};

window.account = account;