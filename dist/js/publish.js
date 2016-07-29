webpackJsonp([18],{

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


	/**
	 * 商品刊登
	 */

	var Validator = __webpack_require__(47);
	var AutoComplete = __webpack_require__(80);
	var Sortable = __webpack_require__(209);
	var Popup = __webpack_require__(51);

	__webpack_require__(76);
	__webpack_require__(85);

	var PublishValidator = Validator.extend({
	    attrs: {
	        showMessage: function(message, element){
	            message = '<i class="iconfont">&#xe62e;</i><span class="ui-form-explain-text">' + message + '</span>';
	            
	            this.getExplain(element)
	                .html(message);

	            this.getItem(element).addClass(this.get('itemErrorClass'));
	        }
	    }
	});

	var publish = {
		index: function(){

			// itemDetail非null时为编辑模式
			// 编辑模式下不可搜索
			var $doc = $(document);

			var uploadWrap = $('#J_upload_wrap'),
				sortbox = $('#J_sortbox'),
				uploadPickerWrap = $('#J_picker_wrap'),
				uploadPicker = $('#J_picker'),
				labelWrap = $('#J_publish_labels'),
				labelNone = labelWrap.find('.tip-none'),
				labelNextEl = labelWrap.parent().next(),
				descArea = $('#product_textarea'),
				categoryPanel = $('#J_category_panel'),
				brandPanel = $('#J_brand_panel'),
				formItemCategory = $('.category'),
				brandListEl = $('#J_brand_setup'),
				productPhoto = $('#product_photo'),
				keywordEl = $('#product_keyword'),
				productPriceEl = $('#product_price'),
				productNameEl = $('#product_name'),
				productsAttrEl = $('#J_products_attr'),
				publishForm = $('#J_form_publish'),
				brankReadEl = $('#J_brand_read'),
				brandValueEl = $('#brand_value'),
				categoryReadEl= $('#J_category_text'),
				categoryValueEl = $('#category_value'),
				productItemcode = $('#product_itemcode'),
				productCfsStock = $('#product_cfs_stock'),
				stockView = $('#J_stock_view'),
				keywordInputEl = $('#product_keyword_input'),
				keywordBlock = $('#J_keyword_block'),
				queryInput = $('#J_publish_search'),
				queryLabel = queryInput.siblings('label'),
				descalExplain, 
				cfsTypeEl, 
				cfsValueEl, 
				volumeInput, 
				productVolumeEl,
				taxCategoryTrigger,
			    taxCategoryValue,
			    volLengthEl,
			    volWeightEl,
			    volHeightEl,
			    productWeightEl,
				moxieShim;

			var	sortItemWidth = uploadPickerWrap.width(),
				sortItemHeight = uploadPickerWrap.height(),
				isSeller = !!(supplierType === 2), // 入驻商
				isSelf = !!(supplierType === 1), // 自营
				sellerData = null,
				sortItemCount = 0,
				couterMax = 6,
				declarePrice = 0,
				propGroupSize = 0,
				panelVisable = false,
				hasStock = productCfsStock[0] ? true : false,
				isEditMode = !!itemDetail,
				isResetMode = !!(itemDetail && itemDetail.Id === 0),
				queryIdCache = [],
				keywordCache = [],
				propertyChoiceCache = [],
				brandListCache = '',
				inventory = '',
				queryAutoComplete,
				brandAutoComplete,
				editor, 
				publishTree, 
				publishTreeObj,
				taxTree,
				taxTreeObj,
				validator,
				brankPopup,
				categoryPopup,
				taxPopup;
			
			// console.log(zNodes)
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
					var self = this;
					var productPriceCache = '';

					if(isEditMode && itemDetail.Id > 0) {
						publishForm.parent().addClass('edit');
					}

					if(typeof errorMessage !== 'undefined' && errorMessage.length){
						showMessage(errorMessage, true);
					}

					sellerData = {
						// 业务模式
						bmodeItems: businessModel || [],
						// 发货地
						shipItems: shippingFroms || [],
						// 税率类别
						tax: taxCategoryTreeJson || [],
						// 原产地
						originplaces: orginPlaces || [],
						// 重量
						weight: '',
						// 体积
						volume: '',
						// 长
						volLength: '',
						// 宽
						volWeight: '',
						// 高
						volHeight: '',
						// 当前业务模式
						currentBmode: '',
						// 当前发货地
						currentShip: '',
						// 当前原产地
						currentOriginplace: '',
						// 当前税率
						currentTax: ''
					};

					if((isEditMode || isResetMode) && isSeller){
						// console.log(itemDetail)
						var hasVolume = !!itemDetail.Volume,
							vols = hasVolume && itemDetail.Volume.split('*');

						sellerData.weight = getObjValue(itemDetail, 'Weight');
						sellerData.volume = getObjValue(itemDetail, 'Volume');
						sellerData.volLength = hasVolume ? vols[0] : '';
						sellerData.volWeight = hasVolume ? vols[1] : '';
						sellerData.volHeight = hasVolume ? vols[2] : '';
						sellerData.currentBmode = itemDetail.BusinessModel;
						sellerData.currentShip = itemDetail.ShippingFromId;
						sellerData.currentOriginplace = itemDetail.OriginPlaceId;
						sellerData.currentTax = itemDetail.TaxCategoryId;
					}

					if(hasStock) {
						cfsTypeEl = $('#product_cfs_type');
						cfsValueEl = $('#product_cfs_num'); 
					}

					if(!isSeller){
						labelWrap.addClass('labels').closest('.ui-form-item', publishForm)
								.append('<div id="J_descalExplain" class="explain"><span class="ui-form-required">*</span><span class="ui-form-explain">请输入申报价</span></div>')
								.addClass('selected-items');
						descalExplain = $('#J_descalExplain');
					}
					
					// 表单的验证
					validator = new PublishValidator({
						element: '#J_form_publish',
						failSilently: true,
						onFormValidate: function(){
							
							validator.removeItem('#J_products_attr');
							
							// 获取规格值
							declarePrice = 0;

		                	if(isSelf){

		                		if(queryIdCache.length){
			                		var result = [],
			                			hasNull = false;

			                		labelWrap.find('.publish-item').each(function(){
			                			
			                			var $this = $(this),
			                				price = $this.find('.input').val();

			                			if($.trim(price) === '' && !isNaN(price)){
			                				hasNull = true;
			                				return false;
			                			}else{
			                				
			                				var info = $this.data('attr');

			                				info.DeclaredPrice = price;

			                				declarePrice += (price * info.Num);

			                				result.push(info);
			                			}
			                		});
			                		
			                		productsAttrEl.val(hasNull ? '' : JSON.stringify(result));

									validator.addItem({
										element: '#J_products_attr',
										required: true,
										rule: '',
										showMessage: function(){
											self.descalMessage('error', '请输入申报价');
										},
										hideMessage: function(){
											self.descalMessage('hide');
										}
									});
		                		}else{
			                		validator.addItem({
										element: '#J_products_attr',
										required: true,
										rule: '',
										showMessage: function(){
											self.descalMessage('error', '请选择商品');
										},
										hideMessage: function(){
											self.descalMessage('hide');
										}
									});
		                		}
		                	}
		                	// 获取属性值
		                	var productPropsEl = $('#J_product_props');
		                	if(productPropsEl[0]){

		                		var result = [];
		                		// var length = 0;

		                		productPropsEl.find('.prop-wrap').each(function(){
		                			var $input = $(this).find('.prop-input'),
		                				val = $.trim($input.val());

		                			// length += 1;

		                			if(val.length){

		                				var ids = $input.data('ids').split('|'),
		                					info = $input.data('info');

		                				var data = {
			                				NameID: ids[0],
			                				ValueID: ids[1],
			                				ValueText: val
		                				};
		                				if(info){
		                					data = info;
		                				}

			                			result.push(data);
		                			}
		                		});
		                		
		                		$('#J_props_result').val(result.length > 0 ? JSON.stringify(result) : '');
		                		// $('#J_props_result').val(result.length === length ? JSON.stringify(result) : '');
		                		// console.log($('#J_props_result').val())
		                	}
		                	
		                	// 获取上传图片的值
							self.updatePhotoValue();

							// 获取库存
							if(hasStock){
								// 1为入库、2为出库
								var cfsType = cfsTypeEl.val() * 1,
									elValue = cfsValueEl.val(),
									cfsValue = $.trim(elValue) === '' ? 0 : elValue;

								if(cfsType === 1){
									productCfsStock.val(cfsValue);
								}else if(cfsType === 2){
									productCfsStock.val(-cfsValue);
								}
							}

							// 获取关键词
							var kv = keywordInputEl.val();
							if(!keywordCache.length && $.trim(kv).length){
								keywordEl.val(kv.replace(/[\,\，]/g, ''));
							}else{
								keywordEl.val(keywordCache.join(','));
							}

							// 入驻商获取相应的值
							if(isSeller){
								// 获取体积
								var volumeVal = [];
								volumeInput.each(function(){
									var val = $(this).val();

									if(!$.trim(val).length && isNaN(val)){
										volumeVal = [];
										return false;
									}else{
										volumeVal.push(val);
									}
								});
								productVolumeEl.val(volumeVal.join('*'));
							}
						},
						onFormValidated: function(error, message, element){

							if(error){
								// console.log(message)
								var lastItem = message[message.length-1];
								
								// 取队列中最后一个(申报价)信息
								if(lastItem[0] && lastItem[2][0].id === 'J_products_attr'){
									scroll2there(lastItem[2].closest('.ui-form-item', publishForm));
								}else {

									for(var i = 0; i < message.length; i++){
										var item = message[i],
											elem = item[2],
											elemId = elem.get(0).id;

										if(item[0]){
											scroll2there(elem.closest('.ui-form-item', publishForm));
											break;
										}
									}
								}

								if(isSeller){
									// 标识体积中错误项
									self.clearFormItemError(volumeInput);
									volumeInput.each(function(){
										// console.log($(this).val())
										self.validVolume($(this));
									});								
								}
							}else{

								loading.show();
							}
						}
					});

					validator
						// 类别
						.addItem({
							element: '#category_value',
							required: true,
							rule: '',
							display: '类别',
							errormessageRequired: '请选择类别'
						})
						// 品牌
						.addItem({
							element: '#brand_value',
							required: true,
							rule: '',
							display: '品牌',
							errormessageRequired: '请选择品牌'
						})
						// 产品名称
						.addItem({
							element: '#product_name',
							required: true,
							rule: '',
							display: '产品名称'
						})
						// 价格
						.addItem({
							element: '#product_price',
							required: true,
							rule: 'number',
							display: '价格',
							onItemValidate: function(element){

								var value = element.val();
								declarePrice = 0;
								productPriceCache = '';

								if(queryIdCache.length){
									$('.publish-item').each(function(){
										var price = $(this).find('input.input').val(),
											count = $(this).find('.m-counter-count').text() * 1;

										if($.trim(price) === '' || isNaN(price)){
											price = 0;
										}

										declarePrice += (price*1) * count;
									});
								}

								if(value * 1 < declarePrice){
									element.val('');
									productPriceCache = value;
								}
							},
							onItemValidated: function(error, result, element){
								if(error && productPriceCache){
									element.val(productPriceCache);
								}
							},
							errormessageRequired: '请输入价格不能小于申报总价'
						})														
						// 关键词
						.addItem({
							element: '#product_keyword',
							required: true,
							rule: '',
							display: '关键词'
						})
						// 产品图片
						.addItem({
							element: '#product_photo',
							required: true,
							rule: '',
							display: '产品图片',
							errormessageRequired: '请上传产品图片'
						}) 
						// 产品描述
						.addItem({
							element: '#product_textarea',
							required: true,
							rule: '',
							display: '产品描述'
						});

					// 如果是入驻商，初始化时，创建一些附加项
					// if(isSeller){
					// 	// 如果是编辑模式，判断是否是已选品，是的话无需附加项
					// 	if((isResetMode || isEditMode) && itemDetail.ItemProducts === null){
					// 		self.createSettleItems();
					// 	}else if(!isEditMode){
					// 		self.createSettleItems();
					// 	}				
					// }
					if($('#product_cfs_num')[0]){
						validator.addItem({
							element: '#product_cfs_num',
							required: true,
							rule: 'number',
							errormessageRequired: '请输入出入库数量',
							display: '数量'
						});
					}
					
					// 非编辑模式下可用搜索
					if(isResetMode || !isEditMode){
						// 搜索查找初始化
						var QueryAutoComplete = AutoComplete.extend({
						    _isEmpty: function() {
						      return false;
						    }
						});
						queryAutoComplete = new QueryAutoComplete({
						    trigger: '#J_publish_search',
						    submitOnEnter: false,
						    selectFirst: true,
						    classPrefix: 'ui-autocomplete',
						    html: ['<div class="queryauto-item" data-pid="{{Id}}">',
						    		'<p class="title" title="{{Name}}">{{Name}}</p>',
						    		'<p class="info" title="业务模式:{{BusinessModelName}}&nbsp;发货地:{{ShippingFromName}}&nbsp;发货规格:{{DeliveryNum}}件一发&nbsp;库存类型:{{InventoryType}}">',
						    		'业务模式:{{BusinessModelName}}&nbsp;发货地:{{ShippingFromName}}&nbsp;发货规格:{{DeliveryNum}}件一发&nbsp;库存类型:{{InventoryType}}</p>',
						    	'</div>'].join(''),
						    dataSource: function(value, done){
						    	if(value.trim().length){
							    	$.ajax({
							    		url: '/Item/SearchProduct?keyword=' + value,
							    		success: function(data){
							    			if(data.length){
							    				var result = [];
								    			data.forEach(function(v){
								    				v.value = value;
								    				result.push(v);
								    			});
							    			
							    				done(result);
							    			}else{
							    				done([]);
							    				queryAutoComplete.hide();
							    			}
							    		},
							    		error: function(){
							    			done([]);
							    		}
							    	});					    		
						    	}
						    	return false;
						    }
						}).render();
						
						queryAutoComplete.element.addClass('query-dropdown');

						queryLabel.on('click', function(){
							queryInput.val('');
							$(this).html('&#xe62b;');
						});
					}

					// 品牌查找初始化 
					brandAutoComplete = new AutoComplete({
						trigger: '#brand_search',
					    submitOnEnter: false,
					    width: 300,
					    filter: 'stringMatch',
					    classPrefix: 'brand-autocomplete',
					    html: '<span class="item-text" data-id="{{Id}}">{{Name}}</span>',
					    dataSource: brandList ? brandList : []			
					}).render();

					// 生成品牌列表html
					if(brandList.length){
						var itemTpl = '';
						for(var i = 0; i < brandList.length; i++){
							var item = brandList[i];
							itemTpl += '<li data-role="item" class="brand-autocomplete-item">';
	        				itemTpl += '<span class="item-text" data-id="'+ item.Id +'">'+ item.Name +'</span>';
	      					itemTpl += '</li>';
						}

						brandListCache = itemTpl;
						brandListEl.html(itemTpl);
					}

					// 类别数据初始化
					publishTree = $.fn.zTree.init($('#J_category_list'), $.extend({}, zSetting, {
						callback: {
		                    // 点击选项时
		                    onClick: function(e, elemId, data, lv){
		                    	// console.log(data)
		                    	// console.log(data.id)
		                    	var currentItem = $('#' + data.tId);
								$('#J_category_text').text(data.name);
								$('#category_value').val(data.id);
								self.clearFormItemError(currentItem);
								categoryPopup.hide();
								self.queryProperty(data.id);
		                    }
						}
					}), zNodes);
					publishTreeObj = $.fn.zTree.getZTreeObj('J_category_list');
					
					var _isIE = PPG.utils.isLtIE10,
						isGtIE8 = !!(_isIE > 8);

					if(!_isIE || isGtIE8){
						// 拖动排序
						var sortable = Sortable.create(sortbox[0], {
						    animation: 300,
						    filter: '.remove',
						    draggable: '.upload-thumb-item',
						    // ghostClass: 'sortable-ghost',
						    // chosenClass: 'sortable-chosen',
						    // dataIdAttr: 'data-id',
						    // forceFallback: true,
						    // fallbackClass: 'fallback',
						    // fallbackOnBody: false,
						    onFilter: function(e){
						    	self.removePhoto($(e.item));
						    }
						});
					}else{
						// IE8不兼容另给提示，和删除操作
						sortbox.on('click', '.remove', function(e){
							var item = $(this).parent();
							self.removePhoto(item);
						});
					}

					// 商品描述编辑器
					editor = CKEDITOR.replace('Description', {
						on: {
							instanceReady: function(e){},
							focus: function(e){
								self.hideFormItemError('#product_textarea');
							},
							blur: function(e){
								var value = this.getData();
								descArea.val(value);
								if(!$.trim(value).length){
									// 这有点不妥
									self.validatorItemExecute('#product_textarea');
								}
							}
						}
					});

					// 非入驻，在编辑或重置时
					if(!isSeller && (isResetMode || isEditMode)){
						// 创建已选产品的内容
						// console.log(itemDetail)
						// inventory = itemDetail.ItemProducts[0].InventoryType;
		            	self.createPublishItem(itemDetail, 'reset');
					}

					// 创建入驻供应商的附加选项
					if(isSeller){
						labelWrap.addClass('single');

						self.createSettleItems();
						// 填充数据
						self.updateFormInfo(itemDetail);
					}

					this.bindEvent();

					if(_isIE){
						['#J_publish_search'].forEach(function(item){
							PPG.placeholder(item);
						});
					}
				},
				bindEvent: function(){
					var self = this;

					// 产品图片上传
		            var uploader = Qiniu.uploader({
		                runtimes: 'html5,flash,html4',    //上传模式,依次退化
		                browse_button: 'J_picker',       //上传选择的点选按钮，**必需**
		                uptoken_url: '/Member/GetUpToken', //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
		                // uptoken : '', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
		                unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
		                // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
		                domain: PPG.IMAGESERVER,   //bucket 域名，下载资源时用到，**必需**
		                get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
		                container: 'J_upload_wrap',           //上传区域DOM ID，默认是browser_button的父元素，
		                max_file_size: '100mb',           //最大文件体积限制
		                // flash_swf_url: 'http://120.76.41.193:8001/dist/js/plugins/qiniu/plupload/Moxie.swf',  //引入flash,相对路径
		                flash_swf_url: '/Resource/Moxie.swf',
		                max_retries: 3,                   //上传失败最大重试次数
		                dragdrop: true,                   //开启可拖曳上传
		                drop_element: 'J_upload_wrap',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
		                chunk_size: '4mb',                //分块上传时，每片的体积
		                auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
		                init: {
		                    FilesAdded: function(up, files) {
		                    	// console.log(up)
		                    	// 文件添加进队列后,处理相关的事情
		                    	// uploadPickerWrap.addClass('loading');

		                    },
		                    BeforeUpload: function(up, file) {
		                           // 每个文件上传前,处理相关的事情
		                           
		                    },
		                    UploadProgress: function(up, file) {
		                           // 每个文件上传时,处理相关的事情
		                           uploadPickerWrap.addClass('loading');
		                    },
		                    FileUploaded: function(up, file, info) {
		                    	var info = JSON.parse(info),
		                    		domain = up.getOption('domain');

	                           // 每个文件上传成功后,处理相关的事情
	                           // 其中 info 是文件上传成功后，服务端返回的json
	                        	var image = domain + info.key +'-W100H100';

		                        uploadPickerWrap.removeClass('loading');
		           
		            			// 添加图片信息
		            			self.createPhoto(info.key);

		            			self.hideFormItemError(sortbox);
		                    },
		                    Error: function(up, err, errTip) {
		                           //上传出错时,处理相关的事情
		                    },
		                    UploadComplete: function() {
		                    	// console.log('UploadComplete')
		                    	// console.log(arguments)
		                        //队列文件处理完毕后,处理相关的事情
		                    },
		                    filters: {
			                    max_file_size: '1mb',
			                    mime_types: [{
			                        title: "Image files ",
			                        extensions: "jpg,gif,png "
			                    }]
			                }
		                }
		            });
		            
		            uploader.bind('init', function(){
		            	moxieShim = $('.moxie-shim');
			            if(!sortItemCount){
			            	self.setUploadPickerPosition();
			            }
		            });

		            if(isResetMode || !isEditMode){
						// 选中搜索结果的某一项时
						queryAutoComplete.on('itemSelected', function(data){
							var pid = data.Id,
								type = data.InventoryType;
							// 记录第一个商品的库存类型
							// if(!queryIdCache.length){
							// 	inventory = type;
							// }
							// 没选过的产品才可添加(需求变更，商品只能选一个)
							// if(queryIdCache.indexOf(pid) === -1 && inventory === type){
							if(queryIdCache.indexOf(pid) === -1){
								$.ajax('/Item/GetProductDetail?id=' + data.Id)
									.success(function(res){
										
										if(res){
											var data = JSON.parse(res);
											
											labelWrap.find('.publish-item').remove();
			                				queryIdCache = [pid];

			                				stockView.show();
			                	
											self.createPublishItem(data);

											if(isSelf){
												self.descalMessage('show', '请输入申报价');	
											}

											// if(isSeller){
											// 	self.destroySettleItems();
											// }		
											queryInput.val(data.Name);
											queryLabel.html('&#xe629;');								
										}

									})
									.error(function(){
										alert('服务器繁忙，请重试');
									});						
							}else{
								// if(inventory !== type){
								// 	showMessage('所选商品的库存类型必须相同');
								// 	return false;
								// }

								// if(queryIdCache.indexOf(pid) > -1){
									showMessage('该商品已选择');
									return false;
								// }
							}
						});

						queryAutoComplete.input.on('queryChanged', function(query){
							if(!query){
								queryAutoComplete.hide();
							}
						});
		            }

					// 品牌输入框的值发生变化时，更新数据
					brandAutoComplete.input.on('queryChanged', function(query){
						if(query){
							brandListEl.html(brandAutoComplete.items);
						}else{
							brandListEl.html(brandListCache);
						}
					});
					brandAutoComplete.on('itemSelected', function(data){
						brandValueEl.val(data.Id);
						brankReadEl.text(data.Name);
						brandPanel.find('.read-text').text(data.Name);
						brankPopup.hide();
						brandAutoComplete.setInputValue('');
					});

					// 类别popup
					categoryPopup = new Popup({
						trigger: '#J_category_text',
						element: '#J_category_panel',
						triggerType: 'click'
					});

					// 品牌popup
					brankPopup = new Popup({
						trigger: '#J_brand_read',
						element: '#J_brand_panel',
						triggerType: 'click'
					});

					// 品牌选择
					$('.brand-list').delegate('li', 'click', function(e){
						e.stopPropagation();

						var $this = $(this),
							formItem = $this.closest('.ui-form-item', publishForm);

						formItem.find('.read-text').text($(e.target).text());
						self.clearFormItemError($this);
						brankPopup.hide();

						var id = $this.find('.item-text').data('id');
						$('#brand_value').val(id);
					});

					// 删除已选产品
					labelWrap.delegate('.remove', 'click', function(){
						var $this = $(this),
							pid = $this.data('pid');

						$this.closest('.publish-item', labelWrap).remove();

						var index = queryIdCache.indexOf(pid);
						queryIdCache.splice(index, 1);
						
						var queryedLength = queryIdCache.length;
						var confirmFill = function(){
							self.coverConfirm(function(){
								$.ajax('/Item/GetProductDetail?id=' + queryIdCache[0])
									.success(function(data){
										
										self.updateFormInfo(JSON.parse(data));
										self.executeUptateItems();
									})
									.error(function(){
										alert('服务器繁忙，请重试');
									});
							});
						};

						if(queryIdCache.length > 0){
							// (入驻供应商)每次选品都
							if(isSeller){
								confirmFill();
							// (自营)只剩一个已选产品时，表单更新为该产品的信息
							}else if(queryedLength === 1){
								confirmFill();
							}
						}else{
							inventory = '';
							labelNone.show();
							stockView.hide();
							descalExplain && descalExplain.removeClass('show');
							labelNextEl.removeClass('mt');
							validator.removeItem('#J_products_attr');

							// self.updateFormInfo(null);
							// if(isSeller){
							// 	self.createSettleItems();
							// }
						}
					});

					// 数量增减
					labelWrap.delegate('.m-counter-minus,.m-counter-plus', 'click', function(e){

	                    var target = $(e.target),
	                        classname = e.target.className,
	                        isMinus = classname.indexOf('minus') > -1,
	                        isPlus = classname.indexOf('plus') > -1,
	                        countElem = target.siblings('.m-counter-count'),
	                        numbText = target.closest('.panel').find('.numb'),
	                        currentCount = countElem.text() * 1;
	                    
	                    function update(n){
	                    	var item = target.closest('.publish-item');
	                    	var attrObj = item.data('attr');
	                    	
	                    	attrObj.Num = n;
	                    	item.data('attr', attrObj);
	                    }

	                    // 减
	                    if(isMinus){

	                        if(currentCount === 1){
	                            return false;
	                        }

	                        currentCount -= 1;
	                        // if(currentCount > couterMax){
	                        //     // showMaxTip(countTip);                            
	                        //     currentCount = couterMax;
	                        // }
	                        // if(currentCount <= 0){
	                        //     currentCount = 1;
	                        // }
	                    }

	                    // 加
	                    if(isPlus){

	                        // if(currentCount === couterMax){
	                        //     // showMaxTip(countTip);
	                        //     return false;
	                        // }

	                        currentCount += 1;
	                        // if(currentCount > couterMax){
	                        //     // showMaxTip(countTip);
	                        //     currentCount = couterMax;
	                        // }
	                    }

	                    countElem.text(currentCount);
	                    numbText.text(currentCount);
	                    update(currentCount);
	                });

	                // 关键词
	                keywordInputEl.on('keypress', function(e){
	                	
	                	var $this = $(this),
	                		val = $(this).val();

	                	if(e.keyCode === 13){

	                		if($.trim(val).length){
	                			var v = val.replace(/[\,\，]/g, '');
		                		keywordCache.push(v);
		                		self.createKeywordItem([v]);
		                		$this.val('');
		                		keywordBlock.show();
	                		}

	                		e.preventDefault();
	                	}
	                }).on('blur', function(){
	                	var val = $(this).val();

	                	if(!keywordCache.length && !$.trim(val).length){
	                		self.validatorItemExecute('#product_keyword');
	                	}
	                });

	                keywordBlock.delegate('i.del', 'click', function(){
	                	var $parent = $(this).parent(),
	                		val = $parent.data('val');

	                	var index = keywordCache.indexOf(val);

	                	keywordCache.splice(index, 1);

	                	$parent.remove();

	                	if(!keywordCache.length){
	                		keywordBlock.hide();
	                	}
	                });

			        // 申报价
			        var descalInput = labelWrap.find('.input');
			        if(descalInput[0]){
				        labelWrap.delegate('input.input', 'focus blur', function(e){
				        	if(e.type === 'focus'){
				        		self.descalMessage('clearError');
				        	}else{
				        		var val = $(this).val();
				        		if($.trim(val) === '' || isNaN(val)){
				        			self.descalMessage('error', '请输入申报价');
				        		}
				        	}
				        });		        	
			        }

	        		// 选属性单选项发生变化时进行检验
					var propInput = '[data-input="prop"]',
						propRadio = '[data-radio="prop"]';

					publishForm.on('change', propRadio, function(){
						var checkSize = publishForm.find(propRadio + ':checked').size();
						// if(checkSize === propGroupSize){
						if(checkSize > 0){
							// 全选后赋值(这里只是个已选标识，并不是所选的真实的值)
							$('#J_props_result').val('1');
							fns.validatorItemExecute('#J_props_result');
						}
					}).on('focusin focusout keyup', propInput, function(e){
						var $this = $(this),
							thisRadio = $this.parent().find('input[type="radio"]');
						
						if(e.type === 'focusin'){
							
							thisRadio.prop('checked', true);
						}else if(e.type === 'keyup'){
							thisRadio.data('text', $this.val());
						}
					});

					// 查看库存
					function compileProContent(data){
						// 3种模式(这里是根据后端返回值判断的，其实可以根据情况给`isWarnMode`、`isEditMode`相应的布尔值，不用依赖后端)
						// 0 上架操作(只能改价)、1库存操作(可改价、启用库存)、2查看(不可编辑)
						var tplData = {
							suggestPrice: data.SuggestPrice,
							avgUnitPrice: data.AvgUnitPrice,
							isEditStock: false,
							isEditPrice: false,
							isEditMode: false,
							products: []
						};

						$.each(data.ProductList, function(i, v){
							v.Images = v.Images.split(',')[0];
							tplData.products.push(v);
						});
						        
						return templatable.compile(self.tpl.proInfos, tplData);
					} 
					stockView.on('click', function(){
						var pid = $(this).data('id'),
							postData = {};
						if(pid && isEditMode){
							postData = {
								Id: pid
							};
						}else {
							var itemProducts = [];
							labelWrap.find('.publish-item').each(function(){
								var $this = $(this),
									attrs = $this.data('attr'),
									declaredPrice = $(this).find('.input').val();

								itemProducts.push({
									Num: attrs.Num,
									ProductCode: attrs.ProductCode,
									DeclaredPrice: declaredPrice ? declaredPrice : 0
								});
							});
							postData = {
								ItemProducts: itemProducts
							};
						}

						// console.log(postData)
						// debugger
						self.ajax('/Item/GetInventoryWarnResult', postData, function(res){
							var result = res.Result;
							ConfirmBox.show(compileProContent(result), null, {
								width: 800,
								onShow: function(){
									this.element.addClass('pro-dialog');
								}
							}, '库存明细：');
						});
					});
				},
				validVolume: function(input){
					var $this = input,
						$parent = $this.parent('.ui-form-item'),
						val = $this.val();

					var validMessage = function(type, message){
	            
	            		var explain = $parent.find('.ui-form-explain'),
	            			errorTextClass = 'ui-tiptext-error';

	            		if(type && type === 'error'){
	            			$this.addClass('error');
	            			explain.html('<i class="iconfont">&#xe62e;</i>' + message).addClass(errorTextClass);
	            		}else{
	            			$this.removeClass('error');
	            			explain.html('').removeClass(errorTextClass);
	            		}
	            	
	            	};

					if(!$.trim(val).length || isNaN(val)){
	            		validMessage('error', '请输入体积');
	            	}else{
	            		validMessage('success', '');
	            	}
				},
				descalMessage: function(type, message){
					var parent = descalExplain.closest('.ui-form-item', publishForm),
						explain = descalExplain.find('.ui-form-explain');

					var fn = {
						show: function(){
							explain.html('<i class="iconfont">&#xe62e;</i>' + message);
							descalExplain.addClass('show');
						},
						hide: function(){
							descalExplain.removeClass('show');
						},
						clearError: function(){
							parent.removeClass('ui-form-item-error');
						}
					};

					return {
						clearError: fn.clearError,
						error: function(){
							parent.addClass('ui-form-item-error');
							fn.show();
						},
						hide: function(){
							fn.hide();
							fn.clearError();
							explain.html('');
						},
						show: function(){
							fn.clearError();
							fn.show();
						}
					}[type]();
				},
				createKeywordItem: function(keywordArray){
					var itemTpl = '';

					for(var i = 0; i < keywordArray.length; i++){
						var keyword = keywordArray[i];
						itemTpl += '<span class="kw" data-val="'+ keyword +'">'+ keyword +'<i class="del iconfont">&#xe629;</i></span>';
					}
					keywordBlock.append(itemTpl);
				},
				createPublishItem: function(publishData, type){
					var self = this,
						items = [];
					var counterTpl = '<div class="m-counter m-counter-mini">' +
										'<span class="m-counter-minus">-</span>' +
										'<span class="m-counter-count">1</span>' +
										'<span class="m-counter-plus">+</span>' +
									'</div>';

					var compileTpl = function(items){
						var tpl =['{{#each items}}',
							'<div class="publish-item" data-attr="{{attr}}">',
	                            '<div class="fn-clear">',
	                                '<div class="thumb">',
	                                	'<div class="img-wrap">',
	                                	'<img src="'+ PPG.IMAGESERVER + '{{image}}" alt="{{name}}">',
	                                	'</div>',
	                                    '{{#if hasDele}}<span class="remove iconfont" href="javascript:;" data-pid="{{id}}">&#xe633;</span>{{/if}}',
	                                    '{{#if isSeller}}',
	                                    '{{else}}',
	                                    '<div class="publish-item-tip">',
	                                    '<p class="title">{{name}}</p>',
	                                    '<p class="info">业务模式:{{bmodel}}&nbsp;发货地:{{ship}}&nbsp;发货规格:{{delivery}}件一发&nbsp;库存类型:{{inventoryType}}</p>',
	                                    '<span class="arrow"></span>',
	                                    '</div>',
	                                    '{{/if}}',
	                                '</div>',
	                                '<div class="panel">',
	                                	'{{#if isSeller}}',
	                                	'<h5 class="ptitle" title="{{name}}">{{name}}</h5>',
	                                	'<p class="pdesc" title="业务模式:{{bmodel}}&nbsp;发货地:{{ship}}&nbsp;发货规格:{{delivery}}件一发&nbsp;库存类型:{{inventoryType}}">业务模式:{{bmodel}}&nbsp;发货地:{{ship}}&nbsp;发货规格:{{delivery}}件一发&nbsp;库存类型:{{inventoryType}}</p>',
	                                	'{{else}}',
	                                	'<div class="operation">',
	                                        '<span class="numb-wrap">x<em class="numb">{{count}}</em></span>{{{counterTpl}}}',
	                                    '</div><p class="input-wrap"><input class="input" type="text" placeholder="申报单价" value="{{declaredPrice}}"></p>',
	                                	'{{/if}}',
	                                '</div>',
	                            '</div>',
	                        '</div>',
	                        '{{/each}}'
	                        ].join('');

	                    return templatable.compile(tpl, {items: items});
					};


					// 编辑模式
	                if(undefined !== type && type === 'reset'){
	                	// console.log(itemDetail)
	                	if(itemDetail.ItemProducts !== null){
		                	var products = itemDetail.ItemProducts;

		                	for(var i = 0; i < products.length; i++){

		                		var product = products[i];
		                		var productId = product.ProductId,
		                			productImages = product.Images,
		                			productName = product.Name,
		                			productCode = product.ProductCode,
		                			productModel = product.BusinessModelName,
		                			productShip = product.ShippingFromName,
		                			productOriginplace = product.OriginPlaceName,
		                			productCount = product.Num,
		                			productDeclaredPrice = product.DeclaredPrice,
		                			productDelivery = product.DeliveryNum,
		                			inventoryType = product.InventoryType;

		                		var isNeedDelBtn = isResetMode ? true : false;

		                		items.push({
		                			hasDele: isNeedDelBtn,
		                			id: productId,
				                	image: productImages.split(',')[0],
				                	name: productName,
				                	code: productCode,
				                	bmodel: productModel,
				                	ship: productShip,
				                	originplace: productOriginplace,
				                	count: productCount,
				                	declaredPrice: productDeclaredPrice,
				                	delivery: productDelivery,
				                	inventoryType: inventoryType,
				                	attr: JSON.stringify({
				                		ProductId: productId, 
				                		ProductCode: productCode, 
				                		Num: productCount,
				                		Name: productName,
				                		Images: productImages,
				                		Stock: product.Stock,
				                		OriginPlaceName: productOriginplace,
				                		ShippingFromName: productShip,
				                		BusinessModelName: productModel,
				                		Id: product.Id,
				                		ItemId: product.ItemId,
				                		DeclaredPrice: productDeclaredPrice,
				                		DeliveryNum: productDelivery,
				                		InventoryType: inventoryType
				                	}),
				                	counterTpl: itemDetail.Id ? '' : counterTpl
		                		});

		                		// 将ID添加到已选结果集
								queryIdCache.push(product.ProductId);
		                	}

		                	var itemsTpl = compileTpl(items);

			                labelNone.hide();
							labelWrap.append(itemsTpl);
							labelNextEl.addClass('mt');

							// 存值
							// productsAttrEl.val(itemDetail.ItemProducts);
	                	}

						// 填充数据
						self.updateFormInfo(publishData);

	                // 非编辑模式
	                }else{

	                	var id = publishData.Id;

		                var publishId = publishData.Id,
	            			publishImages = publishData.Images,
	            			publishName = publishData.Name,
	            			publishCode = publishData.ProductCode,
	            			publishModel = publishData.BusinessModelName,
	            			publishShip = publishData.ShippingFromName,
	            			publishOriginplace = publishData.OriginPlaceName,
	            			publishCount = 1,
	            			publishDeclaredPrice = '',
	            			publishDelivery = publishData.DeliveryNum,
	            			publishInventoryType = publishData.InventoryType;

						var itemData = {
							isSeller: isSeller,
							hasDele: true,
	            			id: publishId,
		                	image: publishImages.split(',')[0],
		                	name: publishName,
		                	code: publishCode,
		                	bmodel: publishModel,
		                	ship: publishShip,
		                	originplace: publishOriginplace,
		                	count: 1,
		                	declaredPrice: publishDeclaredPrice,
		                	delivery: publishDelivery,
		                	inventoryType: publishInventoryType,
		                	attr: JSON.stringify({
								ProductId: publishId, 
		                		ProductCode: publishCode, 
		                		Num: publishCount,
		                		Name: publishName,
		                		Images: publishImages,
		                		Stock: 0,
		                		OriginPlaceName: publishOriginplace,
		                		ShippingFromName: publishShip,
		                		BusinessModelName: publishModel,
		                		Id: publishId,
		                		ItemId: 0,
		                		DeclaredPrice: publishDeclaredPrice,
		                		DeliveryNum: publishDelivery,
		                		InventoryType: publishInventoryType,
		                	}),
		                	counterTpl: counterTpl
						};
	                	
	                	var itemTpl = compileTpl([itemData]);
		                var $item = $(itemTpl);

		                // if(isSeller){
		                	// labelWrap.find('.publish-item').remove();
		                	// queryIdCache = [];
		                // }

		                labelNone.hide();
						labelWrap.append($item);
						labelNextEl.addClass('mt');

						if(isSelf){
							descalExplain.addClass('show');
						}
						
						// 将ID添加到已选结果集
						// queryIdCache.push(id);

						var fillInfo = function(){
							self.coverConfirm(function(){
								self.updateFormInfo(publishData);
								// 如果上一次验证未通过，则选品后再手动触发一次整个表单的验证
								self.executeUptateItems();
							});
						};

						// (自营)如果只选了一个，就填充该产品的信息，否则清空
						// if(isSeller){
						// 	fillInfo();
						// }else if(queryIdCache.length === 1){
							fillInfo();
						// }
	                }
				},
				createSettleItems: function(){
					var self = this;

					// console.log(sellerData)
					// 拼装模板
					var items = [
								// 业务模式
								'<div class="ui-form-item" data-sup="settle">',
									'<label class="ui-label" for="business_mode">业务模式：</label>',
		                        	'<select name="BusinessModel" class="ui-select" id="business_mode">',
		                        		'<option value="">请选择业务模式</option>',
		                        		'{{#each bmodeItems}}',
			                            '<option value="{{Id}}">{{Name}}</option>',
			                            '{{/each}}',
		                            '</select>',
		                            '<span class="ui-form-required">*</span>',
		                            '<span class="ui-form-explain"></span>',
		                        '</div>',

								// 税率类别
								'<div class="taxrate ui-form-item" data-sup="settle">',
									'<label class="ui-label">税率类别：</label>',
									'<span class="read-text" id="J_tax_category">请选择类别</span>',
		                            '<span class="ui-form-required"></span>',
		                            '<span class="ui-form-explain"></span>',
		                            '<div class="category-panel" id="J_tax_category_panel">',
		                                '<ul class="category-list ztree" id="J_tax_category_list"></ul>',
		                            '</div>',
		                            '<input type="hidden" id="tax_category_value" name="TaxCategoryId" value="{{currentTax}}">',
		                        '</div>',

								// 发货地
		               			'<div class="ui-form-item" data-sup="settle">',
		                        	'<label class="ui-label" for="product_ship">发货地：</label>',
		                        	'<select name="ShippingFromId" class="ui-select" id="product_ship">',
		                        		'<option value="">请选择发货地</option>',
		                        		'{{#each shipItems}}',
			                            '<option value="{{Id}}">{{Name}}</option>',
			                            '{{/each}}',
		                            '</select>',
		                            '<span class="ui-form-required">*</span>',
		                            '<span class="ui-form-explain"></span>',
		                        '</div>',

								// 原产地
								'<div class="ui-form-item" data-sup="settle">',
									'<label class="ui-label" for="product_originplace_type">原产地：</label>',
			                        	'<select name="OriginPlaceId" class="ui-select" id="product_originplace_type">', 
			                        		'<option value="">请选原产地</option>',
				                            '{{#each originplaces}}',
				                            '<option value="{{Id}}">{{Name}}</option>',
				                            '{{/each}}',
			                            '</select>',
			                            '<span class="ui-form-required">*</span>',
			                            '<span class="ui-form-explain"></span>',
			                        '</div>',

			                	// 重量
		                		'<div class="ui-form-item" data-sup="settle">',
		                        	'<label class="ui-label" for="product_weight">重量(克)：</label>',
		                            '<input type="text" name="Weight" class="ui-input" id="product_weight" value="{{weight}}">',
		                            '<span class="ui-form-required">*</span>',
		                            '<span class="ui-form-explain"></span>',
		                        '</div>',

		                		// 体积                      
		               			'<div class="volume ui-form-item" data-sup="settle">',
				                    '<label class="ui-label" for="product_volume">体积(cm)：</label>',
				                    '<input type="text" class="volume-input ui-input" placeholder="长" value="{{volLength}}"><small>&nbsp;*&nbsp;</small>',
				                    '<input type="text" class="volume-input ui-input" placeholder="宽" value="{{volWeight}}"><small>&nbsp;*&nbsp;</small>',
				                    '<input type="text" class="volume-input ui-input" placeholder="高" value="{{volHeight}}">',
				                    '<span class="ui-form-required">*</span>',
				                    '<span class="ui-form-explain"></span>',
				                    '<input type="hidden" name="Volume" class="ui-input" id="product_volume" value="{{volume}}">',
				                '</div>'].join('');

			        var tpl = templatable.compile(items, sellerData);
			       

			   //      var optionItemSelected = function(selectId, value){
						// $('#' + selectId).find('option[value="'+ value +'"]').prop('selected', true);
			   //      };

			        // 插入模板
			        productPriceEl.parent().after(tpl);

			        taxCategoryTrigger = $('#J_tax_category');
			        taxCategoryValue = $('#tax_category_value');
			        volumeInput = $('.volume-input');
			        productVolumeEl = $('#product_volume');
			        productWeightEl = $('#product_weight');
			        volLengthEl = volumeInput.eq(0);
				    volWeightEl = volumeInput.eq(1);
				    volHeightEl = volumeInput.eq(2);

			        taxPopup = new Popup({
						trigger: '#J_tax_category',
						element: '#J_tax_category_panel',
						triggerType: 'click'
					});

			        // 创建税率ztree
					taxTree = $.fn.zTree.init($('#J_tax_category_list'), $.extend({}, zSetting, {
						callback: {
							onClick: function(e, elemId, data, lv){
								// console.log(data)
								var currentItem = $('#' + data.tId);
								taxCategoryTrigger.text(data.name);
								taxCategoryValue.val(data.id);
								self.clearFormItemError(currentItem);
								taxPopup.hide();
							}						
						}
					}), sellerData.tax);
					
					// 设置业务模式
					// if(sellerData.currentBmode){
					// 	optionItemSelected('business_mode', sellerData.currentBmode);
					// }

					// 设置税率
					taxTreeObj = $.fn.zTree.getZTreeObj('J_tax_category_list');
					// var taxName = '请选择类别';

					// if(sellerData.currentTax){
					// 	// 如果存在id，则到数据集中查找对应的文字
					// 	var node = taxTreeObj.getNodesByParam('id', sellerData.currentTax, null)[0];
					// 	// console.log(node);
					// 	// 选中类别
					// 	taxTreeObj.selectNode(node);
					// 	taxName = node && node.name;
					// }

					// taxCategoryTrigger.text(taxName);

					// 赋值发货地
					// if(sellerData.currentShip){
					// 	optionItemSelected('product_ship', sellerData.currentShip);
					// }

					// 赋值原产地
					// if(sellerData.currentOriginplace){
					// 	optionItemSelected('product_originplace_type', sellerData.currentOriginplace);
					// }
					
					self.updateSelltleItems();

					// 体积
	                volumeInput.on('blur', function(){
	                	var $this = $(this);
	                	
	                	$this.removeClass('focus');

	                	self.validVolume($this);

	                }).on('focus', function(){
	                	var $this = $(this),
	                		$parent = $this.parent('.ui-form-item');

	                	$this.addClass('focus');
	                	$parent.removeClass('ui-form-item-error');
	                });

			        // 添加校验
			        validator
			        	// 业务模式
						.addItem({
							element: '#business_mode',
							required: true,
							rule: '',
							display: '业务模式'
						})
			        	// 税率类别
						// .addItem({
						// 	element: '#tax_category_value',
						// 	required: true,
						// 	rule: '',
						// 	display: '税率类别'
						// })
			        	// 发货地
						.addItem({
							element: '#product_ship',
							required: true,
							rule: '',
							display: '发货地'
						})
						// 原产地
						.addItem({
							element: '#product_originplace_type',
							required: true,
							rule: '',
							display: '原产地'
						})												        	
			        	// 重量
						.addItem({
							element: '#product_weight',
							required: true,
							rule: 'number',
							display: '重量'
						})
						// 体积
						.addItem({
							element: '#product_volume',
							required: true,
							rule: '',
							display: '体积'
						});
				},
				updateSelltleItems: function(){
			        var optionItemSelected = function(selectId, value){
						$('#' + selectId).find('option[value="'+ value +'"]').prop('selected', true);
			        };

			        // 设置税率
			        var taxName = '请选择类别';
					if(sellerData.currentTax){
						// 如果存在id，则到数据集中查找对应的文字
						var node = taxTreeObj.getNodesByParam('id', sellerData.currentTax, null)[0];
						// console.log(node);
						// 选中类别
						taxTreeObj.selectNode(node);
						taxName = node && node.name;
					}
					taxCategoryTrigger.text(taxName);

					// 设置业务模式
					if(sellerData.currentBmode){
						optionItemSelected('business_mode', sellerData.currentBmode);
					}

					// 赋值发货地
					if(sellerData.currentShip){
						optionItemSelected('product_ship', sellerData.currentShip);
					}

					// 赋值原产地
					if(sellerData.currentOriginplace){
						optionItemSelected('product_originplace_type', sellerData.currentOriginplace);
					}

					// 体积、长、宽、高
					volLengthEl.val(sellerData.volLength);
				    volWeightEl.val(sellerData.volWeight);
				    volHeightEl.val(sellerData.volHeight);
				    productVolumeEl.val(sellerData.volume);

				    // 重量
				    productWeightEl.val(sellerData.weight);

				},
				destroySettleItems: function(){
					// 卸载相关项的校验
					['#business_mode',
					'#tax_category_value',
					'#product_ship',
					'#product_originplace_type', 
					'#product_weight', 
					'#product_volume'
					].forEach(function(v){
						validator.removeItem(v);
					});

					volumeInput = null;
					taxPopup.destroy();

					// 删除相关项
					$('[data-sup="settle"]').remove();
				},
				executeUptateItems: function(){
					var self = this;

					// 隐藏自动填充项的错误信息
					['#category_value',
					'#J_props_result',
					'#brand_value',
					'#product_name',
					'#product_keyword',
					'#product_photo',
					'#product_textarea'
					].forEach(function(item){
						self.hideFormItemError(item);
					});
				},
				validatorItemExecute: function(itemId){
					// 手动触发某项表单的验证
					validator.query(itemId).execute();
				},
				coverConfirm: function(confirmCallback){
					var self = this;
					ConfirmBox.confirm('是否自动填充产品信息', '提示：', function(){
						confirmCallback && confirmCallback();
					});
				},
				hideFormItemError: function(target){
					var parent = $(target).closest('.ui-form-item', publishForm);
					parent.removeClass('ui-form-item-error');
					parent.find('.ui-form-explain')
						.removeClass('ui-tiptext-error')
						.empty();
				},
				removePhoto: function(imageItem){

					imageItem.fadeOut(200, function(){
			    		imageItem.remove();
			    		
			    		sortItemCount -= 1;

			    		if(sortItemCount < 0){
			    			sortItemCount = 0;
			    		}

			    		// 重新定位上传按钮的位置
	        			this.setUploadPickerPosition();

	        			// 重新设值
	        			this.updatePhotoValue();
			    	}.bind(this));
				},
				createPhoto: function(image){
					var images = image.split(','),
						tpl = '';

					sortItemCount += images.length;

					for(var i = 0; i < images.length; i++){
						var imageName = images[i];
						tpl += '<div class="upload-thumb-item" data-name="'+ imageName +'">' +
									'<img src="'+ PPG.IMAGESERVER + imageName +'-W100H100" alt="">' +
			                        '<span class="remove iconfont" data-name="'+ imageName +'">&#xe633;</span>' +
			                    '</div>';
					}

			       	sortbox.append(tpl);

			        // 更新图片记录
			        this.updatePhotoValue();

			        // 设置上传按钮的位置
			        this.setUploadPickerPosition();
				},
				setUploadPickerPosition: function(){

					var _left = 0,
						_top = 10;

					if(sortItemCount){

						var _item = sortbox.find('.upload-thumb-item:last'),
							position = _item.position();

						_left = position.left + sortItemWidth + 10;
						_top = position.top;

						// 清除边距容器
						if(sortItemCount >= 4){
							uploadWrap.addClass('static');
						}else{
							uploadWrap.removeClass('static');
						}
						
						// 上传按钮换行
			       		if(sortItemCount%4 === 0){

			       			_left = 0;
							_top += sortItemHeight + 10;

			       			sortbox.addClass('paddingb');

			       		}else{
			       			
			       			sortbox.removeClass('paddingb');
			       		}

					}

					uploadPickerWrap.css({
						left: _left,
						top: _top
					});

					// 重新定位moxie-shim的位置
					$('.moxie-shim').css({
						left: _left,
						top: _top
	    			});
				},
				updatePhotoValue: function(){
					var images = [];

					sortbox.find('.upload-thumb-item').each(function(){
						images.push($(this).data('name'));
					});

					productPhoto.val(images.length ? images.join(',') : '');
				},
				updateFormInfo: function(data){
					// console.log(data)
					var self = this;
					var categoryId = '',
						brandId = '',
						productName = '', 
						price = '',
						weight= '',
						volume = '',
						keyword = '',
						description = '',
						photos = '',
						itemCode = '',
						properties = [];
					
					if(data){
						categoryId = getObjValue(data, 'CategoryId');
						brandId = getObjValue(data, 'BrandId');
						productName = getObjValue(data, 'Name');
						photos = getObjValue(data, 'Images');
						price = getObjValue(data, 'Price');
						keyword = getObjValue(data, 'Keywords');
						// weight = getObjValue('Weight');
						// volume = getObjValue('Volume');
						description = getObjValue(data, 'Description');
						properties = (data.Properties && data.Properties.length) ? data.Properties : [];
						itemCode = getObjValue(data, 'ItemCode');
					}

					
					// 类别
					var categoryText = '请选择类别';
					
					if(categoryId){
						
						// 如果存在id，则到数据集中查找对应的文字
						var node = publishTreeObj.getNodesByParam('id', categoryId, null)[0];
						// 选中类别
						publishTreeObj.selectNode(node);
						categoryText = node.name;

						// 渲染属性项
						self.queryProperty(categoryId, function(data){
							// console.log(properties)
							// 选中属性
							if(properties.length){
								for(var i = 0; i < properties.length; i++){
									var prop = properties[i];
									if(prop.ValueID === 0){
										$('#C_' + prop.NameID).val(prop.ValueText).trigger('blur');
									}else{
										$('#CC_' + properties[i].ValueID).parent().trigger('click');	
									}
								}

								var propsResultEl = $('#J_props_result');
								propsResultEl && propsResultEl.val(properties);
							}						
						});
					}else{
						$('#J_product_props').remove();
					}

					categoryReadEl.text(categoryText);
					categoryValueEl.val(categoryId);

					// 品牌
					var brandText = '请选择品牌';
					if(brandId && brandList.length){
						// 如果存在id，则到数据集中查找对应的文字
						for(var i = 0; i < brandList.length; i++){
							var brand = brandList[i];
							if(brand.Id === brandId){
								brandText = brand.Name;
								break;
							}
						}
					}
					$('div.brand').find('.read-text').text(brandText);
					brandValueEl.val(brandId);
					
					// 产品名称
					productNameEl.val(productName);
					
					// 商品自定义编码
					productItemcode.val(itemCode);

					// 价格
					productPriceEl.val(price);

					// 重量
					// productWeightEl.val(weight);

					// 体重
					// if(volume.length){
					// 	var volumeArray = volume.split('*');
					// 	volumeInput.each(function(i){
					// 		$(this).val(volumeArray[i]);
					// 	});
					// }
					// productVolumeEl.val(volume);
				
					// 关键词
					// 清空原有关键词
					keywordBlock.empty();
					if(keyword.length){
						var keywords = keyword.split(',');
						keywordCache = keywords;
						self.createKeywordItem(keywords);
						keywordBlock.show();
					}else{
						keywordCache = [];
						keywordBlock.hide();
					}
					keywordEl.val(keyword);

					// 产品图片
					sortbox.find('.upload-thumb-item').remove();

					if(photos){
						this.createPhoto(photos);
					}
					
					this.updatePhotoValue();

					// 产品描述
					editor.setData(description); // 设值
					descArea.val(description);

					if(isSeller){
						self.updateSelltleItems();
					}
				},
				queryProperty: function(id, callback){

					$.post('/Item/GetProperties', {categoryId: id}, function(res){
						if(res.Succeeded){
							if(res.Result){
								// debugger
								var datas = eval('('+res.Result+')');

					        	// 清除旧数据
					    		var propElem = $('#J_product_props');
								if(propElem[0]){
									// 清除校验
									validator.removeItem('#J_props_result');
									propElem.remove();
								}

								if(propertyChoiceCache.length){
									propertyChoiceCache.forEach(function(widget){
										widget.destroy();
									});
									propertyChoiceCache = [];
								}

								var count = 0;

								propGroupSize = 0;

								// 是否存在属性，有的话就展示
								if(datas.length){
									
									var itemStartStr = '<div class="ui-form-item" id="J_product_props"><label class="ui-label">选择属性：</label><div class="prop-row">',
										itemEndStr = '</div><span class="ui-form-required">*</span><span class="ui-form-explain"></span><input type="hidden" name="SeletedProps" id="J_props_result"></div>',
										itemBodyStr = '',
										flag = false,
										childrensCache = [];

									var getPropItem = function(data){
										var itemsString = '';

										var getChilds = function(childrens){
											var childs = '';
											var acData = [];

											if(childrens && childrens.length){

												for(var j = 0; j < childrens.length; j++){
													var child = childrens[j];
													childs += '<li class="child-item" data-role="item">' +
																'<span id="CC_'+ child.id +'" data-ids="'+ child.parentId + '|'+ child.id +'" data-name="'+ child.name +'">'+ child.name +'</span>' +
															'</li>';

													acData.push({
														value: child.name,
														parentId: child.parentId,
														id: child.id,
														name: child.name
													});
												}
											}else{
												acData = null;
											}

											// 缓存childrens
											childrensCache.push(acData);

											return childs;
										};

										itemsString += '<div class="prop-wrap fn-clear">' + 
															'<label class="prop-label" for="C_'+ data.id +'" title="'+ data.name +'">'+ data.name +'：</label>' +
															'<div class="prop-drop">' +
																'<div class="prop-input-wrap">'+
																	'<input type="text" id="C_'+ data.id +'" data-ids="'+ data.id +'|0" class="prop-input" value="">' +
																	'<span class="clear arrow iconfont">&#xe61f</span>' +
																'</div>' + 
																'<div class="prop-drop-panel"><ul class="prop-drop-list">'+ getChilds(data.children) +'</ul></div>' +
															'</div>' +
														'</div>';

										return itemsString;
									};

									for(var n = 0; n < datas.length; n++){

										count += 1;
										flag = true;
										propGroupSize += 1;

										itemBodyStr += getPropItem(datas[n]);
									}

									if(flag){
										formItemCategory.after(itemStartStr + itemBodyStr + itemEndStr);
										var arrow2clear = function($elem){
											$elem.html('&#xe629;').removeClass('arrow');
										};
										var clear2arrow = function($elem){
											$elem.html('&#xe61f').addClass('arrow');
										};
										$('#J_product_props').find('.prop-wrap').each(function(i){

											var $this = $(this),
												$input = $this.find('.prop-input'),
												$panel = $this.find('.prop-drop-panel'),
												$list = $panel.find('.prop-drop-list'),
												$clear = $this.find('.clear'),
												contentCache = $list.html();

											var datas = childrensCache[i],
												hasDatas = datas && datas.length;
											// console.log(datas)
											var pop = new Popup({
												trigger: $input,
												element: $panel,
												triggerType: 'focus'
											});

											var ac = new AutoComplete({
												trigger: $input,
											    submitOnEnter: false,
											    filter: 'stringMatch',
											    classPrefix: 'prop-autocomplete',
											    html: '<span data-ids="{{parentId}}|{{id}}" data-name="{{name}}">{{name}}</span>',
											    dataSource: hasDatas ? datas : []			
											}).render();

											ac.input.on('queryChanged', function(query){
												var info = $input.data('info');

												if(query){

													$list.html(ac.items ? ac.items : '');

													if(info && info.ValueText !== query.trim()){
														$input.removeData('info');
													}

												}else{
													clear2arrow($clear);
													$list.html(contentCache);
													info && $input.removeData('info');
												}
											});
											$input.on('blur', function(){
												var value = $(this).val();
												if(!value.trim().length){
													clear2arrow($clear);
												}else{
													arrow2clear($clear);
													// 查找datas中是否有匹配的数据
													if(hasDatas && !$input.data('info')){
														datas.forEach(function(item){
															if(item.name.toLowerCase() == value.toLowerCase()){
																$input.data('info', {
																	NameID: item.parentId,
																	ValueID: item.id,
																	ValueText: item.name 
																});
															}
														});
													}
												}
											});
											$list.on('click', '[data-role="item"]', function(){
												var $elem = $(this).find('span');
													name = $elem.data('name'),
													ids = $elem.data('ids').split('|');

												pop.hide();
												ac.setInputValue(name);
												$input.data('info', {
					                				NameID: ids[0],
					                				ValueID: ids[1],
					                				ValueText: name
												});
												arrow2clear($clear);
											});
											$clear.on('click', function(){
												clear2arrow($clear);
												ac.setInputValue('');
												$input.removeData('info');
											});

											// 缓存popup autoComplete，用于销毁
											propertyChoiceCache.push(pop);
											propertyChoiceCache.push(ac);
										});

										// 添加校验
										validator.addItem({
											element: '#J_props_result',
											required: true,
											rule: '',
											errormessageRequired: '请选择属性'
										});
									}

									callback && callback(childrensCache);
								}
							}
						}
					});
				},
				clearFormItemError: function(trigger){
		        	var item = trigger.closest('.ui-form-item', publishForm);
		        	item.removeClass('ui-form-item-error');
		        	item.find('.ui-form-explain').removeClass('ui-tiptext-error').empty();				
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
				},			
				tpl: {
					proInfos: '<div class="body">' +
						'{{#each products}}' +
						'<div class="pro-props" data-itemid="{{ItemId}}" data-code="{{ProductCode}}">' +
							'<ul class="head fn-clear">' +
								'<li>' +
									'<div class="ui-panel-mini ui-panel">' +
										'<div class="ui-panel-thumb">' +
							             	'<a href="javascript:;" title="{{Name}}"><img src="'+ PPG.IMAGESERVER +'{{Images}}" alt="{{Name}}"></a>' +
							            '</div>' +
							            '<div class="ui-panel-text">' +
							                '<div class="ui-panel-text-inner">' +
							                    '<a class="name" href="javascript:;" title="{{Name}}">{{Name}}</a>' +
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
				        	'<span class="price-item">单件平均成本：<em id="J_avgunit">{{avgUnitPrice}}</em>&nbsp;元</span>' + 
				        	'<span class="price-item">建议零售价：<em id="J_suggest">{{suggestPrice}}</em>&nbsp;元</span>' +
				        	'{{#if isEditPrice}}<span class="price-edit"><label for="changedPrice">修改后价格：</label>' + 
				        	'<input type="text" class="ui-input" value="{{suggestPrice}}" id="changedPrice">元</span>' + 
				        	'{{/if}}</div>' +
				        	'{{#if isEditMode}}' +
				        	'<div class="btns">' +
					        	'<a data-role="confirm" class="ui-dialog-button-orange" href="javascript:;">确定</a>' +
					        	'<a data-role="cancel" class="ui-dialog-button-white" href="javascript:;">取消</a>' +        	
				        	'</div>' +
				        	'{{/if}}' +
				        '</div>'
				}
			};

			function getElementData(element, dataName){

				if(typeof dataName === 'string'){
					return element.data(dataName);
				}else if(Array.isArray(dataName)){
					var ret = {};
					for(var i = 0; i < dataName.length; i++){
						var key = dataName[i];
						ret[key] = element.data(key);
					}
					return ret;
				}
			}

	        function getObjValue(source, key, defaultValue){
	        	return (source.hasOwnProperty(key) && source[key]) ? 
	        			source[key] : 
	        			(typeof defaultValue === 'undefined' ? '' : defaultValue);
	        }

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

	        function scroll2there(target){
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 100);
			}

			$(function(){
				fns.init();
			});
		}
	};

	window.publish = publish;

