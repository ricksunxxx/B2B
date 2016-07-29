/**
 * 会员中心公共部分 
 */
var ConfirmBox = require('components/confirmbox/index');
var Selection = require('modules/selection');
var templatable = require('extend/templatable');
var formPaginger = require('modules/formpaginger');
var loading = require('modules/loading/index');
var AjaxUpload = require('plugins/ajaxfileupload');
var cookie = require('extend/cookie');

// 侧边折叠菜单
require('modules/membernav')();

//分销商采购管理
var purchase = {

    //已购采购商品管理
    index: function() {
        var form = $('#J_form_query');

        //tab
        $('.ui-tabs-triggers').on('click', '.ui-tabs-trigger', function(event) {
            event.preventDefault();
            var currentStatus = $(this).find('a').data('type');
            $('input[name="LockStatus"]').val(currentStatus);
            form.submit();
        });

        //全选
        $('.member-tabs-purchase').selection({
            selectAllElem: '#J_select_all',
            singleClass: '.checkbox-sub',
            singleParentClass: '.table-group',
            onSelect: function() {},
            onSelectAll: function() {}
        });

        //数组去重
        function unique(arr) {
            var ret = [];
            var hash = {};

            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                var key = typeof(item) + item;
                if (hash[key] !== 1) {
                    ret.push(item);
                    hash[key] = 1;
                }
            }
            return ret;
        }


        //新增订单
        $('#J_up_batch').on('click', function(event) {
            event.preventDefault();
            var $checkboxes = $('.checkbox-sub:checked');

            if ($checkboxes.length > 0) {
                var itemIds = [];
                $checkboxes.each(function(index, element) {
                    var $itemId = $(element).closest('.table-group').find('.table-group-item');
                    var ids = $itemId.map(function(index, element) {
                            return $.trim($(element).data('itemid'));
                        })
                        .get();
                    $.merge(itemIds, ids);
                });
                itemIds = unique(itemIds).join(',');

                $.ajax({
                        url: '/ItemLock/BatchAddInventoryLockItemToCart',
                        type: 'POST',
                        dataType: 'json',
                        data: { itemIds: itemIds }
                    })
                    .done(function(data) {
                        if (data.Succeeded) {
                            var newCookie,
                                oldCookie = cookie.get('CO'),
                                cookieOption = {
                                    expires: 365,
                                    path: '/',
                                    domain: 'papago.hk'
                                };

                            if (oldCookie) {
                                newCookie = (oldCookie + ',' + itemIds).split(',');
                                newCookie = unique(newCookie).join(',');
                                cookie.set('CO', newCookie, cookieOption);
                            } else {
                                cookie.set('CO', itemIds, cookieOption);
                            }

                            window.location.href = wwwDomain + "/Cart";
                        } else {
                            showMessage(data.Message, false);
                        }
                    })
                    .fail(function() {
                        showMessage('网络出错，请稍后再试！', false);
                    });
            } else {
                showMessage('请选择订单', false);
            }
        });

        formPaginger('.ui-paging', '#J_form_query');

        initRangeDate();

    },

    //我的关注
    attention: function() {
        var queryForm = $('#J_form_query');

        //点击tab
        $('.ui-tabs-trigger').on('click', function() {
            var $this = $(this);
            var type = $this.find('a').data('type');
            $('input[name="ItemStatus"]').val(type);
            queryForm.submit();
        });

        //全选
        $('.member-attention').selection({
            selectAllElem: '#J_select_all',
            singleClass: '.checkbox-sub',
            singleParentClass: '.member-table-item',
            batchRemoveElem: '#J_del_batch',
            async: true,
            onSelect: function() {},
            onSelectAll: function() {},
            onBatchRemove: function(data) {
                var that = this,
                    selecteds = this.selecteds,
                    datas = [];

                if (!selecteds.length) {
                    showMessage('请选择要删除的商品！', false);
                    return false;
                }

                ConfirmBox.confirm('确定要删除所选商品吗？', '提示', function() {

                    for (var i = 0; i < selecteds.length; i++) {
                        var item = selecteds[i];
                        datas.push(item.parent.data('pid'));
                    }

                    var pids = datas.join(','); //待删除的商品id
                    $.ajax({
                            url: '/ItemFollow/BatchDeleteItemFollow',
                            data: { itemFollowIds: pids },
                            type: 'POST',
                            dataType: 'json'
                        })
                        .done(function(data) {
                            if (data.Succeeded) {
                                var count = $('.inner-count').text() - selecteds.length;
                                $('.inner-count').text(count);
                                that.batchRemove();
                                checkHasNull(that.items);
                                showMessage('删除成功！', false);
                            } else {
                                showMessage('删除失败，请稍后再试！', false);
                            }
                        })
                        .fail(function() {
                            showMessage('网络出错，请稍后再试！', false);
                        });
                });
            }
        });

        //放入采购车
        // $('#J_in_cart').on('click', function() {
        //     var checkbox = $('.checkbox-sub');
        //     var datas = [];
        //     var msg = '';

        //     for (var i = 0; i < checkbox.length; i++) {
        //         var $item = $(checkbox[i]);
        //         if ($item.prop('checked')) {
        //             datas.push($item.closest('tr').data('pid'));
        //         }
        //     }
        //     var pids = datas.join(','); //待放入采购车的商品id            

        //     if (pids === '') {
        //         ConfirmBox.alert('请选择商品！', function() {}, { title: '提示：' });
        //     } else {
        //         $.ajax({
        //             url: '/addcart',
        //             data: { pids: pids },
        //             type: 'post',
        //             dataType: 'json',
        //             success: function(data) {
        //                 showMessage('您的商品已放入采购车！', false);
        //             },
        //             error: function() {
        //                 showMessage('网络出错，请稍后再试！', false);
        //             }
        //         });
        //     }
        // });

        //批量关注
        // $('#J_attention_batch').on('click', function(e) {
        //     e.preventDefault();
        //     var uploader = null;
        //     var uploadValueEl;
        //     var exportledBatch = [
        //         '<div class="order-exportleds-dialog ui-dialog-form ui-form">',
        //         '<div class="ui-form-item" id="J_exportled_upload_wrap">',
        //         '<label class="ui-label">选择：</label>',
        //         '<a href="javascript:;" class="ui-button-lgreen ui-button" id="J_exportled_upload">上传</a>',
        //         '<span class="ui-form-text fn-hide" id="upload_loading">上传中...</span>',
        //         '<input type="hidden" id="J_upload_value">',
        //         '<div class="ui-tiptext-container ui-tiptext-container-message ui-mt20">',
        //         '<p class="ui-tiptext ui-tiptext-message">',
        //         '<i class="ui-tiptext-icon iconfont" title="提示">&#xe614;</i>温馨提示：<br>',
        //         '1. 只能上传后缀为.XLS格式的Excel文件，可以下载我司现有样例文件 ： 订单上传模板 最后更新时间：2015-09-23 00:00:00<br>',
        //         '2. 如果您上传的文件格式不识别，请下载模板，然后再次上传 <br>',
        //         '3. 批量上传订单数据不能超过300条<br> ',
        //         '4. 如有错误或疑问，请及时联系我们客服 </p>',
        //         '</div>',
        //         '</div></div>'
        //     ].join('');

        //     ConfirmBox.confirm(exportledBatch, '批量关注', null, {
        //         onShow: function() {

        //             var $trigger = $('#J_exportled_upload'),
        //                 uploadLoading = $('#upload_loading');

        //             uploadValueEl = $('#J_upload_value');

        //             uploader = new AjaxUpload($trigger, {
        //                 action: '/Passport/Upload',
        //                 responseType: 'json',
        //                 title: '',
        //                 data: {
        //                     AjaxRequest: "true"
        //                 },
        //                 onChange: function(file, extension) {
        //                     var re = /xls/gi;
        //                     if (!re.test(extension)) {
        //                         alert('请上传Excel格式文件!');
        //                         return false;
        //                     }
        //                 },
        //                 onSubmit: function(file, extension) {
        //                     // 上传中
        //                     $trigger.hide();
        //                     uploadLoading.show();
        //                 },
        //                 onComplete: function(file, response) {
        //                     uploadLoading.hide();
        //                     console.log(file);
        //                     // console.log(response)
        //                 }
        //             });
        //         },
        //         onHide: function() {
        //             uploader = null;
        //         },
        //         onConfirm: function() {

        //             var uploadValue = uploadValueEl.val();

        //             if ($.trim(uploadValue) !== '') {
        //                 this.hide();
        //                 self.showMessage('操作成功');
        //             } else {
        //                 alert('请上传Excel文件');
        //             }

        //         }
        //     });
        // });

        //翻页
        formPaginger('.ui-paging', '#J_form_query');

        initRangeDate();
    }
};

