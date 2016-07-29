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

var Tip = require('components/tip/index');
var AjaxUpload = require('plugins/ajaxfileupload');
var fileDownload = require('plugins/filedownload');
var AutoComplete = require('components/autoComplete/index');
var Popup = require('components/popup/index');
var cookie = require('extend/cookie');

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

function isEmpty(value){
    return $.trim(value) === '';
}

function flagPrice(value){
	return value.trim().length && !isNaN(value) && value*1 > -1;
}


var formatDate = PPG.formatDate,
	validateItem = PPG.validateItem;

var sorder = {
	index: function(){

		var queryForm = $('#J_form_query'),
			clearOrderTrigger = $('.J_order_clear'),
			exportledTrigger = $('.J_shipment'),
			exportledBatchTrigger = $('#J_up_batch'),
			reasonTipTrigger = $('.J_cleartip'),
			createDoTrigger = $('.J_create_do'),
			changePriceTrigger = $('.J_change_price'),
			logisticsTrigger = $('.J_logistics'),
			queryType = $('#J_query_type'),
			pageIndexEl = $('input[name="PageIndex"]');

		// 物流公司
		var express = typeof expressDeliverys !== 'undefined' ? expressDeliverys : [],
			logisticsServers = [];

		if(express.length){
			express.forEach(function(item){
				logisticsServers.push({
					value: item.Name,
					name: item.Name
				});
			});
		}

		var order = {
			init: function(){

				initRangeDate();

				// 页码的操作
				formPaginger('.ui-paging', '#J_form_query');

				this.bindEvent();

				// 兼容placeholder 
				PPG.placeholder('.ui-input-calendar', {
					styles: {
						left: 8,
						top: 7
					}
				});
			},
			bindEvent: function(){
				var self = this;

				function download(url){
					loading.show();
					var params = queryForm.serialize();
					$.fileDownload(url + '?' + params)
		            .done(function (res) {
		            	loading.hide();
		            	showMessage('文件下载成功', true); 
		            })
		            .fail(function () { 
		            	loading.hide();
		            	showMessage('无相关数据', true); 
		            });
				}

				// 普通导出
				$('#J_submit_out2').on('click', function(e){
					e.preventDefault();
					download('/Order/ExportPublicSupplierOrder');
				});

				// 批量手工导出
				$('#J_submit_out').on('click', function(e){
					e.preventDefault();
					download('/Order/ExportSupplierOrder');
				});

				// 查询
				$('#J_submit_query').on('click', function(e){
					e.preventDefault();
					pageIndexEl.val(1);
					loading.show();
					queryForm.submit();
				});

				var $supplier = $('#supplier');
				// 供应商select
				if($supplier[0]){
					var $spanel = $('#supplier_panel'),
						$readText = $supplier.find('.read-text'),
						$query = $('#supplier_query'),
						$list = $('#supplier_list'),
						$id = $('#supplier_id'),
						$clear = $supplier.find('.supplier-clear'),
						supplierCache = '';

					var supplierPop = new Popup({
						trigger: '#pop_trigger',
						element: '#supplier_panel',
						triggerType: 'click'
					});

					var spACData = typeof supplierData !== 'undefined' ? supplierData : [];
					var supplierAC = new AutoComplete({
						trigger: '#supplier_query',
					    submitOnEnter: false,
					    filter: 'stringMatch',
					    classPrefix: 'autocomplete',
					    html: '<span class="item-text" data-id="{{id}}" data-name="{{value}}" title="{{value}}">{{value}}</span>',
					    dataSource: spACData
					}).render();

					if(spACData.length){
						var	si = 0,
							sl = spACData.length,
							itemTpl = '';

						for(; si < sl; si++){
							var item = spACData[si];
							itemTpl += '<li data-role="item" class="autocomplete-item">';
	        				itemTpl += '<span class="item-text" data-id="'+ item.id +'" data-name="'+ item.value +'" title="'+ item.value +'">'+ item.value +'</span>';
	      					itemTpl += '</li>';
						}
						supplierCache = itemTpl;
						$list.html(itemTpl);
					}

					supplierAC.input.on('queryChanged', function(query){
						if(query){
							$list.html(supplierAC.items);
						}else{
							$clear.hide();
							$list.html(supplierCache);
						}
					});
					
					$list.on('click', '[data-role="item"]', function(){
						var elem = $(this).find('.item-text'),
							id = elem.data('id'),
							name = elem.data('name');

							$id.val(id);
							$readText.text(name).addClass('selected');
							supplierPop.hide();
							supplierAC.setInputValue('');
							$clear.show();
					});
					$clear.on('click', function(){
						$(this).hide();
						$readText.text('选择供应商').removeClass('selected');
						supplierAC.setInputValue('');
						$id.val('');
					});

					var cid = $id.val();
					if($.trim(cid).length){
						for(var i = 0; i < spACData.length; i++){
							var data = spACData[i];
							if(data.id == cid){
								$readText.text(data.value).addClass('selected');
								$clear.show();
								break;
							}
						}
					}

					// 无效了？
					// supplierAC.on('itemSelected', function(data){
					// 	debugger
					// 	$id.val(data.Id);
					// 	$readText.text(data.Name);
					// 	$spanel.hide();
					// 	supplierAC.setInputValue('');
					// });
				}

				// 选类型
				queryForm.on('click', '.ui-tabs-trigger', function(){
					var type = $(this).find('a').data('type');
					if($(this).hasClass('ui-tabs-active')) return false;
					pageIndexEl.val(1);
					queryType.val(type);
					queryForm.submit();
				});

				// 批量下DO
				var $todo = $('#J_submit_do');
				if($todo[0]){
					var uploader = null;
					$todo.on('click', function(e){
						e.preventDefault();
						var uploadValueEl;

						ConfirmBox.confirm(self.tpls.todo, '批量DO', null, {
							onShow: function(){
								
								var $trigger = $('#J_exportled_upload'),
									uploadedTip = $('#uploaded_text');

								uploadValueEl = $('#J_upload_value');

								uploader = new AjaxUpload($trigger, {
					                action: '/Member/Upload',
					                responseType: 'json',
					                title: '',
					                data: {
					                    AjaxRequest: "true"
					                },
					                onChange: function(file, extension) {
					            
					                    var reg = /(xls|xlsx)/i;
					                    if (!reg.test(extension)) {
					                        showMessage('请上传Excel格式文件!');
					                        return false;
					                    }
					                },
					                onSubmit: function(file, extension) {
					                	
					                    // 上传中
					                    loading.show();
					                  
					                },
					                onComplete: function(file, response) {
					                	
					                	loading.hide();

					                	if(response.Succeeded){
					                		$trigger.hide();
					                		uploadedTip.text('已上传: ' + file).show();
					                		uploadValueEl.val(response.Result);
					                	}else{
					                		showMessage(response.Message);
					                	}
					                },
					                onError: function(file, response){
					                	loading.hide();
					                	// console.log(response);
					                	showMessage('服务器繁忙，请稍后再试');
					                }
					            });
							},
							onHide: function(){
								uploader = null;
							},
							onConfirm: function(){
								var that = this;
								var uploadValue = uploadValueEl.val();

								if(!isEmpty(uploadValue)){
									self.ajax('/Order/BatchDO', {
										FileName: uploadValue
									}, function(res){
										if(res.Succeeded){
											that.hide();
											showMessage('操作成功');												
										}else{
											showMessage('操作失败');	
										}
									});
								
								}else{
									alert('请上传Excel文件');
								}
							}
						});
					});					
				}

				// 取消订单
				if(clearOrderTrigger[0]){

					var types = typeof AbnormalTypes !== 'undefined' ? AbnormalTypes : [];
						options = [];

					if(types.length){
						types.forEach(function(item){
							options.push({
								value: item.Id,
								name: item.Name
							});
						});
					}

					// 编译模板
					var clearOrderTpl = templatable.compile(self.tpls.clearOrder, {items: options});

					queryForm.on('click', '.J_order_clear', function(e){
						e.preventDefault();
						var $this = $(this);
						var orderId = self.getOrderData($this).code;

						ConfirmBox.confirm(clearOrderTpl, '取消订单', null, {
							onConfirm: function(){
								var that = this;

								self.ajax('/Order/CancelOrderPackage', {
									PackageCode: orderId,
									CancelReasonType: $('#J_clear_emarks').val(),
								}, function(res){
									if(res.Succeeded){
										that.hide();
										showMessage2Reload('取消成功');			
									}else{
										showMessage('取消失败');	
									}
								});
							}
						});
					});
				}

				// 操作出货
				if(exportledTrigger[0]){

					queryForm.on('click', '.J_shipment', function(e){
						e.preventDefault();

						var $this = $(this),
							orderId = self.getOrderData($this).code;

						var exportledTpl = templatable.compile(self.tpls.exportled, {
							orderCode: orderId,
							items: logisticsServers
						});	

						ConfirmBox.confirm(exportledTpl, '操作出库', null, {
							onConfirm: function(){
								var that = this;
								var logisticsCode = $('#logistics_code').val();
								
								if(isEmpty(logisticsCode)){
									showMessage('请填写物流单号');
								}else{
									self.ajax('/Order/ManualOutStorage', {
										PackageCode: orderId,
										OPLILogisticsName: $('#J_logistics_select').val(),
										OPLIShippingNumber: logisticsCode
									}, function(res){
										if(res.Succeeded){
											that.hide();
											showMessage2Reload('操作成功');
										}else{
											showMessage('操作失败');
										}
									});									
								}
							}
						});
					});			
				}

				// 批量出货
				if(exportledBatchTrigger[0]){
					var uploader = null;

					exportledBatchTrigger.on('click', function(e){
						e.preventDefault();

						var uploadValueEl;

						ConfirmBox.confirm(self.tpls.exportledBatch, '批量出库', null, {
							onShow: function(){
								
								var $trigger = $('#J_exportled_upload'),
									uploadedTip = $('#uploaded_text');

								uploadValueEl = $('#J_upload_value');

								uploader = new AjaxUpload($trigger, {
					                action: '/Member/Upload',
					                responseType: 'json',
					                title: '',
					                data: {
					                    AjaxRequest: "true"
					                },
					                onChange: function(file, extension) {
					            
					                    var reg = /(xls|xlsx)/i;
					                    if (!reg.test(extension)) {
					                        showMessage('请上传Excel格式文件!');
					                        return false;
					                    }
					                },
					                onSubmit: function(file, extension) {
					                	
					                    // 上传中
					                    loading.show();
					                  
					                },
					                onComplete: function(file, response) {
					                	
					                	loading.hide();

					                	if(response.Succeeded){
					                		$trigger.hide();
					                		uploadedTip.text('已上传: ' + file).show();
					                		uploadValueEl.val(response.Result);
					                	}else{
					                		showMessage(response.Message);
					                	}
					                },
					                onError: function(file, response){
					                	loading.hide();
					                	// console.log(response);
					                	showMessage('服务器繁忙，请稍后再试');
					                }
					            });
							},
							onHide: function(){
								uploader = null;
							},
							onConfirm: function(){
								var that = this;
								var uploadValue = uploadValueEl.val();

								if(!isEmpty(uploadValue)){
									self.ajax('/Order/BatchImportLogistics', {
										FileName: uploadValue
									}, function(res){
										if(res.Succeeded){
											that.hide();
											showMessage('操作成功');												
										}else{
											showMessage('操作失败');	
										}
									});
								
								}else{
									alert('请上传Excel文件');
								}
							}
						});
					});
				} 
				
				// 改价
				if(changePriceTrigger[0]){
					queryForm.on('click', '.J_change_price', function(e){
						e.preventDefault();

						var $this = $(this),
							orderData = self.getOrderData($this),
							packageInfo = orderData.package,
							orderEl = orderData.element,
							datas = {}, postData = {};

						// 拼装数据
						datas.distributor = '';
						datas.orderCode = postData.PackageCode = packageInfo.PackageCode;
						datas.createTime = packageInfo.CreateTime.replace('T', ' ');
						datas.items = [];
						postData.OrderItems = [];

						packageInfo.OrderItems.forEach(function(product){
							datas.items.push({
								title: product.Name,
								img: product.Image,
								productCode: product.ItemId,
								productId: product.Id,
								number: product.Quantity,
								isEditable: product.IsEditable,
								isLock: product.IsInventoryLock,
								payPrice: product.ItemPrice.toFixed(2),
								realPrice: product.RealItemPrice.toFixed(2)
							});
							postData.OrderItems.push({
								ItemId: product.ItemId,
								RealItemPrice: product.RealItemPrice,
								Id: product.Id
							});
						});

						// 编译模板
						var changePriceTpl = templatable.compile(self.tpls.changePrice, datas);

						ConfirmBox.confirm(changePriceTpl, '订单改价', null, {
							width: 800,
							onConfirm: function(){
								var that = this;
								var hasError = false;
								this.element.find('.input-price').each(function(){
									var $this = $(this),
										productId = $this.data('productid'),
										val = $this.val();

									if(isEmpty(val) || isNaN(val)){
										hasError = true;
										return false;
									}
									
									var products = postData.OrderItems;
									for(var i = 0; i < products.length; i++){
										var item = products[i];
										if(item.Id == productId){
											item.RealItemPrice = val;
											break;
										}
									}
								});

								if(hasError){
									showMessage('价格信息有误,请确认后提交');
								}else{

									self.ajax('/Order/AdjustOrderPrice', postData, function(res){
										if(res.Succeeded){
											that.hide();
											showMessage2Reload('修改成功');
										}else{
											showMessage('服务器繁忙，请重试');
										}
									});
								}
							}
						});
					});
				}

				// 维护物流信息
				if(logisticsTrigger[0]){
					queryForm.on('click', '.J_logistics', function(e){
						e.preventDefault();

						var $this = $(this);
						var orderData = self.getOrderData($this),
							orderId = orderData.code,
							logisticsInfo = orderData.logistics.split('|');

						var exportledTpl = templatable.compile(self.tpls.exportled, {
							orderCode: orderId,
							items: logisticsServers
						});	

						ConfirmBox.confirm(exportledTpl, '物流信息', null, {
							onShow: function(){
								var $logisticsSelect = $('#J_logistics_select');
								if(logisticsInfo[0]){
									$logisticsSelect.val(logisticsInfo[0]);
								}
								$('#logistics_code').val(logisticsInfo[1]);
							},
							onConfirm: function(){
								var that = this;
								var logisticsCode = $('#logistics_code').val();
								
								if(isEmpty(logisticsCode)){
									showMessage('请填写物流单号');
								}else{
									self.ajax('/Order/ManualUpdateLogistics', {
										PackageCode: orderId,
										OPLILogisticsName: $('#J_logistics_select').val(),
										OPLIShippingNumber: logisticsCode
									}, function(res){
										if(res.Succeeded){
											that.hide();
											showMessage2Reload('操作成功');
										}else{
											showMessage('操作失败');
										}
									});									
								}
							}
						});
					});
				}

				// 取消原因
				if(reasonTipTrigger[0]){
					var reasonTip =  new Tip({
						trigger: '.J_cleartip',
						arrowPosition: 2
					});

					reasonTip.before('show', function(){
						this.set('content', this.activeTrigger.data('tip'));
					});
				}

				// 生成DO
				if(createDoTrigger[0]){
					queryForm.on('click', '.J_create_do', function(e){
						e.preventDefault();
						
						var $this = $(this),
							orderId = self.getOrderData($this).code;

						self.ajax('/Order/ManualDo', {PackageCode: orderId}, function(res){
							if(res.Succeeded){
								showMessage2Reload('已成功生成DO');
							}else{
								showMessage('操作失败');	
							}
						});
					});
				}

		        var abnormalUsers = typeof AbnormalUsers !== 'undefined' ? 
		        	AbnormalUsers.map(function(item){
		        		return {value: item.TrueName, label: item.TrueName};
		        	}) : [];

		        var usersCache = '',
		        	userAC = null,
		        	userPop = null,
		        	hasUsers = abnormalUsers.length > 0;

		        if(hasUsers){
		        	abnormalUsers.forEach(function(v){
						usersCache += '<li data-role="item" class="users-item"><span class="item-text" data-name="'+ v.label +'">'+ v.label +'</span></li>';
		        	});
		        }

		        // 如果有处理人，则启用自动补全
		        function initUserAutoComplate(){
		        	if(hasUsers){
						var $list = $('#J_users_list');
							username = $('#J_exception_uname');
						$list.html(usersCache);

						// 处理人
						userAC = new AutoComplete({
							trigger: '#J_exception_uname',
						    submitOnEnter: false,
						    width: 300,
						    filter: 'stringMatch',
						    classPrefix: 'users',
						    html: '<span class="item-text" data-name="{{label}}">{{label}}</span>',
						    dataSource: abnormalUsers			
						}).render();

						var dwp = cookie.get('dwp');
						if(dwp){
							userAC.setInputValue(dwp);
						}

						userPop = new Popup({
							trigger: '#J_exception_uname',
							element: '#J_users_pop',
							triggerType: 'focus'
						});

						userAC.input.on('queryChanged', function(query){
							if(query){
								if(userAC.items){
									$list.html(userAC.items);
									userPop.show();
								}else{
									userPop.hide();
								}
							}else{
								$list.html(usersCache);
								userPop.show();
							}
						});
						
						$list.on('click', '[data-role="item"]', function(){
							var elem = $(this).find('.item-text'),
								name = elem.data('name');
							username.removeClass('failed');
							userAC.setInputValue(name);
							userPop.hide();
						});
		        	}
		        }

		        // 记录处理人cookie
		        function setUserCookie(value){
		        	cookie.set('dwp', value, {
						expires: 365,
						path: '/',
						domain: 'papago.hk'
					});
		        }

		        // 设置异常
		        if($('.J_exception')[0]){
					queryForm.on('click', '.J_exception', function(e){
						var pgkCode = self.getOrderData($(this)).package.PackageCode;
						var content = templatable.compile(self.tpls.setException, {
							items: undefined != AbnormalTypes ? AbnormalTypes : []
						});
						
						ConfirmBox.confirm(content, '设置异常', null, {
							onHide: function(){
								userAC && userAC.destroy();
								userPop && userPop.destroy();
							},
							onShow: function(){
								
								$('#J_exception_emarks,#J_exception_uname').on('focus', function(){
									$(this).removeClass('failed');
								}).on('blur', function(){
									var $this = $(this);
									if(isEmpty($this.val())){
										$this.addClass('failed');
									}
								});

								initUserAutoComplate();
							},
							onConfirm: function(){
								var that = this,
									$tip = $('#valid_tip'),
									$remark = $('#J_exception_emarks'),
									$uname = $('#J_exception_uname'),
									$select = $('#J_exception_select'),
									errors = [];

								var valideIsEmpty = function($elem, message){
									var flag = isEmpty($elem.val());
									
									if(flag){
										errors.push(message);
										$elem.addClass('failed');
									}
									return flag;
								};
								
								valideIsEmpty($select, '请选择异常类型');
								valideIsEmpty($remark, '请输入备注(原因)');
								valideIsEmpty($uname, '请输入处理人');

								if(errors.length){
									var msg = errors.join(' / ');
									if($tip[0]){
										$tip.text(msg);
									}else{
										var content = '<span id="valid_tip" class="failed ui-text-error">'+ msg +'</span>';
										this.element.find('.ui-dialog-operation').prepend(content);
									}
									
									return false;
								}

								$tip[0] && $tip.hide();
								
								var uname = $uname.val();
								self.ajax('/Order/AddAbnormalOrder', {
									PackageCode: pgkCode,
									AbnormalType: $select.val(),
									Remark: $remark.val(),
									CreatedBy: uname					
								}, function(){
									that.hide();
									setUserCookie(uname);
									showMessage2Reload('设置成功');
								});
							}
						});
					});
		        }

				// 跟踪异常
				if($('.J_fl_exception')[0]){
					queryForm.on('click', '.J_fl_exception', function(e){
						var pgkCode = self.getOrderData($(this)).package.PackageCode;
						self.ajax('/Order/GetAbnormalOrderDetails', {
							PackageCode: pgkCode
						}, function(data){
							// console.log(data)
							if(data.Succeeded){
								var result = data.Result[0],
									type = '';

								AbnormalTypes.forEach(function(item){
									if(item.Id == result.AbnormalType){
										type = item.Name;
									}
								});

								var historys = result.OrderTrackingList.map(function(item){
									return {
										name: item.CreatedBy,
										date: formatDate(item.CreatedOn),
										marks: item.Remark
									};
								});

								var content = templatable.compile(self.tpls.followException, {
									type: type,
									time: formatDate(result.CreatedOn),
									author: result.CreatedBy,
									description: result.Remark,
									historys: historys
								});

								ConfirmBox.confirm(content, '跟踪异常', null, {
									width: 600,
									onHide: function(){
										userAC && userAC.destroy();
										userPop && userPop.destroy();
									},									
									onShow: function(){
										
										$('#J_exception_emarks,#J_exception_uname').on('focus', function(){
											$(this).removeClass('failed');
										}).on('blur', function(){
											var $this = $(this);
											if(isEmpty($this.val())){
												$this.addClass('failed');
											}
										});

										initUserAutoComplate();

										$('#J_refund_num').on('blur', function(){
											var $this = $(this),
												flagRefund = $('#J_refund_checkbox').is(':checked');

											if(flagRefund && !flagPrice($this.val())){
												$this.addClass('failed');
											}
										}).on('focus', function(){
											$(this).removeClass('failed');
										});
									},
									onConfirm: function(){
										var that = this,
											$remark = $('#J_exception_emarks'),
											$uname = $('#J_exception_uname'),
											$tip = $('#valid_tip'),
											$refundNum = $('#J_refund_num'),
											$refundCheckbox = $('#J_refund_checkbox'),
											flagRefund = $refundCheckbox.is(':checked'),
											errors = [];

										var valideIsEmpty = function($elem, message){
											var flag = isEmpty($elem.val());
											
											if(flag){
												errors.push(message);
												$elem.addClass('failed');
											}
											return flag;
										};

										valideIsEmpty($remark, '请输入备注(原因)');
										valideIsEmpty($uname, '请输入处理人');


										if(flagRefund && !flagPrice($refundNum.val())){
											$refundNum.addClass('failed');
											errors.push('退款金额格式有误');
										}

										if(errors.length){
											var msg = errors.join(' / ');
											if($tip[0]){
												$tip.text(msg);
											}else{
												var content = '<span id="valid_tip" class="failed ui-text-error">'+ msg +'</span>';
												this.element.find('.ui-dialog-operation').prepend(content);
											}
											
											return false;
										}

										$tip[0] && $tip.hide();

										var uname = $uname.val(),
											isCancelOrder = $('#J_clear').is(':checked');
										var postData = {
											PackageCode: pgkCode,
											Remark: $remark.val(),
											CreatedBy: $uname.val(),
											Refund: flagRefund ? $refundNum.val() : 0,
											Status: $('#J_done').is(':checked') ? 2 : 1,
											IsFullReturn: $('#J_refund_total').is(':checked'),
											IsCancelOrder: isCancelOrder,
											IsContinue: false
										};
										
										self.ajax('/Order/AddAbnormalOrderTracking', postData, function(res){
											if(res.Succeeded){
												that.hide();
												setUserCookie(uname);
												showMessage2Reload('操作成功');
											}else{
												ConfirmBox.confirm(res.Message + '，是否继续?', '提示：', null, {
													confirmTpl: '<a class="ui-dialog-button-orange" href="javascript:;">继续</a>',
													// 继续
													onConfirm: function(){
														var dialog = this;
														postData.IsContinue = true;
														self.ajax('/Order/AddAbnormalOrderTracking', postData, function(data){
															if(data.Succeeded){
																dialog.hide();
																setUserCookie(uname);
																showMessage2Reload('操作成功');
															}else{
																showMessage(data.Message);
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					});					
				}
			},
			getOrderData: function(trigger){

				var parent = trigger.closest('div.table-group');
				var getData = function(name){
					return parent.data(name) ? parent.data(name) : '';
				};

				return {
					element: parent,
					code: getData('info'),
					logistics: getData('logistics'),
					package: getData('package')
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
					loading.hide();
					alert('服务器繁忙，请重试');
				});
			},
			tpls: {
				// 取消订单弹出层内容 
				clearOrder: [
					'<div class="order-clear-dialog ui-dialog-form ui-form">',
                	'<div class="ui-form-item">',
                    '<label class="ui-label">取消原因：</label>',
                    '<select class="ui-select" id="J_clear_select">',
                    '{{#each items}}',
                    '<option value="{{value}}">{{name}}</option>',
                    '{{/each}}',
                    '</select></div>',
                	'<div class="ui-form-item">',
                    '<label class="ui-label" for="J_clear_emarks">备注：</label>',
                    '<textarea id="J_clear_emarks" class="ui-textarea"></textarea>',
                	'</div></div>'].join(''),

                // 操作出库弹出层内容
                exportled: [
                	'<div class="order-exportled-dialog ui-dialog-form ui-form">',
                	'<div class="ui-form-item">',
                	'<label class="ui-label">订单编号：</label>',
                	'<span class="ui-form-text">{{orderCode}}</span></div>',
                	'<div class="ui-form-item">',
                	'<label class="ui-label">物流公司：</label>',
                	'<select class="ui-select" id="J_logistics_select">',
                	'{{#each items}}',
                    '<option value="{{value}}">{{name}}</option>',
                    '{{/each}}',
                    '</select></div>',
                    '<div class="ui-form-item">',
                    '<label class="ui-label" for="logistics_code">物流单号：</label>',
                    '<input type="text" class="ui-input" id="logistics_code"></div></div>'
                ].join(''),

                // 批量出库弹出层内容
                exportledBatch: [
                	'<div class="order-exportleds-dialog ui-dialog-form ui-form">',
                	'<div class="ui-form-item" id="J_exportled_upload_wrap">',
                	'<label class="ui-label">选择：</label>',
                	'<a href="javascript:;" class="ui-button-lgreen ui-button" id="J_exportled_upload">上传</a>',
                	'<span class="ui-form-text fn-hide" id="uploaded_text"></span>',
                	'<input type="hidden" id="J_upload_value">',
                	'<div class="ui-tiptext-container ui-tiptext-container-message ui-mt20">',
                	'<p class="ui-tiptext ui-tiptext-message">',
                		'<i class="ui-tiptext-icon iconfont" title="提示">&#xe614;</i>温馨提示：<br>',
                		'1. 只能上传后缀为.XLS格式的Excel文件，可以下载我司现有样例文件 ： 订单上传模板 最后更新时间：2015-09-23 00:00:00<br>',
						'2. 如果您上传的文件格式不识别，<a target="_blank" style="color:#0ae" href="'+ PPG.RESOURCE_DOMAIN +'template/%E7%89%A9%E6%B5%81%E5%8F%B7%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx">请下载模板</a>，然后再次上传 <br>',
						'3. 批量上传订单数据不能超过300条<br> ',
						'4. 如有错误或疑问，请及时联系我们客服 </p>',
            		'</div>',
                	'</div></div>'
                ].join(''),

                // 批量DO弹出层内容
                todo: [
                	'<div class="order-exportleds-dialog ui-dialog-form ui-form">',
                	'<div class="ui-form-item" id="J_exportled_upload_wrap">',
                	'<label class="ui-label">选择：</label>',
                	'<a href="javascript:;" class="ui-button-lgreen ui-button" id="J_exportled_upload">上传</a>',
                	'<span class="ui-form-text fn-hide" id="uploaded_text"></span>',
                	'<input type="hidden" id="J_upload_value">',
                	'<div class="ui-tiptext-container ui-tiptext-container-message ui-mt20">',
                	'<p class="ui-tiptext ui-tiptext-message">',
                		'<i class="ui-tiptext-icon iconfont" title="提示">&#xe614;</i>温馨提示：<br>',
                		'1. 只能上传后缀为.XLS格式的Excel文件，可以下载我司现有样例文件 ： 订单上传模板 最后更新时间：2015-09-23 00:00:00<br>',
						'2. 如果您上传的文件格式不识别，<a target="_blank" style="color:#0ae" href="'+ PPG.RESOURCE_DOMAIN +'template/%E6%89%B9%E9%87%8F%E4%B8%8BDO%E6%A8%A1%E6%9D%BF.xlsx">请下载模板</a>，然后再次上传 <br>',
						'3. 批量上传订单数据不能超过300条<br> ',
						'4. 如有错误或疑问，请及时联系我们客服 </p>',
            		'</div>',
                	'</div></div>'
                ].join(''),                

                // 改价弹出层内容
                changePrice: [
                	'<div class="order-price-dialog">',
                	'<div class="ui-dialog-form ui-form">',
                	// '<div class="ui-form-item">',
                	// '<label class="ui-label">分销商：</label>',
                	// '<span class="ui-form-text">{{distributor}}</span>',
                	// '</div>',
                	'<div class="ui-form-item">',
                	'<label class="ui-label">订单号：</label>',
                	'<span class="ui-form-text">{{orderCode}}</span>',
                	'</div>',
                	'<div class="ui-form-item">',
                	'<label class="ui-label">创建时间：</label>',
                	'<span class="ui-form-text">{{createTime}}</span>',
                	'</div></div>',
                	'<div class="table-wrap"><h3>商品清单</h3>',
                	'<table class="ui-table">',
                	'<thead><tr>',
                	'<th width="40%">商品名称</th>',
                	'<th width="15%">商品编号</th>',
                	'<th width="15%">实付单价(RMB)</th>',
                	'<th width="15%">应付单价(RMB)</th>',
                	'<th>数量</th>',
                	'</tr></thead>',
                	'<tbody>',
                	'{{#each items}}',
                	'<tr>',
                	'<td>',
                	'<div class="ui-panel-mini ui-panel">',
                    '<div class="ui-panel-thumb">',
                    '{{#if isLock}}<i class="tag iconfont" title="锁库商品">&#xe63a;</i>{{/if}}',
                    '<a href="/Item/Detail?id={{productCode}}" title="{{title}}" target="_blank"><img src="{{img}}" alt="{{title}}"></a>',
                    '</div>',
                    '<div class="ui-panel-text">',
                    '<div class="ui-panel-text-inner">',
                        '<a href="/Item/Detail?id={{productCode}}" title="{{title}}">{{title}}</a>',
                    '</div></div></div></td>',
                    '<td>{{productCode}}</td>',
                    '<td>{{payPrice}}</td>',
                    '<td><div class="input-wrap">{{#if isEditable}}<input type="text" data-productId="{{productId}}" class="input-price ui-input" value="{{realPrice}}">{{else}}{{realPrice}}{{/if}}</div></td>',
                    '<td>{{number}}</td>',
                	'</tr>',
                	'{{/each}}',
                	'</tbody>',
                	'</table></div></div>'
                ].join(''),

                // 设置异常弹出层内容
                setException: [
					'<div class="order-exception-dialog ui-dialog-form ui-form">',
                	'<div class="ui-form-item">',
                    '<label class="ui-label">异常类型：</label>',
                    '<select class="ui-select" id="J_exception_select">',
                    '{{#each items}}',
                    '<option value="{{Id}}">{{Name}}</option>',
                    '{{/each}}',
                    '</select><span class="ui-form-required">*</span></div>',
                	'<div class="ui-form-item">',
                    '<label class="ui-label" for="J_exception_emarks">备注：</label>',
                    '<textarea id="J_exception_emarks" class="ui-textarea ui-vat"></textarea><span class="ui-form-required">*</span></div>',
                    '<div class="ui-form-item">',
					'<label class="ui-label" for="J_exception_uname">处理人：</label>',
					'<div class="users-wrap">',
                    '<input type="text" id="J_exception_uname" class="ui-input uname"><span class="ui-form-required">*</span>',
                    '<div class="users-panel" id="J_users_pop"><ul id="J_users_list" class="users-list"></ul></div></div>',
                	'</div></div>'
                ].join(''),

                // 跟踪异常弹出层内容
                followException: [
					'<div class="order-exception-dialog follow ui-dialog-form ui-form">',
					'<div class="header">',
					'<div class="head">',
					'<h3 class="title"><span class="time fn-right">{{time}}&nbsp;&nbsp;{{author}}</span><strong>{{type}}</strong></h3>',
					'<p>{{description}}</p>',
					'</div>',
					'<div class="historys">{{#each historys}}',
					'<div class="item">',
					'<p class="infos"><span>{{date}}</span><span>{{name}}</span></p>',
					'<p class="desc">{{marks}}</p>',
					'</div>',
					'{{/each}}</div>',
					'</div>',
                	'<div class="ui-form-item">',
                    '<label class="ui-label" for="J_exception_emarks">备注：</label>',
                    '<textarea id="J_exception_emarks" class="ui-textarea ui-vat"></textarea><span class="ui-form-required">*</span></div>',
                    '<div class="ui-form-item">',
					'<label class="ui-label" for="J_exception_uname">处理人：</label>',
                    '<div class="users-wrap">',
                    '<input type="text" id="J_exception_uname" class="ui-input uname"><span class="ui-form-required">*</span>',
                    '<div class="users-panel" id="J_users_pop"><ul id="J_users_list" class="users-list"></ul></div></div></div>',
                    '<div class="ui-form-item">',
                    '<label class="ui-label">退款：</label>',
                    '<div class="exce-item">',
                    '<span class="check-item"><input type="radio" name="refund" class="ui-checkbox" id="J_refund_checkbox"><input type="text" class="ui-input sm" placeholder="退款金额" id="J_refund_num"></span>',                    
                    '<span class="check-item"><input type="radio" name="refund" class="ui-checkbox" id="J_refund_total"><label for="J_refund_total">全额退款</label></span>',
                    '</div>',
                    '</div>',
                    '<div class="ui-form-item pb0">',
                    '<label class="ui-label"></label>',
                    '<span class="check-item"><input type="checkbox" class="ui-checkbox" id="J_clear"><label for="J_clear">取消订单</label></span>',
                    '<span class="check-item"><input type="checkbox" class="ui-checkbox" id="J_done"><label for="J_done">处理完成</label></span>',
                    '</div>',
                	'</div>'             
                ].join('')      
			}
		};

		$(function(){
			order.init();
		});
	},
	detail: function(){

		var validate = PPG.validate;

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

		$(function(){

			var $addrTemp = $('#J_address_form');
			var addressTpl = $addrTemp.html();
			var packageCode = $('#hdPackageCode').val();
			var $uname, $umobile, $uid, $utel, $uprovince, $ucity, $uarea, $uroad, $uzip;

			var validItems = {
				username: {
					element: $uname,
					rule: 'isTrueName',
					display: '真实姓名',
					errorMessage: '请输入真实姓名'
				},
				mobile: {
					element: $umobile,
					rule: 'isMobile',
					display: '手机号码'
				},
				idno: {
					element: $uid,
					rule: 'isID',
					display: '身份证号码'
				},
				tel: {
					element: $utel,
					required: false,
					rule: function(value){

						if(!validate.isEmpty(value) && !validate.isTel(value)){
							return false;
						}

						return true;
					},
					display: '电话号码'
				},
				province: {
					element: $uprovince,
            		display: '省'
				},
				city: {
					element: $ucity,
					display: '市'				
            	},
            	area: {
					element: $uarea,
					display: '区'
            	},
            	road: {
					element: $uroad,
					display: '详细地址',
					errorMessage: '请输入详细地址（不含省市区）'
            	},
            	zip: {
					element: $uzip,
					required: false,
					display: '邮政编码',
					rule: function(value){
						if(!validate.isEmpty(value) && !validate.isPostCode(value)){
							return false;
						}
						return true;
					}            		
            	}
			};

			$addrTemp.remove();

			// 异常订单展开收起
            $('#J_historys').on('click', '.trigger', function(){
                var $this = $(this),
                    $box = $this.closest('.except-box'),
                    panel = $box.find('.except-box-content');

                panel.slideToggle(function(){
                    $this.toggleClass('close');
                });
            });

            // 地址修改
            $('#J_addr_edit').on('click', function(){

            	ConfirmBox.confirm(addressTpl, '地址修改：', null, {
            		width: 520,
            		onShow: function(){
            			var $dialog = this.element;
        				$uname = validItems.username.element = $('#uname');
        				$umobile = validItems.mobile.element = $('#umobile');
        				$uid = validItems.idno.element = $('#uid');
        				$utel = validItems.tel.element = $('#utel');
        				$uprovince = validItems.province.element = $('#J_province');
        				$ucity = validItems.city.element = $('#J_city');
        				$uarea = validItems.area.element = $('#J_area');
        				$uroad = validItems.road.element = $('#uroad');
        				$uzip = validItems.zip.element = $('#uzip');

            			$dialog.addClass('md-address-dialog');

            			$dialog.on('focus', '.ui-input', function(){
            				$(this).removeClass('failed');
            			});

            			$uname.on('blur', function(){
            				var $this = $(this);

            				validItems.username.element = $this;
            				var result = validateItem(validItems.username);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$umobile.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.mobile.element = $this;
            				var result = validateItem(validItems.mobile);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$uid.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.idno.element = $this;
            				var result = validateItem(validItems.idno);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$utel.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.tel.element = $this;
            				var result = validateItem(validItems.tel);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$uprovince.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.province.element = $this;
            				var result = validateItem(validItems.province);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$ucity.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.city.element = $this;
            				var result = validateItem(validItems.city);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$uarea.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.area.element = $this;
            				var result = validateItem(validItems.area);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            			$uroad.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.road.element = $this;
            				var result = validateItem(validItems.road);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});
       			         			
            			$uzip.on('blur', function(){
            				var $this = $(this);
            				
            				validItems.zip.element = $this;
            				var result = validateItem(validItems.zip);

            				if(!result.valided){
            					$this.addClass('failed');
            				}
            			});

            		},
            		onConfirm: function(){
            			var dialog = this;
            			var $tip = $('#valid_tip');
            			var uname = $('#uname').val(),
            				umobile = $umobile.val(),
            				uid = $uid.val(),
            				utel = $utel.val(),
            				uprovince = $uprovince.val(),
            				ucity = $ucity.val(),
            				uarea = $uarea.val(),
            				uroad = $uroad.val(),
            				uzip = $uzip.val();

            			var errors = [];

            			for(var item in validItems){
							var result = validateItem(validItems[item]);
            				if(!result.valided){
            					errors.push(result);
            				}
            			}

            			if(errors.length){
            				var messages = [];
            				errors.forEach(function(item){
            					item.element.addClass('failed');
            					messages.push(item.message);
            				});

            				var msg = '信息有误，请完善后再提交';
							if($tip[0]){
								$tip.text(msg);
							}else{
								var content = '<span id="valid_tip" class="failed ui-text-error">'+ msg +'</span>';
								this.element.find('.ui-dialog-operation').prepend(content);
							}
            				return false;
            			}

            			$tip[0] && $tip.hide();

            			var postData = {
            				PackageCode: packageCode,
            				TrueName: uname,
            				Mobile: umobile,
            				IDCard: uid,
            				Tel: utel,
            				Province: uprovince,
            				City: ucity,
            				Area: uarea,
            				AddressInfo: uroad,
            				PostCode: uzip
            			};
            			// console.log(postData)
            			ajax('/Order/UpdateOrderReceiverInfo', postData, function(res){
            				if(res.Succeeded){
            					dialog.hide();
            					showMessage2Reload('修改成功');
            				}else{
            					showMessage(res.Message, true);
            				}
            			});
            		}
            	});
            });
        });
	}
};

// 日历初始化
function initRangeDate(){
    // 异步加载日历组件
    require.ensure('components/calendar/index', function(require){
        var Calendar = require('components/calendar/index');

        var dateStart, dateEnd;
        // 日历开始
        dateStart = new Calendar({
            trigger: '#J_date_start'
        });

        // 日历结束
        dateEnd = new Calendar({
            trigger: '#J_date_end'
        });

        // 初始化日期
        var dateStartVal = $('#J_date_start').val(),
            dateEndVal = $('#J_date_end').val();

        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() * 1 + 1,
            day = date.getDate() * 1;

        var today = year + '-' +
            (month >= 10 ? month : '0' + month) + '-' +
            (day >= 10 ? day : '0' + day);
        // console.log(today)

        if ($.trim(dateStartVal) === '' && $.trim(dateEndVal) === '') {
            dateStart.range([null, today]);
            dateEnd.range([null, today]);
        } else {
            dateStart.range([null, today]);
            dateEnd.range([dateStartVal, today]);
        }

        // 当选日期时，调整可选日期的范围
        dateStart.on('selectDate', function(date) {
            dateEnd.range([date, today]);
        });

        dateEnd.on('selectDate', function(date) {
            dateStart.range([null, date]);
        });

    },'calendar');
}

window.sorder = sorder;