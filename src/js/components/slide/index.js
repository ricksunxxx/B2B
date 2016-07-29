var Switchable = require('extend/switchable/index');

require('./slide.scss');

// 卡盘轮播组件
module.exports = Switchable.Slide = Switchable.extend({
  attrs: {
    autoplay: true,
    circular: true,
    classPrefix: 'ui-slide'
  }
});