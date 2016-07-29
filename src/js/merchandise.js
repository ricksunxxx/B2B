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

var Popup = require('components/popup/index');
// ztree
require('plugins/ztree/style.css');
require('plugins/ztree/index');

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

function showMessage2Reload(message){
	showMessage(message, false, function(){
		window.location.reload();
	});
}

var merchandise = {
	control: function(){
		
		var queryForm = $('#J_form_query'),
			queryType = $('#J_query_type'),
			pageIndexEl = $('input[name="PageIndex"]'),
			selids = $('#J_query_selids'),
			categoryValue = $('#category_value'),
			categoryValueText = $('#J_category_text'),
			publishTable = $('.member-table-publish');

		var categoryTree,
			categoryTreeObj,
			categoryTreePopup;

        var zSetting = {
                view: {
                    selectedMulti: false,
                    showIcon: false
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                }
            }; 

		var fns = {
			init: function(){
				queryType.val($('.ui-tabs-active').find('a').data('type'));
				this.bindEvent();
				if(typeof infoMessage !== 'undefined' && infoMessage !== ''){
					showMessage(infoMessage);
				}

				categoryTreePopup = new Popup({
					trigger: '#J_category_text',
					element: '#J_category_panel',
					triggerType: 'click'
				});

				categoryTree = $.fn.zTree.init($('#J_category_list'), $.extend(null, zSetting, {
					callback: {
						onClick: function(e, elemId, data, lv){
							// console.log(data)
	                    	var currentItem = $('#' + data.tId);
							categoryValueText.text(data.name);
							categoryValue.val(data.id);
							categoryTreePopup.hide();
						}
					}
				}), zNodes);

				categoryTreeObj = $.fn.zTree.getZTreeObj('J_category_list');

				var categoryId = categoryValue.val();
				if(categoryId !== '0'){

					var node = categoryTreeObj.getNodesByParam('id', categoryId, null)[0];
					// 选中类别
					categoryTreeObj.selectNode(node);
					categoryValueText.text(node.name);

					// 添加取消功能
					var clearEl = $('<span class="icon-clear iconfont">&#xe629;</span>');
					$('.category').append(clearEl);
					clearEl.on('click', function(){
						categoryValue.val(0);
						queryForm.submit();
					});
				}
			},
			bindEvent: function(){
				var self = this;

				// 全选·单选·删除·批量删除
				$('.member-tabs-publish').selection({
					selectAllElem: '#J_select_all',
					singleClass: '.checkbox-sub',
					singleParentClass: '.member-table-item',
					singleRemoveClass: '.opera-del',
					batchRemoveElem: '#J_del_batch',
					async: true,
					// onSelect: function(){console.log(arguments);},
					onSingleRemove: function(data){
						var that = this;
						
						ConfirmBox.confirm('确定要删除这个商品吗？', '提示：', function(){
							var pid = data.removeTrigger.data('pid');
							self.ajax('/Item/DeleteItem', {
								SeletedIds: pid
							}, function(res){
								if(res.Succeeded){
									// selids.val(pid);	
									// that.itemRemove(data.timestamp);
									queryForm.submit();
									// selids.val('');									
								}
							});
						});
					},
					onBatchRemove: function(data){
						var that = this,
							selecteds = this.selecteds,
							datas = [];
						
						if(!selecteds.length) {
							showMessage('请选择商品');
							return false;	
						}

						ConfirmBox.confirm('确定要删除所选商品吗？', '提示：', function(){

							for(var i = 0; i < selecteds.length; i++){
								var item = selecteds[i];
								datas.push(item.removeTrigger.data('pid'));
							}

							var pids = datas.join(',');

							self.ajax('/Item/DeleteItem', {
								SeletedIds: pids
							}, function(res){
								// selids.val(pids);
								// that.batchRemove();
								queryForm.submit();
								// selids.val('');
							});
						});
					}
				});

				var $changedPrice = null;
				var flagPrice = function(val){
					return val.trim().length && !isNaN(val) && val*1 > -1;
				};
				var validItems = function(selector, $dialog){
					// 校验价格(必须为数字)
					$dialog.on('blur', selector, function(){
						var $this = $(this),
							val = $this.val();
						if(!flagPrice(val)){
							$this.addClass('failed');
						}
					}).on('focus', selector, function(){
						$(this).removeClass('failed');
					});
				};

				function compileProContent(data){
					// 3种模式(这里是根据后端返回值判断的，其实可以根据情况给`isWarnMode`、`isEditMode`相应的布尔值，不用依赖后端)
					// 0 上架操作(只能改价)、1库存操作(可改价、启用库存)、2查看(不可编辑)
					var tplData = {
						suggestPrice: data.SuggestPrice,
						avgUnitPrice: data.AvgUnitPrice,
						price: data.Price,
						isEditStock: data.OperateType < 2 && data.InventoryType !== 0,
						isEditPrice: data.OperateType < 2,
						isEditMode: data.OperateType < 2,
						products: []
					};

					$.each(data.ProductList, function(i, v){
						v.Images = v.Images.split(',')[0];
						tplData.products.push(v);
					});
					        
					return templatable.compile(self.tpl.proInfos, tplData);
				}

				// 列表内容的一些操作
				queryForm
					// 选类型
					.delegate('.ui-tabs-trigger', 'click', function(){
						var type = $(this).find('a').data('type');
						if($(this).hasClass('ui-tabs-active')) return false;
						pageIndexEl.val(1);
						queryType.val(type);
						queryForm.submit();

					// 上架
					}).delegate('.opera-rel', 'click', function(){
						var $this = $(this),
							pid = $this.data('pid');
						self.ajax('/Item/UpdateItemShelveStatus', {
							StatusParam: 1,
							SeletedIds: pid
						}, function(data){
							if(data.Succeeded){
								$this.closest('.member-table-item', publishTable).find('.status').text('已上架');
								$this.hide();
								$this.siblings().css('display', 'inline-block');	
							}
							data.Message && showMessage(data.Message);
						});

					// 下架
					}).delegate('.opera-off', 'click', function(){
						var $this = $(this),
							pid = $this.data('pid');

						self.ajax('/Item/UpdateItemShelveStatus', {
							StatusParam: 0,
							SeletedIds: pid
						}, function(data){
							
							if(data.Succeeded){
								$this.closest('.member-table-item', publishTable).find('.status').text('已下架');
								$this.hide();
								$this.siblings().css('display', 'inline-block');
							}

							data.Message && showMessage(data.Message);
							
						});

					// 关联
					}).delegate('.opera-group', 'click', function(e){
						var $this = $(this),
							pid = $this.data('pid'),
							productData = self.getProductData($this),
							categoryId = productData.category,
							brandId = productData.brand;

						var groupItems = [];

						self.ajax('/Item/IsItemBundled', {Id: pid}, function(data){
							if(data == true){
								showMessage('该商品为捆绑商品，不能关联其他商品');
							}else{
								self.ajax('/Item/GetItemGroups', {
									Id: pid,
									CategoryId: categoryId,
									BrandId: brandId
								}, function(res){
									// console.log(res)
									if(res.length){

										var itemGroups = res,
											i = 0, 
											l = itemGroups.length,
											datas = [],
											tpl;

										for(; i < l; i++){

											var item = itemGroups[i];
											var isChecked = item.IsInGroup,
												id = item.Id;

											if(isChecked){
												groupItems.push(id);
											}

											datas.push({
												id: id,
												image: item.Images.split(',')[0],
												checked: isChecked,
												name: item.Name,
												link: ''
											});
										}

										tpl = templatable.compile(self.tpl.operaGroup, {items: datas});

										ConfirmBox.confirm(tpl, '商品关联：',null, {
											width: 562,
											onShow: function(){
												this.element.addClass('relation-dialog');
												var operaGroupList = $('.opera-group-list');

												// 选商品
												$('.opera-group-list').delegate('li.opera-group-item', 'click', function(){
													var $this = $(this),
														$thisId = $this.data('pid'),
														idx = groupItems.indexOf($thisId);


													$this.toggleClass('checked');
													
													if($this.hasClass('checked')){
														if(idx === -1){
															groupItems.push($thisId);
														}
													}else{
														groupItems.splice(idx, 1);
													}
													// console.log(groupItems)
												});

												operaGroupList.find('.m-goods-name a').on('click', function(e){e.stopPropagation()});
											},
											onConfirm: function(){
												var that = this;
												self.ajax('/Item/AddItemGroups', {
													Id: pid,
													ItemGroupIds: groupItems.join(',')
												}, function(res){
													if(res.Succeeded){
														that.hide();
														showMessage('操作成功');
													}else{
														showMessage('操作失败');
													}
												});
											}
										});								
									}else{
										showMessage('无关联的商品');
									}
								});
							}
						});
					
					// 库存管理
					}).delegate('.opera-stock', 'click', function(e){
						var $this = $(this),
							pid = $this.data('pid');

						self.ajax('/Item/GetInventoryWarnResult', {Id: pid}, function(res){
							var result = res.Result;
							ConfirmBox.confirm(compileProContent(result), '库存管理：', null, {
								width: 800,
								confirmTpl: false,
								cancelTpl: false,
								onShow: function(){
									var $dialog = this.element,
										$suggest = $('#J_suggest'),
										$avgunit = $('#J_avgunit');

									$dialog.addClass('pro-dialog');
									validItems('.declarePrice', $dialog);

									// 库存启用
									$dialog.on('change', '.checkbox-se', function(){
										var sendData = {
										    ProductList: [],
										    Id: pid,
										    OperateType: result.OperateType
										};
										// 获取数据
										$dialog.find('.pro-props').each(function(){
											var $this = $(this);						
												$table = $this.find('.ui-table');

											var productCode = $this.data('code'),
												itemId = $this.data('itemid'),
												declarePrice = $this.find('.declarePrice').val();
												inventoryList = [];

											if(!$table.find('.null')[0]){
												// 获取InventoryList
												$table.find('tbody tr').each(function(){
													var $checkbox = $(this).find('.ui-checkbox');
													if($checkbox.is(':checked')){
														inventoryList.push({
															Id: $(this).data('id'),
												            ProductCode: productCode,
												            Status: true
														});
													}
												});
											}

											sendData.ProductList.push({
												InventoryList: inventoryList,
											    ItemId: itemId,
										        ProductCode: productCode,
										        DeclaredPrice: declarePrice ? declarePrice : 0
											});
											
										});

										console.log(sendData);

										$.ajax({
											url:'/Item/GetItemInventoryAvgUnitPrice', 
											type: 'POST',
											data: sendData, 
											success: function(data){
												if(data.Succeeded){
													var result = data.Result;
													$suggest.text(result.SuggestPrice);
													$avgunit.text(result.AvgUnitPrice);
												}else{
													$suggest.text(0);
													$avgunit.text(0);
												}
											},
											error: function(){
												console.log(arguments);
											}
										});
									});
									
								},
								onConfirm: function(){
									var that = this;
									var valided = true,
										$changedPrice = $('#changedPrice'),
										cpval = $changedPrice.val(),
										sendData = {
										    ProductList: [],
										    Id: pid,
										    OperateType: result.OperateType,
										    Price: result.Price
										};

									if(!flagPrice(cpval)){
										valided = false;
										$changedPrice.addClass('failed');
										return false;
									}else{
										sendData.Price = cpval;
									}

									// 获取数据
									this.element.find('.pro-props').each(function(){
										var $this = $(this),
											$declarePrice = $(this).find('.declarePrice'),
											dpval = $declarePrice.val();
										
										if(!flagPrice(dpval)){
											valided = false;
											$declarePrice.addClass('failed');
											return false;
											
										}else{
											var $table = $this.find('.ui-table');
											var productCode = $this.data('code'),
												itemId = $this.data('itemid'),
												inventoryList = [];

											if(!$table.find('.null')[0] && result.InventoryType !== 0){
												// 获取InventoryList
												$table.find('tbody tr').each(function(){
													var $checkbox = $(this).find('.ui-checkbox');
													inventoryList.push({
														Id: $(this).data('id'),
											            ProductCode: productCode,
											            Status: $checkbox.is(':checked')
													});
												});
											}

											sendData.ProductList.push({
												InventoryList: inventoryList,
												DeclaredPrice: dpval,
											    ItemId: itemId,
										        ProductCode: productCode
											});
										}
									});

									if(valided){
										// debugger
										self.ajax('/Item/UpdateItemInventoryWarn', sendData, function(res){
											// console.log(res);
											if(res.Succeeded){
												that.hide();
												showMessage2Reload('修改成功');
											}else{
												showMessage(res.Message);
											}
										});
									}else{
										console.log('信息有误，请更正后再提交');
									}
								}
							});
						});
					});
				
				// 查询
				$('#J_submitbtn').on('click', function(e){
					e.preventDefault();
					pageIndexEl.val(1);
					loading.show();
					queryForm.submit();
				});

				// 页码的操作
				formPaginger('.member-paging', queryForm);
			},
			tpl: {
				operaGroup: [
					'<div class="opera-group-dialog"><ul class="opera-group-list fn-clear">',
					'{{#each items}}',
					'<li class="opera-group-item {{#if checked}}checked{{/if}}" data-pid="{{id}}"><div class="m-goods"><div class="m-goods-thumb">',
                    '<a class="m-goods-thumb-img" href="javascript:;">',
                    '<img src="'+ PPG.IMAGESERVER +'{{image}}" alt="{{name}}"></a></div>',
                    '<div class="m-goods-info">',
                    '<h4 class="m-goods-name"><a title="{{name}}" href="{{link}}" target="_blank">{{name}}</a></h4>',
                    '</div></div><span class="checkspan"><i class="iconfont">&#xe616;</i></span></li>',
                    '{{/each}}',
                    '</ul></div>'
				].join(''),
				// 上架、库存预警
				proInfos: '<div class="body">' +
					'{{#each products}}' +
					'<div class="pro-props" data-itemid="{{ItemId}}" data-code="{{ProductCode}}">' +
						'<ul class="head fn-clear">' +
							'<li>' +
								'<div class="ui-panel-mini ui-panel">' +
									'<div class="ui-panel-thumb">' +
						             	'<a href="'+ wwwDomain + '/item?id={{ItemId}}" target="_blank" title="{{Name}}"><img src="'+ PPG.IMAGESERVER +'{{Images}}" alt="{{Name}}"></a>' +
						            '</div>' +
						            '<div class="ui-panel-text">' +
						                '<div class="ui-panel-text-inner">' +
						                    '<a class="name" href="'+ wwwDomain + '/item?id={{ItemId}}" target="_blank" title="{{Name}}">{{Name}}</a>' +
						                    '<p class="desc fn-text-overflow" title="业务模式:{{BusinessModelName}}|发货地:{{ShippingFromName}}|发货规格:{{DeliveryNum}}件一发|库存类型:{{InventoryType}}">' +
						                    '业务模式:{{BusinessModelName}}|发货地:{{ShippingFromName}}|发货规格:{{DeliveryNum}}件一发|库存类型:{{InventoryType}}</p>' +
						                '</div>' +
						            '</div>' +
						        '</div>' +
							'</li>' +
							'<li><div class="w100">销售规格<br>{{Num}}</div></li>' +
							'<li><div class="w100">申报价<br>{{#if ../isEditPrice}}<input class="declarePrice ui-input" value="{{DeclaredPrice}}" type="text">{{else}}{{DeclaredPrice}}{{/if}}</div></li>' +
						'</ul>' +
				        '<table class="ui-table">' +
				        	'<thead><th>供应商</th><th>仓库</th><th>库存</th><th>采购成本</th><th>税费</th><th>状态</th></thead>' +
				        	'<tbody>' +
				        	'{{#if InventoryList}}' +
				        	'{{#each InventoryList}}' +
				        		'<tr data-id="{{Id}}"><td>{{SupplierName}}</td>' +
				        		'<td>{{WarehouseName}}</td>' +
				        		'<td>{{PhysicalInventory}}</td>' +
				        		'<td>{{UnitPrice}}</td>' +
				        		'<td>{{Tax}}</td>' +
				        		'<td>{{#if ../../isEditStock}}<label><input type="checkbox" class="checkbox-se ui-checkbox" {{#if Status}}checked="checked"{{/if}}>启用</label>' +
				        		'{{else}}<span>{{#if Status}}启用{{else}}未启用{{/if}}</span>{{/if}}</td></tr>' +
				        	'{{/each}}' +
				        	'{{else}}<tr><td class="null" colspan="7" style="text-align:center;">暂无库存</td></tr>' +
				        	'{{/if}}' +
				        	'</tbody>' +
				        '</table>'+
				    '</div>' +
			        '{{/each}}' +
			        '</div>' +
			        '<div class="foot fn-clear">' +
			        	'<div class="left">' +
			        	'<span class="price-item">单件平均成本：<em id="J_avgunit">{{avgUnitPrice}}</em>&nbsp;元</span>' + 
			        	'<span class="price-item">建议零售价：<em id="J_suggest">{{suggestPrice}}</em>&nbsp;元</span>' +
			        	'{{#if isEditPrice}}' +
			        	'<span class="price-item"><label for="changedPrice">修改后价格：</label>' + 
			        	'<input type="text" class="ui-input" value="{{price}}" id="changedPrice">元</span>' + 
			        	'{{/if}}</div>' +
			        	'{{#if isEditMode}}' +
			        	'<div class="btns">' +
				        	'<a data-role="confirm" class="ui-dialog-button-orange" href="javascript:;">确定</a>' +
				        	'<a data-role="cancel" class="ui-dialog-button-white" href="javascript:;">取消</a>' +        	
			        	'</div>' +
			        	'{{/if}}' +
			        '</div>'
			},
			getProductData: function(trigger){
				var parent = trigger.closest('tr.member-table-item', publishTable);
				var getData = function(name){
					return parent.data(name) ? parent.data(name) : '';
				};

				var infos = getData('info').split('|');
				
				return {
					id: getData('pid'),
					category: infos[0],
					brand: infos[1]
				};
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
					// console.log(arguments);
					loading.hide();
					alert('服务器繁忙，请重试');
				});
			}
		};

		$(function(){
			fns.init();
		});
	}
};

window.merchandise = merchandise;