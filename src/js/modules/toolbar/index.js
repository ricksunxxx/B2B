// 样式已移到公共样式
// require('./toolbar.scss');
require('extend/throttle');

var template = require('./toolbar.tpl'),
	config = require('./config');

var $win = $(window),
	$doc = $(document),
	$toolbar,
	$gototop;

var toolbarItem = 'li.m-toolbar-item',
	toolbarItemPanel = 'div.m-toolbar-panel',
	toolbarGotoTop = '#gototop',
	itemEvent = 'mouseenter mouseleave';

var critical = $win.height(),
	throttle = 200;

var fn = {
	init: function(){
		// 插入模板
		$('body').append(template);

		$toolbar = $('#J_global_toolbar');
		$gototop = $(toolbarGotoTop);

		// 赋值
		$('#toolbar_qqonline').attr('href', config.qqOnlineUrl);
		$('#toolbar_telnumber').text(config.telnumber);
		$('#toolbar_qr_weixin').attr('src', config.weixinQRUrl);
		// $('#toolbar_qr_ios').attr('src', config.appIOSUrl);
		// $('#toolbar_app_android').attr('href', config.appAndroidUrl);
	},
	bindEvent: function(){
		// 事件
		var dropTimer = null;
		var hoverDelay = function(e, panel){
			if(panel[0]){
				if(e.type === 'mouseenter'){
					$toolbar.find(toolbarItemPanel).hide();
					panel.show();
					dropTimer && clearTimeout(dropTimer);
				}else{
					dropTimer = setTimeout(function(){
						panel.hide();
					}, 100);
				}
			}
		};

		$toolbar
			.on(itemEvent, toolbarItem, function(e){
				hoverDelay(e, $(this).find(toolbarItemPanel));
			})
			.on(itemEvent, toolbarItemPanel, function(e){
				e.stopPropagation();
				hoverDelay(e, $(this));
			})
			.on('click', toolbarGotoTop, $.proxy(this.gototop, this));

		$win.on('scroll', $.throttle(throttle, $.proxy(this.toggleGototopState, this)));
	},
	toggleGototopState: function(){
		$doc.scrollTop() > critical ?
			$gototop.fadeIn() :
			$gototop.fadeOut();
	},
	gototop: function(){
		$('html,body').animate({scrollTop: 0}, 300);
	}
};

function toolbar(){

	fn.init();
	fn.bindEvent();
}

module.exports = toolbar;