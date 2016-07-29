webpackJsonp([19],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * 会员中心公共部分 
	 */
	var ConfirmBox = __webpack_require__(15);
	var Selection = __webpack_require__(53);
	var templatable = __webpack_require__(10);
	var formPaginger = __webpack_require__(64);
	var loading = __webpack_require__(18);

	// 侧边折叠菜单
	__webpack_require__(52)();

	var Tip = __webpack_require__(82);
	var AjaxUpload = __webpack_require__(65);
	var fileDownload = __webpack_require__(84);
	var AutoComplete = __webpack_require__(80);
	var Popup = __webpack_require__(51);
	var cookie = __webpack_require__(67);

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
	    __webpack_require__.e/* nsure */(0, function(require){
	        var Calendar = __webpack_require__(63);

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

	    });
	}

	window.sorder = sorder;

/***/ },

/***/ 51:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Overlay = __webpack_require__(13);

	// Popup 是可触发 Overlay 型 UI 组件
	var Popup = Overlay.extend({

	  attrs: {
	    // 触发元素
	    trigger: {
	      value: null,
	      // required
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 触发类型
	    triggerType: 'hover',
	    // or click or focus
	    // 触发事件委托的对象
	    delegateNode: {
	      value: null,
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 默认的定位参数
	    align: {
	      value: {
	        baseXY: [0, '100%'],
	        selfXY: [0, 0]
	      },
	      setter: function (val) {
	        if (!val) {
	          return;
	        }
	        if (val.baseElement) {
	          this._specifiedBaseElement = true;
	        } else if (this.activeTrigger) {
	          // 若给的定位元素未指定基准元素
	          // 就给一个...
	          val.baseElement = this.activeTrigger;
	        }
	        return val;
	      },
	      getter: function (val) {
	        // 若未指定基准元素，则按照当前的触发元素进行定位
	        return $.extend({}, val, this._specifiedBaseElement ? {} : {
	          baseElement: this.activeTrigger
	        });
	      }
	    },

	    // 延迟触发和隐藏时间
	    delay: 70,

	    // 是否能够触发
	    // 可以通过set('disabled', true)关闭
	    disabled: false,

	    // 基本的动画效果，可选 fade|slide
	    effect: '',

	    // 动画的持续时间
	    duration: 250

	  },

	  setup: function () {
	    Popup.superclass.setup.call(this);
	    this._bindTrigger();
	    this._blurHide(this.get('trigger'));

	    // 默认绑定activeTrigger为第一个元素
	    // for https://github.com/aralejs/popup/issues/6
	    this.activeTrigger = this.get('trigger').eq(0);

	    // 当使用委托事件时，_blurHide 方法对于新添加的节点会失效
	    // 这时需要重新绑定
	    var that = this;
	    if (this.get('delegateNode')) {
	      this.before('show', function () {
	        that._relativeElements = that.get('trigger');
	        that._relativeElements.push(that.element);
	      });
	    }
	  },

	  render: function () {
	    Popup.superclass.render.call(this);

	    // 通过 template 生成的元素默认也应该是不可见的
	    // 所以插入元素前强制隐藏元素，#20
	    this.element.hide();
	    return this;
	  },

	  show: function () {
	    if (this.get('disabled')) {
	      return;
	    }
	    return Popup.superclass.show.call(this);
	  },

	  // triggerShimSync 为 true 时
	  // 表示什么都不做，只是触发 hide 的 before/after 绑定方法
	  hide: function (triggerShimSync) {
	    if (!triggerShimSync) {
	      return Popup.superclass.hide.call(this);
	    }
	    return this;
	  },

	  _bindTrigger: function () {
	    var triggerType = this.get('triggerType');

	    if (triggerType === 'click') {
	      this._bindClick();
	    } else if (triggerType === 'focus') {
	      this._bindFocus();
	    } else {
	      // 默认是 hover
	      this._bindHover();
	    }
	  },

	  _bindClick: function () {
	    var that = this;

	    bindEvent('click', this.get('trigger'), function (e) {
	      // this._active 这个变量表明了当前触发元素是激活状态
	      if (this._active === true) {
	        that.hide();
	      } else {
	        // 将当前trigger标为激活状态
	        makeActive(this);
	        that.show();
	      }
	    }, this.get('delegateNode'), this);

	    // 隐藏前清空激活状态
	    this.before('hide', function () {
	      makeActive();
	    });

	    // 处理所有trigger的激活状态
	    // 若 trigger 为空，相当于清除所有元素的激活状态
	    function makeActive(trigger) {
	      if (that.get('disabled')) {
	        return;
	      }
	      that.get('trigger').each(function (i, item) {
	        if (trigger == item) {
	          item._active = true;
	          // 标识当前点击的元素
	          that.activeTrigger = $(item);
	        } else {
	          item._active = false;
	        }
	      });
	    }
	  },

	  _bindFocus: function () {
	    var that = this;

	    bindEvent('focus', this.get('trigger'), function () {
	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      that.show();
	    }, this.get('delegateNode'), this);

	    bindEvent('blur', this.get('trigger'), function () {
	      var blurTrigger = this;
	      setTimeout(function () {
	        // 当 blur 的触发元素和当前的 activeTrigger 一样时才能干掉
	        // 修复 https://github.com/aralejs/popup/issues/27
	        if (!that._downOnElement && that.activeTrigger[0] === blurTrigger) {
	          that.hide();
	        }
	        that._downOnElement = false;
	      }, that.get('delay'));
	    }, this.get('delegateNode'), this);

	    // 为了当input blur时能够选择和操作弹出层上的内容
	    this.delegateEvents("mousedown", function (e) {
	      this._downOnElement = true;
	    });
	  },

	  _bindHover: function () {
	    var trigger = this.get('trigger');
	    var delegateNode = this.get('delegateNode');
	    var delay = this.get('delay');

	    var showTimer, hideTimer;
	    var that = this;

	    // 当 delay 为负数时
	    // popup 变成 tooltip 的效果
	    if (delay < 0) {
	      this._bindTooltip();
	      return;
	    }

	    bindEvent('mouseenter', trigger, function () {
	      clearTimeout(hideTimer);
	      hideTimer = null;

	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      showTimer = setTimeout(function () {
	        that.show();
	      }, delay);
	    }, delegateNode, this);

	    bindEvent('mouseleave', trigger, leaveHandler, delegateNode, this);

	    // 鼠标在悬浮层上时不消失
	    this.delegateEvents("mouseenter", function () {
	      clearTimeout(hideTimer);
	    });
	    this.delegateEvents("mouseleave", leaveHandler);

	    this.element.on('mouseleave', 'select', function (e) {
	      e.stopPropagation();
	    });

	    function leaveHandler(e) {
	      clearTimeout(showTimer);
	      showTimer = null;

	      if (that.get('visible')) {
	        hideTimer = setTimeout(function () {
	          that.hide();
	        }, delay);
	      }
	    }
	  },

	  _bindTooltip: function () {
	    var trigger = this.get('trigger');
	    var delegateNode = this.get('delegateNode');
	    var that = this;

	    bindEvent('mouseenter', trigger, function () {
	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      that.show();
	    }, delegateNode, this);

	    bindEvent('mouseleave', trigger, function () {
	      that.hide();
	    }, delegateNode, this);
	  },

	  _onRenderVisible: function (val, originVal) {
	    // originVal 为 undefined 时不继续执行
	    if (val === !!originVal) {
	      return;
	    }

	    var fade = (this.get('effect').indexOf('fade') !== -1);
	    var slide = (this.get('effect').indexOf('slide') !== -1);
	    var animConfig = {};
	    slide && (animConfig.height = (val ? 'show' : 'hide'));
	    fade && (animConfig.opacity = (val ? 'show' : 'hide'));

	    // 需要在回调时强制调一下 hide
	    // 来触发 iframe-shim 的 sync 方法
	    // 修复 ie6 下 shim 未隐藏的问题
	    // visible 只有从 true 变为 false 时，才调用这个 hide
	    var that = this;
	    var hideComplete = val ?
	    function () {
	      that.trigger('animated');
	    } : function () {
	      // 参数 true 代表只是为了触发 shim 方法
	      that.hide(true);
	      that.trigger('animated');
	    };

	    if (fade || slide) {
	      this.element.stop(true, true).animate(animConfig, this.get('duration'), hideComplete).css({
	        'visibility': 'visible'
	      });
	    } else {
	      this.element[val ? 'show' : 'hide']();
	    }
	  }

	});

	module.exports = Popup;

	// 一个绑定事件的简单封装
	function bindEvent(type, element, fn, delegateNode, context) {
	  var hasDelegateNode = delegateNode && delegateNode[0];

	  context.delegateEvents(
	  hasDelegateNode ? delegateNode : element, hasDelegateNode ? type + " " + element.selector : type, function (e) {
	    fn.call(e.currentTarget, e);
	  });
	}


/***/ },

/***/ 65:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	* AJAX Upload ( http://valums.com/ajax-upload/ ) 
	* Copyright (c) Andrew Valums
	* Licensed under the MIT license 
	*/

	/**
	* Attaches event to a dom element.
	* @param {Element} el
	* @param type event name
	* @param fn callback This refers to the passed element
	*/

	(function (factory) {

	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
	        module.exports = factory();
	    }
	    else if (typeof Package !== 'undefined') {
	        AjaxUpload = factory();  // export for Meteor.js
	    }
	    else {
	        /* jshint sub:true */
	        window['AjaxUpload'] = factory();
	    }
	})(function () {

	    function addEvent(el, type, fn) {
	        if (el.addEventListener) {
	            el.addEventListener(type, fn, false);
	        } else if (el.attachEvent) {
	            el.attachEvent('on' + type, function () {
	                fn.call(el);
	            });
	        } else {
	            throw new Error('not supported or DOM not loaded');
	        }
	    }

	    /**
	    * Attaches resize event to a window, limiting
	    * number of event fired. Fires only when encounteres
	    * delay of 100 after series of events.
	    * 
	    * Some browsers fire event multiple times when resizing
	    * http://www.quirksmode.org/dom/events/resize.html
	    * 
	    * @param fn callback This refers to the passed element
	    */
	    function addResizeEvent(fn) {
	        var timeout;

	        addEvent(window, 'resize', function () {
	            if (timeout) {
	                clearTimeout(timeout);
	            }
	            timeout = setTimeout(fn, 100);
	        });
	    }

	    // Needs more testing, will be rewriten for next version        
	    // getOffset function copied from jQuery lib (http://jquery.com/)
	    if (document.documentElement.getBoundingClientRect) {
	        // Get Offset using getBoundingClientRect
	        // http://ejohn.org/blog/getboundingclientrect-is-awesome/
	        var getOffset = function (el) {
	            var box = el.getBoundingClientRect();
	            var doc = el.ownerDocument;
	            var body = doc.body;
	            var docElem = doc.documentElement; // for ie 
	            var clientTop = docElem.clientTop || body.clientTop || 0;
	            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

	            // In Internet Explorer 7 getBoundingClientRect property is treated as physical,
	            // while others are logical. Make all logical, like in IE8.	
	            var zoom = 1;
	            if (body.getBoundingClientRect) {
	                var bound = body.getBoundingClientRect();
	                zoom = (bound.right - bound.left) / body.clientWidth;
	            }

	            if (zoom > 1) {
	                clientTop = 0;
	                clientLeft = 0;
	            }

	            var top = box.top / zoom + (window.pageYOffset || docElem && docElem.scrollTop / zoom || body.scrollTop / zoom) - clientTop, left = box.left / zoom + (window.pageXOffset || docElem && docElem.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;

	            return {
	                top: top,
	                left: left
	            };
	        };
	    } else {
	        // Get offset adding all offsets 
	        var getOffset = function (el) {
	            var top = 0, left = 0;
	            do {
	                top += el.offsetTop || 0;
	                left += el.offsetLeft || 0;
	                el = el.offsetParent;
	            } while (el);

	            return {
	                left: left,
	                top: top
	            };
	        };
	    }

	    /**
	    * Returns left, top, right and bottom properties describing the border-box,
	    * in pixels, with the top-left relative to the body
	    * @param {Element} el
	    * @return {Object} Contains left, top, right,bottom
	    */
	    function getBox(el) {
	        var left, right, top, bottom;
	        var offset = getOffset(el);
	        left = offset.left;
	        top = offset.top;

	        right = left + el.offsetWidth;
	        bottom = top + el.offsetHeight;

	        return {
	            left: left,
	            right: right,
	            top: top,
	            bottom: bottom
	        };
	    }

	    /**
	    * Helper that takes object literal
	    * and add all properties to element.style
	    * @param {Element} el
	    * @param {Object} styles
	    */
	    function addStyles(el, styles) {
	        for (var name in styles) {
	            if (styles.hasOwnProperty(name)) {
	                el.style[name] = styles[name];
	            }
	        }
	    }

	    /**
	    * Function places an absolutely positioned
	    * element on top of the specified element
	    * copying position and dimentions.
	    * @param {Element} from
	    * @param {Element} to
	    */
	    function copyLayout(from, to) {
	        var box = getBox(from);

	        addStyles(to, {
	            position: 'absolute',
	            left: box.left + 'px',
	            top: box.top + 'px',
	            width: from.offsetWidth + 'px',
	            height: from.offsetHeight + 'px'
	        });
	    }

	    /**
	    * Creates and returns element from html chunk
	    * Uses innerHTML to create an element
	    */
	    var toElement = (function () {
	        var div = document.createElement('div');
	        return function (html) {
	            div.innerHTML = html;
	            var el = div.firstChild;
	            return div.removeChild(el);
	        };
	    })();

	    /**
	    * Function generates unique id
	    * @return unique id 
	    */
	    var getUID = (function () {
	        var id = 0;
	        return function () {
	            return 'ValumsAjaxUpload' + id++;
	        };
	    })();

	    /**
	    * Get file name from path
	    * @param {String} file path to file
	    * @return filename
	    */
	    function fileFromPath(file) {
	        return file.replace(/.*(\/|\\)/, "");
	    }

	    /**
	    * Get file extension lowercase
	    * @param {String} file name
	    * @return file extenstion
	    */
	    function getExt(file) {
	        return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
	    }

	    function hasClass(el, name) {
	        var re = new RegExp('\\b' + name + '\\b');
	        return re.test(el.className);
	    }
	    function addClass(el, name) {
	        if (!hasClass(el, name)) {
	            el.className += ' ' + name;
	        }
	    }
	    function removeClass(el, name) {
	        var re = new RegExp('\\b' + name + '\\b');
	        el.className = el.className.replace(re, '');
	    }

	    function removeNode(el) {
	        el.parentNode.removeChild(el);
	    }

	    /**
	    * Easy styling and uploading
	    * @constructor
	    * @param button An element you want convert to 
	    * upload button. Tested dimentions up to 500x500px
	    * @param {Object} options See defaults below.
	    */
	    window.AjaxUpload = function (button, options) {
	        this._settings = {
	            // Location of the server-side upload script
	            action: 'upload.php',
	            // File upload name
	            name: 'userfile',
	            // Select & upload multiple files at once FF3.6+, Chrome 4+
	            multiple: false,
	            // Additional data to send
	            data: {},
	            // Submit file as soon as it's selected
	            autoSubmit: true,
	            // The type of data that you're expecting back from the server.
	            // html and xml are detected automatically.
	            // Only useful when you are using json data as a response.
	            // Set to "json" in that case. 
	            responseType: false,
	            // Class applied to button when mouse is hovered
	            hoverClass: 'hover',
	            // Class applied to button when button is focused
	            focusClass: 'focus',
	            // Class applied to button when AU is disabled
	            disabledClass: 'disabled',
	            // When user selects a file, useful with autoSubmit disabled
	            // You can return false to cancel upload			
	            onChange: function (file, extension) {
	            },
	            // Callback to fire before file is uploaded
	            // You can return false to cancel upload
	            onSubmit: function (file, extension) {
	            },
	            // Fired when file upload is completed
	            // WARNING! DO NOT USE "FALSE" STRING AS A RESPONSE!
	            onComplete: function (file, response) {
	            },
	            onError: function(file, response){}
	        };

	        // Merge the users options with our defaults
	        for (var i in options) {
	            if (options.hasOwnProperty(i)) {
	                this._settings[i] = options[i];
	            }
	        }

	        // button isn't necessary a dom element
	        if (button.jquery) {
	            // jQuery object was passed
	            button = button[0];
	        } else if (typeof button == "string") {
	            if (/^#.*/.test(button)) {
	                // If jQuery user passes #elementId don't break it					
	                button = button.slice(1);
	            }

	            button = document.getElementById(button);
	        }

	        if (!button || button.nodeType !== 1) {
	            throw new Error("Please make sure that you're passing a valid element");
	        }

	        if (button.nodeName.toUpperCase() == 'A') {
	            // disable link                       
	            addEvent(button, 'click', function (e) {
	                if (e && e.preventDefault) {
	                    e.preventDefault();
	                } else if (window.event) {
	                    window.event.returnValue = false;
	                }
	            });
	        }

	        // DOM element
	        this._button = button;
	        // DOM element                 
	        this._input = null;
	        // If disabled clicking on button won't do anything
	        this._disabled = false;

	        // if the button was disabled before refresh if will remain
	        // disabled in FireFox, let's fix it
	        this.enable();

	        this._rerouteClicks();
	    };

	    // assigning methods to our class
	    AjaxUpload.prototype = {
	        setData: function (data) {
	            this._settings.data = data;
	        },
	        disable: function () {
	            addClass(this._button, this._settings.disabledClass);
	            this._disabled = true;

	            var nodeName = this._button.nodeName.toUpperCase();
	            if (nodeName == 'INPUT' || nodeName == 'BUTTON') {
	                this._button.setAttribute('disabled', 'disabled');
	            }

	            // hide input
	            if (this._input) {
	                if (this._input.parentNode) {
	                    // We use visibility instead of display to fix problem with Safari 4
	                    // The problem is that the value of input doesn't change if it 
	                    // has display none when user selects a file
	                    this._input.parentNode.style.visibility = 'hidden';
	                }
	            }
	        },
	        enable: function () {
	            removeClass(this._button, this._settings.disabledClass);
	            this._button.removeAttribute('disabled');
	            this._disabled = false;

	        },
	        /**
	        * Creates invisible file input 
	        * that will hover above the button
	        * <div><input type='file' /></div>
	        */
	        _createInput: function () {
	            var self = this;

	            var input = document.createElement("input");
	            input.setAttribute('type', 'file');
	            input.setAttribute('title', this._settings.title);
	            input.setAttribute('name', this._settings.name);
	            if (this._settings.multiple) input.setAttribute('multiple', 'multiple');

	            addStyles(input, {
	                'position': 'absolute',
	                // in Opera only 'browse' button
	                // is clickable and it is located at
	                // the right side of the input
	                'right': 0,
	                'margin': 0,
	                'padding': 0,
	                'fontSize': '480px',
	                // in Firefox if font-family is set to
	                // 'inherit' the input doesn't work
	                'fontFamily': 'sans-serif',
	                'cursor': 'pointer'
	            });

	            var div = document.createElement("div");
	            addStyles(div, {
	                'display': 'block',
	                'position': 'absolute',
	                'overflow': 'hidden',
	                'margin': 0,
	                'padding': 0,
	                'opacity': 0,
	                // Make sure browse button is in the right side
	                // in Internet Explorer
	                'direction': 'ltr',
	                //Max zIndex supported by Opera 9.0-9.2
	                'zIndex': 2147483583
	            });

	            // Make sure that element opacity exists.
	            // Otherwise use IE filter            
	            if (div.style.opacity !== "0") {
	                if (typeof (div.filters) == 'undefined') {
	                    throw new Error('Opacity not supported by the browser');
	                }
	                div.style.filter = "alpha(opacity=0)";
	            }

	            addEvent(input, 'change', function () {

	                if (!input || input.value === '') {
	                    return;
	                }

	                // Get filename from input, required                
	                // as some browsers have path instead of it          
	                var file = fileFromPath(input.value);

	                if (false === self._settings.onChange.call(self, file, getExt(file))) {
	                    self._clearInput();
	                    return;
	                }

	                // Submit form when value is changed
	                if (self._settings.autoSubmit) {
	                    self.submit();
	                }
	            });

	            addEvent(input, 'mouseover', function () {
	                addClass(self._button, self._settings.hoverClass);
	            });

	            addEvent(input, 'mouseout', function () {
	                removeClass(self._button, self._settings.hoverClass);
	                removeClass(self._button, self._settings.focusClass);

	                if (input.parentNode) {
	                    // We use visibility instead of display to fix problem with Safari 4
	                    // The problem is that the value of input doesn't change if it 
	                    // has display none when user selects a file
	                    input.parentNode.style.visibility = 'hidden';
	                }
	            });

	            addEvent(input, 'focus', function () {
	                addClass(self._button, self._settings.focusClass);
	            });

	            addEvent(input, 'blur', function () {
	                removeClass(self._button, self._settings.focusClass);
	            });

	            div.appendChild(input);
	            document.body.appendChild(div);

	            this._input = input;
	        },
	        _clearInput: function () {
	            if (!this._input) {
	                return;
	            }

	            // this._input.value = ''; Doesn't work in IE6                               
	            removeNode(this._input.parentNode);
	            this._input = null;
	            this._createInput();

	            removeClass(this._button, this._settings.hoverClass);
	            removeClass(this._button, this._settings.focusClass);
	        },
	        /**
	        * Function makes sure that when user clicks upload button,
	        * the this._input is clicked instead
	        */
	        _rerouteClicks: function () {
	            var self = this;

	            // IE will later display 'access denied' error
	            // if you use using self._input.click()
	            // other browsers just ignore click()

	            addEvent(self._button, 'mouseover', function () {
	                if (self._disabled) {
	                    return;
	                }

	                if (!self._input) {
	                    self._createInput();
	                }

	                var div = self._input.parentNode;
	                copyLayout(self._button, div);
	                div.style.visibility = 'visible';

	            });


	            // commented because we now hide input on mouseleave
	            /**
	            * When the window is resized the elements 
	            * can be misaligned if button position depends
	            * on window size
	            */
	            //addResizeEvent(function(){
	            //    if (self._input){
	            //        copyLayout(self._button, self._input.parentNode);
	            //    }
	            //});            

	        },
	        /**
	        * Creates iframe with unique name
	        * @return {Element} iframe
	        */
	        _createIframe: function () {
	            // We can't use getTime, because it sometimes return
	            // same value in safari :(
	            var id = getUID();

	            // We can't use following code as the name attribute
	            // won't be properly registered in IE6, and new window
	            // on form submit will open
	            // var iframe = document.createElement('iframe');
	            // iframe.setAttribute('name', id);                        

	            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
	            // src="javascript:false; was added
	            // because it possibly removes ie6 prompt 
	            // "This page contains both secure and nonsecure items"
	            // Anyway, it doesn't do any harm.            
	            iframe.setAttribute('id', id);

	            iframe.style.display = 'none';
	            document.body.appendChild(iframe);

	            return iframe;
	        },
	        /**
	        * Creates form, that will be submitted to iframe
	        * @param {Element} iframe Where to submit
	        * @return {Element} form
	        */
	        _createForm: function (iframe) {
	            var settings = this._settings;

	            // We can't use the following code in IE6
	            // var form = document.createElement('form');
	            // form.setAttribute('method', 'post');
	            // form.setAttribute('enctype', 'multipart/form-data');
	            // Because in this case file won't be attached to request                    
	            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');

	            form.setAttribute('action', settings.action);
	            form.setAttribute('target', iframe.name);
	            form.style.display = 'none';
	            document.body.appendChild(form);

	            // Create hidden input element for each data key
	            for (var prop in settings.data) {
	                if (settings.data.hasOwnProperty(prop)) {
	                    var el = document.createElement("input");
	                    el.setAttribute('type', 'hidden');
	                    el.setAttribute('name', prop);
	                    el.setAttribute('value', settings.data[prop]);
	                    form.appendChild(el);
	                }
	            }
	            return form;
	        },
	        /**
	        * Gets response from iframe and fires onComplete event when ready
	        * @param iframe
	        * @param file Filename to use in onComplete callback 
	        */
	        _getResponse: function (iframe, file) {
	            // getting response
	            var toDeleteFlag = false, self = this, settings = this._settings;

	            addEvent(iframe, 'load', function () {
	                if (// For Safari 
	                    iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" ||
	                // For FF, IE
	                    iframe.src == "javascript:'<html></html>';") {
	                    // First time around, do not delete.
	                    // We reload to blank page, so that reloading main page
	                    // does not re-submit the post.

	                    if (toDeleteFlag) {
	                        // Fix busy state in FF3
	                        setTimeout(function () {
	                            removeNode(iframe);
	                        }, 0);
	                    }

	                    return;
	                }

	                var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;

	                // fixing Opera 9.26,10.00
	                if (doc.readyState && doc.readyState != 'complete') {
	                    // Opera fires load event multiple times
	                    // Even when the DOM is not ready yet
	                    // this fix should not affect other browsers
	                    return;
	                }

	                // fixing Opera 9.64
	                if (doc.body && doc.body.innerHTML == "false") {
	                    // In Opera 9.64 event was fired second time
	                    // when body.innerHTML changed from false 
	                    // to server response approx. after 1 sec
	                    return;
	                }

	                var response;

	                if (doc.XMLDocument) {
	                    // response is a xml document Internet Explorer property
	                    response = doc.XMLDocument;
	                } else if (doc.body) {

	                    // response is html document or plain text
	                    response = doc.body.innerHTML;
	                    
	                    // 添加error回调
	                    // 妈蛋，表单提交拿不到http状态码，这里根据返回的页面内容处理
	                    // 只针对当前ppg平台
	                    if(doc.body.firstChild.nodeName.toUpperCase() !== 'PRE' &&
	                        doc.body.firstChild.nextSibling){
	                        settings.onError.call(self, file, response);
	                        return;
	                    }

	                    if (settings.responseType && settings.responseType.toLowerCase() == 'json') {
	                        // If the document was sent as 'application/javascript' or
	                        // 'text/javascript', then the browser wraps the text in a <pre>
	                        // tag and performs html encoding on the contents.  In this case,
	                        // we need to pull the original text content from the text node's
	                        // nodeValue property to retrieve the unmangled content.
	                        // Note that IE6 only understands text/html
	                        if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
	                            doc.normalize();
	                            response = doc.body.firstChild.firstChild.nodeValue;
	                        }

	                        if (response) {
	                            response = eval("(" + response + ")");
	                        } else {
	                            response = {};
	                        }
	                    }
	                } else {
	                    // response is a xml document
	                    response = doc;
	                }

	                settings.onComplete.call(self, file, response);

	                // Reload blank page, so that reloading main page
	                // does not re-submit the post. Also, remember to
	                // delete the frame
	                toDeleteFlag = true;

	                // Fix IE mixed content issue
	                iframe.src = "javascript:'<html></html>';";
	            });
	        },
	        /**
	        * Upload file contained in this._input
	        */
	        submit: function () {
	            var self = this, settings = this._settings;

	            if (!this._input || this._input.value === '') {
	                return;
	            }

	            var file = fileFromPath(this._input.value);

	            // user returned false to cancel upload
	            if (false === settings.onSubmit.call(this, file, getExt(file))) {
	                this._clearInput();
	                return;
	            }

	            // sending request    
	            var iframe = this._createIframe();
	            var form = this._createForm(iframe);

	            // assuming following structure
	            // div -> input type='file'
	            removeNode(this._input.parentNode);
	            removeClass(self._button, self._settings.hoverClass);
	            removeClass(self._button, self._settings.focusClass);

	            form.appendChild(this._input);

	            form.submit();

	            // request set, clean up                
	            removeNode(form); form = null;
	            removeNode(this._input); this._input = null;

	            // Get response from iframe and fire onComplete event when ready
	            this._getResponse(iframe, file);

	            // get ready for next request            
	            this._createInput();
	        }
	    };

	    return AjaxUpload;

	});



/***/ },

