
require('./loading.scss');

var tpl = require('./loading.tpl');

function loading (){
	
	var $loading = $(tpl);
	var render = function(){
		$('body').append($loading);
		$loading[0].id = '_loading'+ new Date().getTime() + '_';
	};

	render();

	return {
		element: $loading,
		render: render,
		destroy: function(){
			$loading.remove();
		},
		show: function(){
			$loading.show();
		},
		hide: function(){
			$loading.hide();
		}
	};
}

module.exports = loading();


