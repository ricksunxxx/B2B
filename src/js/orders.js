/**
 * 会员中心公共部分 
 */
var ConfirmBox = require('components/confirmbox/index');
var Selection = require('modules/selection');
var templatable = require('extend/templatable');
var formPaginger = require('modules/formpaginger');
var loading = require('modules/loading/index');
var AjaxUpload = require('plugins/ajaxfileupload');
var fileDownload = require('plugins/filedownload');
var Upload = require('extend/upload');


// 侧边折叠菜单
require('modules/membernav')();

var orders = {
    //订单批量新增
    index: function() {
        var uploader = null,
            $trigger = $('#upload-file'),
            filename = '';

        //上传
        uploader = new AjaxUpload($trigger, {
            action: '/Order/Upload',
            responseType: 'json',
            title: '',
            onChange: function(file, extension) {

                var re = /\.(xlsx|xls)$/i;
                if (!re.test(file)) {
                    showMessage('请上传Excel格式文件!', true);
                    return false;
                }
            },
            onSubmit: function(file, extension) {
                loading.show();
            },
            onComplete: function(file, data) {
                loading.hide();
                if (data.Succeeded) {
                    var uploadedTip = '<span class="uploadedTip" style="display:inline-block;color:#E4393C;padding-left:20px;">已导入:  ' + file + '</span>';
                    $('.uploadedTip').remove();
                    $trigger.after(uploadedTip);
                    showMessage('订单导入成功！', false);
                } else {
                    var message = '订单导入部分失败，详细信息请<a class="ui-text-link" href="/Order/WriteImportOrderLog?message='+ data.Message +'">点此下载</a>';
                    showMessage(message, true);
                }
            },
            onError: function() {
                loading.hide();
                showMessage('网络出错，请稍后再试!', true);
            }
        });
    },

    //我的订单
    myorders: function() {
        var form = $('#J_form_query');
        var order = $('.member-table-order');

        // 是否已无信息
        function checkHasNull(items) {
            if (!items.length) {
                order.append('<div class="member-table-none">无相关信息</div>');
                $('.ui-paging').remove();
            }
        }

        //点击tab
        $('.ui-tabs-trigger').on('click', function() {
            var $this = $(this);
            var type = $this.find('a').data('type');

            $('input[name="Status"]').val(type);
            form.submit();
        });

        //删除所选 
        $('.member-my-order').selection({
            selectAllElem: '#J_select_all',
            singleClass: '.checkbox-sub',
            singleParentClass: '.my-order-group',
            batchRemoveElem: '#J_batch_del',
            async: true,
            onSelect: function() {
                $('#J_select_all').prop('checked') ? $('#selectAll').text('反选') : $('#selectAll').text('全选');
            },
            onSelectAll: function() {},
            onBatchRemove: function(data) {
                var that = this,
                    selecteds = this.selecteds,
                    datas = [];

                if (!selecteds.length) {
                    showMessage('请选择要删除的订单', false);
                    return false;
                }

                ConfirmBox.confirm('确定要删除所选订单吗？', '提示：', function() {
                    for (var i = 0; i < selecteds.length; i++) {
                        var item = selecteds[i];
                        datas.push(item.parent.data('pid'));
                    }

                    var pids = datas.join(',');
                    $.ajax({
                        url: '/Order/OrderBatchDelete',
                        type: 'POST',
                        dataType: 'json',
                        data: { orderCodes: pids },
                        success: function(data) {
                            if (data.Succeeded) {
                                that.batchRemove();
                                checkHasNull(that.items);
                                showMessage('删除成功', false, function(){
                                    window.location.reload();
                                });
                            } else {
                                showMessage('删除失败，请稍后再试！', false);
                            }
                        },
                        error: function() {
                            showMessage('网络出错，请稍后再试！', false);
                        }
                    });
                });
            }
        });
        $('#selectAll').on('click', function(event) {
            event.preventDefault();

            if ($('.my-order-group  .checkbox-sub').length > 0) {
                var $inputSelectAll = $('#J_select_all');

                $inputSelectAll.trigger('click');
                $inputSelectAll.prop('checked') ? $(this).text('反选') : $(this).text('全选');
            }
        });


        //批量付款  
        var Status = $('input[name="Status"]').val();
        if (Status == 0) { //tab至未付款才加事件
            $('#J_batch_pay').on('click', function(event) {
                event.preventDefault();
                var checkboxs = $('input.checkbox-sub:checked');
                var checkboxsLength = checkboxs.length;
                var orderIds = '';

                if (checkboxsLength > 0) {
                    orderIds = checkboxs.map(function(index, elem) {
                        return $(elem).closest('.my-order-group').data('pid');
                    }).get().join(',');

                    $.ajax({
                            url: 'Order/OrderBatchWalletPay',
                            type: 'POST',
                            dataType: 'json',
                            data: { orderCodes: orderIds },
                            beforeSend: function(){
                                loading.show();
                            }
                        })
                        .done(function(data) {
                            loading.hide();
                            if (data.Succeeded) {
                                if (data.Result.Status == 1) {
                                    showMessage('订单付款成功！', false);
                                    $('input[name="Status"]').val('1');
                                    setTimeout(function() {
                                        form.submit();
                                    }, 2000);
                                } else {
                                    var onConfirm = function() {
                                        window.location.href = '/Wallet?amount=' + data.Result.RechargeAmount;
                                    };
                                    var onCancel = function() {
                                        return false;
                                    };
                                    ConfirmBox.confirm(('账户余额不足，订单还需支付' + data.Result.RechargeAmount + '元！'), '支付确认', onConfirm, onCancel);
                                }
                            } else {
                                // showMessage('付款失败，请稍后再试！', true);
                                showMessage(data.Message, true);
                            }
                        })
                        .fail(function() {
                            loading.hide();
                            showMessage('网络出错，请稍后再试！', false);
                        });
                } else {
                    showMessage('请选择要付款的订单！', false);
                }
            });
        }

        var $cancel = $('.j-cancel'),
            $remove = $('.j-remove');

        function getItemData(trigger, $self){
            var parent = $self ? $self : trigger.closest('div.my-order-group', form);
            var getData = function(name){
                return parent.data(name) ? parent.data(name) : '';
            };
            
            return {
                element: parent,
                pid: getData('pid')
            };
        }

        function ajax(url, data, successCallback){
            loading.show();

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: url,
                data: data || {}, 
            }).success(function(data){
                loading.hide();
                successCallback && successCallback(data);
            }).error(function(){
                console.log(arguments);
                loading.hide();
                alert('服务器繁忙，请重试');
            });
        }

        // 取消订单    
        if($cancel[0]){
            form.on('click', '.j-cancel', function(){
                var $this = $(this),
                    data = getItemData($this);

                ConfirmBox.confirm('确定要取消这个订单吗？', '提示：', function(){
                    ajax('/Order/CancelSellerOrder', {orderCode: data.pid}, function(res){
                        if(res.Succeeded){
                            showMessage('取消成功', false, function(){
                                window.location.reload();
                            });
                        }
                    });                    
                });
            });
        }
        // 删除订单 
        if($remove[0]){
            form.on('click', '.j-remove', function(){
                var $this = $(this),
                    data = getItemData($this);
                ConfirmBox.confirm('确定要删除这个订单吗？', '提示：', function(){
                    ajax('/Order/OrderBatchDelete', {orderCodes: data.pid}, function(res){
                        if(res.Succeeded){
                            showMessage('删除成功', false, function(){
                                window.location.reload();
                            });
                        }
                    });                    
                });
            });
        }

        //分页
        formPaginger('.ui-paging', '#J_form_query');

        //日期控件
        initRangeDate();
    },

    //异常订单查询
    abnormal: function() {
        initRangeDate();
        formPaginger('.ui-paging', '#J_form_query');
    },

    detail: function() {
        // console.log('detail');
    }
};

//提示信息
function showMessage(message, hold, hideCallback){
    ConfirmBox.show(message, hideCallback ? hideCallback : null, {
        title: '提示',
        onShow: function(){
            if(!hold){
                var that = this;
                setTimeout(function(){
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

window.orders = orders;