/***/ },

/***/ 9:
/***/ function(module, exports) {

	// var $ = require('jquery');

	var rules = {},
	    messages = {};

	function Rule(name, oper) {
	    var self = this;

	    self.name = name;

	    if (oper instanceof RegExp) {
	        self.operator = function (opts, commit) {
	            var rslt = oper.test($(opts.element).val());
	            commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
	        };
	    } else if ($.isFunction(oper)) {
	        self.operator = function (opts, commit) {
	            var rslt = oper.call(this, opts, function (result, msg) {
	                commit(result ? null : opts.rule, msg || _getMsg(opts, result));
	            });
	            // 当是异步判断时, 返回 undefined, 则执行上面的 commit
	            if (rslt !== undefined) {
	                commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
	            }
	        };
	    } else {
	        throw new Error('The second argument must be a regexp or a function.');
	    }
	}

	Rule.prototype.and = function (name, options) {
	    var target = name instanceof Rule ? name : getRule(name, options);

	    if (!target) {
	        throw new Error('No rule with name "' + name + '" found.');
	    }

	    var that = this;
	    var operator = function (opts, commit) {
	        that.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                commit(err, _getMsg(opts, !err));
	            } else {
	                target.operator.call(this, opts, commit);
	            }
	        });
	    };

	    return new Rule(null, operator);
	};
	Rule.prototype.or = function (name, options) {
	    var target = name instanceof Rule ? name : getRule(name, options);

	    if (!target) {
	        throw new Error('No rule with name "' + name + '" found.');
	    }

	    var that = this;
	    var operator = function (opts, commit) {
	        that.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                target.operator.call(this, opts, commit);
	            } else {
	                commit(null, _getMsg(opts, true));
	            }
	        });
	    };

	    return new Rule(null, operator);
	};
	Rule.prototype.not = function (options) {
	    var target = getRule(this.name, options);
	    var operator = function (opts, commit) {
	        target.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                commit(null, _getMsg(opts, true));
	            } else {
	                commit(true, _getMsg(opts, false))
	            }
	        });
	    };

	    return new Rule(null, operator);
	};


	function addRule(name, operator, message) {
	    if ($.isPlainObject(name)) {
	        $.each(name, function (i, v) {
	            if ($.isArray(v))
	                addRule(i, v[0], v[1]);
	            else
	                addRule(i, v);
	        });
	        return this;
	    }

	    if (operator instanceof Rule) {
	        rules[name] = new Rule(name, operator.operator);
	    } else {
	        rules[name] = new Rule(name, operator);
	    }
	    setMessage(name, message);

	    return this;
	}

	function _getMsg(opts, b) {
	    var ruleName = opts.rule;
	    var msgtpl;

	    if (opts.message) { // user specifies a message
	        if ($.isPlainObject(opts.message)) {
	            msgtpl = opts.message[b ? 'success' : 'failure'];
	            // if user's message is undefined，use default
	            typeof msgtpl === 'undefined' && (msgtpl = messages[ruleName][b ? 'success' : 'failure']);
	        } else {//just string
	            msgtpl = b ? '' : opts.message
	        }
	    } else { // use default
	        msgtpl = messages[ruleName][b ? 'success' : 'failure'];
	    }

	    return msgtpl ? compileTpl(opts, msgtpl) : msgtpl;
	}

	function setMessage(name, msg) {
	    if ($.isPlainObject(name)) {
	        $.each(name, function (i, v) {
	            setMessage(i, v);
	        });
	        return this;
	    }

	    if ($.isPlainObject(msg)) {
	        messages[name] = msg;
	    } else {
	        messages[name] = {
	            failure: msg
	        };
	    }
	    return this;
	}



	function getRule(name, opts) {
	    if (opts) {
	        var rule = rules[name];
	        return new Rule(null, function (options, commit) {
	            rule.operator($.extend(null, options, opts), commit);
	        });
	    } else {
	        return rules[name];
	    }
	}

	function compileTpl(obj, tpl) {
	    var result = tpl;

	    var regexp1 = /\{\{[^\{\}]*\}\}/g,
	        regexp2 = /\{\{(.*)\}\}/;

	    var arr = tpl.match(regexp1);
	    arr && $.each(arr, function (i, v) {
	        var key = v.match(regexp2)[1];
	        var value = obj[$.trim(key)];
	        result = result.replace(v, value);
	    });
	    return result;
	}

	addRule('required', function (options) {
	    var element = $(options.element);

	    var t = element.attr('type');
	    switch (t) {
	        case 'checkbox':
	        case 'radio':
	            var checked = false;
	            element.each(function (i, item) {
	                if ($(item).prop('checked')) {
	                    checked = true;
	                    return false;
	                }
	            });
	            return checked;
	        default:
	            return Boolean($.trim(element.val()));
	    }
	}, '请输入{{display}}');

	addRule('email', /^\s*([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})\s*$/, '{{display}}的格式不正确');

	addRule('text', /.*/);

	addRule('password', /.*/);

	addRule('radio', /.*/);

	addRule('checkbox', /.*/);

	addRule('url', /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, '{{display}}的格式不正确');

	addRule('number', /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$|^0$/, '{{display}}的格式不正确');

	// 00123450 是 digits 但不是 number
	// 1.23 是 number 但不是 digits
	addRule('digits', /^\s*\d+\s*$/, '{{display}}的格式不正确');

	addRule('date', /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/, '{{display}}的格式不正确');

	addRule('min', function (options) {
	    var element = options.element,
	        min = options.min;
	    return Number(element.val()) >= Number(min);
	}, '{{display}}必须大于或者等于{{min}}');

	addRule('max', function (options) {
	    var element = options.element,
	        max = options.max;
	    return Number(element.val()) <= Number(max);
	}, '{{display}}必须小于或者等于{{max}}');

	addRule('minlength', function (options) {
	    var element = options.element;
	    var l = element.val().length;
	    return l >= Number(options.min);
	}, '{{display}}的长度必须大于或等于{{min}}');

	addRule('maxlength', function (options) {
	    var element = options.element;
	    var l = element.val().length;
	    return l <= Number(options.max);
	}, '{{display}}的长度必须小于或等于{{max}}');

	// addRule('mobile', /^1\d{10}$/, '请输入正确的{{display}}');
	addRule('mobile', /^0?(13|15|18|14|17)[0-9]{9}$/, '请输入正确的{{display}}');

	addRule('confirmation', function (options) {
	    var element = options.element,
	        target = $(options.target);
	    return element.val() == target.val();
	}, '两次输入的{{display}}不一致，请重新输入');

	module.exports = {
	    addRule: addRule,
	    setMessage: setMessage,
	    getMessage: function(options, isSuccess) {
	        return _getMsg(options, isSuccess);
	    },
	    getRule: getRule,
	    getOperator: function (name) {
	        return rules[name].operator;
	    }
	};