/***/ 67:
/***/ function(module, exports) {

	// Cookie
	// -------------
	// Thanks to:
	//  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
	//  - http://developer.yahoo.com/yui/3/cookie/


	var Cookie = exports;

	var decode = decodeURIComponent;
	var encode = encodeURIComponent;


	/**
	 * Returns the cookie value for the given name.
	 *
	 * @param {String} name The name of the cookie to retrieve.
	 *
	 * @param {Function|Object} options (Optional) An object containing one or
	 *     more cookie options: raw (true/false) and converter (a function).
	 *     The converter function is run on the value before returning it. The
	 *     function is not used if the cookie doesn't exist. The function can be
	 *     passed instead of the options object for conveniently. When raw is
	 *     set to true, the cookie value is not URI decoded.
	 *
	 * @return {*} If no converter is specified, returns a string or undefined
	 *     if the cookie doesn't exist. If the converter is specified, returns
	 *     the value returned from the converter.
	 */
	Cookie.get = function(name, options) {
	    validateCookieName(name);

	    if (typeof options === 'function') {
	        options = { converter: options };
	    }
	    else {
	        options = options || {};
	    }

	    var cookies = parseCookieString(document.cookie, !options['raw']);
	    return (options.converter || same)(cookies[name]);
	};


	/**
	 * Sets a cookie with a given name and value.
	 *
	 * @param {string} name The name of the cookie to set.
	 *
	 * @param {*} value The value to set for the cookie.
	 *
	 * @param {Object} options (Optional) An object containing one or more
	 *     cookie options: path (a string), domain (a string),
	 *     expires (number or a Date object), secure (true/false),
	 *     and raw (true/false). Setting raw to true indicates that the cookie
	 *     should not be URI encoded before being set.
	 *
	 * @return {string} The created cookie string.
	 */
	Cookie.set = function(name, value, options) {
	    validateCookieName(name);

	    options = options || {};
	    var expires = options['expires'];
	    var domain = options['domain'];
	    var path = options['path'];

	    if (!options['raw']) {
	        value = encode(String(value));
	    }

	    var text = name + '=' + value;

	    // expires
	    var date = expires;
	    if (typeof date === 'number') {
	        date = new Date();
	        date.setDate(date.getDate() + expires);
	    }
	    if (date instanceof Date) {
	        text += '; expires=' + date.toUTCString();
	    }

	    // domain
	    if (isNonEmptyString(domain)) {
	        text += '; domain=' + domain;
	    }

	    // path
	    if (isNonEmptyString(path)) {
	        text += '; path=' + path;
	    }

	    // secure
	    if (options['secure']) {
	        text += '; secure';
	    }

	    document.cookie = text;
	    return text;
	};


	/**
	 * Removes a cookie from the machine by setting its expiration date to
	 * sometime in the past.
	 *
	 * @param {string} name The name of the cookie to remove.
	 *
	 * @param {Object} options (Optional) An object containing one or more
	 *     cookie options: path (a string), domain (a string),
	 *     and secure (true/false). The expires option will be overwritten
	 *     by the method.
	 *
	 * @return {string} The created cookie string.
	 */
	Cookie.remove = function(name, options) {
	    options = options || {};
	    options['expires'] = new Date(0);
	    return this.set(name, '', options);
	};


	function parseCookieString(text, shouldDecode) {
	    var cookies = {};

	    if (isString(text) && text.length > 0) {

	        var decodeValue = shouldDecode ? decode : same;
	        var cookieParts = text.split(/;\s/g);
	        var cookieName;
	        var cookieValue;
	        var cookieNameValue;

	        for (var i = 0, len = cookieParts.length; i < len; i++) {

	            // Check for normally-formatted cookie (name-value)
	            cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
	            if (cookieNameValue instanceof Array) {
	                try {
	                    cookieName = decode(cookieNameValue[1]);
	                    cookieValue = decodeValue(cookieParts[i]
	                            .substring(cookieNameValue[1].length + 1));
	                } catch (ex) {
	                    // Intentionally ignore the cookie -
	                    // the encoding is wrong
	                }
	            } else {
	                // Means the cookie does not have an "=", so treat it as
	                // a boolean flag
	                cookieName = decode(cookieParts[i]);
	                cookieValue = '';
	            }

	            if (cookieName) {
	                cookies[cookieName] = cookieValue;
	            }
	        }

	    }

	    return cookies;
	}


	// Helpers

	function isString(o) {
	    return typeof o === 'string';
	}

	function isNonEmptyString(s) {
	    return isString(s) && s !== '';
	}

	function validateCookieName(name) {
	    if (!isNonEmptyString(name)) {
	        throw new TypeError('Cookie name must be a non-empty string');
	    }
	}

	function same(s) {
	    return s;
	}


/***/ },

