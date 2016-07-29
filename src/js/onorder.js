var Validator = require('components/validator/index');
var Distpicker = require('modules/distpicker/index');
var loading = require('modules/loading/index');
var Confirmbox = require('components/confirmbox/index');

// 添加身份证号码规则
Validator.addRule('idno', PPG.reg.ID, '身份证号码不正确');

// 真实姓名规则，不能包含先生小姐等字眼
Validator.addRule('truename', /(?!.*先生.*|.*小姐.*|.*男士.*|.*女士.*|.*太太.*)^([\u4E00-\u9FA5]|[\uFE30-\uFFA0]|[a-zA-Z\.\·]){2,26}$/, '请输入真实姓名');

function showMessage(message, hold){
    Confirmbox.show(message, null, {
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

var OrderValidator = Validator.extend({
    attrs: {
        showMessage: function(message, element){
            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
            
            this.getExplain(element)
                .html(message);

            this.getItem(element).addClass(this.get('itemErrorClass'));
        }
    }
});

var validator;

var cityselectResult = $('#J_cityselect_result'),
    provinceEl = $('#J_cityselect_province'),
    cityEl = $('#J_cityselect_city'),
    areaEl = $('#J_cityselect_area'),
    postcodeEl = $('#user_postcode'),
    remoteAreaAmount = $('#J_remoteareaamount'),
    packageCount = $('input[name="packageCount"]').val() * 1,
    totalamountEl = $('#J_totalamount'),
    orderForm = $('#J_form_order'),
    totalamount = totalamountEl.text()*1;

var onorder = {
	init: function(){
        var self = this;

        orderForm.off('submit');

		validator = new OrderValidator({
            element: '#J_form_order',
            autoSubmit: false,
            failSilently: true,
            onFormValidated: function(err){
                if(!err){
                    self.ajaxSubmit();
                }
            }
		});

		this.bindEvent();
	},
	bindEvent: function(){
		// 验证项
		validator
			// 姓名
			.addItem({
                element: '#truename',
                required: true,
                rule: 'truename',
                display: '姓名'
			})
            // 身份证号码
            .addItem({
                element: '#user_id',
                required: true,
                rule: 'idno',
                display: '身份证号码'
            })
        	// 手机号码
        	.addItem({
                element: '#user_phone',
                required: true,
                rule: 'mobile',
                display: '手机号码'                
            })
            // 所在地区
            .addItem({
                element: '#J_cityselect_result',
                required: true,
                rule: '',
                errormessageRequired: '请选择省市区'
            })
            // 地址
            .addItem({
                element: '#user_address',
                required: true,
                rule: 'minlength{"min":2} maxlength{"max":80}',
                display: '详细地址'
            });

        // 地区选择
        $('#J_cityselect').distpicker({
            onSelect: function(data){
                var names = data.names,
                    province = names.province,
                    city = names.city,
                    area = names.area;

                if(!province.length || !city.length || !area.length){
                    cityselectResult.val('');
                }

                provinceEl.val(province);
                cityEl.val(city);
                areaEl.val(area);

            },
            onComplete: function(data){
                cityselectResult.val('1');
                validator.query('#J_cityselect_result').execute();
                postcodeEl.val(data.postCode);
                // $.ajax({
                //     'url': '/Cart/GetRemoteAreaAmount',
                //     type: 'POST',
                //     dataType: 'json',
                //     data: {provinceName: data.names.province},
                //     success: function(res){
                //         // console.log(res)
                //         if(res.Succeeded && res.Result){
                //             var v = res.Result * packageCount;
                //             remoteAreaAmount.text(v.toFixed(2));
                //             totalamountEl.text((totalamount + v).toFixed(2));
                //         }else{
                //             remoteAreaAmount.text('0.00');
                //             totalamountEl.text(totalamount.toFixed(2));
                //         }
                //     }
                // });
            }
        });
	},
    ajax: function(url, data, successCallback, type){
        loading.show();

        $.ajax({
            type: type ? type : 'POST',
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
    },
    ajaxSubmit: function(){
        var params = orderForm.serialize().split('&'),
            data = {
                Address: {}
            };

        for(var i = 0; i < params.length; i++){
            var item = params[i].split('=');
            data.Address[item[0]] = decodeURIComponent(item[1]);
        }
        
        data.ExternalOrderCode = data.Address.ExternalOrderCode;
        data.CheckedItemIdList = data.Address.CheckedItemIdList.split(',');
        data.Remark = data.Address.Remark;

        ['CheckedItemIdList', 'ExternalOrderCode', 'Remark'].forEach(function(key){
            delete data.Address[key];
        });

        this.ajax('/Cart/SubmitToSuccess', data, function(res){
            // console.log(res)
            if(res.Succeeded){
                window.location.href = '/Pay?orderCode=' + res.Result + '&orderType=1';
            }else{
                showMessage('服务器繁忙，请稍后再试');
            }
        });
    }
};

$(function(){
	onorder.init();
});