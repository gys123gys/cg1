define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/util/dialog'
], function(base, Ajax, Dict, dialog) {
    var code = base.getUrlParam("code") || "",
        receiptType = Dict.get("receiptType");

    queryOrder();
    addListener();
    //查询订单信息
    function queryOrder() {
        var url = APIURL + '/operators/queryOrder',
            config = {
                "invoiceCode": code
            };
        var modelCode = "",
            modelName, quantity, salePrice, receiveCode, productName, cnyPrice;
        Ajax.post(url, config)
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        invoiceModelLists = data.invoiceModelList;
                    //如果不是待支付订单，则直接跳到个人中心页面
                    if (data.status !== "1") {
                        location.href = "../user/user_info.html";
                    }
                    $("#cont").remove();
                    //发票信息
                    /*$("#od-rtype").html(getReceiptType(data.receiptType));
                    $("#od-rtitle").html(data.receiptTitle || "无");*/
                    var cnyTotal = 0,
                        total = 0;
                    //订单相关商品信息
                    if (invoiceModelLists.length) {
                        var html = '';
                        //计算每种商品的总价
                        invoiceModelLists.forEach(function(invoiceModelList) {
                            quantity = +invoiceModelList.quantity;
                            invoiceModelList.salePrice = (+invoiceModelList.salePrice / 1000).toFixed(0);
                            if (invoiceModelList.saleCnyPrice && +invoiceModelList.saleCnyPrice) {
                                cnyTotal += quantity * (+invoiceModelList.saleCnyPrice);
                                invoiceModelList.saleCnyPrice = (+invoiceModelList.saleCnyPrice / 1000).toFixed(2);
                            }
                            html += '<li class="ptb8 clearfix b_bd_b plr10" modelCode="' + invoiceModelList.modelCode + '">' +
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
                            html += '<p class="t_80">×<span>' + invoiceModelList.quantity + '</span></p></div></div></a></li>'
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
                        $("#cont").remove();
                        $("footer, #items-cont").removeClass("hidden");
                        //$("#items-cont").append(contentTmpl({ items: invoiceModelLists }));
                        $("#items-cont").append(center);
                        $("#totalAmount").html((+data.totalAmount / 1000).toFixed(0));
                        if (cnyTotal) {
                            $("#mAdd, #cnyDiv").removeClass("hidden");
                            $("#totalCnyAmount").html((cnyTotal / 1000).toFixed(2))
                        }
                        //添加地址信息
                        var addData = data.address || {};
                        addData.totalAmount = (+data.totalAmount / 1000).toFixed(0);
                        addData.orderCode = code;
                        var addrHtml = '<p><span class="pr2em">总计</span>：<span class="pl_5rem">' + addData.totalAmount + "积分" + (cnyTotal ? " + " + (cnyTotal / 1000).toFixed(2) + "元" : "") + '<span></span></p>' +
                            '<p><span class="pr1em">订单号</span>：<span class="pl_5rem">' + addData.orderCode + '</span></p>';
                        if (addData.addressee) {
                            addrHtml += '<p><span>配送信息：</span><span class="pl_5rem">' + addData.addressee + '</span><span class="pl10">' + addData.mobile + '</span></p>' +
                                '<p class="pl5_5rem t_73 s_09_5"><span class="pr10">' + addData.province + '</span>' +
                                '<span class="pr10">' + addData.city + '</span><span class="pr10">' + addData.district + '</span><span>' + addData.detailAddress + '</span></p>';
                        }
                        $("#addressDiv").html(addrHtml);
                    } else {
                        $("#cont").remove();
                        doError("#container");
                    }
                } else {
                    $("#cont").remove();
                    doError("#container");
                }
            });
    }

    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
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
    //获取发票类型
    function getReceiptType(data) {
        return data == "" ? "无" : receiptType[data];
    }

    function addListener() {
        /*********支付订单前的确认框start*********/
        //确定支付按钮
        $("#odOk").on("click", function(e) {
            $("#od-mask, #od-tipbox").addClass("hidden");
            doPayOrder();
        });
        $("#odCel").on("click", function(e) {
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
        //取消支付按钮
        /*********支付订单前的确认框end*********/
        //点击支付按钮
        $("#sbtn").on("click", function(e) {
            e.stopPropagation();
            $("#od-mask, #od-tipbox").removeClass("hidden");
        });
    }

    function doPayOrder() {
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post(APIURL + '/operators/payOrder', {
            code: code,
            amount: +$("#totalAmount").text() * 1000,
            cnyAmount: +$("#totalCnyAmount").text() * 1000
        }).then(function(response) {
            if (response.success) {
                location.href = "./pay_success.html";
            } else {
                $("#loaddingIcon").addClass("hidden");
                showMsg(response.msg);
                setTimeout(function() {
                    location.href = "../user/user_info.html";
                }, 2000);
            }
        });
    }
});