
var Switchable = require('extend/switchable/index');

// 样式已移到公共样式
// require('./tabs.scss');

// 展现型标签页组件
module.exports = Switchable.Tabs = Switchable.extend({
	attrs: {
		classPrefix: 'ui-tabs'		
	}
});