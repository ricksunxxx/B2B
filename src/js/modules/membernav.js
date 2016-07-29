var Accordion = require('components/accordion/index');
// var sticky = require('extend/sticky');

module.exports = function() {

    // 高亮当前页面对应的导航项
    // 处理简单的，有层级关系的放后端处理
    var navbar = $('#J_member_sidenav');
    var pathname = window.location.pathname;
    var target = navbar.find('a[href="' + pathname + '"]');

    // sticky('.member-sidenav', { top: 40 });

    if (target[0]) {
        target.parent().addClass('active');
    }

    // 手风琴
    new Accordion({
        element: '#J_member_sidenav',
        multiple: true,
        activeIndex: -99
    }).render();
};
