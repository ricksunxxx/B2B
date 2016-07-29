// 全选·单选·删除·批量删除
// 用法：
// $('#selection').selection({
//     selectAllElem: '#J_select_all', // 全选触发元素
//     singleClass: '.checkbox-sub', // 单选触发元素class
//     singleParentClass: '.table-item', // 项的class
//     singleRemoveClass: '.del', // 删除触发元素class
//     batchRemoveElem: '#J_batch', // 批量删除触发元素
//     async: true, // 异步模式,需手动调用内部方法来删除
//     onSelect: function(){ console.log(arguments)}, // 选择时
//     onSingleRemove: function(data){console.log(arguments)}, // 删除时
//     onBatchRemove: function(data){console.log(arguments)} // 批量删除时
// });

function Selection(wrap, option) {
    this.option = $.extend({}, Selection.option, option);
    this.wrap = wrap;
    this.items = [];
    this.selecteds = [];
    this.init();
}

Selection.option = {
    selectAllElem: '.select-all',
    singleClass: '.select-sub',
    singleParentClass: '.select-item',
    singleRemoveClass: '.select-del',
    batchRemoveElem: '.select-batch',
    onSelect: undefined,
    onSelectAll: undefined,
    onSingleRemove: undefined,
    onBatchRemove: undefined
};

Selection.prototype = {
    init: function() {
        var self = this,
            options = this.option;

        this.itemRemove = this.itemRemove;
        this.removeAll = this.removeAll;
        this.batchRemove = this.batchRemove;
        this.getSelected = this.getSelected;
        this.getSize = this.getSize;
        this.getSelectedSize = this.getSelectedSize;

        // 获取所有选项
        this.wrap.find(options.singleParentClass).each(function(v) {

            var timestamp = new Date().getTime() + v;
            $this = $(this),
                removeElem = $this.find(options.singleRemoveClass),
                checkboxElem = $this.find(options.singleClass);

            var checkedStatus = checkboxElem.is(':checked');

            var info = {
                timestamp: '_' + timestamp + '_',
                removeTrigger: removeElem,
                checkbox: checkboxElem,
                checked: checkedStatus,
                parent: $this
            };

            $this.data('timestamp', info.timestamp);
            checkboxElem.data('timestamp', info.timestamp);

            if (removeElem[0]) {
                removeElem.data('timestamp', info.timestamp);
            }

            if (checkedStatus) {
                self.selecteds.push(info);
            }

            self.items.push(info);
        });

        // 事件绑定
        $(options.singleClass).on('click', function() {
            var $this = $(this),
                timestamp = $this.data('timestamp'),
                items = self.items,
                selecteds = self.selecteds,
                obj = self.getObj(timestamp),
                data = obj[0],
                index = obj[1];

            if ($this.is(':checked')) {
                self.items[index].checked = true;
                self.selecteds.push(self.items[index]);
            } else {
                var o = self.getObj(timestamp, selecteds);
                self.selecteds.splice(o[1], 1);
                self.items[index].checked = false;
            }

            $(options.selectAllElem).prop('checked', self.isEqual() ? true : false);

            options.onSelect && options.onSelect.call(self, self.items[index], self.items);
        });

        // 单项删除
        this.wrap.delegate(options.singleRemoveClass, 'click', function() {
            var $this = $(this),
                timestamp = $this.data('timestamp'),
                currentItem = self.getObj(timestamp);

            options.onSingleRemove && options.onSingleRemove.call(self, currentItem[0], self.items);
            $(options.selectAllElem).prop('checked', self.isEqual() ? true : false);
        });

        // 全选
        $(options.selectAllElem).on('click', function() {

            var $this = $(this),
                flag = true,
                items = self.items,
                length = items.length;

            self.selecteds = [];

            !$this.is(':checked') && (flag = false);

            for (var i = 0; i < length; i++) {
                var item = items[i];
                item.checked = flag;
                item.checkbox.prop('checked', flag);
                if (flag) {
                    self.selecteds.push(items[i]);
                }
            }

            options.onSelectAll && options.onSelectAll.call(self, self.selecteds, self.items);
        });

        // 批量删除
        $(options.batchRemoveElem).on('click', function() {
            options.onBatchRemove && options.onBatchRemove.call(self, self.selecteds, self.items);
            // $(options.selectAllElem).prop('checked', false);
        });

        if (this.isEqual() && this.getSelectedSize() !== 0) {
            $(options.selectAllElem).prop('checked', true);
        }
    },
    isEqual: function() {
        return this.selecteds.length === this.items.length;
    },
    getObj: function(value, source) {
        var items = source ? source : this.items,
            index = 0,
            res = null;

        for (var i = 0; i < items.length; i++) {
            if (items[i]['timestamp'] == value) {
                index = i;
                res = items[i];
                break;
            }
        }
        return [res, index];
    },
    itemRemove: function(timestamp, callback) {
        var currentItem = this.getObj(timestamp),
            selectedItem = this.getObj(timestamp, this.selecteds);

        currentItem[0].parent.remove();
        this.items.splice(currentItem[1], 1);

        if (selectedItem[0]) {
            this.selecteds.splice(selectedItem[1], 1);
        }

        callback && callback.call(this);
    },
    batchRemove: function(callback) {
        var items = this.items,
            itemsLength = items.length,
            tmp = [];

        for (var i = 0; i < itemsLength; i++) {
            var item = items[i];
            if (item.checked) {
                tmp.push(item);
            }
        }

        for (var n = 0; n < tmp.length; n++) {
            this.itemRemove(tmp[n].timestamp);
        }

        callback && callback.call(this);
    },
    removeAll: function(callback) {
        var items = this.items,
            itemsLength = items.length;

        for (var i = 0; i < itemsLength; i++) {
            items[i].parent.remove();
        }

        this.selecteds = this.items = [];

        callback && callback.call(this);
    },
    getSelected: function() {
        return this.selecteds;
    },
    getSize: function() {
        return this.items.length;
    },
    getSelectedSize: function() {
        return this.selecteds.length;
    },
    constructor: Selection
};

$.fn.selection = function(option) {
    return this.each(function() {
        if (undefined === $(this).data('selection')) {
            $(this).data('selection', new Selection($(this), option));
        }
    });
};

module.exports = Selection;
