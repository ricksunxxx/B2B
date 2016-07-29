/**
 * 会员中心公共部分 
 */
var ConfirmBox = require('components/confirmbox/index');
var Selection = require('modules/selection');
var templatable = require('extend/templatable');
var formPaginger = require('modules/formpaginger');
var loading = require('modules/loading/index');

// 侧边折叠菜单
require('modules/membernav')();

var market = {
    //账户充值
    recharge: function() {
        var reg = /^0\.0[1-9]{1}$|^0\.[1-9]{1}\d{0,1}$|^[1-9]+(\d*$|\d*\.\d{1,2}$)/;

        var form = $('.recharge'),
            moneyEl = $('#account-recharge-money'),
            container = $('.recharge-money .ui-grid-20');

        var payWaitTpl = '<div class="pay-wait">' + 
            '<p class="text">请您在新打开的页面进行支付，支付完成前请不要关闭该窗口</p>' +
            '<p class="text" style="padding-top:20px;"><a href="javascript:;" class="ui-button-lorange ui-button" style="margin:0 5px;" data-role="close">已完成支付</a>' +
            '<a href="javascript:;" class="ui-button-lwhite ui-button" style="margin:0 5px;" data-role="close">支付遇到问题</a></p>' +
            '</div>';

        //充值金额校验
        $('#account-recharge-money').on('keyup', function() {
            var money = $('#account-recharge-money').val().trim();
            $('.spanTip').remove();
            if (money !== '') {
                if (!reg.test(money)) {
                    var html = '<span class="spanTip" style="padding-left: 20px;color: #f00;">请输入有效金额</span>';
                    $(this).parent().append(html);
                }
            }

        });

        //选择支付方式
        $('.payment .ui-grid-20').on('click', 'span', function() {
            var inputEl = $(this).find('input');
            inputEl.prop('checked', true);
            $('#J_payid').val(inputEl.data('payid'));
        });

        //提交校验
        $('.recharge').off('submit');

        $('#J_submit_recharge').on('click', function(e){
            e.preventDefault();
            var val = moneyEl.val();
            

            $('.spanTip').remove();

            if($.trim(val) === ''){
                container.append('<span class="spanTip" style="padding-left: 20px;color: #f00;">请输入充值金额</span>');
                return false;
            }else if(!reg.test(val)){
                container.append('<span class="spanTip" style="padding-left: 20px;color: #f00;">请输入有效金额</span>');
                return false;
            }

            window.open('/Wallet/GoToRecharge?' + form.serialize(), '_blank');

            ConfirmBox.show(payWaitTpl, function(){
                window.location.reload();
            }, null, '提示');

        });

        // $('.recharge').on('submit', function() {
        //     var money = $('#account-recharge-money').val().trim();
        //     var container = $('.recharge-money .ui-grid-20');
        //     $('.spanTip').remove();
        //     if (money === '') {
        //         container.append('<span class="spanTip" style="padding-left: 20px;color: #f00;">请输入充值金额</span>');
        //         return false;
        //     }
        //     if (!reg.test(money)) {
        //         container.append('<span class="spanTip" style="padding-left: 20px;color: #f00;">请输入有效金额</span>');
        //         return false;
        //     }
        // });

    },
    //账户明细
    detail: function() {
        initRangeDate();
        formPaginger('.ui-paging', '#J_form_query');
    },
    //仓租费用查询
    warehouseFee: function() {
        initRangeDate();
        formPaginger('.ui-paging', '#J_form_query');
    },
    //我的消息
    news: function() {
        var messageWrap = $('#J_member_message'),
            messageList = $('#J_message_list');

        // 是否已无信息
        function checkHasNull(items) {
            if (!items.length) {
                messageList.append('<li class="null member-message-item">无相关信息</li>');
                $('.ui-paging').remove();
            }
        }

        // 全选·单选·删除·批量删除
        $('#J_member_message').selection({
            selectAllElem: '#J_checkall',
            singleClass: '.checkbox-sub',
            singleParentClass: '.member-message-item',
            singleRemoveClass: '.remove',
            batchRemoveElem: '#J_del_batch',
            async: true,
            onSelect: function() {},
            onSingleRemove: function(selectedEl) {
                var that = this;

                ConfirmBox.confirm('确定要删除这条消息吗？', '提示：', function() {
                    var pids = selectedEl.parent.data('pid');
                    $.ajax({
                        url: '/Home/BatchDeleteMessage',
                        type: 'post',
                        data: { messageIds: pids },
                        success: function(data) {
                            if (data.Succeeded) {
                                //消息总数-1
                                var totalNum = $('.total-msg').text() - 1;
                                $('.total-msg').text(totalNum);
                                //未读消息-1
                                var status = selectedEl.parent.find('.read').data('read') - 0; //0未读,1已读
                                if (status === 0) {
                                    var notReadNum = $('.ui-text-highlight').text() - 1;
                                    $('.ui-text-highlight').text(notReadNum);
                                }
                                that.itemRemove(selectedEl.timestamp);
                                checkHasNull(that.items);
                            } else {
                                showMessage('删除失败，请稍后再试！', false);
                            }
                        },
                        error: function() {
                            showMessage('网络出错，请稍后再试！', false);

                        }
                    });
                });
            },
            onBatchRemove: function(data) {
                var that = this,
                    selecteds = this.selecteds;
                if (!selecteds.length) return false;

                ConfirmBox.confirm('确定要删除所选吗？', '提示：', function() {
                    var pids = [];
                    var notReadNum = $('.ui-text-highlight').text();
                    for (var i = 0; i < selecteds.length; i++) {
                        pids.push(selecteds[i].parent.data('pid'));
                        var status = selecteds[i].parent.find('.read').data('read') - 0;
                        if (status === 0) {
                            notReadNum--;
                        }
                    }
                    pids = pids.join();
                    $.ajax({
                        url: '/Home/BatchDeleteMessage',
                        type: 'post',
                        data: { messageIds: pids },
                        success: function(data) {
                            if (data.Succeeded) {

                                //消息总数-删除总数
                                var totalNum = $('.total-msg').text() - selecteds.length;
                                $('.total-msg').text(totalNum);

                                //未读消息
                                $('.ui-text-highlight').text(notReadNum);

                                //删除
                                that.batchRemove();
                                checkHasNull(that.items);
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

        // 展开收起
        $('#J_member_message').delegate('.read', 'click', function() {
            var $this = $(this),
                panel = $this.siblings('div.content'),
                notReadNum = $('.ui-text-highlight').text() - 0,
                readStatus = $this.data('read') - 0; //0未读，1已读

            if (readStatus === 0) { //未读
                $this.siblings('.title').removeClass('not-read');
                var pids = $this.parent().data('pid');
                $.ajax({
                    url: '/Home/ReadMessage',
                    type: 'post',
                    data: { messageIds: pids },
                    success: function(data) {
                        if (data.Succeeded) {
                            notReadNum--;
                            $('.ui-text-highlight').text(notReadNum);
                            $this.data('read', 1);
                        }
                    }
                });
            }
            $this.toggleClass('active');
            if ($this.hasClass('active')) {
                $this.text('收起');
                panel.show();

            } else {
                $this.text('展开');
                panel.hide();
            }
        });
        //点击标题除非展开收起事件
        $('#J_member_message').delegate('.title', 'click', function() {
            $(this).siblings('.read').trigger('click');
        });

        // 页码操作
        formPaginger('.ui-paging', '#J_form_message');

    }

};

//提示信息
function showMessage(message, hold) {
    ConfirmBox.show(message, null, {
        title: '提示',
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

window.market = market;