/***/ },

/***/ 19:
/***/ function(module, exports) {

	var async = {};

	module.exports = async;

	//// cross-browser compatiblity functions ////

	var _forEach = function (arr, iterator) {
	  if (arr.forEach) {
	    return arr.forEach(iterator);
	  }
	  for (var i = 0; i < arr.length; i += 1) {
	    iterator(arr[i], i, arr);
	  }
	};

	var _map = function (arr, iterator) {
	  if (arr.map) {
	    return arr.map(iterator);
	  }
	  var results = [];
	  _forEach(arr, function (x, i, a) {
	    results.push(iterator(x, i, a));
	  });
	  return results;
	};

	var _keys = function (obj) {
	  if (Object.keys) {
	    return Object.keys(obj);
	  }
	  var keys = [];
	  for (var k in obj) {
	    if (obj.hasOwnProperty(k)) {
	      keys.push(k);
	    }
	  }
	  return keys;
	};

	//// exported async module functions ////

	async.forEach = function (arr, iterator, callback) {
	  callback = callback || function () {
	  };
	  if (!arr.length) {
	    return callback();
	  }
	  var completed = 0;
	  _forEach(arr, function (x) {
	    iterator(x, function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {
	        };
	      }
	      else {
	        completed += 1;
	        if (completed === arr.length) {
	          callback(null);
	        }
	      }
	    });
	  });
	};

	async.forEachSeries = function (arr, iterator, callback) {
	  callback = callback || function () {
	  };
	  if (!arr.length) {
	    return callback();
	  }
	  var completed = 0;
	  var iterate = function () {
	    iterator(arr[completed], function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {
	        };
	      }
	      else {
	        completed += 1;
	        if (completed === arr.length) {
	          callback(null);
	        }
	        else {
	          iterate();
	        }
	      }
	    });
	  };
	  iterate();
	};

	var doParallel = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(null, [async.forEach].concat(args));
	  };
	};
	var doSeries = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(null, [async.forEachSeries].concat(args));
	  };
	};


	var _asyncMap = function (eachfn, arr, iterator, callback) {
	  var results = [];
	  arr = _map(arr, function (x, i) {
	    return {index: i, value: x};
	  });
	  eachfn(arr, function (x, callback) {
	    iterator(x.value, function (err, v) {
	      results[x.index] = v;
	      callback(err);
	    });
	  }, function (err) {
	    callback(err, results);
	  });
	};
	async.map = doParallel(_asyncMap);
	async.mapSeries = doSeries(_asyncMap);

	async.series = function (tasks, callback) {
	  callback = callback || function () {
	  };
	  if (tasks.constructor === Array) {
	    async.mapSeries(tasks, function (fn, callback) {
	      if (fn) {
	        fn(function (err) {
	          var args = Array.prototype.slice.call(arguments, 1);
	          if (args.length <= 1) {
	            args = args[0];
	          }
	          callback.call(null, err, args);
	        });
	      }
	    }, callback);
	  }
	  else {
	    var results = {};
	    async.forEachSeries(_keys(tasks), function (k, callback) {
	      tasks[k](function (err) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        if (args.length <= 1) {
	          args = args[0];
	        }
	        results[k] = args;
	        callback(err);
	      });
	    }, function (err) {
	      callback(err, results);
	    });
	  }
	};


/***/ },

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Rule = __webpack_require__(9);

	var u_count = 0;
	var helpers = {};


	function unique() {
	    return '__anonymous__' + (u_count++);
	}

	function parseRules(str) {
	    if (!str) return null;

	    return str.match(/[a-zA-Z0-9\-\_]+(\{[^\{\}]*\})?/g);
	}

	function parseDom(field) {
	    var field = $(field);

	    var result = {};
	    var arr = [];

	    //parse required attribute
	    var required = field.attr('required');
	    if (required) {
	        arr.push('required');
	        result.required = true;
	    }

	    //parse type attribute
	    var type = field.attr('type');
	    if (type && type != 'submit' && type != 'cancel' && type != 'checkbox' && type != 'radio' && type != 'select' && type != 'select-one' && type != 'file' && type != 'hidden' && type != 'textarea') {

	        if (!Rule.getRule(type)) {
	            throw new Error('Form field with type "' + type + '" not supported!');
	        }

	        arr.push(type);
	    }

	    //parse min attribute
	    var min = field.attr('min');
	    if (min) {
	        arr.push('min{"min":"' + min + '"}');
	    }

	    //parse max attribute
	    var max = field.attr('max');
	    if (max) {
	        arr.push('max{max:' + max + '}');
	    }

	    //parse minlength attribute
	    var minlength = field.attr('minlength');
	    if (minlength) {
	        arr.push('minlength{min:' + minlength + '}');
	    }

	    //parse maxlength attribute
	    var maxlength = field.attr('maxlength');
	    if (maxlength) {
	        arr.push('maxlength{max:' + maxlength + '}');
	    }

	    //parse pattern attribute
	    var pattern = field.attr('pattern');
	    if (pattern) {
	        var regexp = new RegExp(pattern),
	            name = unique();
	        Rule.addRule(name, regexp);
	        arr.push(name);
	    }

	    //parse data-rule attribute to get custom rules
	    var rules = field.attr('data-rule');
	    rules = rules && parseRules(rules);
	    if (rules)
	        arr = arr.concat(rules);

	    result.rule = arr.length == 0 ? null : arr.join(' ');

	    return result;
	}

	function parseJSON(str) {
	    if (!str)
	        return null;

	    var NOTICE = 'Invalid option object "' + str + '".';

	    // remove braces
	    str = str.slice(1, -1);

	    var result = {};

	    var arr = str.split(',');
	    $.each(arr, function (i, v) {
	        arr[i] = $.trim(v);
	        if (!arr[i])
	            throw new Error(NOTICE);

	        var arr2 = arr[i].split(':');

	        var key = $.trim(arr2[0]),
	            value = $.trim(arr2[1]);

	        if (!key || !value)
	            throw new Error(NOTICE);

	        result[getValue(key)] = $.trim(getValue(value));
	    });

	    // 'abc' -> 'abc'  '"abc"' -> 'abc'
	    function getValue(str) {
	        if (str.charAt(0) == '"' && str.charAt(str.length - 1) == '"' || str.charAt(0) == "'" && str.charAt(str.length - 1) == "'") {
	            return eval(str);
	        }
	        return str;
	    }

	    return result;
	}

	function isHidden (ele) {
	    var w = ele[0].offsetWidth,
	        h = ele[0].offsetHeight,
	        force = (ele.prop('tagName') === 'TR');
	    return (w===0 && h===0 && !force) ? true : (w!==0 && h!==0 && !force) ? false : ele.css('display') === 'none';
	}

	module.exports = {
	    parseRule: function (str) {
	        var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);

	        // eg. { name: "valueBetween", param: {min: 1, max: 2} }
	        return {
	            name: match[1],
	            param: parseJSON(match[2])
	        };
	    },
	    parseRules: parseRules,
	    parseDom: parseDom,
	    isHidden: isHidden,
	    helper: function (name, fn) {
	        if (fn) {
	            helpers[name] = fn;
	            return this;
	        }

	        return helpers[name];
	    }
	};



/***/ },

/***/ 46:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Widget = __webpack_require__(4),
	    async = __webpack_require__(19),
	    utils = __webpack_require__(20),
	    Item = __webpack_require__(48);

	var validators = [];

	var setterConfig = {
	    value: $.noop,
	    setter: function (val) {
	        return $.isFunction(val) ? val : utils.helper(val);
	    }
	};

	var Core = Widget.extend({
	    attrs: {
	        triggerType: 'blur',
	        checkOnSubmit: true,    // 是否在表单提交前进行校验，默认进行校验。
	        stopOnError: false,     // 校验整个表单时，遇到错误时是否停止校验其他表单项。
	        autoSubmit: true,       // When all validation passed, submit the form automatically.
	        checkNull: true,        // 除提交前的校验外，input的值为空时是否校验。
	        onItemValidate: setterConfig,
	        onItemValidated: setterConfig,
	        onFormValidate: setterConfig,
	        onFormValidated: setterConfig,
	        // 此函数用来定义如何自动获取校验项对应的 display 字段。
	        displayHelper: function (item) {
	            var labeltext, name;
	            var id = item.element.attr('id');
	            if (id) {
	                labeltext = $('label[for="' + id + '"]').text();
	                if (labeltext) {
	                    labeltext = labeltext.replace(/^[\*\s\:\：]*/, '').replace(/[\*\s\:\：]*$/, '');
	                }
	            }
	            name = item.element.attr('name');
	            return labeltext || name;
	        },
	        showMessage: setterConfig, // specify how to display error messages
	        hideMessage: setterConfig, // specify how to hide error messages
	        autoFocus: true,           // Automatically focus at the first element failed validation if true.
	        failSilently: false,       // If set to true and the given element passed to addItem does not exist, just ignore.
	        skipHidden: false          // 如果 DOM 隐藏是否进行校验
	    },

	    setup: function () {
	        // Validation will be executed according to configurations stored in items.
	        var self = this;

	        self.items = [];

	        // 外层容器是否是 form 元素
	        if (self.element.is('form')) {
	            // 记录 form 原来的 novalidate 的值，因为初始化时需要设置 novalidate 的值，destroy 的时候需要恢复。
	            self._novalidate_old = self.element.attr('novalidate');

	            // disable html5 form validation
	            // see: http://bugs.jquery.com/ticket/12577
	            try {
	                self.element.attr('novalidate', 'novalidate');
	            } catch (e) {}

	            //If checkOnSubmit is true, then bind submit event to execute validation.
	            if (self.get('checkOnSubmit')) {
	                self.element.on('submit.validator', function (e) {
	                    e.preventDefault();
	                    self.execute(function (err) {
	                        !err && self.get('autoSubmit') && self.element.get(0).submit();
	                    });
	                });
	            }
	        }

	        // 当每项校验之后, 根据返回的 err 状态, 显示或隐藏提示信息
	        self.on('itemValidated', function (err, message, element, event) {
	            this.query(element).get(err?'showMessage':'hideMessage').call(this, message, element, event);
	        });

	        validators.push(self);
	    },

	    Statics: $.extend({helper: utils.helper}, __webpack_require__(9), {
	        autoRender: function (cfg) {

	            var validator = new this(cfg);

	            $('input, textarea, select', validator.element).each(function (i, input) {

	                input = $(input);
	                var type = input.attr('type');

	                if (type == 'button' || type == 'submit' || type == 'reset') {
	                    return true;
	                }

	                var options = {};

	                if (type == 'radio' || type == 'checkbox') {
	                    options.element = $('[type=' + type + '][name=' + input.attr('name') + ']', validator.element);
	                } else {
	                    options.element = input;
	                }


	                if (!validator.query(options.element)) {

	                    var obj = utils.parseDom(input);

	                    if (!obj.rule) return true;

	                    $.extend(options, obj);

	                    validator.addItem(options);
	                }
	            });
	        },

	        query: function (selector) {
	            return Widget.query(selector);
	        },

	        // TODO 校验单项静态方法的实现需要优化
	        validate: function (options) {
	            var element = $(options.element);
	            var validator = new Core({
	                element: element.parents()
	            });

	            validator.addItem(options);
	            validator.query(element).execute();
	            validator.destroy();
	        }
	    }),


	    addItem: function (cfg) {
	        var self = this;
	        if ($.isArray(cfg)) {
	            $.each(cfg, function (i, v) {
	                self.addItem(v);
	            });
	            return this;
	        }

	        cfg = $.extend({
	            triggerType: self.get('triggerType'),
	            checkNull: self.get('checkNull'),
	            displayHelper: self.get('displayHelper'),
	            showMessage: self.get('showMessage'),
	            hideMessage: self.get('hideMessage'),
	            failSilently: self.get('failSilently'),
	            skipHidden: self.get('skipHidden')
	        }, cfg);

	        // 当 item 初始化的 element 为 selector 字符串时
	        // 默认到 validator.element 下去找
	        if (typeof cfg.element === 'string') {
	            cfg.element = this.$(cfg.element);
	        }

	        if (!$(cfg.element).length) {
	            if (cfg.failSilently) {
	                return self;
	            } else {
	                throw new Error('element does not exist');
	            }
	        }
	        var item = new Item(cfg);

	        self.items.push(item);
	        // 关联 item 到当前 validator 对象
	        item._validator = self;

	        item.delegateEvents(item.get('triggerType'), function (e) {
	            if (!this.get('checkNull') && !this.element.val()) return;
	            this.execute(null, {event: e});
	        });

	        item.on('all', function (eventName) {
	            this.trigger.apply(this, [].slice.call(arguments));
	        }, self);

	        return self;
	    },

	    removeItem: function (selector) {
	        var self = this,
	            target = selector instanceof Item ? selector : self.query(selector);

	        if (target) {
	            target.get('hideMessage').call(self, null, target.element);
	            erase(target, self.items);
	            target.destroy();
	        }

	        return self;
	    },

	    execute: function (callback) {
	        var self = this,
	            results = [],
	            hasError = false,
	            firstElem = null;

	        // 在表单校验前, 隐藏所有校验项的错误提示
	        $.each(self.items, function (i, item) {
	            item.get('hideMessage').call(self, null, item.element);
	        });
	        self.trigger('formValidate', self.element);

	        async[self.get('stopOnError') ? 'forEachSeries' : 'forEach' ](self.items, function (item, cb) {  // iterator
	            item.execute(function (err, message, ele) {
	                // 第一个校验错误的元素
	                if (err && !hasError) {
	                    hasError = true;
	                    firstElem = ele;
	                }
	                results.push([].slice.call(arguments, 0));

	                // Async doesn't allow any of tasks to fail, if you want the final callback executed after all tasks finished.
	                // So pass none-error value to task callback instead of the real result.
	                cb(self.get('stopOnError') ? err : null);

	            });
	        }, function () {  // complete callback
	            if (self.get('autoFocus') && hasError) {
	                self.trigger('autoFocus', firstElem);
	                firstElem.focus();
	            }

	            self.trigger('formValidated', hasError, results, self.element);
	            callback && callback(hasError, results, self.element);
	        });

	        return self;
	    },

	    destroy: function () {
	        var self = this,
	            len = self.items.length;

	        if (self.element.is('form')) {
	            try {
	                if (self._novalidate_old == undefined)
	                    self.element.removeAttr('novalidate');
	                else
	                    self.element.attr('novalidate', self._novalidate_old);
	            } catch (e) {
	            }

	            self.element.off('submit.validator');
	        }

	        for (var i = len - 1; i >= 0; i--) {
	            self.removeItem(self.items[i]);
	        }
	        erase(self, validators);

	        Core.superclass.destroy.call(this);
	    },

	    query: function (selector) {
	        return findItemBySelector(this.$(selector), this.items);

	        // 不使用 Widget.query 是因为, selector 有可能是重复, 选择第一个有可能不是属于
	        // 该组件的. 即使 再次使用 this.items 匹配, 也没法找到
	        /*var target = Widget.query(selector),
	            result = null;
	        $.each(this.items, function (i, item) {
	            if (item === target) {
	                result = target;
	                return false;
	            }
	        });
	        return result;*/
	    }
	});

	// 从数组中删除对应元素
	function erase(target, array) {
	    for(var i=0; i<array.length; i++) {
	        if (target === array[i]) {
	            array.splice(i, 1);
	            return array;
	        }
	    }
	}

	function findItemBySelector(target, array) {
	    var ret;
	    $.each(array, function (i, item) {
	        if (target.get(0) === item.element.get(0)) {
	            ret = item;
	            return false;
	        }
	    });
	    return ret;
	}

	module.exports = Core;


/***/ },

/***/ 47:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var Core = __webpack_require__(46);
	var Validator = Core.extend({

	  events: {
	    'mouseenter .{{attrs.inputClass}}': 'mouseenter',
	    'mouseleave .{{attrs.inputClass}}': 'mouseleave',
	    'mouseenter .{{attrs.textareaClass}}': 'mouseenter',
	    'mouseleave .{{attrs.textareaClass}}': 'mouseleave',
	    'focus .{{attrs.itemClass}} input,textarea,select': 'focus',
	    'blur .{{attrs.itemClass}} input,textarea,select': 'blur'
	  },

	  attrs: {
	    explainClass: 'ui-form-explain',
	    itemClass: 'ui-form-item',
	    itemHoverClass: 'ui-form-item-hover',
	    itemFocusClass: 'ui-form-item-focus',
	    itemErrorClass: 'ui-form-item-error',
	    inputClass: 'ui-input',
	    textareaClass: 'ui-textarea',

	    showMessage: function (message, element) {
	      this.getExplain(element).html(message);
	      this.getItem(element).addClass(this.get('itemErrorClass'));
	    },

	    hideMessage: function (message, element) {
	      this.getExplain(element).html(element.attr('data-explain') || ' ');
	      this.getItem(element).removeClass(this.get('itemErrorClass'));
	    }
	  },

	  setup: function () {
	    Validator.superclass.setup.call(this);

	    var that = this;

	    this.on('autoFocus', function (ele) {
	      that.set('autoFocusEle', ele);
	    });
	  },

	  addItem: function (cfg) {
	    Validator.superclass.addItem.apply(this, [].slice.call(arguments));
	    var item = this.query(cfg.element);
	    if (item) {
	      this._saveExplainMessage(item);
	    }
	    return this;
	  },

	  _saveExplainMessage: function (item) {
	    var that = this;
	    var ele = item.element;

	    var explain = ele.attr('data-explain');
	    // If explaining message is not specified, retrieve it from data-explain attribute of the target
	    // or from DOM element with class name of the value of explainClass attr.
	    // Explaining message cannot always retrieve from DOM element with class name of the value of explainClass
	    // attr because the initial state of form may contain error messages from server.
	    // ---
	    // Also, If explaining message is under ui-form-item-error className
	    // it could be considered to be a error message from server
	    // that should not be put into data-explain attribute
	    if (explain === undefined && !this.getItem(ele).hasClass(this.get('itemErrorClass'))) {
	      ele.attr('data-explain', this.getExplain(ele).html());
	    }
	  },

	  getExplain: function (ele) {
	    var item = this.getItem(ele);
	    var explain = item.find('.' + this.get('explainClass'));

	    if (explain.length === 0) {
	     explain = $('<div class="' + this.get('explainClass') + '"></div>').appendTo(item);
	    }

	    return explain;
	  },

	  getItem: function (ele) {
	    ele = $(ele);
	    var item = ele.parents('.' + this.get('itemClass'));

	    return item;
	  },

	  mouseenter: function (e) {
	    this.getItem(e.target).addClass(this.get('itemHoverClass'));
	  },

	  mouseleave: function (e) {
	    this.getItem(e.target).removeClass(this.get('itemHoverClass'));
	  },

	  focus: function (e) {
	    var target = e.target,
	        autoFocusEle = this.get('autoFocusEle');

	    if (autoFocusEle && autoFocusEle.has(target)) {
	      var that = this;
	      $(target).keyup(function (e) {
	        that.set('autoFocusEle', null);
	        that.focus({target: target});
	      });
	      return;
	    }
	    this.getItem(target).removeClass(this.get('itemErrorClass'));
	    this.getItem(target).addClass(this.get('itemFocusClass'));
	    this.getExplain(target).html($(target).attr('data-explain') || '');
	  },

	  blur: function (e) {
	    this.getItem(e.target).removeClass(this.get('itemFocusClass'));
	  }
	});


	module.exports = Validator;


/***/ },

/***/ 48:
/***/ function(module, exports, __webpack_require__) {

	// var $ = require('jquery');
	var utils = __webpack_require__(20),
	    Widget = __webpack_require__(4),
	    async = __webpack_require__(19),
	    Rule = __webpack_require__(9);

	var setterConfig = {
	    value: $.noop,
	    setter: function (val) {
	        return $.isFunction(val) ? val : utils.helper(val);
	    }
	};

	function hasRequired(val){
	    return (' ' + val + ' ').indexOf(' required ') >= 0;
	}

	var Item = Widget.extend({
	    attrs: {
	        rule: {
	            value: '',
	            getter: function(val){
	                val = $.trim(val);

	                // 在获取的时候动态判断是否required，来追加或者删除 rule: required
	                if (this.get('required')) {
	                    if (!val || !hasRequired(val)) {
	                        val = $.trim('required ' + val);
	                    }
	                } else {
	                    if (hasRequired(val)) {
	                        val = $.trim((' ' + val + ' ').replace(' required ', ' '));
	                    }
	                }

	                return val;
	            }
	        },
	        display: null,
	        displayHelper: null,
	        triggerType: {
	            getter: function (val) {
	                if (!val)
	                    return val;

	                var element = this.element,
	                    type = element.attr('type');

	                // 将 select, radio, checkbox 的 blur 和 key 事件转成 change
	                var b = element.is("select") || type == 'radio' || type == 'checkbox';
	                if (b && (val.indexOf('blur') > -1 || val.indexOf('key') > -1))
	                    return 'change';
	                return val;
	            }
	        },
	        required: {
	            value: false,
	            getter: function(val) {
	                return $.isFunction(val) ? val() : val;
	            }
	        },
	        checkNull: true,
	        errormessage: null,
	        onItemValidate: setterConfig,
	        onItemValidated: setterConfig,
	        showMessage: setterConfig,
	        hideMessage: setterConfig
	    },

	    setup: function () {
	        if (!this.get('display') && $.isFunction(this.get('displayHelper'))) {
	            this.set('display', this.get('displayHelper')(this));
	        }
	    },

	    // callback 为当这个项校验完后, 通知 form 的 async.forEachSeries 此项校验结束并把结果通知到 async,
	    // 通过 async.forEachSeries 的第二个参数 Fn(item, cb) 的 cb 参数
	    execute: function (callback, context) {
	        var self = this,
	            elemDisabled = !!self.element.attr("disabled");

	        context = context || {};
	        // 如果是设置了不检查不可见元素的话, 直接 callback
	        if (self.get('skipHidden') && utils.isHidden(self.element) || elemDisabled) {
	            callback && callback(null, '', self.element);
	            return self;
	        }

	        self.trigger('itemValidate', self.element, context.event);

	        var rules = utils.parseRules(self.get('rule'));

	        if (rules) {
	            _metaValidate(self, rules, function (err, msg) {
	                self.trigger('itemValidated', err, msg, self.element, context.event);
	                callback && callback(err, msg, self.element);
	            });
	        } else {
	            self.trigger('itemValidated', null, '', self.element, context.event);
	            callback && callback(null, '', self.element);
	        }

	        return self;
	    },
	    getMessage: function(theRule, isSuccess, options) {
	        var message = '',
	            self = this,
	            rules = utils.parseRules(self.get('rule'));

	        isSuccess = !!isSuccess;

	        $.each(rules, function(i, item) {
	            var obj = utils.parseRule(item),
	                ruleName = obj.name,
	                param = obj.param;

	            if (theRule === ruleName) {
	                message = Rule.getMessage($.extend(options || {}, getMsgOptions(param, ruleName, self)), isSuccess);
	            }
	        });
	        return message;
	    }
	});

	function getMsgOptions(param, ruleName, self) {
	    var options = $.extend({}, param, {
	        element: self.element,
	        display: (param && param.display) || self.get('display'),
	        rule: ruleName
	    });

	    var message = self.get('errormessage' + upperFirstLetter(ruleName)) || self.get('errormessage');
	    if (message && !options.message) {
	        options.message = {
	            failure: message
	        };
	    }

	    return options;
	}

	function upperFirstLetter(str) {
	    str = str + "";
	    return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function _metaValidate(self, rules, callback) {
	    var ele = self.element;

	    if (!self.get('required')) {
	        var truly = false;
	        var t = ele.attr('type');
	        switch (t) {
	            case 'checkbox':
	            case 'radio':
	                var checked = false;
	                ele.each(function (i, item) {
	                    if ($(item).prop('checked')) {
	                        checked = true;
	                        return false;
	                    }
	                });
	                truly = checked;
	                break;
	            default:
	                truly = !!ele.val();
	        }

	        // 非必要且没有值的时候, 直接 callback
	        if (!truly) {
	            callback && callback(null, null);
	            return;
	        }
	    }

	    if (!$.isArray(rules))
	        throw new Error('No validation rule specified or not specified as an array.');

	    var tasks = [];

	    $.each(rules, function (i, item) {
	        var obj = utils.parseRule(item),
	            ruleName = obj.name,
	            param = obj.param;

	        var ruleOperator = Rule.getOperator(ruleName);
	        if (!ruleOperator)
	            throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');

	        var options = getMsgOptions(param, ruleName, self);

	        tasks.push(function (cb) {
	            // cb 为 async.series 每个 tasks 函数 的 callback!!
	            // callback(err, results)
	            // self._validator 为当前 Item 对象所在的 Validator 对象
	            ruleOperator.call(self._validator, options, cb);
	        });
	    });


	    // form.execute -> 多个 item.execute -> 多个 rule.operator
	    // 多个 rule 的校验是串行的, 前一个出错, 立即停止
	    // async.series 的 callback fn, 在执行 tasks 结束或某个 task 出错后被调用
	    // 其参数 results 为当前每个 task 执行的结果
	    // 函数内的 callback 回调给项校验
	    async.series(tasks, function (err, results) {
	        callback && callback(err, results[results.length - 1]);
	    });
	}

	module.exports = Item;


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

/***/ 66:
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },

/***/ 71:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports


	// module
	exports.push([module.id, ".ui-autocomplete .ui-autocomplete-content {\n  padding: 10px;\n  background: #fff;\n  border: 1px solid #ddd; }\n\n.ui-autocomplete .ui-autocomplete-item {\n  padding: 0 5px;\n  line-height: 28px;\n  border-bottom: 1px solid #efefef;\n  cursor: pointer; }\n  .ui-autocomplete .ui-autocomplete-item:hover, .ui-autocomplete .ui-autocomplete-item.ui-autocomplete-item-hover {\n    background: #efefef; }\n\n.ui-autocomplete .ui-autocomplete-footer {\n  padding-top: 5px;\n  text-align: right;\n  color: #999; }\n  .ui-autocomplete .ui-autocomplete-footer strong {\n    color: #666; }\n", ""]);

	// exports


/***/ },

/***/ 72:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports


	// module
	exports.push([module.id, "/*-------------------------------------\r\nzTree Style\r\n\r\nversion:  3.5.19\r\nauthor:   Hunter.z\r\nemail:    hunter.z@263.net\r\nwebsite:  http://code.google.com/p/jquerytree/\r\n\r\n-------------------------------------*/\r\n\r\n.ztree * {\r\n    padding: 0;\r\n    margin: 0;\r\n    font-size: 12px;\r\n    font-family: Verdana, Arial, Helvetica, AppleGothic, sans-serif;\r\n}\r\n\r\n.ztree {\r\n    margin: 0;\r\n    padding: 5px;\r\n    color: #333;\r\n}\r\n\r\n.ztree li {\r\n    padding: 0;\r\n    margin: 0;\r\n    list-style: none;\r\n    line-height: 14px;\r\n    text-align: left;\r\n    white-space: nowrap;\r\n    outline: 0;\r\n}\r\n\r\n.ztree li ul {\r\n    margin: 0;\r\n    padding: 0 0 0 18px;\r\n}\r\n\r\n.ztree li ul.line {\r\n    background: url(" + __webpack_require__(77) + ") 0 0 repeat-y;\r\n}\r\n\r\n.ztree li a {\r\n    padding: 1px 3px 0 0;\r\n    margin: 0;\r\n    cursor: pointer;\r\n    height: 17px;\r\n    color: #333;\r\n    background-color: transparent;\r\n    text-decoration: none;\r\n    vertical-align: top;\r\n    display: inline-block;\r\n}\r\n\r\n.ztree li a:hover {\r\n    text-decoration: underline;\r\n}\r\n\r\n.ztree li a.curSelectedNode {\r\n    padding-top: 0px;\r\n    background-color: #FFE6B0;\r\n    color: black;\r\n    height: 16px;\r\n    border: 1px #FFB951 solid;\r\n    opacity: 0.8;\r\n}\r\n\r\n.ztree li a.curSelectedNode_Edit {\r\n    padding-top: 0px;\r\n    background-color: #FFE6B0;\r\n    color: black;\r\n    height: 16px;\r\n    border: 1px #FFB951 solid;\r\n    opacity: 0.8;\r\n}\r\n\r\n.ztree li a.tmpTargetNode_inner {\r\n    padding-top: 0px;\r\n    background-color: #316AC5;\r\n    color: white;\r\n    height: 16px;\r\n    border: 1px #316AC5 solid;\r\n    opacity: 0.8;\r\n    filter: alpha(opacity=80);\r\n}\r\n\r\n.ztree li a.tmpTargetNode_prev {}\r\n\r\n.ztree li a.tmpTargetNode_next {}\r\n\r\n.ztree li a input.rename {\r\n    height: 14px;\r\n    width: 80px;\r\n    padding: 0;\r\n    margin: 0;\r\n    font-size: 12px;\r\n    border: 1px #7EC4CC solid;\r\n    *border: 0px;\r\n}\r\n\r\n.ztree li span {\r\n    line-height: 16px;\r\n    margin-right: 2px;\r\n}\r\n\r\n.ztree li span.button {\r\n    line-height: 0;\r\n    margin: 0;\r\n    width: 16px;\r\n    height: 16px;\r\n    display: inline-block;\r\n    vertical-align: middle;\r\n    border: 0 none;\r\n    cursor: pointer;\r\n    outline: none;\r\n    background-color: transparent;\r\n    background-repeat: no-repeat;\r\n    background-attachment: scroll;\r\n    background-image: url(" + __webpack_require__(66) + ");\r\n}\r\n\r\n.ztree li span.button.chk {\r\n    width: 13px;\r\n    height: 13px;\r\n    margin: 0 3px 0 0;\r\n    cursor: auto;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_false_full {\r\n    background-position: 0 0;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_false_full_focus {\r\n    background-position: 0 -14px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_false_part {\r\n    background-position: 0 -28px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_false_part_focus {\r\n    background-position: 0 -42px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_false_disable {\r\n    background-position: 0 -56px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_true_full {\r\n    background-position: -14px 0;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_true_full_focus {\r\n    background-position: -14px -14px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_true_part {\r\n    background-position: -14px -28px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_true_part_focus {\r\n    background-position: -14px -42px;\r\n}\r\n\r\n.ztree li span.button.chk.checkbox_true_disable {\r\n    background-position: -14px -56px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_false_full {\r\n    background-position: -28px 0;\r\n}\r\n\r\n.ztree li span.button.chk.radio_false_full_focus {\r\n    background-position: -28px -14px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_false_part {\r\n    background-position: -28px -28px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_false_part_focus {\r\n    background-position: -28px -42px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_false_disable {\r\n    background-position: -28px -56px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_true_full {\r\n    background-position: -42px 0;\r\n}\r\n\r\n.ztree li span.button.chk.radio_true_full_focus {\r\n    background-position: -42px -14px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_true_part {\r\n    background-position: -42px -28px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_true_part_focus {\r\n    background-position: -42px -42px;\r\n}\r\n\r\n.ztree li span.button.chk.radio_true_disable {\r\n    background-position: -42px -56px;\r\n}\r\n\r\n.ztree li span.button.switch {\r\n    width: 18px;\r\n    height: 18px;\r\n}\r\n\r\n.ztree li span.button.root_open {\r\n    background-position: -92px -54px;\r\n}\r\n\r\n.ztree li span.button.root_close {\r\n    background-position: -74px -54px;\r\n}\r\n\r\n.ztree li span.button.roots_open {\r\n    background-position: -92px 0;\r\n}\r\n\r\n.ztree li span.button.roots_close {\r\n    background-position: -74px 0;\r\n}\r\n\r\n.ztree li span.button.center_open {\r\n    background-position: -92px -18px;\r\n}\r\n\r\n.ztree li span.button.center_close {\r\n    background-position: -74px -18px;\r\n}\r\n\r\n.ztree li span.button.bottom_open {\r\n    background-position: -92px -36px;\r\n}\r\n\r\n.ztree li span.button.bottom_close {\r\n    background-position: -74px -36px;\r\n}\r\n\r\n.ztree li span.button.noline_open {\r\n    background-position: -92px -72px;\r\n}\r\n\r\n.ztree li span.button.noline_close {\r\n    background-position: -74px -72px;\r\n}\r\n\r\n.ztree li span.button.root_docu {\r\n    background: none;\r\n}\r\n\r\n.ztree li span.button.roots_docu {\r\n    background-position: -56px 0;\r\n}\r\n\r\n.ztree li span.button.center_docu {\r\n    background-position: -56px -18px;\r\n}\r\n\r\n.ztree li span.button.bottom_docu {\r\n    background-position: -56px -36px;\r\n}\r\n\r\n.ztree li span.button.noline_docu {\r\n    background: none;\r\n}\r\n\r\n.ztree li span.button.ico_open {\r\n    margin-right: 2px;\r\n    background-position: -110px -16px;\r\n    vertical-align: top;\r\n    *vertical-align: middle;\r\n}\r\n\r\n.ztree li span.button.ico_close {\r\n    margin-right: 2px;\r\n    background-position: -110px 0;\r\n    vertical-align: top;\r\n    *vertical-align: middle;\r\n}\r\n\r\n.ztree li span.button.ico_docu {\r\n    margin-right: 2px;\r\n    background-position: -110px -32px;\r\n    vertical-align: top;\r\n    *vertical-align: middle;\r\n}\r\n\r\n.ztree li span.button.edit {\r\n    margin-right: 2px;\r\n    background-position: -110px -48px;\r\n    vertical-align: top;\r\n    *vertical-align: middle;\r\n}\r\n\r\n.ztree li span.button.remove {\r\n    margin-right: 2px;\r\n    background-position: -110px -64px;\r\n    vertical-align: top;\r\n    *vertical-align: middle;\r\n}\r\n\r\n.ztree li span.button.ico_loading {\r\n    margin-right: 2px;\r\n    background: url(" + __webpack_require__(78) + ") no-repeat scroll 0 0 transparent;\r\n    vertical-align: top;\r\n    *vertical-align: middle;\r\n}\r\n\r\nul.tmpTargetzTree {\r\n    background-color: #FFE6B0;\r\n    opacity: 0.8;\r\n    filter: alpha(opacity=80);\r\n}\r\n\r\nspan.tmpzTreeMove_arrow {\r\n    width: 16px;\r\n    height: 16px;\r\n    display: inline-block;\r\n    padding: 0;\r\n    margin: 2px 0 0 1px;\r\n    border: 0 none;\r\n    position: absolute;\r\n    background-color: transparent;\r\n    background-repeat: no-repeat;\r\n    background-attachment: scroll;\r\n    background-position: -110px -80px;\r\n    background-image: url(" + __webpack_require__(66) + ");\r\n}\r\n\r\nul.ztree.zTreeDragUL {\r\n    margin: 0;\r\n    padding: 0;\r\n    position: absolute;\r\n    width: auto;\r\n    height: auto;\r\n    overflow: hidden;\r\n    background-color: #cfcfcf;\r\n    border: 1px #00B83F dotted;\r\n    opacity: 0.8;\r\n    filter: alpha(opacity=80);\r\n}\r\n\r\n.zTreeMask {\r\n    z-index: 10000;\r\n    background-color: #cfcfcf;\r\n    opacity: 0.0;\r\n    filter: alpha(opacity=0);\r\n    position: absolute;\r\n}\r\n\r\n\r\n/* level style*/\r\n\r\n\r\n/*.ztree li span.button.level0 {\r\n  display:none;\r\n}\r\n.ztree li ul.level0 {\r\n  padding:0;\r\n  background:none;\r\n}*/\r\n", ""]);

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

