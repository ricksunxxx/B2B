var Selection = require('modules/selection');
var Counter = require('modules/counter');
var Confirmbox = require('components/confirmbox/index');
var loading = require('modules/loading/index');
var cookie = require('extend/cookie');
var sticky = require('extend/sticky');

var cartForm = $('#J_form_cart'),
	cartBody = $('#J_cart_main'),
	selectedSizeEl = $('#J_selected_size'),
	totalPriceEl = $('#J_total_price'),
	buttonLock = $('#J_button_lock'),
	buttonOrder = $('#J_button_order'),
	selectAllFt = $('#J_select_all_ft'),
	selectAllHd = $('#J_select_all_hd'),
	shoppingTable = $('.shopping-table');

var hasCounterTip = false,
	counterTipTimer = null,
	counterTip;

var proCookieOption = {
		expires: 365,
		path: '/',
		domain: 'papago.hk'
	};

var selectedsCache = [];

var cart = {
	init: function(){

		buttonLock.data('flag', 0);
		buttonOrder.data('flag', 0);

		shoppingTable.find('.shopping-table-item').each(function(){
			var $this = $(this),
				counter = $this.find('.m-counter-count');

			if(counter.length){
				var ct = counter.find('input').val();
				$this.data('count', ct);
			}
		});
		
		// 从cookie中获取上次选中的id，并对相关的选项进行选中操作
		var selectedHistory = cookie.get('c');
		if(selectedHistory){
			var sleds = selectedHistory.split(',');

			sleds.forEach(function(item){
				var currentItem = $('[data-itemid="'+ item +'"]'),
					checkbox = currentItem.find('.selectsub');

				checkbox.prop('checked', true);
				selectedsCache.push({
					parent:currentItem, 
					checkbox: checkbox, 
					checked: true
				});
			});

			this.updateInfo();
		}

		// 事件绑定
		this.bindEvent();

		// 如果没选中的记录，则全部勾选
		if(!selectedHistory){
			shoppingTable.find('tbody .selectsub').each(function(){
				$(this).trigger('click');
			});
		}

		if(selectAllHd[0] && selectAllHd.is(':checked')){
			selectAllFt.prop('checked', true);
		}
	},
	bindEvent: function(){
		var self = this;

		$('#J_button_lock, #J_button_order').on('click', function(e){

			e.preventDefault();
			 
			if($(this).data('flag') === 0) {
				self.showMessage('请选择商品！');
				return false;
			}

			if(this.id.match(/lock/)){
				self.ajaxSubmit('lock');
			}else if(this.id.match(/order/)){
				self.ajaxSubmit();
			}
		});

		// 全选、单选、删除、批量删除
		$('#J_cart_main').selection({
		    selectAllElem: '#J_select_all_hd',
		    singleClass: '.selectsub',
		    singleParentClass: '.shopping-table-item',
		    singleRemoveClass: '.remove',
		    batchRemoveElem: '#J_remove_batch',
		    async: true,
		    onSelect: function(item){
		    	var that = this;
		    	var selectedSize = this.getSelectedSize(),
		    		itemSize = this.items.length,
		    		isAllFlag = selectedSize === itemSize ? true : false;

		    		selectedsCache = this.selecteds;

		    	if(item.checked){
		    		item.parent.addClass('selected');	
		    	}else{
		    		item.parent.removeClass('selected');
		    	}

		    	selectAllFt.prop('checked', isAllFlag);

		    	self.updateInfo();

		    },
		    onSelectAll: function(){
		    	var selecteds = this.selecteds,
		    		flag = selecteds.length ? true : false;
				
				selectedsCache = selecteds;

				self.updateInfo();

		    	selectAllFt.prop('checked', flag);
		    },
		    onSingleRemove: function(item){
		    	var that = this;
		    	Confirmbox.confirm('确定要删除这个商品吗？', '提示：', function(){
		    		var itemid = item.parent.data('itemid');
		    		self.ajax('/Cart/DeleteProduct', {
		    			deleteItemIds: itemid
		    		}, function(res){
		    			if(res.Succeeded){
		    				// 清除当前商品cookie
		    				var cc = cookie.get('c');
		    				if(cc){
		    					var ids = cc.split(','),
		    						i = ids.indexOf(itemid+'');

		    					if(i > -1){
		    						ids.splice(i, 1);
		    						if(ids.length){
		    							cookie.set('c', ids.join(','), proCookieOption);
		    						}else{
		    							cookie.remove('c');
		    						}
		    					}
		    				}
				    		that.itemRemove(item.timestamp, function(){
				    			
				    			selectedsCache = this.selecteds;

				    			if(!this.items.length){
				    				self.setCartEmptyMessage();
				    			}else{
				    				self.updateInfo();
				    			}
				    		});		    				
		    			}
		    		});
		    	});
		    },
		    onBatchRemove: function(){
		    	var that = this;
		    	var selectedSize = this.getSelectedSize();

		    	if(!selectedSize) return false;

		    	selectedsCache = this.selecteds;

				Confirmbox.confirm('确定要删除所选商品吗？', '提示：', function(){
					var selectedIds = self.getSelectedIds();
					self.ajax('/Cart/DeleteProduct', {
						deleteItemIds: selectedIds
					}, function(res){
						if(res.Succeeded){
							// 清除记录过的商品cookie
		    				var cc = cookie.get('c');
		    				if(cc){
		    					var ids = cc.split(',');

		    					selectedIds.split(',').forEach(function(v){
			    					var i = ids.indexOf(v+'');
			    					if(i > -1){
			    						ids.splice(i, 1);
			    					}		    						
		    					});

		    					if(ids.length){
		    						cookie.set('c', ids.join(','), proCookieOption);
		    					}else{
		    						cookie.remove('c');
		    					}
		    				}

					    	that.batchRemove(function(){
					    		// 全删除后
					    		if(!that.items.length){
					    			self.setCartEmptyMessage();
					    		}else{
					    			selectedsCache = [];
					    			self.updateInfo();
					    		}
					    	});							
						}
				    });
				});
		    }
		});

		selectAllFt.on('click', function(){
			selectAllHd.trigger('click');
		});

		// 数量增减
		function counterPost(elem, count){

			var itemData = self.getItemData(elem),
				pid = itemData.id,
				parent = itemData.element;
			
			$.ajax({
				url: '/Cart/UpdateProductNum',
				type: 'POST',
				dataType: 'json',
				data: {
					itemId: pid,
					quantity: count
				},
				success: function(res){
					if(res.Succeeded){
						// 如果当前商品为选中商品，则更新价格相关信息
						var isSelected = parent.find('.selectsub').is(':checked');
						
						parent.data('count', count);

						if(isSelected){
							self.updateInfo();
						}
					}
				},
				error: function(){}
			});
		}
		$('.cart-counter').counter({
			onChange: function(data){
				this.tips(null);
				counterPost(this.wrap, data.count);
			},
			onError: function(data){
				var holdState = false;
				var max = this.max,
					type = data.type;

				if(data.errorCount > max){
					if(type === 'keyup'){
						holdState = true;
						this.setCount(max);
						counterPost(this.wrap, max);
					}

					if(type === 'plus' && data.count > max){
						this.setCount(max);
						counterPost(this.wrap, max);	
					}

					this.tips('最多只能购买'+ max +'件', holdState);						
				}
			}
		});

		// 关注
		cartBody.delegate('a.follow', 'click', function(e){
			e.preventDefault();
			var $this = $(this),
				itemid = self.getItemData($(this)).id;

			self.ajax('/Item/AddOrCancelItemFollow', {itemId: itemid}, function(res){
				if(res.Succeeded){

					if(res.Result === 0){
						$this.text('关注该商品');
					}else if(res.Result === 1) {
						$this.text('取消关注');
					}

					self.showMessage(res.Message);
				}
			});
			
		});

		sticky("#J_stickybar", { bottom: 0 });
	},
	showCountTip: function(elem){

    	if(!hasCounterTip){
    		hasCounterTip = true;
    		var tpl = ['<div class="ui-poptip ui-poptip-yellow">',
    				'<div class="ui-poptip-shadow">',
    				'<div class="ui-poptip-container">',
        			'<div class="ui-poptip-arrow ui-poptip-arrow-7">',
            		'<em></em><span></span></div>',
        			'<div class="ui-poptip-content">不可超过可用库存</div>',
    				'</div></div></div>'].join('');
    		$('body').append(tpl);
    		counterTip = $('.ui-poptip');
    	}

    	var counter = elem.closest('.m-counter');

    	counterTip.css({
    		left: counter.offset().left - 24,
    		top: counter.offset().top - 40
    	}).show();
		
		counterTipTimer && clearTimeout(counterTipTimer);

		counterTipTimer = setTimeout(function(){
			counterTip.hide();
		}, 2000);
	},
	getItemData: function(trigger, _self){
		var item = _self ? _self : trigger.closest('tr.shopping-table-item', shoppingTable);
        var getData = function(name){
            return item.data(name) ? item.data(name) : '';
        };
        
        return {
        	element: item,
            id: getData('itemid'),
            count: getData('count'),
            uprice: getData('unitprice')
        };
	},
	showMessage: function(message, hold){
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
	ajaxSubmit: function(isLock){
		var self = this;
		var ids = this.getSelectedIds();

		var ajaxUrl = '/Cart/SubmitToBuy',
			gotoUrl = '/Cart/Buy';

		if(isLock){
			ajaxUrl = '/Cart/SubmitItemsLock';
		}

		this.ajax(ajaxUrl, {checkedItemIds: ids}, function(res){
			if(res.Succeeded){
				// 页面跳转
				if(isLock){
					gotoUrl = '/Pay?orderCode=' + res.Result.Code + '&orderType=2';
				}else{
					// 非锁库时记录cookie
					// 重置cookie
					cookie.set('c', ids, proCookieOption);
				}

				window.location.href = gotoUrl;
			}else{
				this.showMessage(res.Message, true);
			}
		}.bind(this), 'GET');
	},
	getSelectedIds: function(){
		var ret = '';

		if(selectedsCache.length){
			var checkedItemIds = [];
    		for(var i = 0; i < selectedsCache.length; i++){
    			var item = selectedsCache[i];

    			checkedItemIds.push(item.parent.data('itemid'));
    		}

    		ret = checkedItemIds.join(',');
		}

		return ret;
	},
	updateInfo: function(data){
		var self = this;
		var totalPrice = 0,
			selectedCount = selectedsCache.length;

		selectedsCache.forEach(function(item){
			var itemData = self.getItemData(null, item.parent),
				count = itemData.count * 1,
				unitprice = itemData.uprice * 1;

			totalPrice += (unitprice * count);
		});

		// 总价格
		totalPriceEl.text(totalPrice.toFixed(2));
		// 已选商品件数
		selectedSizeEl.text(selectedCount);

		if(selectedCount === 0){
    		this.setSubmitButtonStatus('disable');
    	}else{
    		this.setSubmitButtonStatus('enable');
    	}

	},
	updateCart: function(/*postData*/){
		var self = this;
		// var data = $.extend({}, {isBuy: false}, postData);

		this.ajax('/Cart/UpdateShoppingCart', {
			isBuy: false,
			checkedItemIds: self.getSelectedIds()
		}, function(res){
			// console.log(res)
			if(res.Succeeded){
				self.updateInfo(res.Result);
			}
		});
	},
	setCartEmptyMessage: function(){
		var emptyTpl = '<div class="cart-empty"><i class="iconfont">&#xe603;</i><p class="text">购物车空空如也，<a class="link" href="/Source">去逛逛吧</a>！</p></div>';
		cartBody.html(emptyTpl);
		
	},
	setSubmitButtonStatus: function(status){
		// status --> enable || disable 
		var changeStatus = function(btn, className, status){
			if(status === 'enable'){
				btn.removeClass('ui-button-ldisable')
					.addClass(className)
					.data('flag', 1);
			}else if(status === 'disable'){
				btn.removeClass(className)
					.addClass('ui-button-ldisable')
					.data('flag', 0);
			}
		};

		return {
			enable: function(){
				changeStatus(buttonLock, 'ui-button-lred', 'enable');
				changeStatus(buttonOrder, 'ui-button-lorange', 'enable');

			},
			disable: function(){
				changeStatus(buttonLock, 'ui-button-lred', 'disable');
				changeStatus(buttonOrder, 'ui-button-lorange', 'disable');
			}
		}[status]();
	}
};

$(function(){
	cart.init();
});	