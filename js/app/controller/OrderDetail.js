define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/util/dialog',
    'Handlebars'
], function(base, Ajax, Dict, dialog, Handlebars) {
    $(function() {
        var code = base.getUrlParam('code'),
            receiptType = Dict.get("receiptType"),
            orderStatus = Dict.get("orderStatus"),
            fastMail = Dict.get("fastMail"),
            companyCode = Dict.get("companyCode"),
            addrTmpl = __inline("../ui/order-detail-addr.handlebars"),
            logisticsNO = "";

        initView();

        function initView() {
            $("#orderCode").text(code);
            //查询订单
            (function() {
                var url = APIURL + '/operators/queryOrder',
                    config = {
                        "invoiceCode": code
                    };
                var modelCode = "",
                    modelName, quantity, salePrice, receiveCode, productName;
                Ajax.post(url, config)
                    .then(function(response) {
                        $("#cont").remove();
                        if (response.success) {
                            var data = response.data,
                                html = "",
                                invoiceModelLists = data.invoiceModelList;

                            $("#orderDate").text(getMyDate(data.applyDatetime));
                            $("#orderStatus").text(getStatus(data.status));
                            //待支付(可取消)
                            if (data.status == "1") {
                                $("footer").removeClass("hidden");
                                //取消订单
                                $("#cbtn").on("click", function(e) {
                                    $("#od-mask, #od-tipbox").removeClass("hidden");
                                });
                                //支付订单
                                $("#sbtn").on("click", function() {
                                    location.href = '../operator/pay_order.html?code=' + code;
                                });
                                addListener();
                                //待收货
                            } else if (data.status == "3") {
                                $("#qrsh").removeClass("hidden");
                                //确认收货
                                $("#qr_btn").on("click", function() {
                                    confirmReceipt();
                                });
                            }
                            //说明
                            if (data.approveNote) {
                                $("#approveNoteTitle, #approveNoteInfo").removeClass("hidden");
                                $("#approveNoteInfo").text(data.approveNote);
                            }
                            //备注
                            if (data.applyNote) {
                                $("#applyNoteTitle, #applyNoteInfo").removeClass("hidden");
                                $("#applyNoteInfo").text(data.applyNote);
                            }
                            //商品信息
                            var cnyAmount = 0; //人民币总计
                            if (invoiceModelLists.length) {
                                var html = '<ul>';
                                invoiceModelLists.forEach(function(invoiceModelList) {
                                    invoiceModelList.salePrice = (+invoiceModelList.salePrice / 1000).toFixed(0);
                                    if (invoiceModelList.saleCnyPrice && +invoiceModelList.saleCnyPrice) {
                                        cnyAmount += (+invoiceModelList.saleCnyPrice) * (+invoiceModelList.quantity);
                                        invoiceModelList.saleCnyPrice = (+invoiceModelList.saleCnyPrice / 1000).toFixed(2);
                                    }
                                    html += '<ul>' +
                                        '<li class="ptb8 clearfix b_bd_b plr10" modelCode="' + invoiceModelList.modelCode + '">' +
                                        '<a class="show p_r min-h100p" href="../operator/buy.html?code=' + invoiceModelList.modelCode + '">' +
                                        '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + invoiceModelList.pic1 + '"/></div>' +
                                        '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                                        '<p class="tl line-tow">' + invoiceModelList.modelName + '</p>' +
                                        '<p class="tl pt4 line-tow">' + invoiceModelList.productName + '</p>' +
                                        '</div>' +
                                        '<div class="fl wp40 tr s_11">' +
                                        '<p class="item_totalP">' + invoiceModelList.salePrice + '<span class="t_40pe s_09 pl4">积分</span></p>';
                                    if (invoiceModelList.saleCnyPrice) {
                                        html += '<p class="item_totalP">' + invoiceModelList.saleCnyPrice + '<span class="t_40pe s_09 pl4">元</span></p>';
                                    }
                                    html += '<p class="t_80">×<span>' + invoiceModelList.quantity + '</span></p></div></div></a></li>';
                                });
                                html += '</ul>';
                                var center = $(html);
                                var imgs = center.find("img");
                                for (var i = 0; i < imgs.length; i++) {
                                    var img = imgs.eq(i);
                                    if (img[0].complete) {
                                        var width = img[0].width,
                                            height = img[0].height;
                                        if (width > height) {
                                            img.addClass("hp100");
                                        } else {
                                            img.addClass("wp100");
                                        }
                                        img.closest(".default-bg").removeClass("default-bg");
                                        continue;
                                    }
                                    (function(img) {
                                        img[0].onload = (function() {
                                            var width = this.width,
                                                height = this.height;
                                            if (width > height) {
                                                img.addClass("hp100");
                                            } else {
                                                img.addClass("wp100");
                                            }
                                            img.closest(".default-bg").removeClass("default-bg");
                                        });
                                    })(img);
                                }
                                $("#od-ul").append(center);
                                $("#totalAmount").html((+data.totalAmount / 1000).toFixed(0));
                                if (cnyAmount) {
                                    $("#cnySpan").removeClass("hidden");
                                    $("#totalCnyAmount").text((+cnyAmount / 1000).toFixed(2));
                                }
                                /*$("#od-rtype").html(getReceiptType(data.receiptType));
                                $("#od-rtitle").html(data.receiptTitle || "无");*/
                                $("#od-id").html(data.code);
                                //地址信息
                                var addData = data.address;
                                if (addData) {
                                    $("#addressTitle, #addressDiv").removeClass("hidden");
                                    $("#addressDiv").html(addrTmpl(addData));
                                }
                                //物流信息
                                var logistic = data.logistics;
                                if (logistic && logistic.code) {
                                    logisticsNO = logistic.code;
                                    $("#logisticsTitle, #logisticsInfo").removeClass("hidden");
                                    $("#logisticsComp").text(fastMail[logistic.company]);
                                    $("#logisticsNO").text(logisticsNO);
                                }
                            } else {
                                showMsg("暂时无法获取商品信息！");
                            }
                        } else {
                            showMsg("暂时无法获取订单信息！");
                        }
                    });
            })();
        }
        //确认收货
        function confirmReceipt() {
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post(APIURL + '/operators/receipt/confirm', { code: logisticsNO })
                .then(function(response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        showMsg("确认收货成功！");
                        setTimeout(function() {
                            location.href = "./order_list.html";
                        }, 1000);
                    } else {
                        showMsg(response.msg);
                    }
                });
        }
        //日期格式
        function getMyDate(value) {
            var date = new Date(value);
            return date.getFullYear() + "-" + get2(date.getMonth() + 1) + "-" + get2(date.getDate()) + " " +
                get2(date.getHours()) + ":" + get2(date.getMinutes()) + ":" + get2(date.getSeconds());
        }
        //把一位数变成两位数
        function get2(val) {
            if (val < 10) {
                return "0" + val;
            } else {
                return val;
            }
        }
        //获取发票类型
        /*function getReceiptType(data) {
            return data == "" ? "无": receiptType[data];
        }*/

        function addListener() {
            //取消订单确认框点击确认
            $("#odOk").on("click", function() {
                cancelOrder();
                $("#od-mask, #od-tipbox").addClass("hidden");
            });
            //取消订单确认框点击取消
            $("#odCel").on("click", function() {
                $("#od-mask, #od-tipbox").addClass("hidden");
            });
        }
        //获取定单状态
        function getStatus(status) {
            return orderStatus[status] || "未知状态";
        }

        function trimStr(val) {
            if (val == undefined || val === '') {
                return '';
            }
            return val.replace(/^\s*|\s*$/g, "");
        }

        function cancelOrder() {
            var url = APIURL + '/operators/cancelOrder',
                config = {
                    code: code
                };
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post(url, config)
                .then(function(response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        showMsg("取消订单成功！");
                        setTimeout(function() {
                            location.href = "./order_list.html";
                        }, 1000);
                    } else {
                        showMsg(response.msg);
                    }
                });
        }

        function showMsg(cont) {
            var d = dialog({
                content: cont,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, 2000);
        }
    });
});