var Tip = require('components/tip/index');
var Dialog = require('components/dialog/index');
var Counter = require('modules/counter');
var templatable = require('extend/templatable');
var sticky = require('extend/sticky');
var loading = require('modules/loading/index');
var Tabs = require('components/tabs/index');
var ConfirmBox = require('components/confirmbox/index');

// 图片延时加载
require('plugins/lazyload');

var $propWrap = $('#J_property_wrap'),
	purchaseBtn = $('#J_button_purchase');

var productIds = typeof itemPropertyValuesJson !== 'undefined' ? itemPropertyValuesJson : {},
	currentItemId = itemId,
	recomKey = key || '',
	recomBrand = brand || '',
	recomCategory = category || '',
	hasCounterTip = false,
	counterTipTimer = null,
	isOffline = !purchaseBtn[0] ? true : purchaseBtn[0].className.match(/disable/gi),
	counterTip;

var addCartDialog;

var productId = itemId,
	productNum = 1;

var d_counter = $('#J_detail_counter');
var detail = {
	init: function(){

		this.slider('#J_preview_slide', 5);

		// 在登录的情况下拉取推荐商品
		if(PPG.cookie('sc')){
			var recomLoaded = false,
				recomPolls = null;

			// 渲染推荐商品
			$.ajax({
				url: '/Item/GetRelateItemList',
				type: 'POST',
				dataType: 'json',
				data: {
					key: recomKey, 
					brand: recomBrand, 
					category: recomCategory,
					itemId: productId
				},
				success: function(res){
					// console.log(res)

					if(res.Succeeded){
						// 数据拼装
						var result = res.Result,
							data = {},
							l = result.length;

						if(l > 0){
							data.hasPager = l > 6 ? true : false;
							data.items = [];

							result.forEach(function(product){
								data.items.push({
									url: '/item?id=' + product.Id,
									name: product.Name,
									image: PPG.IMAGESERVER + product.Images.split(',')[0]
								});
							});

							// 渲染模板
							var tpl = templatable.compile(this.tpl.recommendProduct, data);
							$('#J_itemrelate').append(tpl);

							// 如果大于6个，绑定slider
							if(data.hasPager){
								this.slider('#J_recom_slide', 6);
							}							
						}
					}

					recomLoaded = true;

				}.bind(this),
				error: function(){
					recomLoaded = true;
				}
			});	
			
			recomPolls = setInterval(function(){
				if(recomLoaded){
					clearInterval(recomPolls);
					sticky('#J_sticky_detail', 40);
				}
			}, 30);
		}

		var detailIntroTabs = new Tabs({
			triggerType: 'click',
			element: '#J_intro_tab',
			triggers: '#J_intro_tab_nav .ui-tabs-trigger',
			panels: '#J_intro_tab_panel .ui-tabs-panel'
		});

    	detailIntroTabs.set("activeIndex", 0);

    	// 图片lazyload
		$('img.lazy').lazyload({
			data_attribute: 'lazy',
			threshold: 200,
			effect: 'fadeIn'
		});

		if(isOffline){
			this.setSubmitButtonStatus('disable');
		}else{
			this.setSubmitButtonStatus('enable');
		}

		this.bindEvent();
	},
	bindEvent: function(){

		var self = this;
		var hasCountError = false;

		// 数量增减
		$('#J_detail_counter').counter({
			onChange: function(data){
				productNum = data.count;
				self.setSubmitButtonStatus('enable');
				this.tips(null);
			},
			onError: function(data){
				var holdState = false;

				hasCountError = true;

				if(data.errorCount > this.max){
					if(data.type === 'keyup'){
						holdState = true;
						self.setSubmitButtonStatus('disable');
					}
					this.tips('商品数量超过库存', holdState);						
				}
			}
		});

		// 头显缩略图
		var magnifierThumb = $('#J_magnifier_thumb');
		$('#J_preview_slide').delegate('li.detail-slider-item', 'mouseover', function(){
			var $this = $(this),
				image = $this.find('img'),
				imageMiddle = image.data('middle'),
				imageLarge = image.data('large');

			magnifierThumb.attr('src', imageMiddle).data('large-img-url', imageLarge);

			$this.addClass('active').siblings().removeClass('active');
		});

		// 选属性
		$('.prop-list').delegate('li.prop-item', 'click', function(){
			var $this = $(this);
			var thisId = $this.data('id');

			if($this.hasClass('active')) return false;

			$this.addClass('active').siblings().removeClass('active');

			self.getProductId(thisId);
		});

		// 关注
		$('#follow-trigger').on('click', function(e){
			e.preventDefault();
			var $this = $(this);
			$.ajax({
				url: '/Item/AddOrCancelItemFollow',
				type: 'POST',
				dataType: 'json',
				data: {itemId: currentItemId},
				success: function(res){
					// console.log(res);
					if(res.Succeeded){

						if(res.Result === 0){
							$this.removeClass('active').text('关注该商品');
						}else if(res.Result === 1) {
							$this.addClass('active').text('取消关注');
						}
					}
				}
			});
		});

		// 加入购物车
		purchaseBtn.on('click', function(){

			var $this = $(this);

			if(!$this.data('on')) return false;

			self.ajax('/Item/Add2ShoppingCart', {
				 itemId:  productId,
				 itemNum: productNum
			}, function(res){

				if(res.Succeeded){
					var successTpl = templatable.compile(self.tpl.addCartSuccessDialog, {count: res.Result});
					if(!addCartDialog){
						addCartDialog = new Dialog();
					}
					addCartDialog.before('show', function(){
						this.set('content', successTpl);
					});

					addCartDialog.show();
				}else{
					alert('服务器繁忙，请重试');
				}
			});
		});

		// 税费、关税tip
		var propTips = new Tip({
			trigger: '.tip-trigger',
			theme: 'white',
			arrowPosition: 11
		});
		propTips.after('render', function(){
			this.element.addClass('props-tips');
		});
		propTips.before('show', function(){
			var arrow = 11;
			var activer = this.activeTrigger,
				content = activer.find('.content').html();

			this.set('content', content);

			if(activer.hasClass('tariff')){
				arrow = 1;
			}
			this.set('arrowPosition', arrow);
		});
	},
	getProductId: function(currentKey){
		var selectedIds = [],
			firstId = 0,
			productId = 0,
			key = '';

		$propWrap.find('li.prop-item.active').each(function(){
			var itemId = $(this).data('id') * 1;

			selectedIds.push(itemId);
		});

		key = selectedIds.sort().join(';');
		// console.log(key)
		if(productIds[key]){
			productId = productIds[key];
		}else{
			// debugger
			for(var k in productIds){
				
				if(firstId === 0){
					firstId = productIds[k];
				}

				if(k.indexOf(currentKey) > -1){
					productId = productIds[k];
					break;
				}
			}
		}

		if(!productId){
			productId = firstId;
		}

		// console.log(productId);
		window.location.href = '/item?id=' + productId;
	},
	tpl: {
		addCartSuccessDialog: [
			'<div class="ui-status-dialog">',
    			'<div class="ui-status-dialog-bd">',
    			'<i class="icon-success iconfont">&#xe62f;</i>',
    			'<p class="ui-status-dialog-title">商品成功加入采购车</p>',
    			// '<p class="ui-status-dialog-text ui-text-pale">采购车中已有{{count}}件商品</p>',
    			'</div>',
    			'<div class="ui-status-dialog-ft">',
    			'<a class="ui-button-lwhite ui-button" href="javascript:;" data-role="close">继续挑选</a>',
    			'<a class="ui-button-lorange ui-button" href="/Cart">去采购车</a>',
    			'</div>',
    			'</div>'
    	].join(''),
    	recommendProduct: [
            '<div class="detail-recom ui-box">',
                '<div class="ui-box-head">',
                    '<h3 class="ui-box-head-title">相关商品推荐</h3>',
                '</div>',
                '<div class="ui-box-content detail-slider" id="J_recom_slide">',
                    '<ul class="detail-recom-list detail-slider-list">',
                    	'{{#each items}}',
                        '<li class="detail-slider-item">',
                            '<div class="detail-recom-item">',
                            	'<div class="thumb-wrap">',
                            		'<a class="thumb" href="{{url}}" target="_blank"><img src="{{image}}" alt="{{name}}"></a>',
                            	'</div>',
                                '<h3 class="title"><a href="{{url}}" target="_blank" title="{{name}}">{{name}}</a></h3>',
                            '</div>',
                        '</li>',
                        '{{/each}}',
                    '</ul>',
                    '{{#if hasPager}}',
                    '<a class="pager-prev pager" href="javascript:;"><i class="iconfont">&#xe62c;</i></a>',
                    '<a class="pager-next pager" href="javascript:;"><i class="iconfont">&#xe632;</i></a>',
                    '{{/if}}',
                '</div>',
            '</div>'
    	].join('')
	},
	ajax: function(url, data, successCallback){
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
	},	
	slider: function(wrapId, showCount){
		var sliderContainer = $(wrapId),
			sliderList = sliderContainer.find('.detail-slider-list'),
			sliderItem = sliderList.find('.detail-slider-item'),
			sliderItemSize = sliderItem.size(),
			sliderItemWidth = sliderItem.outerWidth(true),
			sliderListWidth = sliderItemWidth * sliderItemSize;
			
		// sliderList.css('width', sliderListWidth);

		if(sliderItemSize <= showCount){
			sliderContainer.find('.pager').hide();
		}else{
			
			var currentIndex = 0,
				maxPosi = sliderListWidth - sliderContainer.innerWidth(),
				maxIndex = maxPosi / sliderItemWidth;

			var pagerPrev = sliderContainer.find('.pager-prev'),
				pagerNext = sliderContainer.find('.pager-next');

			pagerPrev.addClass('stop');

			function changePosi(index){
				var posi = index * sliderItemWidth;
				if(posi <= maxPosi){
					sliderList.animate({
						marginLeft: -posi
					}, 300);
				}else{
					return;
				}
			}

			sliderContainer.find('.pager-prev').on('click', function(){

				if(currentIndex === 0) return false;

				currentIndex -= 1;

				pagerNext.removeClass('stop');

				if(currentIndex === 0){
					$(this).addClass('stop');
				}
				changePosi(currentIndex);
			});

			sliderContainer.find('.pager-next').on('click', function(){

				if(currentIndex === maxIndex) return false;

				currentIndex += 1;

				pagerPrev.removeClass('stop');

				if(currentIndex === maxIndex){
					$(this).addClass('stop');
				}

				changePosi(currentIndex);
			});			
		}
	},
	setSubmitButtonStatus: function(status){
		// status --> enable || disable 
		var changeStatus = function(btn, className, status){
			if(status === 'enable'){
				btn.removeClass('ui-button-ldisable')
					.addClass(className)
					.data('on', 1);
			}else if(status === 'disable'){
				btn.removeClass(className)
					.addClass('ui-button-ldisable')
					.data('on', 0);
			}
		};

		if(status === 'enable'){
			changeStatus(purchaseBtn, 'ui-button-lorange', 'enable');
		}else if(status === 'disable'){
			changeStatus(purchaseBtn, 'ui-button-lorange', 'disable');
		}
	},
	showCountTip: function(elem, _self){

    	if(!hasCounterTip){
    		hasCounterTip = true;
    		var tpl = ['<div class="counter ui-poptip ui-poptip-yellow" id="J_counter_poptip">',
    				'<div class="ui-poptip-shadow">',
    				'<div class="ui-poptip-container">',
        			'<div class="ui-poptip-arrow ui-poptip-arrow-7">',
            		'<em></em><span></span></div>',
        			'<div class="ui-poptip-content">不可超过可用库存</div>',
    				'</div></div></div>'].join('');
    		$('body').append(tpl);
    		counterTip = $('#J_counter_poptip');
    	}

    	var counter = _self ? _self : elem.closest('.m-counter');

    	counterTip.css({
    		left: counter.offset().left -13,
    		top: counter.offset().top - 40
    	}).show();
		
		counterTipTimer && clearTimeout(counterTipTimer);

		counterTipTimer = setTimeout(function(){
			counterTip.hide();
		}, 2000);
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
	detail.init();
	// 右侧工具栏
	require('modules/toolbar/index')();
});