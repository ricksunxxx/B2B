var Slide = require('components/slide/index');

require('plugins/lazyload');

// 图片lazyload
$('img.lazy').lazyload({
	data_attribute: 'lazy',
	threshold: 300,
	effect: 'fadeIn',
	load: function(){
		$(this).removeClass('lazy');
	}
});

// banner
var mainSliderEl = $('#J_index_slider');
if(mainSliderEl[0] && mainSliderEl.find('.ui-slide-panel')[0]){	
	var mainSlider = new Slide({
		    element: '#J_index_slider',
		    panels: '#J_index_slider_content .ui-slide-panel',
		    effect: 'fade'
		}).render();

	var contents = mainSlider.content,
		switchedCache = [];

	function switchPanel(index){
		var panel = contents.find('.ui-slide-panel').eq(index),
			image = panel.find('img'),
			src = image.data('src');

		if(src){
			
			var img = new Image();
			img.src = src;

			switchedCache.push(index);

			$(img).on('load', function(){
				image.attr('src', src)
					.removeAttr('data-src')
					.removeData('src')
					.parent().removeClass('lazy');				
			});
		}
	}

	if(mainSlider.rendered){
		switchPanel(0);
	}
	
	// 在面板切换之前替换下个面板的图片url
	mainSlider.on('switch', function(toIndex){
		if(switchedCache.indexOf(toIndex) === -1){
			switchPanel(toIndex);
		}
	});
}

try{
	// 滚动公告
	var noticeSlider = new Slide({
	    element: '#J_index_notice',
	    panels: '#J_index_notice_scroller .ui-slide-panel',
	    effect: 'scrolly',
	    hasTriggers: false,
	    delay: 6000
	});
}catch(e){}

// 右侧工具栏
require('modules/toolbar/index')();