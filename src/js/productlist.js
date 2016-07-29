
// image lazyload
require('plugins/lazyload');
var Popup = require('components/popup/index');

var selectorPanel = '.ui-dl-horizontal',
	selectorItem = '.prod-selector-item';
var isMultipleExt = false;

var selectorWrap = $('#J_prod_selector');

var productlist = {
	init: function(){

		selectorWrap.find('dl.ui-dl-horizontal').each(function(){
			var $this = $(this),
				panel = $this.find('dd.value');

			if(panel.height() > $this.height()){
				$this.find('.ext-more').css('visibility', 'visible');
			}
		});

		// 图片lazyload
		$('img.lazy').lazyload({
			data_attribute: 'lazy',
			threshold: 200,
			effect: 'fadeIn'
		});

		this.bindEvent();
	},
	bindEvent: function(){
		var self = this;

		// 展开更多
		selectorWrap.delegate('.ext-more', 'click', function(){
			var $this = $(this);

			$this.toggleClass('clicked');

			if($this.hasClass('clicked')){
				self.extSelectorPanel($this, function(){
					$this.text('收起');
				});					
			}else{
				self.minSelectorPanel($this, function(){
					$this.text('更多');
				});				
			}	
		});
		selectorWrap.delegate('.ext-multiple', 'click', function(){
			var $this = $(this);
				self.extSelectorPanel($this, function(wrap){
					isMultipleExt = true;
					wrap.find('.prod-selector-ext').hide();
					wrap.find('.prod-selector-btns').show();
				});	
		});
		selectorWrap.delegate(selectorItem, 'click', function(){
			var $this = $(this);

			if(isMultipleExt){
				
				$this.toggleClass('selected');

				return false;
			}
		});

		$('#J_selector_cancel').on('click', function(e){
			e.stopPropagation();
			self.minSelectorPanel($(this), function(wrap){
				isMultipleExt = false;
				wrap.find('.prod-selector-ext').show();
				wrap.find('.prod-selector-btns').hide();
				wrap.find(selectorItem).each(function(){
					$(this).removeClass('selected');
				});
				wrap.find('.ext-more').removeClass('clicked').text('更多');
			});
		});

		// 面包屑分类
		var dropboxTimer = null;
		var hoverDelay = function(e, panel){
			if(e.type === 'mouseover'){
				panel.show();
				dropboxTimer && clearTimeout(dropboxTimer);
			}else{
				dropboxTimer = setTimeout(function(){
					panel.hide();
				}, 300);
			}
		};

		$('.ui-navmini-list').delegate('>li', 'mouseover mouseleave', function(e){
			var dropbox = $(this).find('.dropbox');

			dropboxTimer && clearTimeout(dropboxTimer);
			$(this).siblings().find('.dropbox').hide();

			if(dropbox[0]){
				hoverDelay(e, dropbox);	
			}
		}).delegate('.dropbox', 'mouseover mouseleave', function(e){
			e.stopPropagation();
			hoverDelay(e, $(this));
		});

		// 面包屑搜索
		var crumbsSearchInput = $('#J_crumbs_search'),
			crumbsSearchVal = crumbsSearchInput.val();
		crumbsSearchInput.on('focus blur', function(e){
			var $this = $(this);

			if(e.type === 'focus'){
				$this.select();
			}else{
				if(!$.trim($this.val()).length){
					crumbsSearchInput.val(crumbsSearchVal);
				}
			}
		});

		// 价格dropbox
		var filterPriceEl = $('#J_filter_price');
		var pricePop = new Popup({
			trigger: '#J_filter_price .ui-input',
			element: '#J_filter_price .prod-filter-dropbox',
			triggerType: 'focus'
		});
		pricePop.before('show', function(){
			filterPriceEl.addClass('active');
		});
		pricePop.before('hide', function(){
			filterPriceEl.removeClass('active');
		});
		$('#J_filter_clear').on('click', function(e){
			e.preventDefault();
			filterPriceEl.find('.ui-input').val('');
		});
		$('#J_filter_enter').on('click', function(e){
			e.preventDefault();
			$('#J_form_filter').submit();
		});

		// 面包屑超长处理
		var crumbsSlide = $('#J_crumbs_slide'),
			crumbsNav = crumbsSlide.find('.ui-navmini-list'),
			crumbsNavLastItem = crumbsNav.find('>li:last'),
			crumbsNavWidth = parseInt(crumbsNavLastItem.position().left + crumbsNavLastItem.outerWidth(), 10),
			crumbsSlideWidth = parseInt(crumbsSlide.innerWidth(), 10),
			speed = 300,
			startPosition = 0, 
			lastPosition = 0;

		if(crumbsNavWidth > crumbsSlideWidth){
			var prevBtn = crumbsSlide.find('.prev'),
				nextBtn = crumbsSlide.find('.next');

			crumbsSlide.addClass('slide');

			var n = Math.floor(crumbsNavWidth/crumbsSlideWidth);
		
			lastPosition = -crumbsNavWidth + crumbsSlideWidth - 40;

			crumbsNav.animate({
				left: lastPosition
			}, speed);

			var index = max = n;

			prevBtn.on('click', function(){
				var $this = $(this);

				if(index === 0) return false;
				
				index -= 1;
				
				if(index < 0){
					index = 0;
				}

				var position = -(crumbsSlideWidth * index);

				if(index === 0){
					position = startPosition;
				}

				crumbsNav.animate({left: position}, speed, function(){
					if(index === 0){
						$this.hide();
					}
					nextBtn.show();
				});
			});

			nextBtn.on('click', function(){
				var $this = $(this);

				if(index === max) return false;

				index += 1;

				if(index > max){
					index = max;
				}

				var position = -(crumbsSlideWidth * index);

				if(index === max){
					position = lastPosition;
				}
				
				crumbsNav.animate({left: position}, speed, function(){
					if(index === max){
						$this.hide();
					}
					prevBtn.show();
				});
			});
		}

	},
	extSelectorPanel: function(trigger, callback){
		var thisWrap = trigger.closest(selectorPanel);
		thisWrap.addClass('opened');
		callback && callback(thisWrap);
	},
	minSelectorPanel: function(trigger, callback){
		var thisWrap = trigger.closest(selectorPanel);
		thisWrap.removeClass('opened');
		callback && callback(thisWrap);
	}	
};

$(function(){
	productlist.init();
});