// 是否已无信息
function checkHasNull(items) {
    if (!items.length) {
        $('.ui-table tbody').append('<tr><td colspan="7" class="member-table-none">无相关信息</td></tr>');
        $('.ui-paging').remove();
    }
}

//提示信息
function showMessage(message, hold) {
    ConfirmBox.show(message, null, {
        title: '提示：',
        onShow: function() {
            if (!hold) {
                var that = this;
                setTimeout(function() {
                    that.hide();
                }, 2000);
            }
        }
    });
}
// 日历初始化
function initRangeDate() {
    // 异步加载日历组件
    require.ensure('components/calendar/index', function(require) {
        var Calendar = require('components/calendar/index');

        var dateStart, dateEnd;
        // 日历开始
        dateStart = new Calendar({
            trigger: '#J_date_start'
        });

        // 日历结束
        dateEnd = new Calendar({
            trigger: '#J_date_end'
        });

        // 初始化日期
        var dateStartVal = $('#J_date_start').val(),
            dateEndVal = $('#J_date_end').val();

        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() * 1 + 1,
            day = date.getDate() * 1;

        var today = year + '-' +
            (month >= 10 ? month : '0' + month) + '-' +
            (day >= 10 ? day : '0' + day);
        // console.log(today)

        if ($.trim(dateStartVal) === '' && $.trim(dateEndVal) === '') {
            dateStart.range([null, today]);
            dateEnd.range([null, today]);
        } else {
            dateStart.range([null, today]);
            dateEnd.range([dateStartVal, today]);
        }

        // 当选日期时，调整可选日期的范围
        dateStart.on('selectDate', function(date) {
            dateEnd.range([date, today]);
        });

        dateEnd.on('selectDate', function(date) {
            dateStart.range([null, date]);
        });

    }, 'calendar');
}

window.purchase = purchase;