/***/ 76:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(72);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(16)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 77:
/***/ function(module, exports) {

	module.exports = "data:image/gif;base64,R0lGODlhCQACAIAAAMzMzP///yH5BAEAAAEALAAAAAAJAAIAAAIEjI9pUAA7"

/***/ },

/***/ 78:
/***/ function(module, exports) {

	module.exports = "data:image/gif;base64,R0lGODlhEAAQAKIGAMLY8YSx5HOm4Mjc88/g9Ofw+v///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFDQoABgAsAAAAABAAEAAAAzBoukW1MBoyiFwgANNej4EQRJQFZRv0XSzjtF/ZyutVt/ar6osM+S7P60aq4ILHZAIAIfkEBQ0KAAYALAIAAAAHAAUAAAMPaGoQsCaIUEhhjgwC610JACH5BAUNCgAGACwGAAAABwAFAAADD1hU1kaDOKMYCGAGEeYFCQAh+QQFDQoABgAsDQoAAgAFAAcAAAMQWFRmNKQp1moFAbQgQsNAAgAh+QQFDQoABgAsDQoABgAFAAcAAAMQaFZUSoMo5pQCAaggws1KAgAh+QQFDQoABgAsBgANCgAHAAUAAAMPaGpFtYYMAgJgLogA610JACH5BAUNCgAGACwCAA0KAAcABQAAAw8IAdYWIjijWCFlkkHmLQkAIfkEBQ0KAAYALAAABgAFAAcAAAMQCAFmIaEp1motpDQySMNFAgA7"

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

/***/ 85:
/***/ function(module, exports) {

	
	/*
	 * JQuery zTree core v3.5.22
	 * http://zTree.me/
	 *
	 * Copyright (c) 2010 Hunter.z
	 *
	 * Licensed same as jquery - MIT License
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * email: hunter.z@263.net
	 * Date: 2016-03-01
	 */
	(function($){
		var settings = {}, roots = {}, caches = {},
		//default consts of core
		_consts = {
			className: {
				BUTTON: "button",
				LEVEL: "level",
				ICO_LOADING: "ico_loading",
				SWITCH: "switch",
				NAME: 'node_name'
			},
			event: {
				NODECREATED: "ztree_nodeCreated",
				CLICK: "ztree_click",
				EXPAND: "ztree_expand",
				COLLAPSE: "ztree_collapse",
				ASYNC_SUCCESS: "ztree_async_success",
				ASYNC_ERROR: "ztree_async_error",
				REMOVE: "ztree_remove",
				SELECTED: "ztree_selected",
				UNSELECTED: "ztree_unselected"
			},
			id: {
				A: "_a",
				ICON: "_ico",
				SPAN: "_span",
				SWITCH: "_switch",
				UL: "_ul"
			},
			line: {
				ROOT: "root",
				ROOTS: "roots",
				CENTER: "center",
				BOTTOM: "bottom",
				NOLINE: "noline",
				LINE: "line"
			},
			folder: {
				OPEN: "open",
				CLOSE: "close",
				DOCU: "docu"
			},
			node: {
				CURSELECTED: "curSelectedNode"
			}
		},
		//default setting of core
		_setting = {
			treeId: "",
			treeObj: null,
			view: {
				addDiyDom: null,
				autoCancelSelected: true,
				dblClickExpand: true,
				expandSpeed: "fast",
				fontCss: {},
				nameIsHTML: false,
				selectedMulti: true,
				showIcon: true,
				showLine: true,
				showTitle: true,
				txtSelectedEnable: false
			},
			data: {
				key: {
					children: "children",
					name: "name",
					title: "",
					url: "url",
					icon: "icon"
				},
				simpleData: {
					enable: false,
					idKey: "id",
					pIdKey: "pId",
					rootPId: null
				},
				keep: {
					parent: false,
					leaf: false
				}
			},
			async: {
				enable: false,
				contentType: "application/x-www-form-urlencoded",
				type: "post",
				dataType: "text",
				url: "",
				autoParam: [],
				otherParam: [],
				dataFilter: null
			},
			callback: {
				beforeAsync:null,
				beforeClick:null,
				beforeDblClick:null,
				beforeRightClick:null,
				beforeMouseDown:null,
				beforeMouseUp:null,
				beforeExpand:null,
				beforeCollapse:null,
				beforeRemove:null,

				onAsyncError:null,
				onAsyncSuccess:null,
				onNodeCreated:null,
				onClick:null,
				onDblClick:null,
				onRightClick:null,
				onMouseDown:null,
				onMouseUp:null,
				onExpand:null,
				onCollapse:null,
				onRemove:null
			}
		},
		//default root of core
		//zTree use root to save full data
		_initRoot = function (setting) {
			var r = data.getRoot(setting);
			if (!r) {
				r = {};
				data.setRoot(setting, r);
			}
			r[setting.data.key.children] = [];
			r.expandTriggerFlag = false;
			r.curSelectedList = [];
			r.noSelection = true;
			r.createdNodes = [];
			r.zId = 0;
			r._ver = (new Date()).getTime();
		},
		//default cache of core
		_initCache = function(setting) {
			var c = data.getCache(setting);
			if (!c) {
				c = {};
				data.setCache(setting, c);
			}
			c.nodes = [];
			c.doms = [];
		},
		//default bindEvent of core
		_bindEvent = function(setting) {
			var o = setting.treeObj,
			c = consts.event;
			o.bind(c.NODECREATED, function (event, treeId, node) {
				tools.apply(setting.callback.onNodeCreated, [event, treeId, node]);
			});

			o.bind(c.CLICK, function (event, srcEvent, treeId, node, clickFlag) {
				tools.apply(setting.callback.onClick, [srcEvent, treeId, node, clickFlag]);
			});

			o.bind(c.EXPAND, function (event, treeId, node) {
				tools.apply(setting.callback.onExpand, [event, treeId, node]);
			});

			o.bind(c.COLLAPSE, function (event, treeId, node) {
				tools.apply(setting.callback.onCollapse, [event, treeId, node]);
			});

			o.bind(c.ASYNC_SUCCESS, function (event, treeId, node, msg) {
				tools.apply(setting.callback.onAsyncSuccess, [event, treeId, node, msg]);
			});

			o.bind(c.ASYNC_ERROR, function (event, treeId, node, XMLHttpRequest, textStatus, errorThrown) {
				tools.apply(setting.callback.onAsyncError, [event, treeId, node, XMLHttpRequest, textStatus, errorThrown]);
			});

			o.bind(c.REMOVE, function (event, treeId, treeNode) {
				tools.apply(setting.callback.onRemove, [event, treeId, treeNode]);
			});

			o.bind(c.SELECTED, function (event, treeId, node) {
				tools.apply(setting.callback.onSelected, [treeId, node]);
			});
			o.bind(c.UNSELECTED, function (event, treeId, node) {
				tools.apply(setting.callback.onUnSelected, [treeId, node]);
			});
		},
		_unbindEvent = function(setting) {
			var o = setting.treeObj,
			c = consts.event;
			o.unbind(c.NODECREATED)
			.unbind(c.CLICK)
			.unbind(c.EXPAND)
			.unbind(c.COLLAPSE)
			.unbind(c.ASYNC_SUCCESS)
			.unbind(c.ASYNC_ERROR)
			.unbind(c.REMOVE)
			.unbind(c.SELECTED)
			.unbind(c.UNSELECTED);
		},
		//default event proxy of core
		_eventProxy = function(event) {
			var target = event.target,
			setting = data.getSetting(event.data.treeId),
			tId = "", node = null,
			nodeEventType = "", treeEventType = "",
			nodeEventCallback = null, treeEventCallback = null,
			tmp = null;

			if (tools.eqs(event.type, "mousedown")) {
				treeEventType = "mousedown";
			} else if (tools.eqs(event.type, "mouseup")) {
				treeEventType = "mouseup";
			} else if (tools.eqs(event.type, "contextmenu")) {
				treeEventType = "contextmenu";
			} else if (tools.eqs(event.type, "click")) {
				if (tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.SWITCH) !== null) {
					tId = tools.getNodeMainDom(target).id;
					nodeEventType = "switchNode";
				} else {
					tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
					if (tmp) {
						tId = tools.getNodeMainDom(tmp).id;
						nodeEventType = "clickNode";
					}
				}
			} else if (tools.eqs(event.type, "dblclick")) {
				treeEventType = "dblclick";
				tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (tmp) {
					tId = tools.getNodeMainDom(tmp).id;
					nodeEventType = "switchNode";
				}
			}
			if (treeEventType.length > 0 && tId.length == 0) {
				tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (tmp) {tId = tools.getNodeMainDom(tmp).id;}
			}
			// event to node
			if (tId.length>0) {
				node = data.getNodeCache(setting, tId);
				switch (nodeEventType) {
					case "switchNode" :
						if (!node.isParent) {
							nodeEventType = "";
						} else if (tools.eqs(event.type, "click")
							|| (tools.eqs(event.type, "dblclick") && tools.apply(setting.view.dblClickExpand, [setting.treeId, node], setting.view.dblClickExpand))) {
							nodeEventCallback = handler.onSwitchNode;
						} else {
							nodeEventType = "";
						}
						break;
					case "clickNode" :
						nodeEventCallback = handler.onClickNode;
						break;
				}
			}
			// event to zTree
			switch (treeEventType) {
				case "mousedown" :
					treeEventCallback = handler.onZTreeMousedown;
					break;
				case "mouseup" :
					treeEventCallback = handler.onZTreeMouseup;
					break;
				case "dblclick" :
					treeEventCallback = handler.onZTreeDblclick;
					break;
				case "contextmenu" :
					treeEventCallback = handler.onZTreeContextmenu;
					break;
			}
			var proxyResult = {
				stop: false,
				node: node,
				nodeEventType: nodeEventType,
				nodeEventCallback: nodeEventCallback,
				treeEventType: treeEventType,
				treeEventCallback: treeEventCallback
			};
			return proxyResult
		},
		//default init node of core
		_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
			if (!n) return;
			var r = data.getRoot(setting),
			childKey = setting.data.key.children;
			n.level = level;
			n.tId = setting.treeId + "_" + (++r.zId);
			n.parentTId = parentNode ? parentNode.tId : null;
			n.open = (typeof n.open == "string") ? tools.eqs(n.open, "true") : !!n.open;
			if (n[childKey] && n[childKey].length > 0) {
				n.isParent = true;
				n.zAsync = true;
			} else {
				n.isParent = (typeof n.isParent == "string") ? tools.eqs(n.isParent, "true") : !!n.isParent;
				n.open = (n.isParent && !setting.async.enable) ? n.open : false;
				n.zAsync = !n.isParent;
			}
			n.isFirstNode = isFirstNode;
			n.isLastNode = isLastNode;
			n.getParentNode = function() {return data.getNodeCache(setting, n.parentTId);};
			n.getPreNode = function() {return data.getPreNode(setting, n);};
			n.getNextNode = function() {return data.getNextNode(setting, n);};
			n.getIndex = function() {return data.getNodeIndex(setting, n);};
			n.getPath = function() {return data.getNodePath(setting, n);};
			n.isAjaxing = false;
			data.fixPIdKeyValue(setting, n);
		},
		_init = {
			bind: [_bindEvent],
			unbind: [_unbindEvent],
			caches: [_initCache],
			nodes: [_initNode],
			proxys: [_eventProxy],
			roots: [_initRoot],
			beforeA: [],
			afterA: [],
			innerBeforeA: [],
			innerAfterA: [],
			zTreeTools: []
		},
		//method of operate data
		data = {
			addNodeCache: function(setting, node) {
				data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = node;
			},
			getNodeCacheId: function(tId) {
				return tId.substring(tId.lastIndexOf("_")+1);
			},
			addAfterA: function(afterA) {
				_init.afterA.push(afterA);
			},
			addBeforeA: function(beforeA) {
				_init.beforeA.push(beforeA);
			},
			addInnerAfterA: function(innerAfterA) {
				_init.innerAfterA.push(innerAfterA);
			},
			addInnerBeforeA: function(innerBeforeA) {
				_init.innerBeforeA.push(innerBeforeA);
			},
			addInitBind: function(bindEvent) {
				_init.bind.push(bindEvent);
			},
			addInitUnBind: function(unbindEvent) {
				_init.unbind.push(unbindEvent);
			},
			addInitCache: function(initCache) {
				_init.caches.push(initCache);
			},
			addInitNode: function(initNode) {
				_init.nodes.push(initNode);
			},
			addInitProxy: function(initProxy, isFirst) {
				if (!!isFirst) {
					_init.proxys.splice(0,0,initProxy);
				} else {
					_init.proxys.push(initProxy);
				}
			},
			addInitRoot: function(initRoot) {
				_init.roots.push(initRoot);
			},
			addNodesData: function(setting, parentNode, index, nodes) {
				var childKey = setting.data.key.children, params;
				if (!parentNode[childKey]) {
					parentNode[childKey] = [];
					index = -1;
				} else if (index >= parentNode[childKey].length) {
					index = -1;
				}

				if (parentNode[childKey].length > 0 && index === 0) {
					parentNode[childKey][0].isFirstNode = false;
					view.setNodeLineIcos(setting, parentNode[childKey][0]);
				} else if (parentNode[childKey].length > 0 && index < 0) {
					parentNode[childKey][parentNode[childKey].length - 1].isLastNode = false;
					view.setNodeLineIcos(setting, parentNode[childKey][parentNode[childKey].length - 1]);
				}
				parentNode.isParent = true;

				if (index<0) {
					parentNode[childKey] = parentNode[childKey].concat(nodes);
				} else {
					params = [index, 0].concat(nodes);
					parentNode[childKey].splice.apply(parentNode[childKey], params);
				}
			},
			addSelectedNode: function(setting, node) {
				var root = data.getRoot(setting);
				if (!data.isSelectedNode(setting, node)) {
					root.curSelectedList.push(node);
				}
			},
			addCreatedNode: function(setting, node) {
				if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
					var root = data.getRoot(setting);
					root.createdNodes.push(node);
				}
			},
			addZTreeTools: function(zTreeTools) {
				_init.zTreeTools.push(zTreeTools);
			},
			exSetting: function(s) {
				$.extend(true, _setting, s);
			},
			fixPIdKeyValue: function(setting, node) {
				if (setting.data.simpleData.enable) {
					node[setting.data.simpleData.pIdKey] = node.parentTId ? node.getParentNode()[setting.data.simpleData.idKey] : setting.data.simpleData.rootPId;
				}
			},
			getAfterA: function(setting, node, array) {
				for (var i=0, j=_init.afterA.length; i<j; i++) {
					_init.afterA[i].apply(this, arguments);
				}
			},
			getBeforeA: function(setting, node, array) {
				for (var i=0, j=_init.beforeA.length; i<j; i++) {
					_init.beforeA[i].apply(this, arguments);
				}
			},
			getInnerAfterA: function(setting, node, array) {
				for (var i=0, j=_init.innerAfterA.length; i<j; i++) {
					_init.innerAfterA[i].apply(this, arguments);
				}
			},
			getInnerBeforeA: function(setting, node, array) {
				for (var i=0, j=_init.innerBeforeA.length; i<j; i++) {
					_init.innerBeforeA[i].apply(this, arguments);
				}
			},
			getCache: function(setting) {
				return caches[setting.treeId];
			},
			getNodeIndex: function(setting, node) {
				if (!node) return null;
				var childKey = setting.data.key.children,
				p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
				for (var i=0, l=p[childKey].length-1; i<=l; i++) {
					if (p[childKey][i] === node) {
						return i;
					}
				}
				return -1;
			},
			getNextNode: function(setting, node) {
				if (!node) return null;
				var childKey = setting.data.key.children,
				p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
				for (var i=0, l=p[childKey].length-1; i<=l; i++) {
					if (p[childKey][i] === node) {
						return (i==l ? null : p[childKey][i+1]);
					}
				}
				return null;
			},
			getNodeByParam: function(setting, nodes, key, value) {
				if (!nodes || !key) return null;
				var childKey = setting.data.key.children;
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i][key] == value) {
						return nodes[i];
					}
					var tmp = data.getNodeByParam(setting, nodes[i][childKey], key, value);
					if (tmp) return tmp;
				}
				return null;
			},
			getNodeCache: function(setting, tId) {
				if (!tId) return null;
				var n = caches[setting.treeId].nodes[data.getNodeCacheId(tId)];
				return n ? n : null;
			},
			getNodeName: function(setting, node) {
				var nameKey = setting.data.key.name;
				return "" + node[nameKey];
			},
			getNodePath: function(setting, node) {
				if (!node) return null;

				var path;
				if(node.parentTId) {
					path = node.getParentNode().getPath();
				} else {
					path = [];
				}

				if (path) {
					path.push(node);
				}

				return path;
			},
			getNodeTitle: function(setting, node) {
				var t = setting.data.key.title === "" ? setting.data.key.name : setting.data.key.title;
				return "" + node[t];
			},
			getNodes: function(setting) {
				return data.getRoot(setting)[setting.data.key.children];
			},
			getNodesByParam: function(setting, nodes, key, value) {
				if (!nodes || !key) return [];
				var childKey = setting.data.key.children,
				result = [];
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i][key] == value) {
						result.push(nodes[i]);
					}
					result = result.concat(data.getNodesByParam(setting, nodes[i][childKey], key, value));
				}
				return result;
			},
			getNodesByParamFuzzy: function(setting, nodes, key, value) {
				if (!nodes || !key) return [];
				var childKey = setting.data.key.children,
				result = [];
				value = value.toLowerCase();
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (typeof nodes[i][key] == "string" && nodes[i][key].toLowerCase().indexOf(value)>-1) {
						result.push(nodes[i]);
					}
					result = result.concat(data.getNodesByParamFuzzy(setting, nodes[i][childKey], key, value));
				}
				return result;
			},
			getNodesByFilter: function(setting, nodes, filter, isSingle, invokeParam) {
				if (!nodes) return (isSingle ? null : []);
				var childKey = setting.data.key.children,
				result = isSingle ? null : [];
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (tools.apply(filter, [nodes[i], invokeParam], false)) {
						if (isSingle) {return nodes[i];}
						result.push(nodes[i]);
					}
					var tmpResult = data.getNodesByFilter(setting, nodes[i][childKey], filter, isSingle, invokeParam);
					if (isSingle && !!tmpResult) {return tmpResult;}
					result = isSingle ? tmpResult : result.concat(tmpResult);
				}
				return result;
			},
			getPreNode: function(setting, node) {
				if (!node) return null;
				var childKey = setting.data.key.children,
				p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
				for (var i=0, l=p[childKey].length; i<l; i++) {
					if (p[childKey][i] === node) {
						return (i==0 ? null : p[childKey][i-1]);
					}
				}
				return null;
			},
			getRoot: function(setting) {
				return setting ? roots[setting.treeId] : null;
			},
			getRoots: function() {
				return roots;
			},
			getSetting: function(treeId) {
				return settings[treeId];
			},
			getSettings: function() {
				return settings;
			},
			getZTreeTools: function(treeId) {
				var r = this.getRoot(this.getSetting(treeId));
				return r ? r.treeTools : null;
			},
			initCache: function(setting) {
				for (var i=0, j=_init.caches.length; i<j; i++) {
					_init.caches[i].apply(this, arguments);
				}
			},
			initNode: function(setting, level, node, parentNode, preNode, nextNode) {
				for (var i=0, j=_init.nodes.length; i<j; i++) {
					_init.nodes[i].apply(this, arguments);
				}
			},
			initRoot: function(setting) {
				for (var i=0, j=_init.roots.length; i<j; i++) {
					_init.roots[i].apply(this, arguments);
				}
			},
			isSelectedNode: function(setting, node) {
				var root = data.getRoot(setting);
				for (var i=0, j=root.curSelectedList.length; i<j; i++) {
					if(node === root.curSelectedList[i]) return true;
				}
				return false;
			},
			removeNodeCache: function(setting, node) {
				var childKey = setting.data.key.children;
				if (node[childKey]) {
					for (var i=0, l=node[childKey].length; i<l; i++) {
						arguments.callee(setting, node[childKey][i]);
					}
				}
				data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = null;
			},
			removeSelectedNode: function(setting, node) {
				var root = data.getRoot(setting);
				for (var i=0, j=root.curSelectedList.length; i<j; i++) {
					if(node === root.curSelectedList[i] || !data.getNodeCache(setting, root.curSelectedList[i].tId)) {
						root.curSelectedList.splice(i, 1);
						setting.treeObj.trigger(consts.event.UNSELECTED, [setting.treeId, node]);
						i--;j--;
					}
				}
			},
			setCache: function(setting, cache) {
				caches[setting.treeId] = cache;
			},
			setRoot: function(setting, root) {
				roots[setting.treeId] = root;
			},
			setZTreeTools: function(setting, zTreeTools) {
				for (var i=0, j=_init.zTreeTools.length; i<j; i++) {
					_init.zTreeTools[i].apply(this, arguments);
				}
			},
			transformToArrayFormat: function (setting, nodes) {
				if (!nodes) return [];
				var childKey = setting.data.key.children,
				r = [];
				if (tools.isArray(nodes)) {
					for (var i=0, l=nodes.length; i<l; i++) {
						r.push(nodes[i]);
						if (nodes[i][childKey])
							r = r.concat(data.transformToArrayFormat(setting, nodes[i][childKey]));
					}
				} else {
					r.push(nodes);
					if (nodes[childKey])
						r = r.concat(data.transformToArrayFormat(setting, nodes[childKey]));
				}
				return r;
			},
			transformTozTreeFormat: function(setting, sNodes) {
				var i,l,
				key = setting.data.simpleData.idKey,
				parentKey = setting.data.simpleData.pIdKey,
				childKey = setting.data.key.children;
				if (!key || key=="" || !sNodes) return [];

				if (tools.isArray(sNodes)) {
					var r = [];
					var tmpMap = [];
					for (i=0, l=sNodes.length; i<l; i++) {
						tmpMap[sNodes[i][key]] = sNodes[i];
					}
					for (i=0, l=sNodes.length; i<l; i++) {
						if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
							if (!tmpMap[sNodes[i][parentKey]][childKey])
								tmpMap[sNodes[i][parentKey]][childKey] = [];
							tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
						} else {
							r.push(sNodes[i]);
						}
					}
					return r;
				}else {
					return [sNodes];
				}
			}
		},
		//method of event proxy
		event = {
			bindEvent: function(setting) {
				for (var i=0, j=_init.bind.length; i<j; i++) {
					_init.bind[i].apply(this, arguments);
				}
			},
			unbindEvent: function(setting) {
				for (var i=0, j=_init.unbind.length; i<j; i++) {
					_init.unbind[i].apply(this, arguments);
				}
			},
			bindTree: function(setting) {
				var eventParam = {
					treeId: setting.treeId
				},
				o = setting.treeObj;
				if (!setting.view.txtSelectedEnable) {
					// for can't select text
					o.bind('selectstart', handler.onSelectStart).css({
						"-moz-user-select":"-moz-none"
					});
				}
				o.bind('click', eventParam, event.proxy);
				o.bind('dblclick', eventParam, event.proxy);
				o.bind('mouseover', eventParam, event.proxy);
				o.bind('mouseout', eventParam, event.proxy);
				o.bind('mousedown', eventParam, event.proxy);
				o.bind('mouseup', eventParam, event.proxy);
				o.bind('contextmenu', eventParam, event.proxy);
			},
			unbindTree: function(setting) {
				var o = setting.treeObj;
				o.unbind('selectstart', handler.onSelectStart)
					.unbind('click', event.proxy)
					.unbind('dblclick', event.proxy)
					.unbind('mouseover', event.proxy)
					.unbind('mouseout', event.proxy)
					.unbind('mousedown', event.proxy)
					.unbind('mouseup', event.proxy)
					.unbind('contextmenu', event.proxy);
			},
			doProxy: function(e) {
				var results = [];
				for (var i=0, j=_init.proxys.length; i<j; i++) {
					var proxyResult = _init.proxys[i].apply(this, arguments);
					results.push(proxyResult);
					if (proxyResult.stop) {
						break;
					}
				}
				return results;
			},
			proxy: function(e) {
				var setting = data.getSetting(e.data.treeId);
				if (!tools.uCanDo(setting, e)) return true;
				var results = event.doProxy(e),
				r = true, x = false;
				for (var i=0, l=results.length; i<l; i++) {
					var proxyResult = results[i];
					if (proxyResult.nodeEventCallback) {
						x = true;
						r = proxyResult.nodeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
					}
					if (proxyResult.treeEventCallback) {
						x = true;
						r = proxyResult.treeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
					}
				}
				return r;
			}
		},
		//method of event handler
		handler = {
			onSwitchNode: function (event, node) {
				var setting = data.getSetting(event.data.treeId);
				if (node.open) {
					if (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false) return true;
					data.getRoot(setting).expandTriggerFlag = true;
					view.switchNode(setting, node);
				} else {
					if (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false) return true;
					data.getRoot(setting).expandTriggerFlag = true;
					view.switchNode(setting, node);
				}
				return true;
			},
			onClickNode: function (event, node) {
				var setting = data.getSetting(event.data.treeId),
				clickFlag = ( (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey)) && data.isSelectedNode(setting, node)) ? 0 : (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey) && setting.view.selectedMulti) ? 2 : 1;
				if (tools.apply(setting.callback.beforeClick, [setting.treeId, node, clickFlag], true) == false) return true;
				if (clickFlag === 0) {
					view.cancelPreSelectedNode(setting, node);
				} else {
					view.selectNode(setting, node, clickFlag === 2);
				}
				setting.treeObj.trigger(consts.event.CLICK, [event, setting.treeId, node, clickFlag]);
				return true;
			},
			onZTreeMousedown: function(event, node) {
				var setting = data.getSetting(event.data.treeId);
				if (tools.apply(setting.callback.beforeMouseDown, [setting.treeId, node], true)) {
					tools.apply(setting.callback.onMouseDown, [event, setting.treeId, node]);
				}
				return true;
			},
			onZTreeMouseup: function(event, node) {
				var setting = data.getSetting(event.data.treeId);
				if (tools.apply(setting.callback.beforeMouseUp, [setting.treeId, node], true)) {
					tools.apply(setting.callback.onMouseUp, [event, setting.treeId, node]);
				}
				return true;
			},
			onZTreeDblclick: function(event, node) {
				var setting = data.getSetting(event.data.treeId);
				if (tools.apply(setting.callback.beforeDblClick, [setting.treeId, node], true)) {
					tools.apply(setting.callback.onDblClick, [event, setting.treeId, node]);
				}
				return true;
			},
			onZTreeContextmenu: function(event, node) {
				var setting = data.getSetting(event.data.treeId);
				if (tools.apply(setting.callback.beforeRightClick, [setting.treeId, node], true)) {
					tools.apply(setting.callback.onRightClick, [event, setting.treeId, node]);
				}
				return (typeof setting.callback.onRightClick) != "function";
			},
			onSelectStart: function(e){
				var n = e.originalEvent.srcElement.nodeName.toLowerCase();
				return (n === "input" || n === "textarea" );
			}
		},
		//method of tools for zTree
		tools = {
			apply: function(fun, param, defaultValue) {
				if ((typeof fun) == "function") {
					return fun.apply(zt, param?param:[]);
				}
				return defaultValue;
			},
			canAsync: function(setting, node) {
				var childKey = setting.data.key.children;
				return (setting.async.enable && node && node.isParent && !(node.zAsync || (node[childKey] && node[childKey].length > 0)));
			},
			clone: function (obj){
				if (obj === null) return null;
				var o = tools.isArray(obj) ? [] : {};
				for(var i in obj){
					o[i] = (obj[i] instanceof Date) ? new Date(obj[i].getTime()) : (typeof obj[i] === "object" ? arguments.callee(obj[i]) : obj[i]);
				}
				return o;
			},
			eqs: function(str1, str2) {
				return str1.toLowerCase() === str2.toLowerCase();
			},
			isArray: function(arr) {
				return Object.prototype.toString.apply(arr) === "[object Array]";
			},
			$: function(node, exp, setting) {
				if (!!exp && typeof exp != "string") {
					setting = exp;
					exp = "";
				}
				if (typeof node == "string") {
					return $(node, setting ? setting.treeObj.get(0).ownerDocument : null);
				} else {
					return $("#" + node.tId + exp, setting ? setting.treeObj : null);
				}
			},
			getMDom: function (setting, curDom, targetExpr) {
				if (!curDom) return null;
				while (curDom && curDom.id !== setting.treeId) {
					for (var i=0, l=targetExpr.length; curDom.tagName && i<l; i++) {
						if (tools.eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
							return curDom;
						}
					}
					curDom = curDom.parentNode;
				}
				return null;
			},
			getNodeMainDom:function(target) {
				return ($(target).parent("li").get(0) || $(target).parentsUntil("li").parent().get(0));
			},
			isChildOrSelf: function(dom, parentId) {
				return ( $(dom).closest("#" + parentId).length> 0 );
			},
			uCanDo: function(setting, e) {
				return true;
			}
		},
		//method of operate ztree dom
		view = {
			addNodes: function(setting, parentNode, index, newNodes, isSilent) {
				if (setting.data.keep.leaf && parentNode && !parentNode.isParent) {
					return;
				}
				if (!tools.isArray(newNodes)) {
					newNodes = [newNodes];
				}
				if (setting.data.simpleData.enable) {
					newNodes = data.transformTozTreeFormat(setting, newNodes);
				}
				if (parentNode) {
					var target_switchObj = $$(parentNode, consts.id.SWITCH, setting),
					target_icoObj = $$(parentNode, consts.id.ICON, setting),
					target_ulObj = $$(parentNode, consts.id.UL, setting);

					if (!parentNode.open) {
						view.replaceSwitchClass(parentNode, target_switchObj, consts.folder.CLOSE);
						view.replaceIcoClass(parentNode, target_icoObj, consts.folder.CLOSE);
						parentNode.open = false;
						target_ulObj.css({
							"display": "none"
						});
					}

					data.addNodesData(setting, parentNode, index, newNodes);
					view.createNodes(setting, parentNode.level + 1, newNodes, parentNode, index);
					if (!isSilent) {
						view.expandCollapseParentNode(setting, parentNode, true);
					}
				} else {
					data.addNodesData(setting, data.getRoot(setting), index, newNodes);
					view.createNodes(setting, 0, newNodes, null, index);
				}
			},
			appendNodes: function(setting, level, nodes, parentNode, index, initFlag, openFlag) {
				if (!nodes) return [];
				var html = [],
				childKey = setting.data.key.children;

				var tmpPNode = (parentNode) ? parentNode: data.getRoot(setting),
					tmpPChild = tmpPNode[childKey],
					isFirstNode, isLastNode;

				if (!tmpPChild || index >= tmpPChild.length) {
					index = -1;
				}

				for (var i = 0, l = nodes.length; i < l; i++) {
					var node = nodes[i];
					if (initFlag) {
						isFirstNode = ((index===0 || tmpPChild.length == nodes.length) && (i == 0));
						isLastNode = (index < 0 && i == (nodes.length - 1));
						data.initNode(setting, level, node, parentNode, isFirstNode, isLastNode, openFlag);
						data.addNodeCache(setting, node);
					}

					var childHtml = [];
					if (node[childKey] && node[childKey].length > 0) {
						//make child html first, because checkType
						childHtml = view.appendNodes(setting, level + 1, node[childKey], node, -1, initFlag, openFlag && node.open);
					}
					if (openFlag) {

						view.makeDOMNodeMainBefore(html, setting, node);
						view.makeDOMNodeLine(html, setting, node);
						data.getBeforeA(setting, node, html);
						view.makeDOMNodeNameBefore(html, setting, node);
						data.getInnerBeforeA(setting, node, html);
						view.makeDOMNodeIcon(html, setting, node);
						data.getInnerAfterA(setting, node, html);
						view.makeDOMNodeNameAfter(html, setting, node);
						data.getAfterA(setting, node, html);
						if (node.isParent && node.open) {
							view.makeUlHtml(setting, node, html, childHtml.join(''));
						}
						view.makeDOMNodeMainAfter(html, setting, node);
						data.addCreatedNode(setting, node);
					}
				}
				return html;
			},
			appendParentULDom: function(setting, node) {
				var html = [],
				nObj = $$(node, setting);
				if (!nObj.get(0) && !!node.parentTId) {
					view.appendParentULDom(setting, node.getParentNode());
					nObj = $$(node, setting);
				}
				var ulObj = $$(node, consts.id.UL, setting);
				if (ulObj.get(0)) {
					ulObj.remove();
				}
				var childKey = setting.data.key.children,
				childHtml = view.appendNodes(setting, node.level+1, node[childKey], node, -1, false, true);
				view.makeUlHtml(setting, node, html, childHtml.join(''));
				nObj.append(html.join(''));
			},
			asyncNode: function(setting, node, isSilent, callback) {
				var i, l;
				if (node && !node.isParent) {
					tools.apply(callback);
					return false;
				} else if (node && node.isAjaxing) {
					return false;
				} else if (tools.apply(setting.callback.beforeAsync, [setting.treeId, node], true) == false) {
					tools.apply(callback);
					return false;
				}
				if (node) {
					node.isAjaxing = true;
					var icoObj = $$(node, consts.id.ICON, setting);
					icoObj.attr({"style":"", "class":consts.className.BUTTON + " " + consts.className.ICO_LOADING});
				}

				var tmpParam = {};
				for (i = 0, l = setting.async.autoParam.length; node && i < l; i++) {
					var pKey = setting.async.autoParam[i].split("="), spKey = pKey;
					if (pKey.length>1) {
						spKey = pKey[1];
						pKey = pKey[0];
					}
					tmpParam[spKey] = node[pKey];
				}
				if (tools.isArray(setting.async.otherParam)) {
					for (i = 0, l = setting.async.otherParam.length; i < l; i += 2) {
						tmpParam[setting.async.otherParam[i]] = setting.async.otherParam[i + 1];
					}
				} else {
					for (var p in setting.async.otherParam) {
						tmpParam[p] = setting.async.otherParam[p];
					}
				}

				var _tmpV = data.getRoot(setting)._ver;
				$.ajax({
					contentType: setting.async.contentType,
	                cache: false,
					type: setting.async.type,
					url: tools.apply(setting.async.url, [setting.treeId, node], setting.async.url),
					data: tmpParam,
					dataType: setting.async.dataType,
					success: function(msg) {
						if (_tmpV != data.getRoot(setting)._ver) {
							return;
						}
						var newNodes = [];
						try {
							if (!msg || msg.length == 0) {
								newNodes = [];
							} else if (typeof msg == "string") {
								newNodes = eval("(" + msg + ")");
							} else {
								newNodes = msg;
							}
						} catch(err) {
							newNodes = msg;
						}

						if (node) {
							node.isAjaxing = null;
							node.zAsync = true;
						}
						view.setNodeLineIcos(setting, node);
						if (newNodes && newNodes !== "") {
							newNodes = tools.apply(setting.async.dataFilter, [setting.treeId, node, newNodes], newNodes);
							view.addNodes(setting, node, -1, !!newNodes ? tools.clone(newNodes) : [], !!isSilent);
						} else {
							view.addNodes(setting, node, -1, [], !!isSilent);
						}
						setting.treeObj.trigger(consts.event.ASYNC_SUCCESS, [setting.treeId, node, msg]);
						tools.apply(callback);
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						if (_tmpV != data.getRoot(setting)._ver) {
							return;
						}
						if (node) node.isAjaxing = null;
						view.setNodeLineIcos(setting, node);
						setting.treeObj.trigger(consts.event.ASYNC_ERROR, [setting.treeId, node, XMLHttpRequest, textStatus, errorThrown]);
					}
				});
				return true;
			},
			cancelPreSelectedNode: function (setting, node, excludeNode) {
				var list = data.getRoot(setting).curSelectedList,
					i, n;
				for (i=list.length-1; i>=0; i--) {
					n = list[i];
					if (node === n || (!node && (!excludeNode || excludeNode !== n))) {
						$$(n, consts.id.A, setting).removeClass(consts.node.CURSELECTED);
						if (node) {
							data.removeSelectedNode(setting, node);
							break;
						} else {
							list.splice(i, 1);
							setting.treeObj.trigger(consts.event.UNSELECTED, [setting.treeId, n]);
						}
					}
				}
			},
			createNodeCallback: function(setting) {
				if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
					var root = data.getRoot(setting);
					while (root.createdNodes.length>0) {
						var node = root.createdNodes.shift();
						tools.apply(setting.view.addDiyDom, [setting.treeId, node]);
						if (!!setting.callback.onNodeCreated) {
							setting.treeObj.trigger(consts.event.NODECREATED, [setting.treeId, node]);
						}
					}
				}
			},
			createNodes: function(setting, level, nodes, parentNode, index) {
				if (!nodes || nodes.length == 0) return;
				var root = data.getRoot(setting),
				childKey = setting.data.key.children,
				openFlag = !parentNode || parentNode.open || !!$$(parentNode[childKey][0], setting).get(0);
				root.createdNodes = [];
				var zTreeHtml = view.appendNodes(setting, level, nodes, parentNode, index, true, openFlag),
					parentObj, nextObj;

				if (!parentNode) {
					parentObj = setting.treeObj;
					//setting.treeObj.append(zTreeHtml.join(''));
				} else {
					var ulObj = $$(parentNode, consts.id.UL, setting);
					if (ulObj.get(0)) {
						parentObj = ulObj;
						//ulObj.append(zTreeHtml.join(''));
					}
				}
				if (parentObj) {
					if (index >= 0) {
						nextObj = parentObj.children()[index];
					}
					if (index >=0 && nextObj) {
						$(nextObj).before(zTreeHtml.join(''));
					} else {
						parentObj.append(zTreeHtml.join(''));
					}
				}

				view.createNodeCallback(setting);
			},
			destroy: function(setting) {
				if (!setting) return;
				data.initCache(setting);
				data.initRoot(setting);
				event.unbindTree(setting);
				event.unbindEvent(setting);
				setting.treeObj.empty();
				delete settings[setting.treeId];
			},
			expandCollapseNode: function(setting, node, expandFlag, animateFlag, callback) {
				var root = data.getRoot(setting),
				childKey = setting.data.key.children;
				if (!node) {
					tools.apply(callback, []);
					return;
				}
				if (root.expandTriggerFlag) {
					var _callback = callback;
					callback = function(){
						if (_callback) _callback();
						if (node.open) {
							setting.treeObj.trigger(consts.event.EXPAND, [setting.treeId, node]);
						} else {
							setting.treeObj.trigger(consts.event.COLLAPSE, [setting.treeId, node]);
						}
					};
					root.expandTriggerFlag = false;
				}
				if (!node.open && node.isParent && ((!$$(node, consts.id.UL, setting).get(0)) || (node[childKey] && node[childKey].length>0 && !$$(node[childKey][0], setting).get(0)))) {
					view.appendParentULDom(setting, node);
					view.createNodeCallback(setting);
				}
				if (node.open == expandFlag) {
					tools.apply(callback, []);
					return;
				}
				var ulObj = $$(node, consts.id.UL, setting),
				switchObj = $$(node, consts.id.SWITCH, setting),
				icoObj = $$(node, consts.id.ICON, setting);

				if (node.isParent) {
					node.open = !node.open;
					if (node.iconOpen && node.iconClose) {
						icoObj.attr("style", view.makeNodeIcoStyle(setting, node));
					}

					if (node.open) {
						view.replaceSwitchClass(node, switchObj, consts.folder.OPEN);
						view.replaceIcoClass(node, icoObj, consts.folder.OPEN);
						if (animateFlag == false || setting.view.expandSpeed == "") {
							ulObj.show();
							tools.apply(callback, []);
						} else {
							if (node[childKey] && node[childKey].length > 0) {
								ulObj.slideDown(setting.view.expandSpeed, callback);
							} else {
								ulObj.show();
								tools.apply(callback, []);
							}
						}
					} else {
						view.replaceSwitchClass(node, switchObj, consts.folder.CLOSE);
						view.replaceIcoClass(node, icoObj, consts.folder.CLOSE);
						if (animateFlag == false || setting.view.expandSpeed == "" || !(node[childKey] && node[childKey].length > 0)) {
							ulObj.hide();
							tools.apply(callback, []);
						} else {
							ulObj.slideUp(setting.view.expandSpeed, callback);
						}
					}
				} else {
					tools.apply(callback, []);
				}
			},
			expandCollapseParentNode: function(setting, node, expandFlag, animateFlag, callback) {
				if (!node) return;
				if (!node.parentTId) {
					view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
					return;
				} else {
					view.expandCollapseNode(setting, node, expandFlag, animateFlag);
				}
				if (node.parentTId) {
					view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, animateFlag, callback);
				}
			},
			expandCollapseSonNode: function(setting, node, expandFlag, animateFlag, callback) {
				var root = data.getRoot(setting),
				childKey = setting.data.key.children,
				treeNodes = (node) ? node[childKey]: root[childKey],
				selfAnimateSign = (node) ? false : animateFlag,
				expandTriggerFlag = data.getRoot(setting).expandTriggerFlag;
				data.getRoot(setting).expandTriggerFlag = false;
				if (treeNodes) {
					for (var i = 0, l = treeNodes.length; i < l; i++) {
						if (treeNodes[i]) view.expandCollapseSonNode(setting, treeNodes[i], expandFlag, selfAnimateSign);
					}
				}
				data.getRoot(setting).expandTriggerFlag = expandTriggerFlag;
				view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback );
			},
			isSelectedNode: function (setting, node) {
				if (!node) {
					return false;
				}
				var list = data.getRoot(setting).curSelectedList,
					i;
				for (i=list.length-1; i>=0; i--) {
					if (node === list[i]) {
						return true;
					}
				}
				return false;
			},
			makeDOMNodeIcon: function(html, setting, node) {
				var nameStr = data.getNodeName(setting, node),
				name = setting.view.nameIsHTML ? nameStr : nameStr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
				html.push("<span id='", node.tId, consts.id.ICON,
					"' title='' treeNode", consts.id.ICON," class='", view.makeNodeIcoClass(setting, node),
					"' style='", view.makeNodeIcoStyle(setting, node), "'></span><span id='", node.tId, consts.id.SPAN,
					"' class='", consts.className.NAME,
					"'>",name,"</span>");
			},
			makeDOMNodeLine: function(html, setting, node) {
				html.push("<span id='", node.tId, consts.id.SWITCH,	"' title='' class='", view.makeNodeLineClass(setting, node), "' treeNode", consts.id.SWITCH,"></span>");
			},
			makeDOMNodeMainAfter: function(html, setting, node) {
				html.push("</li>");
			},
			makeDOMNodeMainBefore: function(html, setting, node) {
				html.push("<li id='", node.tId, "' class='", consts.className.LEVEL, node.level,"' tabindex='0' hidefocus='true' treenode>");
			},
			makeDOMNodeNameAfter: function(html, setting, node) {
				html.push("</a>");
			},
			makeDOMNodeNameBefore: function(html, setting, node) {
				var title = data.getNodeTitle(setting, node),
				url = view.makeNodeUrl(setting, node),
				fontcss = view.makeNodeFontCss(setting, node),
				fontStyle = [];
				for (var f in fontcss) {
					fontStyle.push(f, ":", fontcss[f], ";");
				}
				html.push("<a id='", node.tId, consts.id.A, "' class='", consts.className.LEVEL, node.level,"' treeNode", consts.id.A," onclick=\"", (node.click || ''),
					"\" ", ((url != null && url.length > 0) ? "href='" + url + "'" : ""), " target='",view.makeNodeTarget(node),"' style='", fontStyle.join(''),
					"'");
				if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle) && title) {html.push("title='", title.replace(/'/g,"&#39;").replace(/</g,'&lt;').replace(/>/g,'&gt;'),"'");}
				html.push(">");
			},
			makeNodeFontCss: function(setting, node) {
				var fontCss = tools.apply(setting.view.fontCss, [setting.treeId, node], setting.view.fontCss);
				return (fontCss && ((typeof fontCss) != "function")) ? fontCss : {};
			},
			makeNodeIcoClass: function(setting, node) {
				var icoCss = ["ico"];
				if (!node.isAjaxing) {
					icoCss[0] = (node.iconSkin ? node.iconSkin + "_" : "") + icoCss[0];
					if (node.isParent) {
						icoCss.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
					} else {
						icoCss.push(consts.folder.DOCU);
					}
				}
				return consts.className.BUTTON + " " + icoCss.join('_');
			},
			makeNodeIcoStyle: function(setting, node) {
				var icoStyle = [];
				if (!node.isAjaxing) {
					var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node[setting.data.key.icon];
					if (icon) icoStyle.push("background:url(", icon, ") 0 0 no-repeat;");
					if (setting.view.showIcon == false || !tools.apply(setting.view.showIcon, [setting.treeId, node], true)) {
						icoStyle.push("width:0px;height:0px;");
					}
				}
				return icoStyle.join('');
			},
			makeNodeLineClass: function(setting, node) {
				var lineClass = [];
				if (setting.view.showLine) {
					if (node.level == 0 && node.isFirstNode && node.isLastNode) {
						lineClass.push(consts.line.ROOT);
					} else if (node.level == 0 && node.isFirstNode) {
						lineClass.push(consts.line.ROOTS);
					} else if (node.isLastNode) {
						lineClass.push(consts.line.BOTTOM);
					} else {
						lineClass.push(consts.line.CENTER);
					}
				} else {
					lineClass.push(consts.line.NOLINE);
				}
				if (node.isParent) {
					lineClass.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
				} else {
					lineClass.push(consts.folder.DOCU);
				}
				return view.makeNodeLineClassEx(node) + lineClass.join('_');
			},
			makeNodeLineClassEx: function(node) {
				return consts.className.BUTTON + " " + consts.className.LEVEL + node.level + " " + consts.className.SWITCH + " ";
			},
			makeNodeTarget: function(node) {
				return (node.target || "_blank");
			},
			makeNodeUrl: function(setting, node) {
				var urlKey = setting.data.key.url;
				return node[urlKey] ? node[urlKey] : null;
			},
			makeUlHtml: function(setting, node, html, content) {
				html.push("<ul id='", node.tId, consts.id.UL, "' class='", consts.className.LEVEL, node.level, " ", view.makeUlLineClass(setting, node), "' style='display:", (node.open ? "block": "none"),"'>");
				html.push(content);
				html.push("</ul>");
			},
			makeUlLineClass: function(setting, node) {
				return ((setting.view.showLine && !node.isLastNode) ? consts.line.LINE : "");
			},
			removeChildNodes: function(setting, node) {
				if (!node) return;
				var childKey = setting.data.key.children,
				nodes = node[childKey];
				if (!nodes) return;

				for (var i = 0, l = nodes.length; i < l; i++) {
					data.removeNodeCache(setting, nodes[i]);
				}
				data.removeSelectedNode(setting);
				delete node[childKey];

				if (!setting.data.keep.parent) {
					node.isParent = false;
					node.open = false;
					var tmp_switchObj = $$(node, consts.id.SWITCH, setting),
					tmp_icoObj = $$(node, consts.id.ICON, setting);
					view.replaceSwitchClass(node, tmp_switchObj, consts.folder.DOCU);
					view.replaceIcoClass(node, tmp_icoObj, consts.folder.DOCU);
					$$(node, consts.id.UL, setting).remove();
				} else {
					$$(node, consts.id.UL, setting).empty();
				}
			},
			setFirstNode: function(setting, parentNode) {
				var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
				if ( childLength > 0) {
					parentNode[childKey][0].isFirstNode = true;
				}
			},
			setLastNode: function(setting, parentNode) {
				var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
				if ( childLength > 0) {
					parentNode[childKey][childLength - 1].isLastNode = true;
				}
			},
			removeNode: function(setting, node) {
				var root = data.getRoot(setting),
				childKey = setting.data.key.children,
				parentNode = (node.parentTId) ? node.getParentNode() : root;

				node.isFirstNode = false;
				node.isLastNode = false;
				node.getPreNode = function() {return null;};
				node.getNextNode = function() {return null;};

				if (!data.getNodeCache(setting, node.tId)) {
					return;
				}

				$$(node, setting).remove();
				data.removeNodeCache(setting, node);
				data.removeSelectedNode(setting, node);

				for (var i = 0, l = parentNode[childKey].length; i < l; i++) {
					if (parentNode[childKey][i].tId == node.tId) {
						parentNode[childKey].splice(i, 1);
						break;
					}
				}
				view.setFirstNode(setting, parentNode);
				view.setLastNode(setting, parentNode);

				var tmp_ulObj,tmp_switchObj,tmp_icoObj,
				childLength = parentNode[childKey].length;

				//repair nodes old parent
				if (!setting.data.keep.parent && childLength == 0) {
					//old parentNode has no child nodes
					parentNode.isParent = false;
					parentNode.open = false;
					tmp_ulObj = $$(parentNode, consts.id.UL, setting);
					tmp_switchObj = $$(parentNode, consts.id.SWITCH, setting);
					tmp_icoObj = $$(parentNode, consts.id.ICON, setting);
					view.replaceSwitchClass(parentNode, tmp_switchObj, consts.folder.DOCU);
					view.replaceIcoClass(parentNode, tmp_icoObj, consts.folder.DOCU);
					tmp_ulObj.css("display", "none");

				} else if (setting.view.showLine && childLength > 0) {
					//old parentNode has child nodes
					var newLast = parentNode[childKey][childLength - 1];
					tmp_ulObj = $$(newLast, consts.id.UL, setting);
					tmp_switchObj = $$(newLast, consts.id.SWITCH, setting);
					tmp_icoObj = $$(newLast, consts.id.ICON, setting);
					if (parentNode == root) {
						if (parentNode[childKey].length == 1) {
							//node was root, and ztree has only one root after move node
							view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.ROOT);
						} else {
							var tmp_first_switchObj = $$(parentNode[childKey][0], consts.id.SWITCH, setting);
							view.replaceSwitchClass(parentNode[childKey][0], tmp_first_switchObj, consts.line.ROOTS);
							view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
						}
					} else {
						view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
					}
					tmp_ulObj.removeClass(consts.line.LINE);
				}
			},
			replaceIcoClass: function(node, obj, newName) {
				if (!obj || node.isAjaxing) return;
				var tmpName = obj.attr("class");
				if (tmpName == undefined) return;
				var tmpList = tmpName.split("_");
				switch (newName) {
					case consts.folder.OPEN:
					case consts.folder.CLOSE:
					case consts.folder.DOCU:
						tmpList[tmpList.length-1] = newName;
						break;
				}
				obj.attr("class", tmpList.join("_"));
			},
			replaceSwitchClass: function(node, obj, newName) {
				if (!obj) return;
				var tmpName = obj.attr("class");
				if (tmpName == undefined) return;
				var tmpList = tmpName.split("_");
				switch (newName) {
					case consts.line.ROOT:
					case consts.line.ROOTS:
					case consts.line.CENTER:
					case consts.line.BOTTOM:
					case consts.line.NOLINE:
						tmpList[0] = view.makeNodeLineClassEx(node) + newName;
						break;
					case consts.folder.OPEN:
					case consts.folder.CLOSE:
					case consts.folder.DOCU:
						tmpList[1] = newName;
						break;
				}
				obj.attr("class", tmpList.join("_"));
				if (newName !== consts.folder.DOCU) {
					obj.removeAttr("disabled");
				} else {
					obj.attr("disabled", "disabled");
				}
			},
			selectNode: function(setting, node, addFlag) {
				if (!addFlag) {
					view.cancelPreSelectedNode(setting, null, node);
				}
				$$(node, consts.id.A, setting).addClass(consts.node.CURSELECTED);
				data.addSelectedNode(setting, node);
				setting.treeObj.trigger(consts.event.SELECTED, [setting.treeId, node]);
			},
			setNodeFontCss: function(setting, treeNode) {
				var aObj = $$(treeNode, consts.id.A, setting),
				fontCss = view.makeNodeFontCss(setting, treeNode);
				if (fontCss) {
					aObj.css(fontCss);
				}
			},
			setNodeLineIcos: function(setting, node) {
				if (!node) return;
				var switchObj = $$(node, consts.id.SWITCH, setting),
				ulObj = $$(node, consts.id.UL, setting),
				icoObj = $$(node, consts.id.ICON, setting),
				ulLine = view.makeUlLineClass(setting, node);
				if (ulLine.length==0) {
					ulObj.removeClass(consts.line.LINE);
				} else {
					ulObj.addClass(ulLine);
				}
				switchObj.attr("class", view.makeNodeLineClass(setting, node));
				if (node.isParent) {
					switchObj.removeAttr("disabled");
				} else {
					switchObj.attr("disabled", "disabled");
				}
				icoObj.removeAttr("style");
				icoObj.attr("style", view.makeNodeIcoStyle(setting, node));
				icoObj.attr("class", view.makeNodeIcoClass(setting, node));
			},
			setNodeName: function(setting, node) {
				var title = data.getNodeTitle(setting, node),
				nObj = $$(node, consts.id.SPAN, setting);
				nObj.empty();
				if (setting.view.nameIsHTML) {
					nObj.html(data.getNodeName(setting, node));
				} else {
					nObj.text(data.getNodeName(setting, node));
				}
				if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle)) {
					var aObj = $$(node, consts.id.A, setting);
					aObj.attr("title", !title ? "" : title);
				}
			},
			setNodeTarget: function(setting, node) {
				var aObj = $$(node, consts.id.A, setting);
				aObj.attr("target", view.makeNodeTarget(node));
			},
			setNodeUrl: function(setting, node) {
				var aObj = $$(node, consts.id.A, setting),
				url = view.makeNodeUrl(setting, node);
				if (url == null || url.length == 0) {
					aObj.removeAttr("href");
				} else {
					aObj.attr("href", url);
				}
			},
			switchNode: function(setting, node) {
				if (node.open || !tools.canAsync(setting, node)) {
					view.expandCollapseNode(setting, node, !node.open);
				} else if (setting.async.enable) {
					if (!view.asyncNode(setting, node)) {
						view.expandCollapseNode(setting, node, !node.open);
						return;
					}
				} else if (node) {
					view.expandCollapseNode(setting, node, !node.open);
				}
			}
		};
		// zTree defind
		$.fn.zTree = {
			consts : _consts,
			_z : {
				tools: tools,
				view: view,
				event: event,
				data: data
			},
			getZTreeObj: function(treeId) {
				var o = data.getZTreeTools(treeId);
				return o ? o : null;
			},
			destroy: function(treeId) {
				if (!!treeId && treeId.length > 0) {
					view.destroy(data.getSetting(treeId));
				} else {
					for(var s in settings) {
						view.destroy(settings[s]);
					}
				}
			},
			init: function(obj, zSetting, zNodes) {
				var setting = tools.clone(_setting);
				$.extend(true, setting, zSetting);
				setting.treeId = obj.attr("id");
				setting.treeObj = obj;
				setting.treeObj.empty();
				settings[setting.treeId] = setting;
				//For some older browser,(e.g., ie6)
				if(typeof document.body.style.maxHeight === "undefined") {
					setting.view.expandSpeed = "";
				}
				data.initRoot(setting);
				var root = data.getRoot(setting),
				childKey = setting.data.key.children;
				zNodes = zNodes ? tools.clone(tools.isArray(zNodes)? zNodes : [zNodes]) : [];
				if (setting.data.simpleData.enable) {
					root[childKey] = data.transformTozTreeFormat(setting, zNodes);
				} else {
					root[childKey] = zNodes;
				}

				data.initCache(setting);
				event.unbindTree(setting);
				event.bindTree(setting);
				event.unbindEvent(setting);
				event.bindEvent(setting);

				var zTreeTools = {
					setting : setting,
					addNodes : function(parentNode, index, newNodes, isSilent) {
						if (!parentNode) parentNode = null;
						if (parentNode && !parentNode.isParent && setting.data.keep.leaf) return null;

						var i = parseInt(index, 10);
						if (isNaN(i)) {
							isSilent = !!newNodes;
							newNodes = index;
							index = -1;
						} else {
							index = i;
						}
						if (!newNodes) return null;


						var xNewNodes = tools.clone(tools.isArray(newNodes)? newNodes: [newNodes]);
						function addCallback() {
							view.addNodes(setting, parentNode, index, xNewNodes, (isSilent==true));
						}

						if (tools.canAsync(setting, parentNode)) {
							view.asyncNode(setting, parentNode, isSilent, addCallback);
						} else {
							addCallback();
						}
						return xNewNodes;
					},
					cancelSelectedNode : function(node) {
						view.cancelPreSelectedNode(setting, node);
					},
					destroy : function() {
						view.destroy(setting);
					},
					expandAll : function(expandFlag) {
						expandFlag = !!expandFlag;
						view.expandCollapseSonNode(setting, null, expandFlag, true);
						return expandFlag;
					},
					expandNode : function(node, expandFlag, sonSign, focus, callbackFlag) {
						if (!node || !node.isParent) return null;
						if (expandFlag !== true && expandFlag !== false) {
							expandFlag = !node.open;
						}
						callbackFlag = !!callbackFlag;

						if (callbackFlag && expandFlag && (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false)) {
							return null;
						} else if (callbackFlag && !expandFlag && (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false)) {
							return null;
						}
						if (expandFlag && node.parentTId) {
							view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, false);
						}
						if (expandFlag === node.open && !sonSign) {
							return null;
						}

						data.getRoot(setting).expandTriggerFlag = callbackFlag;
						if (!tools.canAsync(setting, node) && sonSign) {
							view.expandCollapseSonNode(setting, node, expandFlag, true, showNodeFocus);
						} else {
							node.open = !expandFlag;
							view.switchNode(this.setting, node);
							showNodeFocus();
						}
						return expandFlag;

						function showNodeFocus() {
							var a = $$(node, setting).get(0);
							if (a && focus !== false) {
								if (a.scrollIntoView) {
									a.scrollIntoView(false);
								} else {
									try{a.focus().blur();}catch(e){}
								}
							}
						}
					},
					getNodes : function() {
						return data.getNodes(setting);
					},
					getNodeByParam : function(key, value, parentNode) {
						if (!key) return null;
						return data.getNodeByParam(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), key, value);
					},
					getNodeByTId : function(tId) {
						return data.getNodeCache(setting, tId);
					},
					getNodesByParam : function(key, value, parentNode) {
						if (!key) return null;
						return data.getNodesByParam(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), key, value);
					},
					getNodesByParamFuzzy : function(key, value, parentNode) {
						if (!key) return null;
						return data.getNodesByParamFuzzy(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), key, value);
					},
					getNodesByFilter: function(filter, isSingle, parentNode, invokeParam) {
						isSingle = !!isSingle;
						if (!filter || (typeof filter != "function")) return (isSingle ? null : []);
						return data.getNodesByFilter(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), filter, isSingle, invokeParam);
					},
					getNodeIndex : function(node) {
						if (!node) return null;
						var childKey = setting.data.key.children,
						parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(setting);
						for (var i=0, l = parentNode[childKey].length; i < l; i++) {
							if (parentNode[childKey][i] == node) return i;
						}
						return -1;
					},
					getSelectedNodes : function() {
						var r = [], list = data.getRoot(setting).curSelectedList;
						for (var i=0, l=list.length; i<l; i++) {
							r.push(list[i]);
						}
						return r;
					},
					isSelectedNode : function(node) {
						return data.isSelectedNode(setting, node);
					},
					reAsyncChildNodes : function(parentNode, reloadType, isSilent) {
						if (!this.setting.async.enable) return;
						var isRoot = !parentNode;
						if (isRoot) {
							parentNode = data.getRoot(setting);
						}
						if (reloadType=="refresh") {
							var childKey = this.setting.data.key.children;
							for (var i = 0, l = parentNode[childKey] ? parentNode[childKey].length : 0; i < l; i++) {
								data.removeNodeCache(setting, parentNode[childKey][i]);
							}
							data.removeSelectedNode(setting);
							parentNode[childKey] = [];
							if (isRoot) {
								this.setting.treeObj.empty();
							} else {
								var ulObj = $$(parentNode, consts.id.UL, setting);
								ulObj.empty();
							}
						}
						view.asyncNode(this.setting, isRoot? null:parentNode, !!isSilent);
					},
					refresh : function() {
						this.setting.treeObj.empty();
						var root = data.getRoot(setting),
						nodes = root[setting.data.key.children]
						data.initRoot(setting);
						root[setting.data.key.children] = nodes
						data.initCache(setting);
						view.createNodes(setting, 0, root[setting.data.key.children], null, -1);
					},
					removeChildNodes : function(node) {
						if (!node) return null;
						var childKey = setting.data.key.children,
						nodes = node[childKey];
						view.removeChildNodes(setting, node);
						return nodes ? nodes : null;
					},
					removeNode : function(node, callbackFlag) {
						if (!node) return;
						callbackFlag = !!callbackFlag;
						if (callbackFlag && tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return;
						view.removeNode(setting, node);
						if (callbackFlag) {
							this.setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
						}
					},
					selectNode : function(node, addFlag) {
						if (!node) return;
						if (tools.uCanDo(setting)) {
							addFlag = setting.view.selectedMulti && addFlag;
							if (node.parentTId) {
								view.expandCollapseParentNode(setting, node.getParentNode(), true, false, showNodeFocus);
							} else {
								try{$$(node, setting).focus().blur();}catch(e){}
							}
							view.selectNode(setting, node, addFlag);
						}

						function showNodeFocus() {
							var a = $$(node, setting).get(0);
							if (a) {
								if (a.scrollIntoView) {
									a.scrollIntoView(false);
								} else {
									try{a.focus().blur();}catch(e){}
								}
							}
						}
					},
					transformTozTreeNodes : function(simpleNodes) {
						return data.transformTozTreeFormat(setting, simpleNodes);
					},
					transformToArray : function(nodes) {
						return data.transformToArrayFormat(setting, nodes);
					},
					updateNode : function(node, checkTypeFlag) {
						if (!node) return;
						var nObj = $$(node, setting);
						if (nObj.get(0) && tools.uCanDo(setting)) {
							view.setNodeName(setting, node);
							view.setNodeTarget(setting, node);
							view.setNodeUrl(setting, node);
							view.setNodeLineIcos(setting, node);
							view.setNodeFontCss(setting, node);
						}
					}
				}
				root.treeTools = zTreeTools;
				data.setZTreeTools(setting, zTreeTools);

				if (root[childKey] && root[childKey].length > 0) {
					view.createNodes(setting, 0, root[childKey], null, -1);
				} else if (setting.async.enable && setting.async.url && setting.async.url !== '') {
					view.asyncNode(setting);
				}
				return zTreeTools;
			}
		};

		var zt = $.fn.zTree,
		$$ = tools.$,
		consts = zt.consts;
	})(jQuery);
	/*
	 * JQuery zTree excheck v3.5.22
	 * http://zTree.me/
	 *
	 * Copyright (c) 2010 Hunter.z
	 *
	 * Licensed same as jquery - MIT License
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * email: hunter.z@263.net
	 * Date: 2016-03-01
	 */
	(function($){
		//default consts of excheck
		var _consts = {
			event: {
				CHECK: "ztree_check"
			},
			id: {
				CHECK: "_check"
			},
			checkbox: {
				STYLE: "checkbox",
				DEFAULT: "chk",
				DISABLED: "disable",
				FALSE: "false",
				TRUE: "true",
				FULL: "full",
				PART: "part",
				FOCUS: "focus"
			},
			radio: {
				STYLE: "radio",
				TYPE_ALL: "all",
				TYPE_LEVEL: "level"
			}
		},
		//default setting of excheck
		_setting = {
			check: {
				enable: false,
				autoCheckTrigger: false,
				chkStyle: _consts.checkbox.STYLE,
				nocheckInherit: false,
				chkDisabledInherit: false,
				radioType: _consts.radio.TYPE_LEVEL,
				chkboxType: {
					"Y": "ps",
					"N": "ps"
				}
			},
			data: {
				key: {
					checked: "checked"
				}
			},
			callback: {
				beforeCheck:null,
				onCheck:null
			}
		},
		//default root of excheck
		_initRoot = function (setting) {
			var r = data.getRoot(setting);
			r.radioCheckedList = [];
		},
		//default cache of excheck
		_initCache = function(treeId) {},
		//default bind event of excheck
		_bindEvent = function(setting) {
			var o = setting.treeObj,
			c = consts.event;
			o.bind(c.CHECK, function (event, srcEvent, treeId, node) {
				event.srcEvent = srcEvent;
				tools.apply(setting.callback.onCheck, [event, treeId, node]);
			});
		},
		_unbindEvent = function(setting) {
			var o = setting.treeObj,
			c = consts.event;
			o.unbind(c.CHECK);
		},
		//default event proxy of excheck
		_eventProxy = function(e) {
			var target = e.target,
			setting = data.getSetting(e.data.treeId),
			tId = "", node = null,
			nodeEventType = "", treeEventType = "",
			nodeEventCallback = null, treeEventCallback = null;

			if (tools.eqs(e.type, "mouseover")) {
				if (setting.check.enable && tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.CHECK) !== null) {
					tId = tools.getNodeMainDom(target).id;
					nodeEventType = "mouseoverCheck";
				}
			} else if (tools.eqs(e.type, "mouseout")) {
				if (setting.check.enable && tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.CHECK) !== null) {
					tId = tools.getNodeMainDom(target).id;
					nodeEventType = "mouseoutCheck";
				}
			} else if (tools.eqs(e.type, "click")) {
				if (setting.check.enable && tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.CHECK) !== null) {
					tId = tools.getNodeMainDom(target).id;
					nodeEventType = "checkNode";
				}
			}
			if (tId.length>0) {
				node = data.getNodeCache(setting, tId);
				switch (nodeEventType) {
					case "checkNode" :
						nodeEventCallback = _handler.onCheckNode;
						break;
					case "mouseoverCheck" :
						nodeEventCallback = _handler.onMouseoverCheck;
						break;
					case "mouseoutCheck" :
						nodeEventCallback = _handler.onMouseoutCheck;
						break;
				}
			}
			var proxyResult = {
				stop: nodeEventType === "checkNode",
				node: node,
				nodeEventType: nodeEventType,
				nodeEventCallback: nodeEventCallback,
				treeEventType: treeEventType,
				treeEventCallback: treeEventCallback
			};
			return proxyResult
		},
		//default init node of excheck
		_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
			if (!n) return;
			var checkedKey = setting.data.key.checked;
			if (typeof n[checkedKey] == "string") n[checkedKey] = tools.eqs(n[checkedKey], "true");
			n[checkedKey] = !!n[checkedKey];
			n.checkedOld = n[checkedKey];
			if (typeof n.nocheck == "string") n.nocheck = tools.eqs(n.nocheck, "true");
			n.nocheck = !!n.nocheck || (setting.check.nocheckInherit && parentNode && !!parentNode.nocheck);
			if (typeof n.chkDisabled == "string") n.chkDisabled = tools.eqs(n.chkDisabled, "true");
			n.chkDisabled = !!n.chkDisabled || (setting.check.chkDisabledInherit && parentNode && !!parentNode.chkDisabled);
			if (typeof n.halfCheck == "string") n.halfCheck = tools.eqs(n.halfCheck, "true");
			n.halfCheck = !!n.halfCheck;
			n.check_Child_State = -1;
			n.check_Focus = false;
			n.getCheckStatus = function() {return data.getCheckStatus(setting, n);};

			if (setting.check.chkStyle == consts.radio.STYLE && setting.check.radioType == consts.radio.TYPE_ALL && n[checkedKey] ) {
				var r = data.getRoot(setting);
				r.radioCheckedList.push(n);
			}
		},
		//add dom for check
		_beforeA = function(setting, node, html) {
			var checkedKey = setting.data.key.checked;
			if (setting.check.enable) {
				data.makeChkFlag(setting, node);
				html.push("<span ID='", node.tId, consts.id.CHECK, "' class='", view.makeChkClass(setting, node), "' treeNode", consts.id.CHECK, (node.nocheck === true?" style='display:none;'":""),"></span>");
			}
		},
		//update zTreeObj, add method of check
		_zTreeTools = function(setting, zTreeTools) {
			zTreeTools.checkNode = function(node, checked, checkTypeFlag, callbackFlag) {
				var checkedKey = this.setting.data.key.checked;
				if (node.chkDisabled === true) return;
				if (checked !== true && checked !== false) {
					checked = !node[checkedKey];
				}
				callbackFlag = !!callbackFlag;

				if (node[checkedKey] === checked && !checkTypeFlag) {
					return;
				} else if (callbackFlag && tools.apply(this.setting.callback.beforeCheck, [this.setting.treeId, node], true) == false) {
					return;
				}
				if (tools.uCanDo(this.setting) && this.setting.check.enable && node.nocheck !== true) {
					node[checkedKey] = checked;
					var checkObj = $$(node, consts.id.CHECK, this.setting);
					if (checkTypeFlag || this.setting.check.chkStyle === consts.radio.STYLE) view.checkNodeRelation(this.setting, node);
					view.setChkClass(this.setting, checkObj, node);
					view.repairParentChkClassWithSelf(this.setting, node);
					if (callbackFlag) {
						this.setting.treeObj.trigger(consts.event.CHECK, [null, this.setting.treeId, node]);
					}
				}
			}

			zTreeTools.checkAllNodes = function(checked) {
				view.repairAllChk(this.setting, !!checked);
			}

			zTreeTools.getCheckedNodes = function(checked) {
				var childKey = this.setting.data.key.children;
				checked = (checked !== false);
				return data.getTreeCheckedNodes(this.setting, data.getRoot(this.setting)[childKey], checked);
			}

			zTreeTools.getChangeCheckedNodes = function() {
				var childKey = this.setting.data.key.children;
				return data.getTreeChangeCheckedNodes(this.setting, data.getRoot(this.setting)[childKey]);
			}

			zTreeTools.setChkDisabled = function(node, disabled, inheritParent, inheritChildren) {
				disabled = !!disabled;
				inheritParent = !!inheritParent;
				inheritChildren = !!inheritChildren;
				view.repairSonChkDisabled(this.setting, node, disabled, inheritChildren);
				view.repairParentChkDisabled(this.setting, node.getParentNode(), disabled, inheritParent);
			}

			var _updateNode = zTreeTools.updateNode;
			zTreeTools.updateNode = function(node, checkTypeFlag) {
				if (_updateNode) _updateNode.apply(zTreeTools, arguments);
				if (!node || !this.setting.check.enable) return;
				var nObj = $$(node, this.setting);
				if (nObj.get(0) && tools.uCanDo(this.setting)) {
					var checkObj = $$(node, consts.id.CHECK, this.setting);
					if (checkTypeFlag == true || this.setting.check.chkStyle === consts.radio.STYLE) view.checkNodeRelation(this.setting, node);
					view.setChkClass(this.setting, checkObj, node);
					view.repairParentChkClassWithSelf(this.setting, node);
				}
			}
		},
		//method of operate data
		_data = {
			getRadioCheckedList: function(setting) {
				var checkedList = data.getRoot(setting).radioCheckedList;
				for (var i=0, j=checkedList.length; i<j; i++) {
					if(!data.getNodeCache(setting, checkedList[i].tId)) {
						checkedList.splice(i, 1);
						i--; j--;
					}
				}
				return checkedList;
			},
			getCheckStatus: function(setting, node) {
				if (!setting.check.enable || node.nocheck || node.chkDisabled) return null;
				var checkedKey = setting.data.key.checked,
				r = {
					checked: node[checkedKey],
					half: node.halfCheck ? node.halfCheck : (setting.check.chkStyle == consts.radio.STYLE ? (node.check_Child_State === 2) : (node[checkedKey] ? (node.check_Child_State > -1 && node.check_Child_State < 2) : (node.check_Child_State > 0)))
				};
				return r;
			},
			getTreeCheckedNodes: function(setting, nodes, checked, results) {
				if (!nodes) return [];
				var childKey = setting.data.key.children,
				checkedKey = setting.data.key.checked,
				onlyOne = (checked && setting.check.chkStyle == consts.radio.STYLE && setting.check.radioType == consts.radio.TYPE_ALL);
				results = !results ? [] : results;
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] == checked) {
						results.push(nodes[i]);
						if(onlyOne) {
							break;
						}
					}
					data.getTreeCheckedNodes(setting, nodes[i][childKey], checked, results);
					if(onlyOne && results.length > 0) {
						break;
					}
				}
				return results;
			},
			getTreeChangeCheckedNodes: function(setting, nodes, results) {
				if (!nodes) return [];
				var childKey = setting.data.key.children,
				checkedKey = setting.data.key.checked;
				results = !results ? [] : results;
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] != nodes[i].checkedOld) {
						results.push(nodes[i]);
					}
					data.getTreeChangeCheckedNodes(setting, nodes[i][childKey], results);
				}
				return results;
			},
			makeChkFlag: function(setting, node) {
				if (!node) return;
				var childKey = setting.data.key.children,
				checkedKey = setting.data.key.checked,
				chkFlag = -1;
				if (node[childKey]) {
					for (var i = 0, l = node[childKey].length; i < l; i++) {
						var cNode = node[childKey][i];
						var tmp = -1;
						if (setting.check.chkStyle == consts.radio.STYLE) {
							if (cNode.nocheck === true || cNode.chkDisabled === true) {
								tmp = cNode.check_Child_State;
							} else if (cNode.halfCheck === true) {
								tmp = 2;
							} else if (cNode[checkedKey]) {
								tmp = 2;
							} else {
								tmp = cNode.check_Child_State > 0 ? 2:0;
							}
							if (tmp == 2) {
								chkFlag = 2; break;
							} else if (tmp == 0){
								chkFlag = 0;
							}
						} else if (setting.check.chkStyle == consts.checkbox.STYLE) {
							if (cNode.nocheck === true || cNode.chkDisabled === true) {
								tmp = cNode.check_Child_State;
							} else if (cNode.halfCheck === true) {
								tmp = 1;
							} else if (cNode[checkedKey] ) {
								tmp = (cNode.check_Child_State === -1 || cNode.check_Child_State === 2) ? 2 : 1;
							} else {
								tmp = (cNode.check_Child_State > 0) ? 1 : 0;
							}
							if (tmp === 1) {
								chkFlag = 1; break;
							} else if (tmp === 2 && chkFlag > -1 && i > 0 && tmp !== chkFlag) {
								chkFlag = 1; break;
							} else if (chkFlag === 2 && tmp > -1 && tmp < 2) {
								chkFlag = 1; break;
							} else if (tmp > -1) {
								chkFlag = tmp;
							}
						}
					}
				}
				node.check_Child_State = chkFlag;
			}
		},
		//method of event proxy
		_event = {

		},
		//method of event handler
		_handler = {
			onCheckNode: function (event, node) {
				if (node.chkDisabled === true) return false;
				var setting = data.getSetting(event.data.treeId),
				checkedKey = setting.data.key.checked;
				if (tools.apply(setting.callback.beforeCheck, [setting.treeId, node], true) == false) return true;
				node[checkedKey] = !node[checkedKey];
				view.checkNodeRelation(setting, node);
				var checkObj = $$(node, consts.id.CHECK, setting);
				view.setChkClass(setting, checkObj, node);
				view.repairParentChkClassWithSelf(setting, node);
				setting.treeObj.trigger(consts.event.CHECK, [event, setting.treeId, node]);
				return true;
			},
			onMouseoverCheck: function(event, node) {
				if (node.chkDisabled === true) return false;
				var setting = data.getSetting(event.data.treeId),
				checkObj = $$(node, consts.id.CHECK, setting);
				node.check_Focus = true;
				view.setChkClass(setting, checkObj, node);
				return true;
			},
			onMouseoutCheck: function(event, node) {
				if (node.chkDisabled === true) return false;
				var setting = data.getSetting(event.data.treeId),
				checkObj = $$(node, consts.id.CHECK, setting);
				node.check_Focus = false;
				view.setChkClass(setting, checkObj, node);
				return true;
			}
		},
		//method of tools for zTree
		_tools = {

		},
		//method of operate ztree dom
		_view = {
			checkNodeRelation: function(setting, node) {
				var pNode, i, l,
				childKey = setting.data.key.children,
				checkedKey = setting.data.key.checked,
				r = consts.radio;
				if (setting.check.chkStyle == r.STYLE) {
					var checkedList = data.getRadioCheckedList(setting);
					if (node[checkedKey]) {
						if (setting.check.radioType == r.TYPE_ALL) {
							for (i = checkedList.length-1; i >= 0; i--) {
								pNode = checkedList[i];
								if (pNode[checkedKey] && pNode != node) {
									pNode[checkedKey] = false;
									checkedList.splice(i, 1);

									view.setChkClass(setting, $$(pNode, consts.id.CHECK, setting), pNode);
									if (pNode.parentTId != node.parentTId) {
										view.repairParentChkClassWithSelf(setting, pNode);
									}
								}
							}
							checkedList.push(node);
						} else {
							var parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(setting);
							for (i = 0, l = parentNode[childKey].length; i < l; i++) {
								pNode = parentNode[childKey][i];
								if (pNode[checkedKey] && pNode != node) {
									pNode[checkedKey] = false;
									view.setChkClass(setting, $$(pNode, consts.id.CHECK, setting), pNode);
								}
							}
						}
					} else if (setting.check.radioType == r.TYPE_ALL) {
						for (i = 0, l = checkedList.length; i < l; i++) {
							if (node == checkedList[i]) {
								checkedList.splice(i, 1);
								break;
							}
						}
					}

				} else {
					if (node[checkedKey] && (!node[childKey] || node[childKey].length==0 || setting.check.chkboxType.Y.indexOf("s") > -1)) {
						view.setSonNodeCheckBox(setting, node, true);
					}
					if (!node[checkedKey] && (!node[childKey] || node[childKey].length==0 || setting.check.chkboxType.N.indexOf("s") > -1)) {
						view.setSonNodeCheckBox(setting, node, false);
					}
					if (node[checkedKey] && setting.check.chkboxType.Y.indexOf("p") > -1) {
						view.setParentNodeCheckBox(setting, node, true);
					}
					if (!node[checkedKey] && setting.check.chkboxType.N.indexOf("p") > -1) {
						view.setParentNodeCheckBox(setting, node, false);
					}
				}
			},
			makeChkClass: function(setting, node) {
				var checkedKey = setting.data.key.checked,
				c = consts.checkbox, r = consts.radio,
				fullStyle = "";
				if (node.chkDisabled === true) {
					fullStyle = c.DISABLED;
				} else if (node.halfCheck) {
					fullStyle = c.PART;
				} else if (setting.check.chkStyle == r.STYLE) {
					fullStyle = (node.check_Child_State < 1)? c.FULL:c.PART;
				} else {
					fullStyle = node[checkedKey] ? ((node.check_Child_State === 2 || node.check_Child_State === -1) ? c.FULL:c.PART) : ((node.check_Child_State < 1)? c.FULL:c.PART);
				}
				var chkName = setting.check.chkStyle + "_" + (node[checkedKey] ? c.TRUE : c.FALSE) + "_" + fullStyle;
				chkName = (node.check_Focus && node.chkDisabled !== true) ? chkName + "_" + c.FOCUS : chkName;
				return consts.className.BUTTON + " " + c.DEFAULT + " " + chkName;
			},
			repairAllChk: function(setting, checked) {
				if (setting.check.enable && setting.check.chkStyle === consts.checkbox.STYLE) {
					var checkedKey = setting.data.key.checked,
					childKey = setting.data.key.children,
					root = data.getRoot(setting);
					for (var i = 0, l = root[childKey].length; i<l ; i++) {
						var node = root[childKey][i];
						if (node.nocheck !== true && node.chkDisabled !== true) {
							node[checkedKey] = checked;
						}
						view.setSonNodeCheckBox(setting, node, checked);
					}
				}
			},
			repairChkClass: function(setting, node) {
				if (!node) return;
				data.makeChkFlag(setting, node);
				if (node.nocheck !== true) {
					var checkObj = $$(node, consts.id.CHECK, setting);
					view.setChkClass(setting, checkObj, node);
				}
			},
			repairParentChkClass: function(setting, node) {
				if (!node || !node.parentTId) return;
				var pNode = node.getParentNode();
				view.repairChkClass(setting, pNode);
				view.repairParentChkClass(setting, pNode);
			},
			repairParentChkClassWithSelf: function(setting, node) {
				if (!node) return;
				var childKey = setting.data.key.children;
				if (node[childKey] && node[childKey].length > 0) {
					view.repairParentChkClass(setting, node[childKey][0]);
				} else {
					view.repairParentChkClass(setting, node);
				}
			},
			repairSonChkDisabled: function(setting, node, chkDisabled, inherit) {
				if (!node) return;
				var childKey = setting.data.key.children;
				if (node.chkDisabled != chkDisabled) {
					node.chkDisabled = chkDisabled;
				}
				view.repairChkClass(setting, node);
				if (node[childKey] && inherit) {
					for (var i = 0, l = node[childKey].length; i < l; i++) {
						var sNode = node[childKey][i];
						view.repairSonChkDisabled(setting, sNode, chkDisabled, inherit);
					}
				}
			},
			repairParentChkDisabled: function(setting, node, chkDisabled, inherit) {
				if (!node) return;
				if (node.chkDisabled != chkDisabled && inherit) {
					node.chkDisabled = chkDisabled;
				}
				view.repairChkClass(setting, node);
				view.repairParentChkDisabled(setting, node.getParentNode(), chkDisabled, inherit);
			},
			setChkClass: function(setting, obj, node) {
				if (!obj) return;
				if (node.nocheck === true) {
					obj.hide();
				} else {
					obj.show();
				}
	            obj.attr('class', view.makeChkClass(setting, node));
			},
			setParentNodeCheckBox: function(setting, node, value, srcNode) {
				var childKey = setting.data.key.children,
				checkedKey = setting.data.key.checked,
				checkObj = $$(node, consts.id.CHECK, setting);
				if (!srcNode) srcNode = node;
				data.makeChkFlag(setting, node);
				if (node.nocheck !== true && node.chkDisabled !== true) {
					node[checkedKey] = value;
					view.setChkClass(setting, checkObj, node);
					if (setting.check.autoCheckTrigger && node != srcNode) {
						setting.treeObj.trigger(consts.event.CHECK, [null, setting.treeId, node]);
					}
				}
				if (node.parentTId) {
					var pSign = true;
					if (!value) {
						var pNodes = node.getParentNode()[childKey];
						for (var i = 0, l = pNodes.length; i < l; i++) {
							if ((pNodes[i].nocheck !== true && pNodes[i].chkDisabled !== true && pNodes[i][checkedKey])
							|| ((pNodes[i].nocheck === true || pNodes[i].chkDisabled === true) && pNodes[i].check_Child_State > 0)) {
								pSign = false;
								break;
							}
						}
					}
					if (pSign) {
						view.setParentNodeCheckBox(setting, node.getParentNode(), value, srcNode);
					}
				}
			},
			setSonNodeCheckBox: function(setting, node, value, srcNode) {
				if (!node) return;
				var childKey = setting.data.key.children,
				checkedKey = setting.data.key.checked,
				checkObj = $$(node, consts.id.CHECK, setting);
				if (!srcNode) srcNode = node;

				var hasDisable = false;
				if (node[childKey]) {
					for (var i = 0, l = node[childKey].length; i < l; i++) {
						var sNode = node[childKey][i];
						view.setSonNodeCheckBox(setting, sNode, value, srcNode);
						if (sNode.chkDisabled === true) hasDisable = true;
					}
				}

				if (node != data.getRoot(setting) && node.chkDisabled !== true) {
					if (hasDisable && node.nocheck !== true) {
						data.makeChkFlag(setting, node);
					}
					if (node.nocheck !== true && node.chkDisabled !== true) {
						node[checkedKey] = value;
						if (!hasDisable) node.check_Child_State = (node[childKey] && node[childKey].length > 0) ? (value ? 2 : 0) : -1;
					} else {
						node.check_Child_State = -1;
					}
					view.setChkClass(setting, checkObj, node);
					if (setting.check.autoCheckTrigger && node != srcNode && node.nocheck !== true && node.chkDisabled !== true) {
						setting.treeObj.trigger(consts.event.CHECK, [null, setting.treeId, node]);
					}
				}

			}
		},

		_z = {
			tools: _tools,
			view: _view,
			event: _event,
			data: _data
		};
		$.extend(true, $.fn.zTree.consts, _consts);
		$.extend(true, $.fn.zTree._z, _z);

		var zt = $.fn.zTree,
		tools = zt._z.tools,
		consts = zt.consts,
		view = zt._z.view,
		data = zt._z.data,
		event = zt._z.event,
		$$ = tools.$;

		data.exSetting(_setting);
		data.addInitBind(_bindEvent);
		data.addInitUnBind(_unbindEvent);
		data.addInitCache(_initCache);
		data.addInitNode(_initNode);
		data.addInitProxy(_eventProxy, true);
		data.addInitRoot(_initRoot);
		data.addBeforeA(_beforeA);
		data.addZTreeTools(_zTreeTools);

		var _createNodes = view.createNodes;
		view.createNodes = function(setting, level, nodes, parentNode, index) {
			if (_createNodes) _createNodes.apply(view, arguments);
			if (!nodes) return;
			view.repairParentChkClassWithSelf(setting, parentNode);
		}
		var _removeNode = view.removeNode;
		view.removeNode = function(setting, node) {
			var parentNode = node.getParentNode();
			if (_removeNode) _removeNode.apply(view, arguments);
			if (!node || !parentNode) return;
			view.repairChkClass(setting, parentNode);
			view.repairParentChkClass(setting, parentNode);
		}

		var _appendNodes = view.appendNodes;
		view.appendNodes = function(setting, level, nodes, parentNode, index, initFlag, openFlag) {
			var html = "";
			if (_appendNodes) {
				html = _appendNodes.apply(view, arguments);
			}
			if (parentNode) {
				data.makeChkFlag(setting, parentNode);
			}
			return html;
		}
	})(jQuery);
	/*
	 * JQuery zTree exedit v3.5.22
	 * http://zTree.me/
	 *
	 * Copyright (c) 2010 Hunter.z
	 *
	 * Licensed same as jquery - MIT License
	 * http://www.opensource.org/licenses/mit-license.php
	 *
	 * email: hunter.z@263.net
	 * Date: 2016-03-01
	 */
	(function($){
		//default consts of exedit
		var _consts = {
			event: {
				DRAG: "ztree_drag",
				DROP: "ztree_drop",
				RENAME: "ztree_rename",
				DRAGMOVE:"ztree_dragmove"
			},
			id: {
				EDIT: "_edit",
				INPUT: "_input",
				REMOVE: "_remove"
			},
			move: {
				TYPE_INNER: "inner",
				TYPE_PREV: "prev",
				TYPE_NEXT: "next"
			},
			node: {
				CURSELECTED_EDIT: "curSelectedNode_Edit",
				TMPTARGET_TREE: "tmpTargetzTree",
				TMPTARGET_NODE: "tmpTargetNode"
			}
		},
		//default setting of exedit
		_setting = {
			edit: {
				enable: false,
				editNameSelectAll: false,
				showRemoveBtn: true,
				showRenameBtn: true,
				removeTitle: "remove",
				renameTitle: "rename",
				drag: {
					autoExpandTrigger: false,
					isCopy: true,
					isMove: true,
					prev: true,
					next: true,
					inner: true,
					minMoveSize: 5,
					borderMax: 10,
					borderMin: -5,
					maxShowNodeNum: 5,
					autoOpenTime: 500
				}
			},
			view: {
				addHoverDom: null,
				removeHoverDom: null
			},
			callback: {
				beforeDrag:null,
				beforeDragOpen:null,
				beforeDrop:null,
				beforeEditName:null,
				beforeRename:null,
				onDrag:null,
				onDragMove:null,
				onDrop:null,
				onRename:null
			}
		},
		//default root of exedit
		_initRoot = function (setting) {
			var r = data.getRoot(setting), rs = data.getRoots();
			r.curEditNode = null;
			r.curEditInput = null;
			r.curHoverNode = null;
			r.dragFlag = 0;
			r.dragNodeShowBefore = [];
			r.dragMaskList = new Array();
			rs.showHoverDom = true;
		},
		//default cache of exedit
		_initCache = function(treeId) {},
		//default bind event of exedit
		_bindEvent = function(setting) {
			var o = setting.treeObj;
			var c = consts.event;
			o.bind(c.RENAME, function (event, treeId, treeNode, isCancel) {
				tools.apply(setting.callback.onRename, [event, treeId, treeNode, isCancel]);
			});

			o.bind(c.DRAG, function (event, srcEvent, treeId, treeNodes) {
				tools.apply(setting.callback.onDrag, [srcEvent, treeId, treeNodes]);
			});

			o.bind(c.DRAGMOVE,function(event, srcEvent, treeId, treeNodes){
				tools.apply(setting.callback.onDragMove,[srcEvent, treeId, treeNodes]);
			});

			o.bind(c.DROP, function (event, srcEvent, treeId, treeNodes, targetNode, moveType, isCopy) {
				tools.apply(setting.callback.onDrop, [srcEvent, treeId, treeNodes, targetNode, moveType, isCopy]);
			});
		},
		_unbindEvent = function(setting) {
			var o = setting.treeObj;
			var c = consts.event;
			o.unbind(c.RENAME);
			o.unbind(c.DRAG);
			o.unbind(c.DRAGMOVE);
			o.unbind(c.DROP);
		},
		//default event proxy of exedit
		_eventProxy = function(e) {
			var target = e.target,
			setting = data.getSetting(e.data.treeId),
			relatedTarget = e.relatedTarget,
			tId = "", node = null,
			nodeEventType = "", treeEventType = "",
			nodeEventCallback = null, treeEventCallback = null,
			tmp = null;

			if (tools.eqs(e.type, "mouseover")) {
				tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (tmp) {
					tId = tools.getNodeMainDom(tmp).id;
					nodeEventType = "hoverOverNode";
				}
			} else if (tools.eqs(e.type, "mouseout")) {
				tmp = tools.getMDom(setting, relatedTarget, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (!tmp) {
					tId = "remove";
					nodeEventType = "hoverOutNode";
				}
			} else if (tools.eqs(e.type, "mousedown")) {
				tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (tmp) {
					tId = tools.getNodeMainDom(tmp).id;
					nodeEventType = "mousedownNode";
				}
			}
			if (tId.length>0) {
				node = data.getNodeCache(setting, tId);
				switch (nodeEventType) {
					case "mousedownNode" :
						nodeEventCallback = _handler.onMousedownNode;
						break;
					case "hoverOverNode" :
						nodeEventCallback = _handler.onHoverOverNode;
						break;
					case "hoverOutNode" :
						nodeEventCallback = _handler.onHoverOutNode;
						break;
				}
			}
			var proxyResult = {
				stop: false,
				node: node,
				nodeEventType: nodeEventType,
				nodeEventCallback: nodeEventCallback,
				treeEventType: treeEventType,
				treeEventCallback: treeEventCallback
			};
			return proxyResult
		},
		//default init node of exedit
		_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
			if (!n) return;
			n.isHover = false;
			n.editNameFlag = false;
		},
		//update zTreeObj, add method of edit
		_zTreeTools = function(setting, zTreeTools) {
			zTreeTools.cancelEditName = function(newName) {
				var root = data.getRoot(this.setting);
				if (!root.curEditNode) return;
				view.cancelCurEditNode(this.setting, newName?newName:null, true);
			}
			zTreeTools.copyNode = function(targetNode, node, moveType, isSilent) {
				if (!node) return null;
				if (targetNode && !targetNode.isParent && this.setting.data.keep.leaf && moveType === consts.move.TYPE_INNER) return null;
				var _this = this,
					newNode = tools.clone(node);
				if (!targetNode) {
					targetNode = null;
					moveType = consts.move.TYPE_INNER;
				}
				if (moveType == consts.move.TYPE_INNER) {
					function copyCallback() {
						view.addNodes(_this.setting, targetNode, -1, [newNode], isSilent);
					}

					if (tools.canAsync(this.setting, targetNode)) {
						view.asyncNode(this.setting, targetNode, isSilent, copyCallback);
					} else {
						copyCallback();
					}
				} else {
					view.addNodes(this.setting, targetNode.parentNode, -1, [newNode], isSilent);
					view.moveNode(this.setting, targetNode, newNode, moveType, false, isSilent);
				}
				return newNode;
			}
			zTreeTools.editName = function(node) {
				if (!node || !node.tId || node !== data.getNodeCache(this.setting, node.tId)) return;
				if (node.parentTId) view.expandCollapseParentNode(this.setting, node.getParentNode(), true);
				view.editNode(this.setting, node)
			}
			zTreeTools.moveNode = function(targetNode, node, moveType, isSilent) {
				if (!node) return node;
				if (targetNode && !targetNode.isParent && this.setting.data.keep.leaf && moveType === consts.move.TYPE_INNER) {
					return null;
				} else if (targetNode && ((node.parentTId == targetNode.tId && moveType == consts.move.TYPE_INNER) || $$(node, this.setting).find("#" + targetNode.tId).length > 0)) {
					return null;
				} else if (!targetNode) {
					targetNode = null;
				}
				var _this = this;
				function moveCallback() {
					view.moveNode(_this.setting, targetNode, node, moveType, false, isSilent);
				}
				if (tools.canAsync(this.setting, targetNode) && moveType === consts.move.TYPE_INNER) {
					view.asyncNode(this.setting, targetNode, isSilent, moveCallback);
				} else {
					moveCallback();
				}
				return node;
			}
			zTreeTools.setEditable = function(editable) {
				this.setting.edit.enable = editable;
				return this.refresh();
			}
		},
		//method of operate data
		_data = {
			setSonNodeLevel: function(setting, parentNode, node) {
				if (!node) return;
				var childKey = setting.data.key.children;
				node.level = (parentNode)? parentNode.level + 1 : 0;
				if (!node[childKey]) return;
				for (var i = 0, l = node[childKey].length; i < l; i++) {
					if (node[childKey][i]) data.setSonNodeLevel(setting, node, node[childKey][i]);
				}
			}
		},
		//method of event proxy
		_event = {

		},
		//method of event handler
		_handler = {
			onHoverOverNode: function(event, node) {
				var setting = data.getSetting(event.data.treeId),
				root = data.getRoot(setting);
				if (root.curHoverNode != node) {
					_handler.onHoverOutNode(event);
				}
				root.curHoverNode = node;
				view.addHoverDom(setting, node);
			},
			onHoverOutNode: function(event, node) {
				var setting = data.getSetting(event.data.treeId),
				root = data.getRoot(setting);
				if (root.curHoverNode && !data.isSelectedNode(setting, root.curHoverNode)) {
					view.removeTreeDom(setting, root.curHoverNode);
					root.curHoverNode = null;
				}
			},
			onMousedownNode: function(eventMouseDown, _node) {
				var i,l,
				setting = data.getSetting(eventMouseDown.data.treeId),
				root = data.getRoot(setting), roots = data.getRoots();
				//right click can't drag & drop
				if (eventMouseDown.button == 2 || !setting.edit.enable || (!setting.edit.drag.isCopy && !setting.edit.drag.isMove)) return true;

				//input of edit node name can't drag & drop
				var target = eventMouseDown.target,
				_nodes = data.getRoot(setting).curSelectedList,
				nodes = [];
				if (!data.isSelectedNode(setting, _node)) {
					nodes = [_node];
				} else {
					for (i=0, l=_nodes.length; i<l; i++) {
						if (_nodes[i].editNameFlag && tools.eqs(target.tagName, "input") && target.getAttribute("treeNode"+consts.id.INPUT) !== null) {
							return true;
						}
						nodes.push(_nodes[i]);
						if (nodes[0].parentTId !== _nodes[i].parentTId) {
							nodes = [_node];
							break;
						}
					}
				}

				view.editNodeBlur = true;
				view.cancelCurEditNode(setting);

				var doc = $(setting.treeObj.get(0).ownerDocument),
				body = $(setting.treeObj.get(0).ownerDocument.body), curNode, tmpArrow, tmpTarget,
				isOtherTree = false,
				targetSetting = setting,
				sourceSetting = setting,
				preNode, nextNode,
				preTmpTargetNodeId = null,
				preTmpMoveType = null,
				tmpTargetNodeId = null,
				moveType = consts.move.TYPE_INNER,
				mouseDownX = eventMouseDown.clientX,
				mouseDownY = eventMouseDown.clientY,
				startTime = (new Date()).getTime();

				if (tools.uCanDo(setting)) {
					doc.bind("mousemove", _docMouseMove);
				}
				function _docMouseMove(event) {
					//avoid start drag after click node
					if (root.dragFlag == 0 && Math.abs(mouseDownX - event.clientX) < setting.edit.drag.minMoveSize
						&& Math.abs(mouseDownY - event.clientY) < setting.edit.drag.minMoveSize) {
						return true;
					}
					var i, l, tmpNode, tmpDom, tmpNodes,
					childKey = setting.data.key.children;
					body.css("cursor", "pointer");

					if (root.dragFlag == 0) {
						if (tools.apply(setting.callback.beforeDrag, [setting.treeId, nodes], true) == false) {
							_docMouseUp(event);
							return true;
						}

						for (i=0, l=nodes.length; i<l; i++) {
							if (i==0) {
								root.dragNodeShowBefore = [];
							}
							tmpNode = nodes[i];
							if (tmpNode.isParent && tmpNode.open) {
								view.expandCollapseNode(setting, tmpNode, !tmpNode.open);
								root.dragNodeShowBefore[tmpNode.tId] = true;
							} else {
								root.dragNodeShowBefore[tmpNode.tId] = false;
							}
						}

						root.dragFlag = 1;
						roots.showHoverDom = false;
						tools.showIfameMask(setting, true);

						//sort
						var isOrder = true, lastIndex = -1;
						if (nodes.length>1) {
							var pNodes = nodes[0].parentTId ? nodes[0].getParentNode()[childKey] : data.getNodes(setting);
							tmpNodes = [];
							for (i=0, l=pNodes.length; i<l; i++) {
								if (root.dragNodeShowBefore[pNodes[i].tId] !== undefined) {
									if (isOrder && lastIndex > -1 && (lastIndex+1) !== i) {
										isOrder = false;
									}
									tmpNodes.push(pNodes[i]);
									lastIndex = i;
								}
								if (nodes.length === tmpNodes.length) {
									nodes = tmpNodes;
									break;
								}
							}
						}
						if (isOrder) {
							preNode = nodes[0].getPreNode();
							nextNode = nodes[nodes.length-1].getNextNode();
						}

						//set node in selected
						curNode = $$("<ul class='zTreeDragUL'></ul>", setting);
						for (i=0, l=nodes.length; i<l; i++) {
							tmpNode = nodes[i];
							tmpNode.editNameFlag = false;
							view.selectNode(setting, tmpNode, i>0);
							view.removeTreeDom(setting, tmpNode);

							if (i > setting.edit.drag.maxShowNodeNum-1) {
								continue;
							}

							tmpDom = $$("<li id='"+ tmpNode.tId +"_tmp'></li>", setting);
							tmpDom.append($$(tmpNode, consts.id.A, setting).clone());
							tmpDom.css("padding", "0");
							tmpDom.children("#" + tmpNode.tId + consts.id.A).removeClass(consts.node.CURSELECTED);
							curNode.append(tmpDom);
							if (i == setting.edit.drag.maxShowNodeNum-1) {
								tmpDom = $$("<li id='"+ tmpNode.tId +"_moretmp'><a>  ...  </a></li>", setting);
								curNode.append(tmpDom);
							}
						}
						curNode.attr("id", nodes[0].tId + consts.id.UL + "_tmp");
						curNode.addClass(setting.treeObj.attr("class"));
						curNode.appendTo(body);

						tmpArrow = $$("<span class='tmpzTreeMove_arrow'></span>", setting);
						tmpArrow.attr("id", "zTreeMove_arrow_tmp");
						tmpArrow.appendTo(body);

						setting.treeObj.trigger(consts.event.DRAG, [event, setting.treeId, nodes]);
					}

					if (root.dragFlag == 1) {
						if (tmpTarget && tmpArrow.attr("id") == event.target.id && tmpTargetNodeId && (event.clientX + doc.scrollLeft()+2) > ($("#" + tmpTargetNodeId + consts.id.A, tmpTarget).offset().left)) {
							var xT = $("#" + tmpTargetNodeId + consts.id.A, tmpTarget);
							event.target = (xT.length > 0) ? xT.get(0) : event.target;
						} else if (tmpTarget) {
							tmpTarget.removeClass(consts.node.TMPTARGET_TREE);
							if (tmpTargetNodeId) $("#" + tmpTargetNodeId + consts.id.A, tmpTarget).removeClass(consts.node.TMPTARGET_NODE + "_" + consts.move.TYPE_PREV)
								.removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_NEXT).removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_INNER);
						}
						tmpTarget = null;
						tmpTargetNodeId = null;

						//judge drag & drop in multi ztree
						isOtherTree = false;
						targetSetting = setting;
						var settings = data.getSettings();
						for (var s in settings) {
							if (settings[s].treeId && settings[s].edit.enable && settings[s].treeId != setting.treeId
								&& (event.target.id == settings[s].treeId || $(event.target).parents("#" + settings[s].treeId).length>0)) {
								isOtherTree = true;
								targetSetting = settings[s];
							}
						}

						var docScrollTop = doc.scrollTop(),
						docScrollLeft = doc.scrollLeft(),
						treeOffset = targetSetting.treeObj.offset(),
						scrollHeight = targetSetting.treeObj.get(0).scrollHeight,
						scrollWidth = targetSetting.treeObj.get(0).scrollWidth,
						dTop = (event.clientY + docScrollTop - treeOffset.top),
						dBottom = (targetSetting.treeObj.height() + treeOffset.top - event.clientY - docScrollTop),
						dLeft = (event.clientX + docScrollLeft - treeOffset.left),
						dRight = (targetSetting.treeObj.width() + treeOffset.left - event.clientX - docScrollLeft),
						isTop = (dTop < setting.edit.drag.borderMax && dTop > setting.edit.drag.borderMin),
						isBottom = (dBottom < setting.edit.drag.borderMax && dBottom > setting.edit.drag.borderMin),
						isLeft = (dLeft < setting.edit.drag.borderMax && dLeft > setting.edit.drag.borderMin),
						isRight = (dRight < setting.edit.drag.borderMax && dRight > setting.edit.drag.borderMin),
						isTreeInner = dTop > setting.edit.drag.borderMin && dBottom > setting.edit.drag.borderMin && dLeft > setting.edit.drag.borderMin && dRight > setting.edit.drag.borderMin,
						isTreeTop = (isTop && targetSetting.treeObj.scrollTop() <= 0),
						isTreeBottom = (isBottom && (targetSetting.treeObj.scrollTop() + targetSetting.treeObj.height()+10) >= scrollHeight),
						isTreeLeft = (isLeft && targetSetting.treeObj.scrollLeft() <= 0),
						isTreeRight = (isRight && (targetSetting.treeObj.scrollLeft() + targetSetting.treeObj.width()+10) >= scrollWidth);

						if (event.target && tools.isChildOrSelf(event.target, targetSetting.treeId)) {
							//get node <li> dom
							var targetObj = event.target;
							while (targetObj && targetObj.tagName && !tools.eqs(targetObj.tagName, "li") && targetObj.id != targetSetting.treeId) {
								targetObj = targetObj.parentNode;
							}

							var canMove = true;
							//don't move to self or children of self
							for (i=0, l=nodes.length; i<l; i++) {
								tmpNode = nodes[i];
								if (targetObj.id === tmpNode.tId) {
									canMove = false;
									break;
								} else if ($$(tmpNode, setting).find("#" + targetObj.id).length > 0) {
									canMove = false;
									break;
								}
							}
							if (canMove && event.target && tools.isChildOrSelf(event.target, targetObj.id + consts.id.A)) {
								tmpTarget = $(targetObj);
								tmpTargetNodeId = targetObj.id;
							}
						}

						//the mouse must be in zTree
						tmpNode = nodes[0];
						if (isTreeInner && tools.isChildOrSelf(event.target, targetSetting.treeId)) {
							//judge mouse move in root of ztree
							if (!tmpTarget && (event.target.id == targetSetting.treeId || isTreeTop || isTreeBottom || isTreeLeft || isTreeRight) && (isOtherTree || (!isOtherTree && tmpNode.parentTId))) {
								tmpTarget = targetSetting.treeObj;
							}
							//auto scroll top
							if (isTop) {
								targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop()-10);
							} else if (isBottom)  {
								targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop()+10);
							}
							if (isLeft) {
								targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()-10);
							} else if (isRight) {
								targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()+10);
							}
							//auto scroll left
							if (tmpTarget && tmpTarget != targetSetting.treeObj && tmpTarget.offset().left < targetSetting.treeObj.offset().left) {
								targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()+ tmpTarget.offset().left - targetSetting.treeObj.offset().left);
							}
						}

						curNode.css({
							"top": (event.clientY + docScrollTop + 3) + "px",
							"left": (event.clientX + docScrollLeft + 3) + "px"
						});

						var dX = 0;
						var dY = 0;
						if (tmpTarget && tmpTarget.attr("id")!=targetSetting.treeId) {
							var tmpTargetNode = tmpTargetNodeId == null ? null: data.getNodeCache(targetSetting, tmpTargetNodeId),
								isCopy = ((event.ctrlKey || event.metaKey) && setting.edit.drag.isMove && setting.edit.drag.isCopy) || (!setting.edit.drag.isMove && setting.edit.drag.isCopy),
								isPrev = !!(preNode && tmpTargetNodeId === preNode.tId),
								isNext = !!(nextNode && tmpTargetNodeId === nextNode.tId),
								isInner = (tmpNode.parentTId && tmpNode.parentTId == tmpTargetNodeId),
								canPrev = (isCopy || !isNext) && tools.apply(targetSetting.edit.drag.prev, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.prev),
								canNext = (isCopy || !isPrev) && tools.apply(targetSetting.edit.drag.next, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.next),
								canInner = (isCopy || !isInner) && !(targetSetting.data.keep.leaf && !tmpTargetNode.isParent) && tools.apply(targetSetting.edit.drag.inner, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.inner);

							function clearMove() {
								tmpTarget = null;
								tmpTargetNodeId = "";
								moveType = consts.move.TYPE_INNER;
								tmpArrow.css({
									"display":"none"
								});
								if (window.zTreeMoveTimer) {
									clearTimeout(window.zTreeMoveTimer);
									window.zTreeMoveTargetNodeTId = null
								}
							}
							if (!canPrev && !canNext && !canInner) {
								clearMove();
							} else {
								var tmpTargetA = $("#" + tmpTargetNodeId + consts.id.A, tmpTarget),
									tmpNextA = tmpTargetNode.isLastNode ? null : $("#" + tmpTargetNode.getNextNode().tId + consts.id.A, tmpTarget.next()),
									tmpTop = tmpTargetA.offset().top,
									tmpLeft = tmpTargetA.offset().left,
									prevPercent = canPrev ? (canInner ? 0.25 : (canNext ? 0.5 : 1) ) : -1,
									nextPercent = canNext ? (canInner ? 0.75 : (canPrev ? 0.5 : 0) ) : -1,
									dY_percent = (event.clientY + docScrollTop - tmpTop)/tmpTargetA.height();

								if ((prevPercent==1 || dY_percent<=prevPercent && dY_percent>=-.2) && canPrev) {
									dX = 1 - tmpArrow.width();
									dY = tmpTop - tmpArrow.height()/2;
									moveType = consts.move.TYPE_PREV;
								} else if ((nextPercent==0 || dY_percent>=nextPercent && dY_percent<=1.2) && canNext) {
									dX = 1 - tmpArrow.width();
									dY = (tmpNextA == null || (tmpTargetNode.isParent && tmpTargetNode.open)) ? (tmpTop + tmpTargetA.height() - tmpArrow.height()/2) : (tmpNextA.offset().top - tmpArrow.height()/2);
									moveType = consts.move.TYPE_NEXT;
								} else if (canInner) {
									dX = 5 - tmpArrow.width();
									dY = tmpTop;
									moveType = consts.move.TYPE_INNER;
								} else {
									clearMove();
								}

								if (tmpTarget) {
									tmpArrow.css({
										"display":"block",
										"top": dY + "px",
										"left": (tmpLeft + dX) + "px"
									});
									tmpTargetA.addClass(consts.node.TMPTARGET_NODE + "_" + moveType);

									if (preTmpTargetNodeId != tmpTargetNodeId || preTmpMoveType != moveType) {
										startTime = (new Date()).getTime();
									}
									if (tmpTargetNode && tmpTargetNode.isParent && moveType == consts.move.TYPE_INNER) {
										var startTimer = true;
										if (window.zTreeMoveTimer && window.zTreeMoveTargetNodeTId !== tmpTargetNode.tId) {
											clearTimeout(window.zTreeMoveTimer);
											window.zTreeMoveTargetNodeTId = null;
										} else if (window.zTreeMoveTimer && window.zTreeMoveTargetNodeTId === tmpTargetNode.tId) {
											startTimer = false;
										}
										if (startTimer) {
											window.zTreeMoveTimer = setTimeout(function() {
												if (moveType != consts.move.TYPE_INNER) return;
												if (tmpTargetNode && tmpTargetNode.isParent && !tmpTargetNode.open && (new Date()).getTime() - startTime > targetSetting.edit.drag.autoOpenTime
													&& tools.apply(targetSetting.callback.beforeDragOpen, [targetSetting.treeId, tmpTargetNode], true)) {
													view.switchNode(targetSetting, tmpTargetNode);
													if (targetSetting.edit.drag.autoExpandTrigger) {
														targetSetting.treeObj.trigger(consts.event.EXPAND, [targetSetting.treeId, tmpTargetNode]);
													}
												}
											}, targetSetting.edit.drag.autoOpenTime+50);
											window.zTreeMoveTargetNodeTId = tmpTargetNode.tId;
										}
									}
								}
							}
						} else {
							moveType = consts.move.TYPE_INNER;
							if (tmpTarget && tools.apply(targetSetting.edit.drag.inner, [targetSetting.treeId, nodes, null], !!targetSetting.edit.drag.inner)) {
								tmpTarget.addClass(consts.node.TMPTARGET_TREE);
							} else {
								tmpTarget = null;
							}
							tmpArrow.css({
								"display":"none"
							});
							if (window.zTreeMoveTimer) {
								clearTimeout(window.zTreeMoveTimer);
								window.zTreeMoveTargetNodeTId = null;
							}
						}
						preTmpTargetNodeId = tmpTargetNodeId;
						preTmpMoveType = moveType;

						setting.treeObj.trigger(consts.event.DRAGMOVE, [event, setting.treeId, nodes]);
					}
					return false;
				}

				doc.bind("mouseup", _docMouseUp);
				function _docMouseUp(event) {
					if (window.zTreeMoveTimer) {
						clearTimeout(window.zTreeMoveTimer);
						window.zTreeMoveTargetNodeTId = null;
					}
					preTmpTargetNodeId = null;
					preTmpMoveType = null;
					doc.unbind("mousemove", _docMouseMove);
					doc.unbind("mouseup", _docMouseUp);
					doc.unbind("selectstart", _docSelect);
					body.css("cursor", "auto");
					if (tmpTarget) {
						tmpTarget.removeClass(consts.node.TMPTARGET_TREE);
						if (tmpTargetNodeId) $("#" + tmpTargetNodeId + consts.id.A, tmpTarget).removeClass(consts.node.TMPTARGET_NODE + "_" + consts.move.TYPE_PREV)
								.removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_NEXT).removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_INNER);
					}
					tools.showIfameMask(setting, false);

					roots.showHoverDom = true;
					if (root.dragFlag == 0) return;
					root.dragFlag = 0;

					var i, l, tmpNode;
					for (i=0, l=nodes.length; i<l; i++) {
						tmpNode = nodes[i];
						if (tmpNode.isParent && root.dragNodeShowBefore[tmpNode.tId] && !tmpNode.open) {
							view.expandCollapseNode(setting, tmpNode, !tmpNode.open);
							delete root.dragNodeShowBefore[tmpNode.tId];
						}
					}

					if (curNode) curNode.remove();
					if (tmpArrow) tmpArrow.remove();

					var isCopy = ((event.ctrlKey || event.metaKey) && setting.edit.drag.isMove && setting.edit.drag.isCopy) || (!setting.edit.drag.isMove && setting.edit.drag.isCopy);
					if (!isCopy && tmpTarget && tmpTargetNodeId && nodes[0].parentTId && tmpTargetNodeId==nodes[0].parentTId && moveType == consts.move.TYPE_INNER) {
						tmpTarget = null;
					}
					if (tmpTarget) {
						var dragTargetNode = tmpTargetNodeId == null ? null: data.getNodeCache(targetSetting, tmpTargetNodeId);
						if (tools.apply(setting.callback.beforeDrop, [targetSetting.treeId, nodes, dragTargetNode, moveType, isCopy], true) == false) {
							view.selectNodes(sourceSetting, nodes);
							return;
						}
						var newNodes = isCopy ? tools.clone(nodes) : nodes;

						function dropCallback() {
							if (isOtherTree) {
								if (!isCopy) {
									for(var i=0, l=nodes.length; i<l; i++) {
										view.removeNode(setting, nodes[i]);
									}
								}
								if (moveType == consts.move.TYPE_INNER) {
									view.addNodes(targetSetting, dragTargetNode, -1, newNodes);
								} else {
									view.addNodes(targetSetting, dragTargetNode.getParentNode(), moveType == consts.move.TYPE_PREV ? dragTargetNode.getIndex() : dragTargetNode.getIndex()+1, newNodes);
								}
							} else {
								if (isCopy && moveType == consts.move.TYPE_INNER) {
									view.addNodes(targetSetting, dragTargetNode, -1, newNodes);
								} else if (isCopy) {
									view.addNodes(targetSetting, dragTargetNode.getParentNode(), moveType == consts.move.TYPE_PREV ? dragTargetNode.getIndex() : dragTargetNode.getIndex()+1, newNodes);
								} else {
									if (moveType != consts.move.TYPE_NEXT) {
										for (i=0, l=newNodes.length; i<l; i++) {
											view.moveNode(targetSetting, dragTargetNode, newNodes[i], moveType, false);
										}
									} else {
										for (i=-1, l=newNodes.length-1; i<l; l--) {
											view.moveNode(targetSetting, dragTargetNode, newNodes[l], moveType, false);
										}
									}
								}
							}
							view.selectNodes(targetSetting, newNodes);

							var a = $$(newNodes[0], setting).get(0);
							if (a) {
								if (a.scrollIntoView) {
									a.scrollIntoView(false);
								} else {
									try{a.focus().blur();}catch(e){}
								}
							}

							setting.treeObj.trigger(consts.event.DROP, [event, targetSetting.treeId, newNodes, dragTargetNode, moveType, isCopy]);
						}

						if (moveType == consts.move.TYPE_INNER && tools.canAsync(targetSetting, dragTargetNode)) {
							view.asyncNode(targetSetting, dragTargetNode, false, dropCallback);
						} else {
							dropCallback();
						}

					} else {
						view.selectNodes(sourceSetting, nodes);
						setting.treeObj.trigger(consts.event.DROP, [event, setting.treeId, nodes, null, null, null]);
					}
				}

				doc.bind("selectstart", _docSelect);
				function _docSelect() {
					return false;
				}

				//Avoid FireFox's Bug
				//If zTree Div CSS set 'overflow', so drag node outside of zTree, and event.target is error.
				if(eventMouseDown.preventDefault) {
					eventMouseDown.preventDefault();
				}
				return true;
			}
		},
		//method of tools for zTree
		_tools = {
			getAbs: function (obj) {
				var oRect = obj.getBoundingClientRect(),
				scrollTop = document.body.scrollTop+document.documentElement.scrollTop,
				scrollLeft = document.body.scrollLeft+document.documentElement.scrollLeft;
				return [oRect.left+scrollLeft,oRect.top+scrollTop];
			},
			inputFocus: function(inputObj) {
				if (inputObj.get(0)) {
					inputObj.focus();
					tools.setCursorPosition(inputObj.get(0), inputObj.val().length);
				}
			},
			inputSelect: function(inputObj) {
				if (inputObj.get(0)) {
					inputObj.focus();
					inputObj.select();
				}
			},
			setCursorPosition: function(obj, pos){
				if(obj.setSelectionRange) {
					obj.focus();
					obj.setSelectionRange(pos,pos);
				} else if (obj.createTextRange) {
					var range = obj.createTextRange();
					range.collapse(true);
					range.moveEnd('character', pos);
					range.moveStart('character', pos);
					range.select();
				}
			},
			showIfameMask: function(setting, showSign) {
				var root = data.getRoot(setting);
				//clear full mask
				while (root.dragMaskList.length > 0) {
					root.dragMaskList[0].remove();
					root.dragMaskList.shift();
				}
				if (showSign) {
					//show mask
					var iframeList = $$("iframe", setting);
					for (var i = 0, l = iframeList.length; i < l; i++) {
						var obj = iframeList.get(i),
						r = tools.getAbs(obj),
						dragMask = $$("<div id='zTreeMask_" + i + "' class='zTreeMask' style='top:" + r[1] + "px; left:" + r[0] + "px; width:" + obj.offsetWidth + "px; height:" + obj.offsetHeight + "px;'></div>", setting);
						dragMask.appendTo($$("body", setting));
						root.dragMaskList.push(dragMask);
					}
				}
			}
		},
		//method of operate ztree dom
		_view = {
			addEditBtn: function(setting, node) {
				if (node.editNameFlag || $$(node, consts.id.EDIT, setting).length > 0) {
					return;
				}
				if (!tools.apply(setting.edit.showRenameBtn, [setting.treeId, node], setting.edit.showRenameBtn)) {
					return;
				}
				var aObj = $$(node, consts.id.A, setting),
				editStr = "<span class='" + consts.className.BUTTON + " edit' id='" + node.tId + consts.id.EDIT + "' title='"+tools.apply(setting.edit.renameTitle, [setting.treeId, node], setting.edit.renameTitle)+"' treeNode"+consts.id.EDIT+" style='display:none;'></span>";
				aObj.append(editStr);

				$$(node, consts.id.EDIT, setting).bind('click',
					function() {
						if (!tools.uCanDo(setting) || tools.apply(setting.callback.beforeEditName, [setting.treeId, node], true) == false) return false;
						view.editNode(setting, node);
						return false;
					}
					).show();
			},
			addRemoveBtn: function(setting, node) {
				if (node.editNameFlag || $$(node, consts.id.REMOVE, setting).length > 0) {
					return;
				}
				if (!tools.apply(setting.edit.showRemoveBtn, [setting.treeId, node], setting.edit.showRemoveBtn)) {
					return;
				}
				var aObj = $$(node, consts.id.A, setting),
				removeStr = "<span class='" + consts.className.BUTTON + " remove' id='" + node.tId + consts.id.REMOVE + "' title='"+tools.apply(setting.edit.removeTitle, [setting.treeId, node], setting.edit.removeTitle)+"' treeNode"+consts.id.REMOVE+" style='display:none;'></span>";
				aObj.append(removeStr);

				$$(node, consts.id.REMOVE, setting).bind('click',
					function() {
						if (!tools.uCanDo(setting) || tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return false;
						view.removeNode(setting, node);
						setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
						return false;
					}
					).bind('mousedown',
					function(eventMouseDown) {
						return true;
					}
					).show();
			},
			addHoverDom: function(setting, node) {
				if (data.getRoots().showHoverDom) {
					node.isHover = true;
					if (setting.edit.enable) {
						view.addEditBtn(setting, node);
						view.addRemoveBtn(setting, node);
					}
					tools.apply(setting.view.addHoverDom, [setting.treeId, node]);
				}
			},
			cancelCurEditNode: function (setting, forceName, isCancel) {
				var root = data.getRoot(setting),
				nameKey = setting.data.key.name,
				node = root.curEditNode;

				if (node) {
					var inputObj = root.curEditInput,
					newName = forceName ? forceName:(isCancel ? node[nameKey]: inputObj.val());
					if (tools.apply(setting.callback.beforeRename, [setting.treeId, node, newName, isCancel], true) === false) {
						return false;
					}
	                node[nameKey] = newName;
	                var aObj = $$(node, consts.id.A, setting);
					aObj.removeClass(consts.node.CURSELECTED_EDIT);
					inputObj.unbind();
					view.setNodeName(setting, node);
					node.editNameFlag = false;
					root.curEditNode = null;
					root.curEditInput = null;
					view.selectNode(setting, node, false);
	                setting.treeObj.trigger(consts.event.RENAME, [setting.treeId, node, isCancel]);
				}
				root.noSelection = true;
				return true;
			},
			editNode: function(setting, node) {
				var root = data.getRoot(setting);
				view.editNodeBlur = false;
				if (data.isSelectedNode(setting, node) && root.curEditNode == node && node.editNameFlag) {
					setTimeout(function() {tools.inputFocus(root.curEditInput);}, 0);
					return;
				}
				var nameKey = setting.data.key.name;
				node.editNameFlag = true;
				view.removeTreeDom(setting, node);
				view.cancelCurEditNode(setting);
				view.selectNode(setting, node, false);
				$$(node, consts.id.SPAN, setting).html("<input type=text class='rename' id='" + node.tId + consts.id.INPUT + "' treeNode" + consts.id.INPUT + " >");
				var inputObj = $$(node, consts.id.INPUT, setting);
				inputObj.attr("value", node[nameKey]);
				if (setting.edit.editNameSelectAll) {
					tools.inputSelect(inputObj);
				} else {
					tools.inputFocus(inputObj);
				}

				inputObj.bind('blur', function(event) {
					if (!view.editNodeBlur) {
						view.cancelCurEditNode(setting);
					}
				}).bind('keydown', function(event) {
					if (event.keyCode=="13") {
						view.editNodeBlur = true;
						view.cancelCurEditNode(setting);
					} else if (event.keyCode=="27") {
						view.cancelCurEditNode(setting, null, true);
					}
				}).bind('click', function(event) {
					return false;
				}).bind('dblclick', function(event) {
					return false;
				});

				$$(node, consts.id.A, setting).addClass(consts.node.CURSELECTED_EDIT);
				root.curEditInput = inputObj;
				root.noSelection = false;
				root.curEditNode = node;
			},
			moveNode: function(setting, targetNode, node, moveType, animateFlag, isSilent) {
				var root = data.getRoot(setting),
				childKey = setting.data.key.children;
				if (targetNode == node) return;
				if (setting.data.keep.leaf && targetNode && !targetNode.isParent && moveType == consts.move.TYPE_INNER) return;
				var oldParentNode = (node.parentTId ? node.getParentNode(): root),
				targetNodeIsRoot = (targetNode === null || targetNode == root);
				if (targetNodeIsRoot && targetNode === null) targetNode = root;
				if (targetNodeIsRoot) moveType = consts.move.TYPE_INNER;
				var targetParentNode = (targetNode.parentTId ? targetNode.getParentNode() : root);

				if (moveType != consts.move.TYPE_PREV && moveType != consts.move.TYPE_NEXT) {
					moveType = consts.move.TYPE_INNER;
				}

				if (moveType == consts.move.TYPE_INNER) {
					if (targetNodeIsRoot) {
						//parentTId of root node is null
						node.parentTId = null;
					} else {
						if (!targetNode.isParent) {
							targetNode.isParent = true;
							targetNode.open = !!targetNode.open;
							view.setNodeLineIcos(setting, targetNode);
						}
						node.parentTId = targetNode.tId;
					}
				}

				//move node Dom
				var targetObj, target_ulObj;
				if (targetNodeIsRoot) {
					targetObj = setting.treeObj;
					target_ulObj = targetObj;
				} else {
					if (!isSilent && moveType == consts.move.TYPE_INNER) {
						view.expandCollapseNode(setting, targetNode, true, false);
					} else if (!isSilent) {
						view.expandCollapseNode(setting, targetNode.getParentNode(), true, false);
					}
					targetObj = $$(targetNode, setting);
					target_ulObj = $$(targetNode, consts.id.UL, setting);
					if (!!targetObj.get(0) && !target_ulObj.get(0)) {
						var ulstr = [];
						view.makeUlHtml(setting, targetNode, ulstr, '');
						targetObj.append(ulstr.join(''));
					}
					target_ulObj = $$(targetNode, consts.id.UL, setting);
				}
				var nodeDom = $$(node, setting);
				if (!nodeDom.get(0)) {
					nodeDom = view.appendNodes(setting, node.level, [node], null, -1, false, true).join('');
				} else if (!targetObj.get(0)) {
					nodeDom.remove();
				}
				if (target_ulObj.get(0) && moveType == consts.move.TYPE_INNER) {
					target_ulObj.append(nodeDom);
				} else if (targetObj.get(0) && moveType == consts.move.TYPE_PREV) {
					targetObj.before(nodeDom);
				} else if (targetObj.get(0) && moveType == consts.move.TYPE_NEXT) {
					targetObj.after(nodeDom);
				}

				//repair the data after move
				var i,l,
				tmpSrcIndex = -1,
				tmpTargetIndex = 0,
				oldNeighbor = null,
				newNeighbor = null,
				oldLevel = node.level;
				if (node.isFirstNode) {
					tmpSrcIndex = 0;
					if (oldParentNode[childKey].length > 1 ) {
						oldNeighbor = oldParentNode[childKey][1];
						oldNeighbor.isFirstNode = true;
					}
				} else if (node.isLastNode) {
					tmpSrcIndex = oldParentNode[childKey].length -1;
					oldNeighbor = oldParentNode[childKey][tmpSrcIndex - 1];
					oldNeighbor.isLastNode = true;
				} else {
					for (i = 0, l = oldParentNode[childKey].length; i < l; i++) {
						if (oldParentNode[childKey][i].tId == node.tId) {
							tmpSrcIndex = i;
							break;
						}
					}
				}
				if (tmpSrcIndex >= 0) {
					oldParentNode[childKey].splice(tmpSrcIndex, 1);
				}
				if (moveType != consts.move.TYPE_INNER) {
					for (i = 0, l = targetParentNode[childKey].length; i < l; i++) {
						if (targetParentNode[childKey][i].tId == targetNode.tId) tmpTargetIndex = i;
					}
				}
				if (moveType == consts.move.TYPE_INNER) {
					if (!targetNode[childKey]) targetNode[childKey] = new Array();
					if (targetNode[childKey].length > 0) {
						newNeighbor = targetNode[childKey][targetNode[childKey].length - 1];
						newNeighbor.isLastNode = false;
					}
					targetNode[childKey].splice(targetNode[childKey].length, 0, node);
					node.isLastNode = true;
					node.isFirstNode = (targetNode[childKey].length == 1);
				} else if (targetNode.isFirstNode && moveType == consts.move.TYPE_PREV) {
					targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
					newNeighbor = targetNode;
					newNeighbor.isFirstNode = false;
					node.parentTId = targetNode.parentTId;
					node.isFirstNode = true;
					node.isLastNode = false;

				} else if (targetNode.isLastNode && moveType == consts.move.TYPE_NEXT) {
					targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
					newNeighbor = targetNode;
					newNeighbor.isLastNode = false;
					node.parentTId = targetNode.parentTId;
					node.isFirstNode = false;
					node.isLastNode = true;

				} else {
					if (moveType == consts.move.TYPE_PREV) {
						targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
					} else {
						targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
					}
					node.parentTId = targetNode.parentTId;
					node.isFirstNode = false;
					node.isLastNode = false;
				}
				data.fixPIdKeyValue(setting, node);
				data.setSonNodeLevel(setting, node.getParentNode(), node);

				//repair node what been moved
				view.setNodeLineIcos(setting, node);
				view.repairNodeLevelClass(setting, node, oldLevel)

				//repair node's old parentNode dom
				if (!setting.data.keep.parent && oldParentNode[childKey].length < 1) {
					//old parentNode has no child nodes
					oldParentNode.isParent = false;
					oldParentNode.open = false;
					var tmp_ulObj = $$(oldParentNode, consts.id.UL, setting),
					tmp_switchObj = $$(oldParentNode, consts.id.SWITCH, setting),
					tmp_icoObj = $$(oldParentNode, consts.id.ICON, setting);
					view.replaceSwitchClass(oldParentNode, tmp_switchObj, consts.folder.DOCU);
					view.replaceIcoClass(oldParentNode, tmp_icoObj, consts.folder.DOCU);
					tmp_ulObj.css("display", "none");

				} else if (oldNeighbor) {
					//old neigbor node
					view.setNodeLineIcos(setting, oldNeighbor);
				}

				//new neigbor node
				if (newNeighbor) {
					view.setNodeLineIcos(setting, newNeighbor);
				}

				//repair checkbox / radio
				if (!!setting.check && setting.check.enable && view.repairChkClass) {
					view.repairChkClass(setting, oldParentNode);
					view.repairParentChkClassWithSelf(setting, oldParentNode);
					if (oldParentNode != node.parent)
						view.repairParentChkClassWithSelf(setting, node);
				}

				//expand parents after move
				if (!isSilent) {
					view.expandCollapseParentNode(setting, node.getParentNode(), true, animateFlag);
				}
			},
			removeEditBtn: function(setting, node) {
				$$(node, consts.id.EDIT, setting).unbind().remove();
			},
			removeRemoveBtn: function(setting, node) {
				$$(node, consts.id.REMOVE, setting).unbind().remove();
			},
			removeTreeDom: function(setting, node) {
				node.isHover = false;
				view.removeEditBtn(setting, node);
				view.removeRemoveBtn(setting, node);
				tools.apply(setting.view.removeHoverDom, [setting.treeId, node]);
			},
			repairNodeLevelClass: function(setting, node, oldLevel) {
				if (oldLevel === node.level) return;
				var liObj = $$(node, setting),
				aObj = $$(node, consts.id.A, setting),
				ulObj = $$(node, consts.id.UL, setting),
				oldClass = consts.className.LEVEL + oldLevel,
				newClass = consts.className.LEVEL + node.level;
				liObj.removeClass(oldClass);
				liObj.addClass(newClass);
				aObj.removeClass(oldClass);
				aObj.addClass(newClass);
				ulObj.removeClass(oldClass);
				ulObj.addClass(newClass);
			},
			selectNodes : function(setting, nodes) {
				for (var i=0, l=nodes.length; i<l; i++) {
					view.selectNode(setting, nodes[i], i>0);
				}
			}
		},

		_z = {
			tools: _tools,
			view: _view,
			event: _event,
			data: _data
		};
		$.extend(true, $.fn.zTree.consts, _consts);
		$.extend(true, $.fn.zTree._z, _z);

		var zt = $.fn.zTree,
		tools = zt._z.tools,
		consts = zt.consts,
		view = zt._z.view,
		data = zt._z.data,
		event = zt._z.event,
		$$ = tools.$;

		data.exSetting(_setting);
		data.addInitBind(_bindEvent);
		data.addInitUnBind(_unbindEvent);
		data.addInitCache(_initCache);
		data.addInitNode(_initNode);
		data.addInitProxy(_eventProxy);
		data.addInitRoot(_initRoot);
		data.addZTreeTools(_zTreeTools);

		var _cancelPreSelectedNode = view.cancelPreSelectedNode;
		view.cancelPreSelectedNode = function (setting, node) {
			var list = data.getRoot(setting).curSelectedList;
			for (var i=0, j=list.length; i<j; i++) {
				if (!node || node === list[i]) {
					view.removeTreeDom(setting, list[i]);
					if (node) break;
				}
			}
			if (_cancelPreSelectedNode) _cancelPreSelectedNode.apply(view, arguments);
		}

		var _createNodes = view.createNodes;
		view.createNodes = function(setting, level, nodes, parentNode, index) {
			if (_createNodes) {
				_createNodes.apply(view, arguments);
			}
			if (!nodes) return;
			if (view.repairParentChkClassWithSelf) {
				view.repairParentChkClassWithSelf(setting, parentNode);
			}
		}

		var _makeNodeUrl = view.makeNodeUrl;
		view.makeNodeUrl = function(setting, node) {
			return setting.edit.enable ? null : (_makeNodeUrl.apply(view, arguments));
		}

		var _removeNode = view.removeNode;
		view.removeNode = function(setting, node) {
			var root = data.getRoot(setting);
			if (root.curEditNode === node) root.curEditNode = null;
			if (_removeNode) {
				_removeNode.apply(view, arguments);
			}
		}

		var _selectNode = view.selectNode;
		view.selectNode = function(setting, node, addFlag) {
			var root = data.getRoot(setting);
			if (data.isSelectedNode(setting, node) && root.curEditNode == node && node.editNameFlag) {
				return false;
			}
			if (_selectNode) _selectNode.apply(view, arguments);
			view.addHoverDom(setting, node);
			return true;
		}

		var _uCanDo = tools.uCanDo;
		tools.uCanDo = function(setting, e) {
			var root = data.getRoot(setting);
			if (e && (tools.eqs(e.type, "mouseover") || tools.eqs(e.type, "mouseout") || tools.eqs(e.type, "mousedown") || tools.eqs(e.type, "mouseup"))) {
				return true;
			}
			if (root.curEditNode) {
				view.editNodeBlur = false;
				root.curEditInput.focus();
			}
			return (!root.curEditNode) && (_uCanDo ? _uCanDo.apply(view, arguments) : true);
		}
	})(jQuery);

	module.exports = $ = jQuery;


