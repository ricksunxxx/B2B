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


/**
 * 商品刊登
 */

var Validator = require('components/validator/index');
var AutoComplete = require('components/autoComplete/index');
var Sortable = require('plugins/sortable');
var Popup = require('components/popup/index');

require('plugins/ztree/style.css');
require('plugins/ztree/index');

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