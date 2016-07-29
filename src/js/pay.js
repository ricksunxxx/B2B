var ConfirmBox = require('components/confirmbox/index');
var Dialog = require('components/dialog/index');
var loading = require('modules/loading/index');

var payTypeSelector = $('#J_pay_type'),
	submitBtn = $('#J_submitbtn'),
	lockBox = $('#J_lock_tip'),
	payGroupEl = $('#J_pay_group'),
	creditLimitEl = $('#creditLimit'),
	payInterfaceEl = $('#payInterface'),
	walletTrigger = $('span[data-value="walletBalance"]'),
	creditTrigger = $('span[data-value="creditLimit"]'),
	interfaceTrigger = $('span[data-value="payInterface"]');

var hasInterface = !!payInterfaceEl[0];
var orderAmount = $('input[name="Amount"]').val() * 1,
	orderType = $('input[name="OrderType"]').val() * 1; // 订单类型 -- 1为订单、2为采购单

var balance = $('input[name="Balance"]').val() * 1, // 帐号余额
	availableCreditLimit = $('input[name="AvailableCreditLimit"]').val() * 1, // 可用信用额度
	isNormalOrder =  orderType === 1, // 普通订单
	isPurchaseOrder = orderType === 2, // 采购订单
	isReverseModel = balance + availableCreditLimit >= orderAmount,
	isWalletPay = !!(walletTrigger[0]),
	isCreditPay = !!(creditTrigger[0] && creditTrigger.hasClass('checked')),
	isInterfacePay = !!(interfaceTrigger[0]);

var postData = {},
	payTypeData = {
		IsWalletPay: isWalletPay,
		IsCreditPay: isCreditPay,
		IsInterfacePay: isInterfacePay
	},
	isCanPayOrderLock = CreditLimitIsCanPayOrderLock == 'True' ? true : false,
	creditPayCount = creditLimitEl.text() * 1;