/***/ },

/***/ 209:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**!
	 * Sortable
	 * @author	RubaXa   <trash@rubaxa.org>
	 * @license MIT
	 */


	(function (factory) {
		"use strict";

		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof module != "undefined" && typeof module.exports != "undefined") {
			module.exports = factory();
		}
		else if (typeof Package !== "undefined") {
			Sortable = factory();  // export for Meteor.js
		}
		else {
			/* jshint sub:true */
			window["Sortable"] = factory();
		}
	})(function () {
		"use strict";
		
		if (typeof window == "undefined" || typeof window.document == "undefined") {
			return function() {
				throw new Error( "Sortable.js requires a window with a document" );
			}
		}

		var dragEl,
			parentEl,
			ghostEl,
			cloneEl,
			rootEl,
			nextEl,

			scrollEl,
			scrollParentEl,

			lastEl,
			lastCSS,
			lastParentCSS,

			oldIndex,
			newIndex,

			activeGroup,
			autoScroll = {},

			tapEvt,
			touchEvt,

			moved,

			/** @const */
			RSPACE = /\s+/g,

			expando = 'Sortable' + (new Date).getTime(),

			win = window,
			document = win.document,
			parseInt = win.parseInt,

			supportDraggable = !!('draggable' in document.createElement('div')),
			supportCssPointerEvents = (function (el) {
				el = document.createElement('x');
				el.style.cssText = 'pointer-events:auto';
				return el.style.pointerEvents === 'auto';
			})(),

			_silent = false,

			abs = Math.abs,
			slice = [].slice,

			touchDragOverListeners = [],

			_autoScroll = _throttle(function (/**Event*/evt, /**Object*/options, /**HTMLElement*/rootEl) {
				// Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
				if (rootEl && options.scroll) {
					var el,
						rect,
						sens = options.scrollSensitivity,
						speed = options.scrollSpeed,

						x = evt.clientX,
						y = evt.clientY,

						winWidth = window.innerWidth,
						winHeight = window.innerHeight,

						vx,
						vy
					;

					// Delect scrollEl
					if (scrollParentEl !== rootEl) {
						scrollEl = options.scroll;
						scrollParentEl = rootEl;

						if (scrollEl === true) {
							scrollEl = rootEl;

							do {
								if ((scrollEl.offsetWidth < scrollEl.scrollWidth) ||
									(scrollEl.offsetHeight < scrollEl.scrollHeight)
								) {
									break;
								}
								/* jshint boss:true */
							} while (scrollEl = scrollEl.parentNode);
						}
					}

					if (scrollEl) {
						el = scrollEl;
						rect = scrollEl.getBoundingClientRect();
						vx = (abs(rect.right - x) <= sens) - (abs(rect.left - x) <= sens);
						vy = (abs(rect.bottom - y) <= sens) - (abs(rect.top - y) <= sens);
					}


					if (!(vx || vy)) {
						vx = (winWidth - x <= sens) - (x <= sens);
						vy = (winHeight - y <= sens) - (y <= sens);

						/* jshint expr:true */
						(vx || vy) && (el = win);
					}


					if (autoScroll.vx !== vx || autoScroll.vy !== vy || autoScroll.el !== el) {
						autoScroll.el = el;
						autoScroll.vx = vx;
						autoScroll.vy = vy;

						clearInterval(autoScroll.pid);

						if (el) {
							autoScroll.pid = setInterval(function () {
								if (el === win) {
									win.scrollTo(win.pageXOffset + vx * speed, win.pageYOffset + vy * speed);
								} else {
									vy && (el.scrollTop += vy * speed);
									vx && (el.scrollLeft += vx * speed);
								}
							}, 24);
						}
					}
				}
			}, 30),

			_prepareGroup = function (options) {
				var group = options.group;

				if (!group || typeof group != 'object') {
					group = options.group = {name: group};
				}

				['pull', 'put'].forEach(function (key) {
					if (!(key in group)) {
						group[key] = true;
					}
				});

				options.groups = ' ' + group.name + (group.put.join ? ' ' + group.put.join(' ') : '') + ' ';
			}
		;



		/**
		 * @class  Sortable
		 * @param  {HTMLElement}  el
		 * @param  {Object}       [options]
		 */
		function Sortable(el, options) {
			if (!(el && el.nodeType && el.nodeType === 1)) {
				throw 'Sortable: `el` must be HTMLElement, and not ' + {}.toString.call(el);
			}

			this.el = el; // root element
			this.options = options = _extend({}, options);


			// Export instance
			el[expando] = this;


			// Default options
			var defaults = {
				group: Math.random(),
				sort: true,
				disabled: false,
				store: null,
				handle: null,
				scroll: true,
				scrollSensitivity: 30,
				scrollSpeed: 10,
				draggable: /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen',
				ignore: 'a, img',
				filter: null,
				animation: 0,
				setData: function (dataTransfer, dragEl) {
					dataTransfer.setData('Text', dragEl.textContent);
				},
				dropBubble: false,
				dragoverBubble: false,
				dataIdAttr: 'data-id',
				delay: 0,
				forceFallback: false,
				fallbackClass: 'sortable-fallback',
				fallbackOnBody: false
			};


			// Set default options
			for (var name in defaults) {
				!(name in options) && (options[name] = defaults[name]);
			}

			_prepareGroup(options);

			// Bind all private methods
			for (var fn in this) {
				if (fn.charAt(0) === '_') {
					this[fn] = this[fn].bind(this);
				}
			}

			// Setup drag mode
			this.nativeDraggable = options.forceFallback ? false : supportDraggable;

			// Bind events
			_on(el, 'mousedown', this._onTapStart);
			_on(el, 'touchstart', this._onTapStart);

			if (this.nativeDraggable) {
				_on(el, 'dragover', this);
				_on(el, 'dragenter', this);
			}

			touchDragOverListeners.push(this._onDragOver);

			// Restore sorting
			options.store && this.sort(options.store.get(this));
		}


		Sortable.prototype = /** @lends Sortable.prototype */ {
			constructor: Sortable,

			_onTapStart: function (/** Event|TouchEvent */evt) {
				var _this = this,
					el = this.el,
					options = this.options,
					type = evt.type,
					touch = evt.touches && evt.touches[0],
					target = (touch || evt).target,
					originalTarget = target,
					filter = options.filter;


				if (type === 'mousedown' && evt.button !== 0 || options.disabled) {
					return; // only left button or enabled
				}

				target = _closest(target, options.draggable, el);

				if (!target) {
					return;
				}

				// get the index of the dragged element within its parent
				oldIndex = _index(target, options.draggable);

				// Check filter
				if (typeof filter === 'function') {
					if (filter.call(this, evt, target, this)) {
						_dispatchEvent(_this, originalTarget, 'filter', target, el, oldIndex);
						evt.preventDefault();
						return; // cancel dnd
					}
				}
				else if (filter) {
					filter = filter.split(',').some(function (criteria) {
						criteria = _closest(originalTarget, criteria.trim(), el);

						if (criteria) {
							_dispatchEvent(_this, criteria, 'filter', target, el, oldIndex);
							return true;
						}
					});

					if (filter) {
						evt.preventDefault();
						return; // cancel dnd
					}
				}


				if (options.handle && !_closest(originalTarget, options.handle, el)) {
					return;
				}


				// Prepare `dragstart`
				this._prepareDragStart(evt, touch, target);
			},

			_prepareDragStart: function (/** Event */evt, /** Touch */touch, /** HTMLElement */target) {
				var _this = this,
					el = _this.el,
					options = _this.options,
					ownerDocument = el.ownerDocument,
					dragStartFn;

				if (target && !dragEl && (target.parentNode === el)) {
					tapEvt = evt;

					rootEl = el;
					dragEl = target;
					parentEl = dragEl.parentNode;
					nextEl = dragEl.nextSibling;
					activeGroup = options.group;

					dragStartFn = function () {
						// Delayed drag has been triggered
						// we can re-enable the events: touchmove/mousemove
						_this._disableDelayedDrag();

						// Make the element draggable
						dragEl.draggable = true;

						// Chosen item
						_toggleClass(dragEl, _this.options.chosenClass, true);

						// Bind the events: dragstart/dragend
						_this._triggerDragStart(touch);
					};

					// Disable "draggable"
					options.ignore.split(',').forEach(function (criteria) {
						_find(dragEl, criteria.trim(), _disableDraggable);
					});

					_on(ownerDocument, 'mouseup', _this._onDrop);
					_on(ownerDocument, 'touchend', _this._onDrop);
					_on(ownerDocument, 'touchcancel', _this._onDrop);

					if (options.delay) {
						// If the user moves the pointer or let go the click or touch
						// before the delay has been reached:
						// disable the delayed drag
						_on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
						_on(ownerDocument, 'touchend', _this._disableDelayedDrag);
						_on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
						_on(ownerDocument, 'mousemove', _this._disableDelayedDrag);
						_on(ownerDocument, 'touchmove', _this._disableDelayedDrag);

						_this._dragStartTimer = setTimeout(dragStartFn, options.delay);
					} else {
						dragStartFn();
					}
				}
			},

			_disableDelayedDrag: function () {
				var ownerDocument = this.el.ownerDocument;

				clearTimeout(this._dragStartTimer);
				_off(ownerDocument, 'mouseup', this._disableDelayedDrag);
				_off(ownerDocument, 'touchend', this._disableDelayedDrag);
				_off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
				_off(ownerDocument, 'mousemove', this._disableDelayedDrag);
				_off(ownerDocument, 'touchmove', this._disableDelayedDrag);
			},

			_triggerDragStart: function (/** Touch */touch) {
				if (touch) {
					// Touch device support
					tapEvt = {
						target: dragEl,
						clientX: touch.clientX,
						clientY: touch.clientY
					};

					this._onDragStart(tapEvt, 'touch');
				}
				else if (!this.nativeDraggable) {
					this._onDragStart(tapEvt, true);
				}
				else {
					_on(dragEl, 'dragend', this);
					_on(rootEl, 'dragstart', this._onDragStart);
				}

				try {
					if (document.selection) {
						document.selection.empty();
					} else {
						window.getSelection().removeAllRanges();
					}
				} catch (err) {
				}
			},

			_dragStarted: function () {
				if (rootEl && dragEl) {
					// Apply effect
					_toggleClass(dragEl, this.options.ghostClass, true);

					Sortable.active = this;

					// Drag start event
					_dispatchEvent(this, rootEl, 'start', dragEl, rootEl, oldIndex);
				}
			},

			_emulateDragOver: function () {
				if (touchEvt) {
					if (this._lastX === touchEvt.clientX && this._lastY === touchEvt.clientY) {
						return;
					}

					this._lastX = touchEvt.clientX;
					this._lastY = touchEvt.clientY;

					if (!supportCssPointerEvents) {
						_css(ghostEl, 'display', 'none');
					}

					var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY),
						parent = target,
						groupName = ' ' + this.options.group.name + '',
						i = touchDragOverListeners.length;

					if (parent) {
						do {
							if (parent[expando] && parent[expando].options.groups.indexOf(groupName) > -1) {
								while (i--) {
									touchDragOverListeners[i]({
										clientX: touchEvt.clientX,
										clientY: touchEvt.clientY,
										target: target,
										rootEl: parent
									});
								}

								break;
							}

							target = parent; // store last element
						}
						/* jshint boss:true */
						while (parent = parent.parentNode);
					}

					if (!supportCssPointerEvents) {
						_css(ghostEl, 'display', '');
					}
				}
			},


			_onTouchMove: function (/**TouchEvent*/evt) {
				if (tapEvt) {
					// only set the status to dragging, when we are actually dragging
					if (!Sortable.active) {
						this._dragStarted();
					}

					// as well as creating the ghost element on the document body
					this._appendGhost();

					var touch = evt.touches ? evt.touches[0] : evt,
						dx = touch.clientX - tapEvt.clientX,
						dy = touch.clientY - tapEvt.clientY,
						translate3d = evt.touches ? 'translate3d(' + dx + 'px,' + dy + 'px,0)' : 'translate(' + dx + 'px,' + dy + 'px)';

					moved = true;
					touchEvt = touch;

					_css(ghostEl, 'webkitTransform', translate3d);
					_css(ghostEl, 'mozTransform', translate3d);
					_css(ghostEl, 'msTransform', translate3d);
					_css(ghostEl, 'transform', translate3d);

					evt.preventDefault();
				}
			},

			_appendGhost: function () {
				if (!ghostEl) {
					var rect = dragEl.getBoundingClientRect(),
						css = _css(dragEl),
						options = this.options,
						ghostRect;

					ghostEl = dragEl.cloneNode(true);

					_toggleClass(ghostEl, options.ghostClass, false);
					_toggleClass(ghostEl, options.fallbackClass, true);

					_css(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
					_css(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));
					_css(ghostEl, 'width', rect.width);
					_css(ghostEl, 'height', rect.height);
					_css(ghostEl, 'opacity', '0.8');
					_css(ghostEl, 'position', 'fixed');
					_css(ghostEl, 'zIndex', '100000');
					_css(ghostEl, 'pointerEvents', 'none');

					options.fallbackOnBody && document.body.appendChild(ghostEl) || rootEl.appendChild(ghostEl);

					// Fixing dimensions.
					ghostRect = ghostEl.getBoundingClientRect();
					_css(ghostEl, 'width', rect.width * 2 - ghostRect.width);
					_css(ghostEl, 'height', rect.height * 2 - ghostRect.height);
				}
			},

			_onDragStart: function (/**Event*/evt, /**boolean*/useFallback) {
				var dataTransfer = evt.dataTransfer,
					options = this.options;

				this._offUpEvents();

				if (activeGroup.pull == 'clone') {
					cloneEl = dragEl.cloneNode(true);
					_css(cloneEl, 'display', 'none');
					rootEl.insertBefore(cloneEl, dragEl);
				}

				if (useFallback) {

					if (useFallback === 'touch') {
						// Bind touch events
						_on(document, 'touchmove', this._onTouchMove);
						_on(document, 'touchend', this._onDrop);
						_on(document, 'touchcancel', this._onDrop);
					} else {
						// Old brwoser
						_on(document, 'mousemove', this._onTouchMove);
						_on(document, 'mouseup', this._onDrop);
					}

					this._loopId = setInterval(this._emulateDragOver, 50);
				}
				else {
					if (dataTransfer) {
						dataTransfer.effectAllowed = 'move';
						options.setData && options.setData.call(this, dataTransfer, dragEl);
					}

					_on(document, 'drop', this);
					setTimeout(this._dragStarted, 0);
				}
			},

			_onDragOver: function (/**Event*/evt) {
				var el = this.el,
					target,
					dragRect,
					revert,
					options = this.options,
					group = options.group,
					groupPut = group.put,
					isOwner = (activeGroup === group),
					canSort = options.sort;

				if (evt.preventDefault !== void 0) {
					evt.preventDefault();
					!options.dragoverBubble && evt.stopPropagation();
				}

				moved = true;

				if (activeGroup && !options.disabled &&
					(isOwner
						? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
						: activeGroup.pull && groupPut && (
							(activeGroup.name === group.name) || // by Name
							(groupPut.indexOf && ~groupPut.indexOf(activeGroup.name)) // by Array
						)
					) &&
					(evt.rootEl === void 0 || evt.rootEl === this.el) // touch fallback
				) {
					// Smart auto-scrolling
					_autoScroll(evt, options, this.el);

					if (_silent) {
						return;
					}

					target = _closest(evt.target, options.draggable, el);
					dragRect = dragEl.getBoundingClientRect();

					if (revert) {
						_cloneHide(true);

						if (cloneEl || nextEl) {
							rootEl.insertBefore(dragEl, cloneEl || nextEl);
						}
						else if (!canSort) {
							rootEl.appendChild(dragEl);
						}

						return;
					}


					if ((el.children.length === 0) || (el.children[0] === ghostEl) ||
						(el === evt.target) && (target = _ghostIsLast(el, evt))
					) {

						if (target) {
							if (target.animated) {
								return;
							}

							targetRect = target.getBoundingClientRect();
						}

						_cloneHide(isOwner);

						if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect) !== false) {
							if (!dragEl.contains(el)) {
								el.appendChild(dragEl);
								parentEl = el; // actualization
							}

							this._animate(dragRect, dragEl);
							target && this._animate(targetRect, target);
						}
					}
					else if (target && !target.animated && target !== dragEl && (target.parentNode[expando] !== void 0)) {
						if (lastEl !== target) {
							lastEl = target;
							lastCSS = _css(target);
							lastParentCSS = _css(target.parentNode);
						}


						var targetRect = target.getBoundingClientRect(),
							width = targetRect.right - targetRect.left,
							height = targetRect.bottom - targetRect.top,
							floating = /left|right|inline/.test(lastCSS.cssFloat + lastCSS.display)
								|| (lastParentCSS.display == 'flex' && lastParentCSS['flex-direction'].indexOf('row') === 0),
							isWide = (target.offsetWidth > dragEl.offsetWidth),
							isLong = (target.offsetHeight > dragEl.offsetHeight),
							halfway = (floating ? (evt.clientX - targetRect.left) / width : (evt.clientY - targetRect.top) / height) > 0.5,
							nextSibling = target.nextElementSibling,
							moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect),
							after
						;

						if (moveVector !== false) {
							_silent = true;
							setTimeout(_unsilent, 30);

							_cloneHide(isOwner);

							if (moveVector === 1 || moveVector === -1) {
								after = (moveVector === 1);
							}
							else if (floating) {
								var elTop = dragEl.offsetTop,
									tgTop = target.offsetTop;

								if (elTop === tgTop) {
									after = (target.previousElementSibling === dragEl) && !isWide || halfway && isWide;
								} else {
									after = tgTop > elTop;
								}
							} else {
								after = (nextSibling !== dragEl) && !isLong || halfway && isLong;
							}

							if (!dragEl.contains(el)) {
								if (after && !nextSibling) {
									el.appendChild(dragEl);
								} else {
									target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
								}
							}

							parentEl = dragEl.parentNode; // actualization

							this._animate(dragRect, dragEl);
							this._animate(targetRect, target);
						}
					}
				}
			},

			_animate: function (prevRect, target) {
				var ms = this.options.animation;

				if (ms) {
					var currentRect = target.getBoundingClientRect();

					_css(target, 'transition', 'none');
					_css(target, 'transform', 'translate3d('
						+ (prevRect.left - currentRect.left) + 'px,'
						+ (prevRect.top - currentRect.top) + 'px,0)'
					);

					target.offsetWidth; // repaint

					_css(target, 'transition', 'all ' + ms + 'ms');
					_css(target, 'transform', 'translate3d(0,0,0)');

					clearTimeout(target.animated);
					target.animated = setTimeout(function () {
						_css(target, 'transition', '');
						_css(target, 'transform', '');
						target.animated = false;
					}, ms);
				}
			},

			_offUpEvents: function () {
				var ownerDocument = this.el.ownerDocument;

				_off(document, 'touchmove', this._onTouchMove);
				_off(ownerDocument, 'mouseup', this._onDrop);
				_off(ownerDocument, 'touchend', this._onDrop);
				_off(ownerDocument, 'touchcancel', this._onDrop);
			},

			_onDrop: function (/**Event*/evt) {
				var el = this.el,
					options = this.options;

				clearInterval(this._loopId);
				clearInterval(autoScroll.pid);
				clearTimeout(this._dragStartTimer);

				// Unbind events
				_off(document, 'mousemove', this._onTouchMove);

				if (this.nativeDraggable) {
					_off(document, 'drop', this);
					_off(el, 'dragstart', this._onDragStart);
				}

				this._offUpEvents();

				if (evt) {
					if (moved) {
						evt.preventDefault();
						!options.dropBubble && evt.stopPropagation();
					}

					ghostEl && ghostEl.parentNode.removeChild(ghostEl);

					if (dragEl) {
						if (this.nativeDraggable) {
							_off(dragEl, 'dragend', this);
						}

						_disableDraggable(dragEl);

						// Remove class's
						_toggleClass(dragEl, this.options.ghostClass, false);
						_toggleClass(dragEl, this.options.chosenClass, false);

						if (rootEl !== parentEl) {
							newIndex = _index(dragEl, options.draggable);

							if (newIndex >= 0) {
								// drag from one list and drop into another
								_dispatchEvent(null, parentEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
								_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);

								// Add event
								_dispatchEvent(null, parentEl, 'add', dragEl, rootEl, oldIndex, newIndex);

								// Remove event
								_dispatchEvent(this, rootEl, 'remove', dragEl, rootEl, oldIndex, newIndex);
							}
						}
						else {
							// Remove clone
							cloneEl && cloneEl.parentNode.removeChild(cloneEl);

							if (dragEl.nextSibling !== nextEl) {
								// Get the index of the dragged element within its parent
								newIndex = _index(dragEl, options.draggable);

								if (newIndex >= 0) {
									// drag & drop within the same list
									_dispatchEvent(this, rootEl, 'update', dragEl, rootEl, oldIndex, newIndex);
									_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
								}
							}
						}

						if (Sortable.active) {
							if (newIndex === null || newIndex === -1) {
								newIndex = oldIndex;
							}

							_dispatchEvent(this, rootEl, 'end', dragEl, rootEl, oldIndex, newIndex);

							// Save sorting
							this.save();
						}
					}

				}
				this._nulling();
			},

			_nulling: function() {
				// Nulling
				rootEl =
				dragEl =
				parentEl =
				ghostEl =
				nextEl =
				cloneEl =

				scrollEl =
				scrollParentEl =

				tapEvt =
				touchEvt =

				moved =
				newIndex =

				lastEl =
				lastCSS =

				activeGroup =
				Sortable.active = null;
			},

			handleEvent: function (/**Event*/evt) {
				var type = evt.type;

				if (type === 'dragover' || type === 'dragenter') {
					if (dragEl) {
						this._onDragOver(evt);
						_globalDragOver(evt);
					}
				}
				else if (type === 'drop' || type === 'dragend') {
					this._onDrop(evt);
				}
			},


			/**
			 * Serializes the item into an array of string.
			 * @returns {String[]}
			 */
			toArray: function () {
				var order = [],
					el,
					children = this.el.children,
					i = 0,
					n = children.length,
					options = this.options;

				for (; i < n; i++) {
					el = children[i];
					if (_closest(el, options.draggable, this.el)) {
						order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
					}
				}

				return order;
			},


			/**
			 * Sorts the elements according to the array.
			 * @param  {String[]}  order  order of the items
			 */
			sort: function (order) {
				var items = {}, rootEl = this.el;

				this.toArray().forEach(function (id, i) {
					var el = rootEl.children[i];

					if (_closest(el, this.options.draggable, rootEl)) {
						items[id] = el;
					}
				}, this);

				order.forEach(function (id) {
					if (items[id]) {
						rootEl.removeChild(items[id]);
						rootEl.appendChild(items[id]);
					}
				});
			},


			/**
			 * Save the current sorting
			 */
			save: function () {
				var store = this.options.store;
				store && store.set(this);
			},


			/**
			 * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
			 * @param   {HTMLElement}  el
			 * @param   {String}       [selector]  default: `options.draggable`
			 * @returns {HTMLElement|null}
			 */
			closest: function (el, selector) {
				return _closest(el, selector || this.options.draggable, this.el);
			},


			/**
			 * Set/get option
			 * @param   {string} name
			 * @param   {*}      [value]
			 * @returns {*}
			 */
			option: function (name, value) {
				var options = this.options;

				if (value === void 0) {
					return options[name];
				} else {
					options[name] = value;

					if (name === 'group') {
						_prepareGroup(options);
					}
				}
			},


			/**
			 * Destroy
			 */
			destroy: function () {
				var el = this.el;

				el[expando] = null;

				_off(el, 'mousedown', this._onTapStart);
				_off(el, 'touchstart', this._onTapStart);

				if (this.nativeDraggable) {
					_off(el, 'dragover', this);
					_off(el, 'dragenter', this);
				}

				// Remove draggable attributes
				Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
					el.removeAttribute('draggable');
				});

				touchDragOverListeners.splice(touchDragOverListeners.indexOf(this._onDragOver), 1);

				this._onDrop();

				this.el = el = null;
			}
		};


		function _cloneHide(state) {
			if (cloneEl && (cloneEl.state !== state)) {
				_css(cloneEl, 'display', state ? 'none' : '');
				!state && cloneEl.state && rootEl.insertBefore(cloneEl, dragEl);
				cloneEl.state = state;
			}
		}


		function _closest(/**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx) {
			if (el) {
				ctx = ctx || document;

				do {
					if (
						(selector === '>*' && el.parentNode === ctx)
						|| _matches(el, selector)
					) {
						return el;
					}
				}
				while (el !== ctx && (el = el.parentNode));
			}

			return null;
		}


		function _globalDragOver(/**Event*/evt) {
			if (evt.dataTransfer) {
				evt.dataTransfer.dropEffect = 'move';
			}
			evt.preventDefault();
		}


		function _on(el, event, fn) {
			if(el.addEventListener){
				el.addEventListener(event, fn, false);
			}else if(el.attachEvent){
				el.attachEvent('on' + event, fn);
			}else{
				el['on' + event] = fn;
			}
		}


		function _off(el, event, fn) {
			if(el.removeEventListener){
				el.removeEventListener(event, fn, false);
			}else if(el.attachEvent){
				el.detachEvent('on' + event, fn);
			}else{
				el['on' + event] = null;
			}
		}


		function _toggleClass(el, name, state) {
			if (el) {
				if (el.classList) {
					el.classList[state ? 'add' : 'remove'](name);
				}
				else {
					var className = (' ' + el.className + ' ').replace(RSPACE, ' ').replace(' ' + name + ' ', ' ');
					el.className = (className + (state ? ' ' + name : '')).replace(RSPACE, ' ');
				}
			}
		}


		function _css(el, prop, val) {
			var style = el && el.style;

			if (style) {
				if (val === void 0) {
					if (document.defaultView && document.defaultView.getComputedStyle) {
						val = document.defaultView.getComputedStyle(el, '');
					}
					else if (el.currentStyle) {
						val = el.currentStyle;
					}

					return prop === void 0 ? val : val[prop];
				}
				else {
					if (!(prop in style)) {
						prop = '-webkit-' + prop;
					}

					style[prop] = val + (typeof val === 'string' ? '' : 'px');
				}
			}
		}


		function _find(ctx, tagName, iterator) {
			if (ctx) {
				var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;

				if (iterator) {
					for (; i < n; i++) {
						iterator(list[i], i);
					}
				}

				return list;
			}

			return [];
		}



		function _dispatchEvent(sortable, rootEl, name, targetEl, fromEl, startIndex, newIndex) {
			var evt = document.createEvent('Event'),
				options = (sortable || rootEl[expando]).options,
				onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);

			evt.initEvent(name, true, true);

			evt.to = rootEl;
			evt.from = fromEl || rootEl;
			evt.item = targetEl || rootEl;
			evt.clone = cloneEl;

			evt.oldIndex = startIndex;
			evt.newIndex = newIndex;

			rootEl.dispatchEvent(evt);

			if (options[onName]) {
				options[onName].call(sortable, evt);
			}
		}


		function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect) {
			var evt,
				sortable = fromEl[expando],
				onMoveFn = sortable.options.onMove,
				retVal;

			evt = document.createEvent('Event');
			evt.initEvent('move', true, true);

			evt.to = toEl;
			evt.from = fromEl;
			evt.dragged = dragEl;
			evt.draggedRect = dragRect;
			evt.related = targetEl || toEl;
			evt.relatedRect = targetRect || toEl.getBoundingClientRect();

			fromEl.dispatchEvent(evt);

			if (onMoveFn) {
				retVal = onMoveFn.call(sortable, evt);
			}

			return retVal;
		}


		function _disableDraggable(el) {
			el.draggable = false;
		}


		function _unsilent() {
			_silent = false;
		}


		/** @returns {HTMLElement|false} */
		function _ghostIsLast(el, evt) {
			var lastEl = el.lastElementChild,
					rect = lastEl.getBoundingClientRect();

			return ((evt.clientY - (rect.top + rect.height) > 5) || (evt.clientX - (rect.right + rect.width) > 5)) && lastEl; // min delta
		}


		/**
		 * Generate id
		 * @param   {HTMLElement} el
		 * @returns {String}
		 * @private
		 */
		function _generateId(el) {
			var str = el.tagName + el.className + el.src + el.href + el.textContent,
				i = str.length,
				sum = 0;

			while (i--) {
				sum += str.charCodeAt(i);
			}

			return sum.toString(36);
		}

		/**
		 * Returns the index of an element within its parent for a selected set of
		 * elements
		 * @param  {HTMLElement} el
		 * @param  {selector} selector
		 * @return {number}
		 */
		function _index(el, selector) {
			var index = 0;

			if (!el || !el.parentNode) {
				return -1;
			}

			while (el && (el = el.previousElementSibling)) {
				if (el.nodeName.toUpperCase() !== 'TEMPLATE'
						&& _matches(el, selector)) {
					index++;
				}
			}

			return index;
		}

		function _matches(/**HTMLElement*/el, /**String*/selector) {
			if (el) {
				selector = selector.split('.');

				var tag = selector.shift().toUpperCase(),
					re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g');

				return (
					(tag === '' || el.nodeName.toUpperCase() == tag) &&
					(!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)
				);
			}

			return false;
		}

		function _throttle(callback, ms) {
			var args, _this;

			return function () {
				if (args === void 0) {
					args = arguments;
					_this = this;

					setTimeout(function () {
						if (args.length === 1) {
							callback.call(_this, args[0]);
						} else {
							callback.apply(_this, args);
						}

						args = void 0;
					}, ms);
				}
			};
		}

		function _extend(dst, src) {
			if (dst && src) {
				for (var key in src) {
					if (src.hasOwnProperty(key)) {
						dst[key] = src[key];
					}
				}
			}

			return dst;
		}


		// Export utils
		Sortable.utils = {
			on: _on,
			off: _off,
			css: _css,
			find: _find,
			is: function (el, selector) {
				return !!_closest(el, selector, el);
			},
			extend: _extend,
			throttle: _throttle,
			closest: _closest,
			toggleClass: _toggleClass,
			index: _index
		};


		/**
		 * Create sortable instance
		 * @param {HTMLElement}  el
		 * @param {Object}      [options]
		 */
		Sortable.create = function (el, options) {
			return new Sortable(el, options);
		};


		// Export
		Sortable.version = '1.4.2';
		return Sortable;
	});


/***/ }

});