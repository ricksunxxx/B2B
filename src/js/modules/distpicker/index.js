// 加载样式
require('./distpicker.scss');

// 模板
var template = require('./distpicker.tpl');

// 为了更新方便，地区数据已剥离到localities.js，直接DOM中引用即可
// var distpickerData = require('./data'); 
var distpickerData = window.PPG_LOCALITIES ? window.PPG_LOCALITIES : null;

if(distpickerData === null){
	throw new Error('not found localities data');
}

var distpickerDataLength = distpickerData.length,
	currentProvinceData = currentCityData = currentAreaData = [];

// 简易tabs切换
function Tabs(option){

	var triggers = $(option.triggers),
		panels = $(option.panels);

	var beforeSwitch = option.beforeSwitch,
		afterSwitch = option.afterSwitch;

	var toggleTab = function(elem, tabName){
		elem.find('[data-tab]').removeClass('current');
		elem.find('[data-tab="'+ tabName +'"]').addClass('current');
	};

	var childNodeName = triggers.children()[0].nodeName.toLowerCase();

	triggers.delegate(childNodeName, 'click', function(){
		triggers.trigger('switch', $(this).data('tab'));
	});

	triggers.on('switch', function(e, tabName){
		var currentTab = triggers.find('.current').data('tab');
		beforeSwitch && beforeSwitch(currentTab, tabName);
		toggleTab(triggers, tabName);
		toggleTab(panels, tabName);
		afterSwitch && afterSwitch(currentTab, tabName);
	});

	triggers.trigger('switch', triggers.find(childNodeName+':first').data('tab'));

	return triggers;
}

// 数据筛选
function filterChild(areaid, source){
	var i = 0, l = source.length,
		ret = [];

	if(l){
		for(; i < l; i++){
			var data = source[i];
			if(data.hasOwnProperty('parentId') && data.parentId === areaid){
				ret.push(data);
			}
		}				
	}

	return ret;
}

function getCurrentItemData(id, source){
	var sl = source.length,
		ret = null;

	for(var i = 0; i < sl; i++){
		var currentItem = source[i];

		if(currentItem.id == id){
			ret = currentItem;
			break;
		}
	}

	return ret;
}

// 生成label
function createLabels(data, panel){
	var labels = '<div class="m-distpicker-labels">';
	var l = data.length, i = 0;
	
	for(; i < l; i++){
		var item = data[i];
		labels += '<span class="label" data-id="'+ item.id +'" title="'+ item.name +'">'+ item.name +'</span>';
	}

	labels += '</div>';

	panel.empty().append(labels);
}


function Distpicker(wrap, options){
	this.option = $.extend({}, Distpicker.defaults, options);
	this.wrap = wrap;
	this.timestamp = new Date().getTime();
	this.data = {};
	this.init();
}

Distpicker.prototype = {
	init: function(){
		
		var self = this;
		var option = this.option;

		var distpickerId = 'distpicker' + this.timestamp,
			tabTriggersContainer = '#' + distpickerId + ' .m-distpicker-tabs-nav-inner',
			tabPanelsContainer = '#' + distpickerId + ' .m-distpicker-tabs-content';

		$.map(['names', 'ids'], function(v){
			self.data[v] = {
				province: '',
				city: '',
				area: ''
			};
		});

		// 创建基本模板
		this.wrap.append(template);

		this.distpicker = this.wrap.find('.m-distpicker');
		this.distpicker.get(0).id = distpickerId;

		var $tabTriggersContainer = $(tabTriggersContainer),
			$tabPanelsContainer = $(tabPanelsContainer);

		this.provincePanel = $tabPanelsContainer.find('div[data-tab="province"]');
		this.cityPanel = $tabPanelsContainer.find('div[data-tab="city"]');
		this.areaPanel = $tabPanelsContainer.find('div[data-tab="area"]');

		// 创建省级label
		var _provinceData = [];
		distpickerData.forEach(function(item){
			_provinceData.push(item);
		});
		createLabels(_provinceData, this.provincePanel);

		var defaults = option.defaults;
		if(defaults.province){
			// 设置省级数据
			console.log(defaults.province)
			// 筛选市级
		}

		if(defaults.city){
			// 设置市级数据
			console.log(defaults.city)
			// 筛选区级
		}

		if(defaults.area){
			// 设置区级数据
			console.log(defaults.area)
		}

		// tabs切换
		this.tabs = new Tabs({
			triggers: tabTriggersContainer,
			panels: tabPanelsContainer
		});

		this.bindEvent();
	},
	bindEvent: function(){
		var self = this;
		var option = this.option;

		var distpickerBody = this.distpicker.find('.m-distpicker-bd'),
			distpickerTitle = this.distpicker.find('.m-distpicker-title');

		this.distpicker.find('.m-distpicker-hd').on('click', function(e){
			if(distpickerBody.is(':hidden')){
				self.tabs.trigger('switch', 'province');
				distpickerBody.show();
			}
		});

		this.distpicker
			.delegate('span.label', 'click', function(){
				var $this = $(this);
				var currentPanel = $this.parents('.m-distpicker-tabs-panel').data('tab'),
					areaId = $this.data('id'),
					areaName = $this.attr('title');
				
				$this.addClass('current').siblings().removeClass('current');

				switch(currentPanel) {
					case 'province':
						// 创建城市label
						currentProvinceData = getCurrentItemData(areaId, distpickerData);
						createLabels(currentProvinceData.children, self.cityPanel);

						// 切换到城市面板
						self.tabs.trigger('switch', 'city');

						// 清空地区
						self.areaPanel.empty();

						// 重新赋值
						self.noteDatas('province', [areaName, areaId]);
						self.noteDatas('city', null);
						self.noteDatas('area', null);

						break;

					case 'city':
						// 创建地区label
						currentCityData = getCurrentItemData(areaId, currentProvinceData.children);
						createLabels(currentCityData.children, self.areaPanel);
						
						// 切换到城市面板
						self.tabs.trigger('switch', 'area');

						self.noteDatas('city', [areaName, areaId]);
						self.noteDatas('area', null);

						break;

					case 'area':

						currentAreaData = getCurrentItemData(areaId, currentCityData.children);
						self.noteDatas('area', [areaName, areaId, currentAreaData.postCode]);
						
						distpickerBody.hide();

						option.onComplete && option.onComplete.call(self, self.data);

						break;
				}

				var names = self.data.names,
					os = [];

				for(var v in names){
					if(names[v]){
						os.push(names[v]);
					}
				}

				distpickerTitle.text(os.join('/'));

				option.onSelect && option.onSelect.call(self, self.data);
			});

		$(document).on('click', function(e){
			if(!$.contains(self.distpicker.get(0), e.target)){
				distpickerBody.hide();
			}
		});
	},
	noteDatas: function(key, value){
		var name = '',
			id = '',
			code = '';

		if(value && $.isArray(value)){
			name = value[0];
			id = value[1];

			if(value[2]){
				code = value[2];
			}
		}

		this.data.names[key] = name;
		this.data.ids[key] = id;
		this.data.postCode = code;
	},
	constructor: Distpicker
};

Distpicker.defaults = {
	defaults: {
		province: null,
		city: null,
		area: null
	},
	onSelect: function(){},
	onComplete: function(){}
};

$.fn.distpicker = function(options){
	return this.each(function(){
		var $this = $(this);
		if(undefined === $this.data('distpicker')){
			$this.data('distpicker', new Distpicker($this, options));
		}
	});
};

module.exports = Distpicker;