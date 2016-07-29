require('plugins/lazyload');
require('plugins/supperslide');

var mainBanner = $('#J_home_slider');
var isInViewport = PPG.utils.isInViewport;

// 图片lazyload
$('img.lazy').lazyload({
	data_attribute: 'src',
	effect: 'fadeIn',
	load: function(){
		$(this).removeClass('lazy');
	}
});

$('#J_home_slider').slide({
	autoPlay: true,
	interTime: 5000,
	delayTime: 1000,
	effect: 'fold',
	switchLoad: 'data-src',
	mainCell: '#J_home_slider_content'
});

// 合作平台 carousel
$('#J_partner_carousel').slide({
	vis: 5,
	scroll: 1,
	autoPlay: true,
	prevCell: '.ui-carousel-prev-btn',
	nextCell: '.ui-carousel-next-btn',
	mainCell: '.scroller .ui-carousel-content',
	trigger: 'click',
	effect: 'leftLoop',
	switchLoad: 'data-src'
});

// intro section slide
$('.intro-scroller').slide({
	mainCell: '#J_intro_slider_content',
	trigger: 'click',
	effect: 'fold',
	titCell: '#J_intro_slider_nav .trigger',
	titOnClassName: 'ui-slide-active',
	switchLoad: 'data-src',
	startFun: function(index, count, slider, hanlder, panel){

		var currentPanel = panel.children().eq(index);
		currentPanel.siblings().removeClass('current');
		currentPanel.addClass('current');
	}
});


// 右侧工具栏
require('modules/toolbar/index')();