/***/ 71:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports


	// module
	exports.push([module.id, ".ui-autocomplete .ui-autocomplete-content {\n  padding: 10px;\n  background: #fff;\n  border: 1px solid #ddd; }\n\n.ui-autocomplete .ui-autocomplete-item {\n  padding: 0 5px;\n  line-height: 28px;\n  border-bottom: 1px solid #efefef;\n  cursor: pointer; }\n  .ui-autocomplete .ui-autocomplete-item:hover, .ui-autocomplete .ui-autocomplete-item.ui-autocomplete-item-hover {\n    background: #efefef; }\n\n.ui-autocomplete .ui-autocomplete-footer {\n  padding-top: 5px;\n  text-align: right;\n  color: #999; }\n  .ui-autocomplete .ui-autocomplete-footer strong {\n    color: #666; }\n", ""]);

	// exports


/***/ },

/***/ 73:
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(8);
	module.exports = (Handlebars['default'] || Handlebars).template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
	    var stack1;

	  return "      <li data-role=\"item\" class=\""
	    + container.escapeExpression(container.lambda((depths[1] != null ? depths[1].classPrefix : depths[1]), depth0))
	    + "-item\">\r\n        "
	    + ((stack1 = (helpers.include || (depth0 && depth0.include) || helpers.helperMissing).call(depth0 != null ? depth0 : {},{"name":"include","hash":{"parent":depths[1]},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
	    + "\r\n      </li>\r\n";
	},"2":function(container,depth0,helpers,partials,data) {
	    var stack1;

	  return ((stack1 = container.invokePartial(partials.html,depth0,{"name":"html","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
	},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
	    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

	  return "<div class=\""
	    + alias4(((helper = (helper = helpers.classPrefix || (depth0 != null ? depth0.classPrefix : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"classPrefix","hash":{},"data":data}) : helper)))
	    + "\">\r\n  <div class=\""
	    + alias4(((helper = (helper = helpers.classPrefix || (depth0 != null ? depth0.classPrefix : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"classPrefix","hash":{},"data":data}) : helper)))
	    + "-content\">\r\n"
	    + ((stack1 = container.invokePartial(partials.header,depth0,{"name":"header","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
	    + "    <ul data-role=\"items\">\r\n"
	    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
	    + "    </ul>\r\n"
	    + ((stack1 = container.invokePartial(partials.footer,depth0,{"name":"footer","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
	    + "  </div>\r\n</div>\r\n";
	},"usePartial":true,"useData":true,"useDepths":true});

/***/ },

/***/ 74:
/***/ function(module, exports) {

	module.exports = "<div class=\"ui-poptip\">\r\n    <div class=\"ui-poptip-shadow\">\r\n    <div class=\"ui-poptip-container\">\r\n        <div class=\"ui-poptip-arrow\">\r\n            <em></em>\r\n            <span></span>\r\n        </div>\r\n        <div class=\"ui-poptip-content\" data-role=\"content\">\r\n        </div>\r\n    </div>\r\n    </div>\r\n</div>\r\n";

/***/ },

/***/ 75:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(71);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(16)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/autoprefixer-loader/index.js!./../../../../node_modules/sass-loader/index.js!./autocomplete.scss", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/autoprefixer-loader/index.js!./../../../../node_modules/sass-loader/index.js!./autocomplete.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 80:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75);

	// var $ = require('jquery');
	var Base = __webpack_require__(14);
	var Overlay = __webpack_require__(13);
	var Templatable = __webpack_require__(10);

	var DataSource = Base.extend({

	    attrs: {
	        source: null,
	        type: 'array'
	    },

	    initialize: function(config) {
	        DataSource.superclass.initialize.call(this, config);

	        // 每次发送请求会将 id 记录到 callbacks 中，返回后会从中删除
	        // 如果 abort 会清空 callbacks，之前的请求结果都不会执行
	        this.id = 0;
	        this.callbacks = [];

	        var source = this.get('source');
	        if (isString(source)) {
	            this.set('type', 'url');
	        } else if ($.isArray(source)) {
	            this.set('type', 'array');
	        } else if ($.isPlainObject(source)) {
	            this.set('type', 'object');
	        } else if ($.isFunction(source)) {
	            this.set('type', 'function');
	        } else {
	            throw new Error('Source Type Error');
	        }
	    },

	    getData: function(query) {
	        return this['_get' + capitalize(this.get('type') || '') + 'Data'](query);
	    },

	    abort: function() {
	        this.callbacks = [];
	    },

	    // 完成数据请求，getData => done
	    _done: function(data) {
	        this.trigger('data', data);
	    },

	    _getUrlData: function(query) {
	        var that = this,
	            options;
	        var obj = {
	            query: query ? encodeURIComponent(query) : '',
	            timestamp: new Date().getTime()
	        };
	        var url = this.get('source').replace(/\{\{(.*?)\}\}/g, function(all, match) {
	            return obj[match];
	        });

	        var callbackId = 'callback_' + this.id++;
	        this.callbacks.push(callbackId);

	        if (/^(https?:\/\/)/.test(url)) {
	            options = {
	                dataType: 'jsonp'
	            };
	        } else {
	            options = {
	                dataType: 'json'
	            };
	        }
	        $.ajax(url, options).success(function(data) {
	            if ($.inArray(callbackId, that.callbacks) > -1) {
	                delete that.callbacks[callbackId];
	                that._done(data);
	            }
	        }).error(function() {
	            if ($.inArray(callbackId, that.callbacks) > -1) {
	                delete that.callbacks[callbackId];
	                that._done({});
	            }
	        });
	    },

	    _getArrayData: function() {
	        var source = this.get('source');
	        this._done(source);
	        return source;
	    },

	    _getObjectData: function() {
	        var source = this.get('source');
	        this._done(source);
	        return source;
	    },

	    _getFunctionData: function(query) {
	        var that = this,
	            func = this.get('source');

	        // 如果返回 false 可阻止执行
	        var data = func.call(this, query, done);
	        if (data) {
	            this._done(data);
	        }

	        function done(data) {
	            that._done(data);
	        }
	    }
	});

	// 转义正则关键字
	var keyword = /(\[|\[|\]|\^|\$|\||\(|\)|\{|\}|\+|\*|\?|\\)/g;
	var Filter = {
	    'default': function(data) {
	        return data;
	    },

	    'startsWith': function(data, query) {
	        query = query || '';
	        var result = [],
	            l = query.length,
	            reg = new RegExp('^' + escapeKeyword(query));

	        if (!l) return [];

	        $.each(data, function(index, item) {
	            var a, matchKeys = [item.value].concat(item.alias);

	            // 匹配 value 和 alias 中的
	            while (a = matchKeys.shift()) {
	                if (reg.test(a)) {
	                    // 匹配和显示相同才有必要高亮
	                    if (item.label === a) {
	                        item.highlightIndex = [
	                            [0, l]
	                        ];
	                    }
	                    result.push(item);
	                    break;
	                }
	            }
	        });
	        return result;
	    },


	    'stringMatch': function(data, query) {
	        query = query || '';
	        var result = [],
	            l = query.length;

	        if (!l) return [];

	        $.each(data, function(index, item) {
	            var a, matchKeys = [item.value].concat(item.alias);
	        
	            // 匹配 value 和 alias 中的
	            while (a = matchKeys.shift()) {
	                // 统一按小写匹配 add luohx
	                var lowerA = a.toLowerCase(),
	                    lowerQuery = query.toLowerCase();

	                // if (a.indexOf(query) > -1) {
	                if(lowerA.indexOf(lowerQuery) > -1) {
	                    // 匹配和显示相同才有必要高亮
	                    // if (item.label === a) {
	                    if (item.label.toLowerCase === lowerA) {
	                        item.highlightIndex = stringMatch(a, query);
	                    }
	                    result.push(item);
	                    break;
	                }
	            }
	        });
	        return result;
	    }
	};

	var lteIE9 = /\bMSIE [6789]\.0\b/.test(navigator.userAgent);
	var specialKeyCodeMap = {
	    9: 'tab',
	    27: 'esc',
	    37: 'left',
	    39: 'right',
	    13: 'enter',
	    38: 'up',
	    40: 'down'
	};

	var Input = Base.extend({

	    attrs: {
	        element: {
	            value: null,
	            setter: function(val) {
	                return $(val);
	            }
	        },
	        query: null,
	        delay: 100
	    },

	    initialize: function() {
	        Input.superclass.initialize.apply(this, arguments);

	        // bind events
	        this._bindEvents();

	        // init query
	        this.set('query', this.getValue());
	    },

	    focus: function() {
	        this.get('element').focus();
	    },

	    getValue: function() {
	        return this.get('element').val();
	    },

	    setValue: function(val, silent) {
	        this.get('element').val(val);
	        !silent && this._change();
	    },

	    destroy: function() {
	        Input.superclass.destroy.call(this);
	    },

	    _bindEvents: function() {
	        var timer, input = this.get('element');

	        input.attr('autocomplete', 'off').on('focus.autocomplete', wrapFn(this._handleFocus, this)).on('blur.autocomplete', wrapFn(this._handleBlur, this)).on('keydown.autocomplete', wrapFn(this._handleKeydown, this));

	        // IE678 don't support input event
	        // IE 9 does not fire an input event when the user removes characters from input filled by keyboard, cut, or drag operations.
	        if (!lteIE9) {
	            input.on('input.autocomplete', wrapFn(this._change, this));
	        } else {
	            var that = this,
	                events = ['keydown.autocomplete', 'keypress.autocomplete', 'cut.autocomplete', 'paste.autocomplete'].join(' ');

	            input.on(events, wrapFn(function(e) {
	                if (specialKeyCodeMap[e.which]) return;

	                clearTimeout(timer);
	                timer = setTimeout(function() {
	                    that._change.call(that, e);
	                }, this.get('delay'));
	            }, this));
	        }
	    },

	    _change: function() {
	        var newVal = this.getValue();
	        var oldVal = this.get('query');
	        var isSame = compare(oldVal, newVal);
	        var isSameExpectWhitespace = isSame ? (newVal.length !== oldVal.length) : false;

	        if (isSameExpectWhitespace) {
	            this.trigger('whitespaceChanged', oldVal);
	        }
	        if (!isSame) {
	            this.set('query', newVal);
	            this.trigger('queryChanged', newVal, oldVal);
	        }
	    },

	    _handleFocus: function(e) {
	        this.trigger('focus', e);
	    },

	    _handleBlur: function(e) {
	        this.trigger('blur', e);
	    },

	    _handleKeydown: function(e) {
	        var keyName = specialKeyCodeMap[e.which];
	        if (keyName) {
	            var eventKey = 'key' + ucFirst(keyName);
	            this.trigger(e.type = eventKey, e);
	        }
	    }
	});

	var IE678 = /\bMSIE [678]\.0\b/.test(navigator.userAgent);
	var template = __webpack_require__(73);

	var AutoComplete = Overlay.extend({

	    Implements: Templatable,

	    attrs: {
	        // 触发元素
	        trigger: null,
	        classPrefix: 'ui-select',
	        align: {
	            baseXY: [0, '100%']
	        },
	        submitOnEnter: true,
	        // 回车是否会提交表单
	        dataSource: { //数据源，支持 Array, URL, Object, Function
	            value: [],
	            getter: function(val) {
	                var that = this;
	                if ($.isFunction(val)) {
	                    return function() {
	                        return val.apply(that, arguments);
	                    };
	                }
	                return val;
	            }
	        },
	        locator: 'data',
	        // 输出过滤
	        filter: null,
	        disabled: false,
	        selectFirst: false,
	        delay: 100,
	        // 以下为模板相关
	        model: {
	            value: {
	                items: []
	            },
	            getter: function(val) {
	                val.classPrefix || (val.classPrefix = this.get('classPrefix'));
	                return val;
	            }
	        },
	        template: template,
	        footer: '',
	        header: '',
	        html: '{{{label}}}',
	        // 以下仅为组件使用
	        selectedIndex: null,
	        data: []
	    },

	    events: {
	        'mousedown [data-role=items]': '_handleMouseDown',
	        'click [data-role=item]': '_handleSelection',
	        'mouseenter [data-role=item]': '_handleMouseMove',
	        'mouseleave [data-role=item]': '_handleMouseMove'
	    },

	    templateHelpers: {
	        // 将匹配的高亮文字加上 hl 的样式
	        highlightItem: highlightItem,
	        include: include
	    },

	    parseElement: function() {
	        var that = this;
	        this.templatePartials || (this.templatePartials = {});
	        $.each(['header', 'footer', 'html'], function(index, item) {
	            that.templatePartials[item] = that.get(item);
	        });
	        AutoComplete.superclass.parseElement.call(this);
	    },

	    setup: function() {
	        AutoComplete.superclass.setup.call(this);

	        this._isOpen = false;
	        this._initInput(); // 初始化输入框
	        this._initDataSource(); // 初始化数据源
	        this._initFilter(); // 初始化过滤器
	        this._bindHandle(); // 绑定事件
	        this._blurHide([$(this.get('trigger'))]);
	        this._tweakAlignDefaultValue();

	        this.on('indexChanged', function(index) {
	            // scroll current item into view
	            //this.currentItem.scrollIntoView();
	            var containerHeight = parseInt(this.get('height'), 10);
	            if (!containerHeight) return;

	            var itemHeight = this.items.parent().height() / this.items.length,
	                itemTop = Math.max(0, itemHeight * (index + 1) - containerHeight);
	            this.element.children().scrollTop(itemTop);
	        });
	    },

	    show: function() {
	        this._isOpen = true;
	        // 无数据则不显示
	        if (this._isEmpty()) return;
	        AutoComplete.superclass.show.call(this);
	    },

	    hide: function() {
	        // 隐藏的时候取消请求或回调
	        if (this._timeout) clearTimeout(this._timeout);
	        this.dataSource.abort();
	        this._hide();
	    },

	    destroy: function() {
	        this._clear();
	        if (this.input) {
	            this.input.destroy();
	            this.input = null;
	        }
	        AutoComplete.superclass.destroy.call(this);
	    },


	    // Public Methods
	    // --------------
	    selectItem: function(index) {
	        if (this.items) {
	            if (index && this.items.length > index && index >= -1) {
	                this.set('selectedIndex', index);
	            }
	            this._handleSelection();
	        }
	    },

	    setInputValue: function(val) {
	        this.input.setValue(val);
	    },

	    // Private Methods
	    // ---------------

	    // 数据源返回，过滤数据
	    _filterData: function(data) {
	        var filter = this.get('filter'),
	            locator = this.get('locator');

	        // 获取目标数据
	        data = locateResult(locator, data);

	        // 进行过滤
	        data = filter.call(this, normalize(data), this.input.get('query'));

	        this.set('data', data);
	    },

	    // 通过数据渲染模板
	    _onRenderData: function(data) {
	        data || (data = []);

	        // 渲染下拉
	        this.set('model', {
	            items: data,
	            query: this.input.get('query'),
	            length: data.length
	        });

	        this.renderPartial();

	        // 初始化下拉的状态
	        this.items = this.$('[data-role=items]').children();

	        if (this.get('selectFirst')) {
	            this.set('selectedIndex', 0);
	        }

	        // 选中后会修改 input 的值并触发下一次渲染，但第二次渲染的结果不应该显示出来。
	        this._isOpen && this.show();
	    },

	    // 键盘控制上下移动
	    _onRenderSelectedIndex: function(index) {
	        var hoverClass = this.get('classPrefix') + '-item-hover';
	        this.items && this.items.removeClass(hoverClass);

	        // -1 什么都不选
	        if (index === -1) return;

	        this.items.eq(index).addClass(hoverClass);
	        this.trigger('indexChanged', index, this.lastIndex);
	        this.lastIndex = index;
	    },

	    // 初始化
	    // ------------
	    _initDataSource: function() {
	        this.dataSource = new DataSource({
	            source: this.get('dataSource')
	        });
	    },

	    _initInput: function() {
	        this.input = new Input({
	            element: this.get('trigger'),
	            delay: this.get('delay')
	        });
	    },

	    _initFilter: function() {
	        var filter = this.get('filter');
	        filter = initFilter(filter, this.dataSource);
	        this.set('filter', filter);
	    },

	    // 事件绑定
	    // ------------
	    _bindHandle: function() {
	        this.dataSource.on('data', this._filterData, this);

	        this.input.on('blur', this.hide, this).on('focus', this._handleFocus, this).on('keyEnter', this._handleSelection, this).on('keyEsc', this.hide, this).on('keyUp keyDown', this.show, this).on('keyUp keyDown', this._handleStep, this).on('queryChanged', this._clear, this).on('queryChanged', this._hide, this).on('queryChanged', this._handleQueryChange, this).on('queryChanged', this.show, this);

	        this.after('hide', function() {
	            this.set('selectedIndex', -1);
	        });

	        // 选中后隐藏浮层
	        this.on('itemSelected', function() {
	            this._hide();
	        });
	    },

	    // 选中的处理器
	    // 1. 鼠标点击触发
	    // 2. 回车触发
	    // 3. selectItem 触发
	    _handleSelection: function(e) {
	        if (!this.items) return;
	        var isMouse = e ? e.type === 'click' : false;
	        var index = isMouse ? this.items.index(e.currentTarget) : this.get('selectedIndex');
	        var item = this.items.eq(index);
	        var data = this.get('data')[index];

	        if (index >= 0 && item && data) {
	            this.input.setValue(data.target);
	            this.set('selectedIndex', index, {
	                silent: true
	            });

	            // 是否阻止回车提交表单
	            if (e && !isMouse && !this.get('submitOnEnter')) e.preventDefault();

	            this.trigger('itemSelected', data, item);
	        }
	    },

	    _handleFocus: function() {
	        this._isOpen = true;
	    },

	    _handleMouseMove: function(e) {
	        var hoverClass = this.get('classPrefix') + '-item-hover';
	        this.items.removeClass(hoverClass);
	        if (e.type === 'mouseenter') {
	            var index = this.items.index(e.currentTarget);
	            this.set('selectedIndex', index, {
	                silent: true
	            });
	            this.items.eq(index).addClass(hoverClass);
	        }
	    },

	    _handleMouseDown: function(e) {
	        if (IE678) {
	            var trigger = this.input.get('element')[0];
	            trigger.onbeforedeactivate = function() {
	                window.event.returnValue = false;
	                trigger.onbeforedeactivate = null;
	            };
	        }
	        e.preventDefault();
	    },

	    _handleStep: function(e) {
	        e.preventDefault();
	        this.get('visible') && this._step(e.type === 'keyUp' ? -1 : 1);
	    },

	    _handleQueryChange: function(val, prev) {
	        if (this.get('disabled')) return;

	        this.dataSource.abort();
	        this.dataSource.getData(val);
	    },

	    // 选项上下移动
	    _step: function(direction) {
	        var currentIndex = this.get('selectedIndex');
	        if (direction === -1) { // 反向
	            if (currentIndex > -1) {
	                this.set('selectedIndex', currentIndex - 1);
	            } else {
	                this.set('selectedIndex', this.items.length - 1);
	            }
	        } else if (direction === 1) { // 正向
	            if (currentIndex < this.items.length - 1) {
	                this.set('selectedIndex', currentIndex + 1);
	            } else {
	                this.set('selectedIndex', -1);
	            }
	        }
	    },

	    _clear: function() {
	        this.$('[data-role=items]').empty();
	        this.set('selectedIndex', -1);
	        delete this.items;
	        delete this.lastIndex;
	    },

	    _hide: function() {
	        this._isOpen = false;
	        AutoComplete.superclass.hide.call(this);
	    },

	    _isEmpty: function() {
	        var data = this.get('data');
	        return !(data && data.length > 0);
	    },

	    // 调整 align 属性的默认值
	    _tweakAlignDefaultValue: function() {
	        var align = this.get('align');
	        align.baseElement = this.get('trigger');
	        this.set('align', align);
	    }
	});


	function capitalize(str) {
	  return str.replace(/^([a-z])/, function (f, m) {
	    return m.toUpperCase();
	  });
	}

	function isString(str) {
	    return Object.prototype.toString.call(str) === '[object String]';
	}

	function isObject(obj) {
	    return Object.prototype.toString.call(obj) === '[object Object]';
	}

	function escapeKeyword(str) {
	    return (str || '').replace(keyword, '\\$1');
	}

	function stringMatch(matchKey, query) {
	    var r = [],
	        a = matchKey.split('');
	    var queryIndex = 0,
	        q = query.split('');
	    for (var i = 0, l = a.length; i < l; i++) {
	        var v = a[i];
	        if (v === q[queryIndex]) {
	            if (queryIndex === q.length - 1) {
	                r.push([i - q.length + 1, i + 1]);
	                queryIndex = 0;
	                continue;
	            }
	            queryIndex++;
	        } else {
	            queryIndex = 0;
	        }
	    }
	    return r;
	}

	function wrapFn(fn, context) {
	    return function() {
	        fn.apply(context, arguments);
	    };
	}

	function compare(a, b) {
	    a = (a || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
	    b = (b || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
	    return a === b;
	}

	function ucFirst(str) {
	    return str.charAt(0).toUpperCase() + str.substring(1);
	}

	// 通过 locator 找到 data 中的某个属性的值
	// 1. locator 支持 function，函数返回值为结果
	// 2. locator 支持 string，而且支持点操作符寻址
	//     data {
	//       a: {
	//         b: 'c'
	//       }
	//     }
	//     locator 'a.b'
	// 最后的返回值为 c

	function locateResult(locator, data) {
	    if (locator) {
	        if ($.isFunction(locator)) {
	            return locator.call(this, data);
	        } else if (!$.isArray(data) && isString(locator)) {
	            var s = locator.split('.'),
	                p = data;
	            while (s.length) {
	                var v = s.shift();
	                if (!p[v]) {
	                    break;
	                }
	                p = p[v];
	            }
	            return p;
	        }
	    }
	    return data;
	}

	// 标准格式，不匹配则忽略
	//
	//   {
	//     label: '', 显示的字段
	//     value: '', 匹配的字段
	//     target: '', input的最终值
	//     alias: []  其他匹配的字段
	//   }

	function normalize(data) {
	    var result = [];
	    $.each(data, function(index, item) {
	        if (isString(item)) {
	            result.push({
	                label: item,
	                value: item,
	                target: item,
	                alias: []
	            });
	        } else if (isObject(item)) {
	            if (!item.value && !item.label) return;
	            item.value || (item.value = item.label);
	            item.label || (item.label = item.value);
	            item.target || (item.target = item.label);
	            item.alias || (item.alias = []);
	            result.push(item);
	        }
	    });
	    return result;
	}

	// 初始化 filter
	// 支持的格式
	//   1. null: 使用默认的 startsWith
	//   2. string: 从 Filter 中找，如果不存在则用 default
	//   3. function: 自定义

	function initFilter(filter, dataSource) {
	    // 字符串
	    if (isString(filter)) {
	        // 从组件内置的 FILTER 获取
	        if (Filter[filter]) {
	            filter = Filter[filter];
	        } else {
	            filter = Filter['default'];
	        }
	    }
	    // 非函数为默认值
	    else if (!$.isFunction(filter)) {
	        // 异步请求的时候不需要过滤器
	        if (dataSource.get('type') === 'url') {
	            filter = Filter['default'];
	        } else {
	            filter = Filter['startsWith'];
	        }
	    }
	    return filter;
	}

	function include(options) {
	    var context = {};

	    mergeContext(this);
	    mergeContext(options.hash);
	    return options.fn(context);

	    function mergeContext(obj) {
	        for (var k in obj) context[k] = obj[k];
	    }
	}

	function highlightItem(label) {
	    var index = this.highlightIndex,
	        classPrefix = this.parent ? this.parent.classPrefix : '',
	        cursor = 0,
	        v = label || this.label || '',
	        h = '';
	    if ($.isArray(index)) {
	        for (var i = 0, l = index.length; i < l; i++) {
	            var j = index[i],
	                start, length;
	            if ($.isArray(j)) {
	                start = j[0];
	                length = j[1] - j[0];
	            } else {
	                start = j;
	                length = 1;
	            }

	            if (start > cursor) {
	                h += v.substring(cursor, start);
	            }
	            if (start < v.length) {
	                var className = classPrefix ? ('class="' + classPrefix + '-item-hl"') : '';
	                h += '<span ' + className + '>' + v.substr(start, length) + '</span>';
	            }
	            cursor = start + length;
	            if (cursor >= v.length) {
	                break;
	            }
	        }
	        if (v.length > cursor) {
	            h += v.substring(cursor, v.length);
	        }
	        return h;
	    }
	    return v;
	}

	module.exports = AutoComplete;


/***/ },

/***/ 82:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Popup = __webpack_require__(51);

	// 依赖样式 alice/poptip@1.1.1
	// 转移至公共样式
	// require('./tip.scss');

	// 通用提示组件
	// 兼容站内各类样式
	var BasicTip = Popup.extend({

	    attrs: {
	        // 提示内容
	        content: null,

	        // 提示框在目标的位置方向 [up|down|left|right]
	        direction: 'up',

	        // 提示框离目标距离(px)
	        distance: 8,

	        // 箭头偏移位置(px)，负数表示箭头位置从最右边或最下边开始算
	        arrowShift: 22,

	        // 箭头指向 trigger 的水平或垂直的位置
	        pointPos: '50%'
	    },

	    _setAlign: function() {
	        var alignObject = {},
	            arrowShift = this.get('arrowShift'),
	            distance = this.get('distance'),
	            pointPos = this.get('pointPos'),
	            direction = this.get('direction');

	        if (arrowShift < 0) {
	            arrowShift = '100%' + arrowShift;
	        }

	        if (direction === 'up') {
	            alignObject.baseXY = [pointPos, 0];
	            alignObject.selfXY = [arrowShift, '100%+' + distance];
	        } else if (direction === 'down') {
	            alignObject.baseXY = [pointPos, '100%+' + distance];
	            alignObject.selfXY = [arrowShift, 0];
	        } else if (direction === 'left') {
	            alignObject.baseXY = [0, pointPos];
	            alignObject.selfXY = ['100%+' + distance, arrowShift];
	        } else if (direction === 'right') {
	            alignObject.baseXY = ['100%+' + distance, pointPos];
	            alignObject.selfXY = [0, arrowShift];
	        }

	        alignObject.comeFromArrowPosition = true;
	        this.set('align', alignObject);
	    },

	    // 用于 set 属性后的界面更新
	    _onRenderContent: function(val) {
	        var ctn = this.$('[data-role="content"]');
	        if (typeof val !== 'string') {
	            val = val.call(this);
	        }
	        ctn && ctn.html(val);
	    }

	});

	// 气泡提示弹出组件
	// ---
	var Tip = BasicTip.extend({

	    attrs: {
	        template: __webpack_require__(74),

	        // 提示内容
	        content: 'A TIP BOX',

	        // 箭头位置
	        // 按钟表点位置，目前支持1、2、5、7、10、11点位置
	        // https://i.alipayobjects.com/e/201307/jBty06lQT.png
	        arrowPosition: 7,

	        align: {
	            setter: function(val) {
	                // 用户初始化时主动设置了 align
	                // 且并非来自 arrowPosition 的设置
	                if (val && !val.comeFromArrowPosition) {
	                    this._specifiedAlign = true;
	                }
	                return val;
	            }
	        },

	        // 颜色 [yellow|blue|white]
	        theme: 'yellow',

	        // 当弹出层显示在屏幕外时，是否自动转换浮层位置
	        inViewport: false
	    },

	    setup: function() {
	        BasicTip.superclass.setup.call(this);
	        this._originArrowPosition = this.get('arrowPosition');

	        this.after('show', function() {
	            this._makesureInViewport();
	        });
	    },

	    _makesureInViewport: function() {
	        if (!this.get('inViewport')) {
	            return;
	        }
	        var ap = this._originArrowPosition,
	            scrollTop = $(window).scrollTop(),
	            viewportHeight = $(window).outerHeight(),
	            elemHeight = this.element.height() + this.get('distance'),
	            triggerTop = this.get('trigger').offset().top,
	            triggerHeight = this.get('trigger').height(),
	            arrowMap = {
	                '1': 5,
	                '5': 1,
	                '7': 11,
	                '11': 7
	            };

	        if ((ap == 11 || ap == 1) && (triggerTop + triggerHeight > scrollTop + viewportHeight - elemHeight)) {
	            // tip 溢出屏幕下方
	            this.set('arrowPosition', arrowMap[ap]);
	        } else if ((ap == 7 || ap == 5) && (triggerTop < scrollTop + elemHeight)) {
	            // tip 溢出屏幕上方
	            this.set('arrowPosition', arrowMap[ap]);
	        } else {
	            // 复原
	            this.set('arrowPosition', this._originArrowPosition);
	        }
	    },

	    // 用于 set 属性后的界面更新
	    _onRenderArrowPosition: function(val, prev) {
	        val = parseInt(val, 10);
	        var arrow = this.$('.ui-poptip-arrow');
	        arrow.removeClass('ui-poptip-arrow-' + prev).addClass('ui-poptip-arrow-' + val);

	        // 用户设置了 align
	        // 则直接使用 align 表示的位置信息，忽略 arrowPosition
	        if (this._specifiedAlign) {
	            return;
	        }

	        var direction = '',
	            arrowShift = 0;
	        if (val === 10) {
	            direction = 'right';
	            arrowShift = 20;
	        } else if (val === 11) {
	            direction = 'down';
	            arrowShift = 22;
	        } else if (val === 1) {
	            direction = 'down';
	            arrowShift = -22;
	        } else if (val === 2) {
	            direction = 'left';
	            arrowShift = 20;
	        } else if (val === 5) {
	            direction = 'up';
	            arrowShift = -22;
	        } else if (val === 7) {
	            direction = 'up';
	            arrowShift = 22;
	        }
	        this.set('direction', direction);
	        this.set('arrowShift', arrowShift);
	        this._setAlign();
	    },

	    _onRenderWidth: function(val) {
	        this.$('[data-role="content"]').css('width', val);
	    },

	    _onRenderHeight: function(val) {
	        this.$('[data-role="content"]').css('height', val);
	    },

	    _onRenderTheme: function(val, prev) {
	        this.element.removeClass('ui-poptip-' + prev);
	        this.element.addClass('ui-poptip-' + val);
	    }

	});

	module.exports = Tip;


/***/ },

/***/ 84:
/***/ function(module, exports) {

	/*
	 * jQuery File Download Plugin v1.4.4
	 *
	 * http://www.johnculviner.com
	 *
	 * Copyright (c) 2013 - John Culviner
	 *
	 * Licensed under the MIT license:
	 *   http://www.opensource.org/licenses/mit-license.php
	 *
	 * !!!!NOTE!!!!
	 * You must also write a cookie in conjunction with using this plugin as mentioned in the orignal post:
	 * http://johnculviner.com/jquery-file-download-plugin-for-ajax-like-feature-rich-file-downloads/
	 * !!!!NOTE!!!!
	 */

	(function($){
	    // i'll just put them here to get evaluated on script load
	    var htmlSpecialCharsRegEx = /[<>&\r\n"']/gm;
	    var htmlSpecialCharsPlaceHolders = {
	        '<': 'lt;',
	        '>': 'gt;',
	        '&': 'amp;',
	        '\r': "#13;",
	        '\n': "#10;",
	        '"': 'quot;',
	        "'": '#39;' /*single quotes just to be safe, IE8 doesn't support &apos;, so use &#39; instead */
	    };

	    $.extend({
	        //
	        //$.fileDownload('/path/to/url/', options)
	        //  see directly below for possible 'options'
	        fileDownload: function(fileUrl, options) {

	            //provide some reasonable defaults to any unspecified options below
	            var settings = $.extend({

	                //
	                //Requires jQuery UI: provide a message to display to the user when the file download is being prepared before the browser's dialog appears
	                //
	                preparingMessageHtml: null,

	                //
	                //Requires jQuery UI: provide a message to display to the user when a file download fails
	                //
	                failMessageHtml: null,

	                //
	                //the stock android browser straight up doesn't support file downloads initiated by a non GET: http://code.google.com/p/android/issues/detail?id=1780
	                //specify a message here to display if a user tries with an android browser
	                //if jQuery UI is installed this will be a dialog, otherwise it will be an alert
	                //Set to null to disable the message and attempt to download anyway
	                //
	                androidPostUnsupportedMessageHtml: "Unfortunately your Android browser doesn't support this type of file download. Please try again with a different browser.",

	                //
	                //Requires jQuery UI: options to pass into jQuery UI Dialog
	                //
	                dialogOptions: { modal: true },

	                //
	                //a function to call while the dowload is being prepared before the browser's dialog appears
	                //Args:
	                //  url - the original url attempted
	                //
	                prepareCallback: function(url) {},

	                //
	                //a function to call after a file download dialog/ribbon has appeared
	                //Args:
	                //  url - the original url attempted
	                //
	                successCallback: function(url) {},

	                //
	                //a function to call after a file download dialog/ribbon has appeared
	                //Args:
	                //  responseHtml    - the html that came back in response to the file download. this won't necessarily come back depending on the browser.
	                //                      in less than IE9 a cross domain error occurs because 500+ errors cause a cross domain issue due to IE subbing out the
	                //                      server's error message with a "helpful" IE built in message
	                //  url             - the original url attempted
	                //  error           - original error cautch from exception
	                //
	                failCallback: function(responseHtml, url, error) {},

	                //
	                // the HTTP method to use. Defaults to "GET".
	                //
	                httpMethod: "GET",

	                //
	                // if specified will perform a "httpMethod" request to the specified 'fileUrl' using the specified data.
	                // data must be an object (which will be $.param serialized) or already a key=value param string
	                //
	                data: null,

	                //
	                //a period in milliseconds to poll to determine if a successful file download has occured or not
	                //
	                checkInterval: 100,

	                //
	                //the cookie name to indicate if a file download has occured
	                //
	                cookieName: "fileDownload",

	                //
	                //the cookie value for the above name to indicate that a file download has occured
	                //
	                cookieValue: "true",

	                //
	                //the cookie path for above name value pair
	                //
	                cookiePath: "/",

	                //
	                //if specified it will be used when attempting to clear the above name value pair
	                //useful for when downloads are being served on a subdomain (e.g. downloads.example.com)
	                //
	                cookieDomain: null,

	                //
	                //the title for the popup second window as a download is processing in the case of a mobile browser
	                //
	                popupWindowTitle: "Initiating file download...",

	                //
	                //Functionality to encode HTML entities for a POST, need this if data is an object with properties whose values contains strings with quotation marks.
	                //HTML entity encoding is done by replacing all &,<,>,',",\r,\n characters.
	                //Note that some browsers will POST the string htmlentity-encoded whilst others will decode it before POSTing.
	                //It is recommended that on the server, htmlentity decoding is done irrespective.
	                //
	                encodeHTMLEntities: true

	            }, options);

	            var deferred = new $.Deferred();

	            //Setup mobile browser detection: Partial credit: http://detectmobilebrowser.com/
	            var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();

	            var isIos; //has full support of features in iOS 4.0+, uses a new window to accomplish this.
	            var isAndroid; //has full support of GET features in 4.0+ by using a new window. Non-GET is completely unsupported by the browser. See above for specifying a message.
	            var isOtherMobileBrowser; //there is no way to reliably guess here so all other mobile devices will GET and POST to the current window.

	            if (/ip(ad|hone|od)/.test(userAgent)) {

	                isIos = true;

	            } else if (userAgent.indexOf('android') !== -1) {

	                isAndroid = true;

	            } else {

	                isOtherMobileBrowser = /avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|playbook|silk|iemobile|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4));

	            }

	            var httpMethodUpper = settings.httpMethod.toUpperCase();

	            if (isAndroid && httpMethodUpper !== "GET" && settings.androidPostUnsupportedMessageHtml) {
	                //the stock android browser straight up doesn't support file downloads initiated by non GET requests: http://code.google.com/p/android/issues/detail?id=1780

	                if ($().dialog) {
	                    $("<div>").html(settings.androidPostUnsupportedMessageHtml).dialog(settings.dialogOptions);
	                } else {
	                    alert(settings.androidPostUnsupportedMessageHtml);
	                }

	                return deferred.reject();
	            }

	            var $preparingDialog = null;

	            var internalCallbacks = {

	                onPrepare: function(url) {

	                    //wire up a jquery dialog to display the preparing message if specified
	                    if (settings.preparingMessageHtml) {

	                        $preparingDialog = $("<div>").html(settings.preparingMessageHtml).dialog(settings.dialogOptions);

	                    } else if (settings.prepareCallback) {

	                        settings.prepareCallback(url);

	                    }

	                },

	                onSuccess: function(url) {

	                    //remove the perparing message if it was specified
	                    if ($preparingDialog) {
	                        $preparingDialog.dialog('close');
	                    }

	                    settings.successCallback(url);

	                    deferred.resolve(url);
	                },

	                onFail: function(responseHtml, url, error) {

	                    //remove the perparing message if it was specified
	                    if ($preparingDialog) {
	                        $preparingDialog.dialog('close');
	                    }

	                    //wire up a jquery dialog to display the fail message if specified
	                    if (settings.failMessageHtml) {
	                        $("<div>").html(settings.failMessageHtml).dialog(settings.dialogOptions);
	                    }

	                    settings.failCallback(responseHtml, url, error);

	                    deferred.reject(responseHtml, url);
	                }
	            };

	            internalCallbacks.onPrepare(fileUrl);

	            //make settings.data a param string if it exists and isn't already
	            if (settings.data !== null && typeof settings.data !== "string") {
	                settings.data = $.param(settings.data);
	            }


	            var $iframe,
	                downloadWindow,
	                formDoc,
	                $form;

	            if (httpMethodUpper === "GET") {

	                if (settings.data !== null) {
	                    //need to merge any fileUrl params with the data object

	                    var qsStart = fileUrl.indexOf('?');

	                    if (qsStart !== -1) {
	                        //we have a querystring in the url

	                        if (fileUrl.substring(fileUrl.length - 1) !== "&") {
	                            fileUrl = fileUrl + "&";
	                        }
	                    } else {

	                        fileUrl = fileUrl + "?";
	                    }

	                    fileUrl = fileUrl + settings.data;
	                }

	                if (isIos || isAndroid) {

	                    downloadWindow = window.open(fileUrl);
	                    downloadWindow.document.title = settings.popupWindowTitle;
	                    window.focus();

	                } else if (isOtherMobileBrowser) {

	                    window.location(fileUrl);

	                } else {

	                    //create a temporary iframe that is used to request the fileUrl as a GET request
	                    $iframe = $("<iframe>")
	                        .hide()
	                        .prop("src", fileUrl)
	                        .appendTo("body");
	                }

	            } else {

	                var formInnerHtml = "";

	                if (settings.data !== null) {

	                    $.each(settings.data.replace(/\+/g, ' ').split("&"), function() {

	                        var kvp = this.split("=");

	                        //Issue: When value contains sign '=' then the kvp array does have more than 2 items. We have to join value back
	                        var k = kvp[0];
	                        kvp.shift();
	                        var v = kvp.join("=");
	                        kvp = [k, v];

	                        var key = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[0])) : decodeURIComponent(kvp[0]);
	                        if (key) {
	                            var value = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[1])) : decodeURIComponent(kvp[1]);
	                            formInnerHtml += '<input type="hidden" name="' + key + '" value="' + value + '" />';
	                        }
	                    });
	                }

	                if (isOtherMobileBrowser) {

	                    $form = $("<form>").appendTo("body");
	                    $form.hide()
	                        .prop('method', settings.httpMethod)
	                        .prop('action', fileUrl)
	                        .html(formInnerHtml);

	                } else {

	                    if (isIos) {

	                        downloadWindow = window.open("about:blank");
	                        downloadWindow.document.title = settings.popupWindowTitle;
	                        formDoc = downloadWindow.document;
	                        window.focus();

	                    } else {

	                        $iframe = $("<iframe style='display: none' src='about:blank'></iframe>").appendTo("body");
	                        formDoc = getiframeDocument($iframe);
	                    }

	                    formDoc.write("<html><head></head><body><form method='" + settings.httpMethod + "' action='" + fileUrl + "'>" + formInnerHtml + "</form>" + settings.popupWindowTitle + "</body></html>");
	                    $form = $(formDoc).find('form');
	                }

	                $form.submit();
	            }


	            //check if the file download has completed every checkInterval ms
	            setTimeout(checkFileDownloadComplete, settings.checkInterval);


	            function checkFileDownloadComplete() {
	                //has the cookie been written due to a file download occuring?

	                var cookieValue = settings.cookieValue;
	                if (typeof cookieValue == 'string') {
	                    cookieValue = cookieValue.toLowerCase();
	                }

	                var lowerCaseCookie = settings.cookieName.toLowerCase() + "=" + cookieValue;

	                if (document.cookie.toLowerCase().indexOf(lowerCaseCookie) > -1) {

	                    //execute specified callback
	                    internalCallbacks.onSuccess(fileUrl);

	                    //remove cookie
	                    var cookieData = settings.cookieName + "=; path=" + settings.cookiePath + "; expires=" + new Date(0).toUTCString() + ";";
	                    if (settings.cookieDomain) cookieData += " domain=" + settings.cookieDomain + ";";
	                    document.cookie = cookieData;

	                    //remove iframe
	                    cleanUp(false);

	                    return;
	                }

	                //has an error occured?
	                //if neither containers exist below then the file download is occuring on the current window
	                if (downloadWindow || $iframe) {

	                    //has an error occured?
	                    try {

	                        var formDoc = downloadWindow ? downloadWindow.document : getiframeDocument($iframe);

	                        if (formDoc && formDoc.body !== null && formDoc.body.innerHTML.length) {

	                            var isFailure = true;

	                            if ($form && $form.length) {
	                                var $contents = $(formDoc.body).contents().first();

	                                try {
	                                    if ($contents.length && $contents[0] === $form[0]) {
	                                        isFailure = false;
	                                    }
	                                } catch (e) {
	                                    if (e && e.number == -2146828218) {
	                                        // IE 8-10 throw a permission denied after the form reloads on the "$contents[0] === $form[0]" comparison
	                                        isFailure = true;
	                                    } else {
	                                        throw e;
	                                    }
	                                }
	                            }

	                            if (isFailure) {
	                                // IE 8-10 don't always have the full content available right away, they need a litle bit to finish
	                                setTimeout(function() {
	                                    internalCallbacks.onFail(formDoc.body.innerHTML, fileUrl);
	                                    cleanUp(true);
	                                }, 100);

	                                return;
	                            }
	                        }
	                    } catch (err) {

	                        //500 error less than IE9
	                        internalCallbacks.onFail('', fileUrl, err);

	                        cleanUp(true);

	                        return;
	                    }
	                }


	                //keep checking...
	                setTimeout(checkFileDownloadComplete, settings.checkInterval);
	            }

	            //gets an iframes document in a cross browser compatible manner
	            function getiframeDocument($iframe) {
	                var iframeDoc = $iframe[0].contentWindow || $iframe[0].contentDocument;
	                if (iframeDoc.document) {
	                    iframeDoc = iframeDoc.document;
	                }
	                return iframeDoc;
	            }

	            function cleanUp(isFailure) {

	                setTimeout(function() {

	                    if (downloadWindow) {

	                        if (isAndroid) {
	                            downloadWindow.close();
	                        }

	                        if (isIos) {
	                            if (downloadWindow.focus) {
	                                downloadWindow.focus(); //ios safari bug doesn't allow a window to be closed unless it is focused
	                                if (isFailure) {
	                                    downloadWindow.close();
	                                }
	                            }
	                        }
	                    }

	                    //iframe cleanup appears to randomly cause the download to fail
	                    //not doing it seems better than failure...
	                    //if ($iframe) {
	                    //    $iframe.remove();
	                    //}

	                }, 0);
	            }


	            function htmlSpecialCharsEntityEncode(str) {
	                return str.replace(htmlSpecialCharsRegEx, function(match) {
	                    return '&' + htmlSpecialCharsPlaceHolders[match];
	                });
	            }
	            var promise = deferred.promise();
	            promise.abort = function() {
	                cleanUp();
	                $iframe.remove();
	            };
	            return promise;
	        }
	    });
	})(jQuery);

	if(typeof module != 'undefined' && typeof module.exports != 'undefined'){
	    module.exports = $ = jQuery; 
	}




/***/ }

});