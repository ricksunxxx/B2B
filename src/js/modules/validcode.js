/**
 * 获取图片验证码
 * @param  {dom} element [图片]
 * @param  {[type]} url [图片地址]
 */
var getValidCode = function(element) {

    $(element).on('click', function(){

    	var imgUrl = url = $(this).attr('src');

	    if (imgUrl.indexOf('?') > -1) {
	        url = imgUrl.split('?')[0];
	    }

	    url += ('?t=' + new Date().getTime());

	    $(this).attr('src', url);    	
    });
};

module.exports = getValidCode;