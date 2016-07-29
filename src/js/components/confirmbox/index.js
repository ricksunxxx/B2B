// var $ = require('jquery');
var Dialog = require('components/dialog/index');

var template = require('./confirmbox.hbs');

// ConfirmBox
// -------
// ConfirmBox 是一个有基础模板和样式的对话框组件。
var ConfirmBox = Dialog.extend({

    attrs: {
        title: '默认标题',

        confirmTpl: '<a class="ui-dialog-button-orange" href="javascript:;">确定</a>',

        cancelTpl: '<a class="ui-dialog-button-white" href="javascript:;">取消</a>',

        message: '默认内容'
    },

    setup: function() {
        ConfirmBox.superclass.setup.call(this);

        var model = {
            classPrefix: this.get('classPrefix'),
            message: this.get('message'),
            title: this.get('title'),
            confirmTpl: this.get('confirmTpl'),
            cancelTpl: this.get('cancelTpl'),
            hasFoot: this.get('confirmTpl') || this.get('cancelTpl')
        };
        this.set('content', template(model));
    },

    events: {
        'click [data-role=confirm]': function(e) {
            e.preventDefault();
            this.trigger('confirm');
        },
        'click [data-role=cancel]': function(e) {
            e.preventDefault();
            this.trigger('cancel');
            this.hide();
        }
    },

    _onChangeMessage: function(val) {
        this.$('[data-role=message]').html(val);
    },

    _onChangeTitle: function(val) {
        this.$('[data-role=title]').html(val);
    },

    _onChangeConfirmTpl: function(val) {
        this.$('[data-role=confirm]').html(val);
    },

    _onChangeCancelTpl: function(val) {
        this.$('[data-role=cancel]').html(val);
    }

});

ConfirmBox.alert = function(message, callback, options) {
    var defaults = {
        message: message,
        title: '',
        cancelTpl: '',
        closeTpl: '',
        onConfirm: function() {
            callback && callback();
            this.hide();
        }
    };
    new ConfirmBox($.extend(null, defaults, options)).show().after('hide', function() {
        this.destroy();
    });
};

ConfirmBox.confirm = function(message, title, onConfirm, onCancel, options) {
    // support confirm(message, title, onConfirm, options)
    if (typeof onCancel === 'object' && !options) {
        options = onCancel;
        onCancel = null;
    }

    var defaults = {
        message: message,
        title: title || '确认框',
        closeTpl: '',
        onConfirm: function() {
            onConfirm && onConfirm();
            this.hide();
        },
        onCancel: function() {
            onCancel && onCancel();
            this.hide();
        }
    };
    // 2016/03/29/添加显示后和隐藏后的回调 lhx
    new ConfirmBox($.extend(null, defaults, options))
        .after('show', function() {
            options && options.onShow && options.onShow.call(this);
        })
        .show()
        .after('hide', function() {
            options && options.onHide && options.onHide.call(this);
            this.destroy();
        });
};

ConfirmBox.show = function(message, callback, options, title) {
    var defaults = {
        message: '<div class="ui-confirmbox-message">' + message + '</div>',
        title: title,
        confirmTpl: false,
        cancelTpl: false
    };
    // 2016/03/29/添加显示后的回调 lhx
    new ConfirmBox($.extend(null, defaults, options))
        .after('show', function() {
            options && options.onShow && options.onShow.call(this);
        })
        .show()
        .before('hide', function() {
            callback && callback.call();
        })
        .after('hide', function() {
            this.destroy();
        });
};

module.exports = ConfirmBox;