var pay = {
	init: function(){

		// 初始化post数据
		['PayTypeCode', 'OrderType', 'PayId', 'Amount', 'OrderCode'].forEach(function(key){
			var elem = $('input[name="'+ key +'"]'),
				value = elem.val();
			postData[key] = value;
		});

		// 事件绑定
		this.bindEvent();


		payGroupEl.find('.checkbox-trigger').each(function(){
			$(this).data('switch', true);
		});

		// 初始化支付方式选择
		// 帐号余额不管哪种类型订单，都不可反选
		walletTrigger.data('switch', false);

		// 只要有第三方支付，就选中一个默认的第三方(目前选第一个)
		if(payTypeSelector[0]){
			payTypeSelector.find('.pay-bank-item').eq(0).trigger('click');
			payTypeData.IsInterfacePay = true;
		}

		// 普通订单情况
		if(isNormalOrder){
			creditTrigger.data('switch', false);
			// interfaceTrigger.data('switch', false);
		}

		// 采购订单情况
		if(isPurchaseOrder){
			creditTrigger.data('switch', true);
			// payTypeData.IsCreditPay = false;
			var creditStatus = creditTrigger.hasClass('checked');
			payTypeData.IsCreditPay = creditStatus;
		}

		// 如果账户余额+信用额度大于等于应付金额，第三方支付为true，且不能反选
		if(!isReverseModel){
			interfaceTrigger.data('switch', false);
			payTypeData.IsInterfacePay = true;
		}

		// 提交按钮状态
		if(submitBtn.hasClass('ui-button-ldisable')){
			submitBtn.data('state', false);
		}else{
			submitBtn.data('state', true);
		}

		payTypeData.OrderType = orderType;
		payTypeData.OrderCode = $('input[name="OrderCode"]').val();
		
	},
	bindEvent: function(){
		var self = this;

		$('#J_form_pay').off('submit');

		var bankGroupItem = '.pay-type-group-item',
			bankItem = '.pay-bank-item',
			bankCheckboxTrigger = '.checkbox-trigger';

		var setPayInfo = function(data){
			var creditLimitAmount = data.CreditLimitPayAmount,
				interfaceAmount = data.InterfacePayAmount;

			creditLimitEl.text(creditLimitAmount.toFixed(2));

			if(hasInterface){
				payInterfaceEl.text(interfaceAmount.toFixed(2));
				postData.Amount = interfaceAmount.toFixed(2);

				if(interfaceAmount > 0){
					payTypeData.IsInterfacePay = true;
				}else{
					payTypeData.IsInterfacePay = false;
				}
			}
			
			if(creditLimitAmount > 0){
				payTypeData.IsCreditPay = true;

				if(orderType === 2){
					lockBox.find('.lock-tips').show(function(){
						window.scrollTo(0, lockBox.offset().top - 50);	
					});
				}
			}else{
				payTypeData.IsCreditPay = false;
				if(orderType === 2){
					lockBox.find('.lock-tips').hide();
				}
			}
		};

		payGroupEl.on('click', bankCheckboxTrigger, function(e){
			var $this = $(this),
				parent = $this.closest(bankGroupItem, payGroupEl),
				value = $this.data('value'),
				$switch = $this.data('switch');
			
			if($switch) {
				$this.toggleClass('checked');

				if($this.hasClass('checked')){
					parent.addClass('active');

					switch(value){
						
						case 'creditLimit':
							payTypeData.IsCreditPay = true;

							if(isReverseModel){
								interfaceTrigger.removeClass('checked');
								interfaceTrigger.closest('.pay-type-group-item').removeClass('active');
								payTypeData.IsInterfacePay = false;
								payTypeSelector.find('.pay-bank-item').removeClass('active');
							}

							break;
						case 'payInterface':
							payTypeData.IsInterfacePay = true;

							if(isReverseModel){
								creditTrigger.removeClass('checked');
								creditTrigger.closest('.pay-type-group-item').removeClass('active');
								payTypeData.IsCreditPay = false;
							}

							if(!parent.find(bankItem + '.active')[0]){
								parent.find(bankItem + ':first').trigger('click');
							}
							break;
					}

				}else{
					
					parent.removeClass('active');

					switch(value){
						case 'creditLimit':
							payTypeData.IsCreditPay = false;

							if(isReverseModel){
								interfaceTrigger.addClass('checked');
								interfaceTrigger.closest('.pay-type-group-item').addClass('active');
								payTypeData.IsInterfacePay = true;
								payTypeSelector.find('.pay-bank-item').addClass('active');
							}

							break;
						case 'payInterface':
							if(isReverseModel){
								creditTrigger.addClass('checked');
								creditTrigger.closest('.pay-type-group-item').addClass('active');
								payTypeData.IsCreditPay = true;
							}
							payTypeData.IsInterfacePay = false;
							parent.find(bankItem).removeClass('active');
							break;
					}
				}
				
				$.ajax({
					type: 'POST',
					url: '/Pay/CalculationSellerPayTypeAmount',
					data: payTypeData,
					success: function(res){
						// console.log(res);
						if(res.Succeeded){
							var result = res.Result;
							setPayInfo(result);
						}
					}
				});
			}else{
				return false;
			}
		});

		payTypeSelector.on('click', bankItem, function(){
			var $this = $(this),
				parent = $this.closest(bankGroupItem, payGroupEl);

			if($this.hasClass('active')) return false;
			
			postData.PayTypeCode = $this.data('value');
			
			$this.addClass('active').siblings().removeClass('active');				
			
			if(!parent.hasClass('active')){
				parent.find(bankCheckboxTrigger).trigger('click');
			}
		});

		submitBtn.on('click', function(e){
			e.preventDefault();

			if($(this).data('state')){
				self.ajax('/Pay/CheckOrder', {
					IsWalletPay: isWalletPay,
					Amount: orderAmount/*postData.Amount*/,
					OrderCode: postData.OrderCode,
					OrderType: postData.OrderType,
					IsCreditPay: payTypeData.IsCreditPay,
					IsInterfacePay: payTypeData.IsInterfacePay
				}, function(res){
					if(res.Succeeded){
						var result = res.Result;
						if(result.IsInterfacePay){
							
							postData.Amount = result.PayAmount;
							postData.IsCreditPay = payTypeData.IsCreditPay;
							self.gotobank();
							
						}else{
							self.ajax('/Pay/WalletOrCreditLimitPay', payTypeData, function(data){
								if(data.Succeeded){
									if(postData.OrderType == 1){
										window.location.href = sellerDomain + "/Order/Detail?orderCode=" + postData.OrderCode;
									}else{
										window.location.href = sellerDomain + "/ItemLock?Code=" + postData.OrderCode;
									}
								// 支付失败是，显示失败原因
								}else{
									showMessage(data.Message, true, function(){
										window.location.reload();
									});
								}
							});
						}
					}
				}, 'async');				
			}
		});
	},
	setSubmitBtnStatus: function(type){
		if(type === 'disable'){
			submitBtn
				.removeClass('ui-button-lorange')
				.addClass('ui-button-ldisable')
				.data('state', false);
		}else if('endisable'){
			submitBtn
				.removeClass('ui-button-ldisable')
				.addClass('ui-button-lorange')
				.data('state', true);
		}
	},
	gotobank: function(){
		window.open('/pay/gotobank?' + $.param(postData), '_blank');
		ConfirmBox.show(this.tpl.payWait, function(){
			window.location.reload();
		}, null, '提示');
	},
	ajax: function(url, data, successCallback, async){

		loading.show();

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: url,
			data: data || {},
			async: async ? false : true,
		}).success(function(data){
			loading.hide();
			successCallback && successCallback(data);
		}).error(function(){
			loading.hide();
			alert('服务器繁忙，请重试');
		});
	},
	tpl: {
		lockSuccess: [
			'<div class="result-tipbox ui-tipbox ui-tipbox-white ui-tipbox-success">',
			'<span class="ui-tipbox-icon"><i class="iconfont">&#xe60c;</i></span>',
			'<div class="ui-tipbox-content">',
			'<p>预定记录提交成功，为待审核状态！<br>请等待审核！</p>',
			'</div>',
			'</div>'
		].join(''),
		lockCredit: [
			'<div class="result-tipbox ui-tipbox ui-tipbox-white ui-tipbox-wait">',
			'<span class="ui-tipbox-icon"><i class="iconfont">&#xe608;</i></span>',
			'<div class="ui-tipbox-content">',
			'<p>您的账户余额(现金+可用信用额度)不足！<br>是否去充值？</p>',
			'</div>',
			'</div>'
		].join(''),
		payWait: [
			'<div class="pay-wait">',
			'<p class="text">请您在新打开的页面进行支付，支付完成前请不要关闭该窗口</p>',
			'<p class="text"><a href="javascript:;" class="ui-button-lorange ui-button" data-role="close">已完成支付</a>',
            '<a href="javascript:;" class="ui-button-lwhite ui-button" data-role="close">支付遇到问题</a></p>',
			'</div>'
		].join('')	
	}
};

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

$(function(){
	pay.init();
});