
var sticky = require('extend/sticky');
var loading = require('modules/loading/index');
var Tabs = require('components/tabs/index');
var ConfirmBox = require('components/confirmbox/index');

// 图片延时加载
require('plugins/lazyload');
// 右侧工具栏
require('modules/toolbar/index')();

var $propWrap = $('#J_property_wrap');

var productIds = typeof itemPropertyValuesJson !== 'undefined' ? itemPropertyValuesJson : {},
	currentItemId = itemId,
	imageServer = imageDomain || PPG.IMAGESERVER;

var productId = itemId;

var detail = {
	init: function(){

		this.slider('#J_preview_slide', 5);

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
			// threshold: $(window).height()/2,
			effect: 'fadeIn'
		});

		this.bindEvent();

		// sticky('#J_sticky_detail', 40);
	},
	bindEvent: function(){

		var self = this;

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
		window.location.href = '/Item/Detail?id=' + productId;
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
});