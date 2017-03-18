define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'app/util/dialog',
    'Handlebars'
], function(base, Ajax, Dict, dialog, Handlebars) {
    var code = base.getUrlParam("code") || "",
        type = base.getUrlParam("type") || "1",
        q = base.getUrlParam("q") || "1",
        receiptType = Dict.get("receiptType"),
        //contentTmpl = __inline("../ui/submit-order-imgs.handlebars"),
        //contentTmpl1 = __inline("../ui/submit-order-imgs1.handlebars"),
        toUser = "";
    init();

    function init() {
        //获取地址信息
        (function() {
            var url = APIURL + '/user/queryAddresses',
                config = {
                    "isDefault": ""
                },
                addressTmpl = __inline("../ui/submit-order-address.handlebars");
            Ajax.get(url, config, true)
                .then(function(response) {
                    $("#cont").hide();
                    if (response.success) {
                        var data = response.data,
                            html1 = "",
                            len = data.length;;
                        if (len) {
                            for (var i = 0; i < len; i++) {
                                if (data[i].isDefault == "1") {
                                    break;
                                }
                            }
                            if (i == len) {
                                i = 0;
                            }
                            var content = addressTmpl(data[i]);
                            $("#addressDiv").append(content);
                            $("#addressRight").removeClass("hidden");
                        } else {
                            $("#noAddressDiv").removeClass("hidden");
                        }
                    } else {
                        doError("#addressDiv");
                    }
                });
        })();
        //单种商品购买
        if (type == 1) {
            getModel();
            //购物车点击购买
        } else if (type == 2) {
            code = code.split(/_/);
            getModel1();
        }
        //发票信息展示
        /*(function () {
            var html = '<option value="0">无</option>';
            for(var rec in receiptType){
                html += '<option value="'+rec+'">'+receiptType[rec]+'</option>';
            }
            $("#receipt").html(html);
        })();*/
        //获取货品商
        (function() {
            var html = "";
            Ajax.get(APIURL + '/user/getHpsList', true)
                .then(function(res) {
                    if (res.success) {
                        var data = res.data,
                            html = "";
                        for (var i = 0; i < data.length; i++) {
                            var d = data[i];
                            if (d.userReferee.trim() == "") {
                                toUser = d.userId;
                            } else {
                                html += '<option value="' + d.userId + '">' + d.loginName + '</option>';
                            }
                        }
                        $("#seller").html(html);
                    }
                });
        })();
        addListeners();
    }

    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
    }
    //购物车点击购买后查询相关商品信息
    function getModel1() {
        var url = APIURL + '/operators/queryCart';
        Ajax.get(url, true)
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        html = "",
                        totalCount = 0,
                        cnyTotalCount = 0;
                    if (data.length) {
                        var items = [],
                            flag = false,
                            html = '<ul class="b_bd_b">';

                        for (var i = 0, len = code.length; i < len; i++) {
                            var d = data[code[i]];
                            var eachCount = (+d.salePrice) * (+d.quantity),
                                cnyEachCount = 0;
                            d.salePrice = (+d.salePrice / 1000).toFixed(0);
                            if (d.saleCnyPrice && +d.saleCnyPrice) {
                                cnyEachCount = (+d.saleCnyPrice) * (+d.quantity);
                                d.saleCnyPrice = (+d.saleCnyPrice / 1000).toFixed(2);
                            }
                            totalCount += eachCount;
                            cnyTotalCount += cnyEachCount;
                            html += '<li class="ptb8 clearfix b_bd_b plr10" modelCode="' + d.code + '">' +
                                '<a href="../operator/buy.html?code=' + d.modelCode + '" class="show p_r min-h100p">' +
                                '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + d.pic1 + '"/></div>' +
                                '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                                '<p class="tl line-tow">' + d.modelName + '</p>' +
                                '<p class="tl pt4 line-tow">' + d.productName + '</p>' +
                                '</div>' +
                                '<div class="fl wp40 tr s_10">' +
                                '<p><span class="item_totalP">' + d.salePrice + '</span><span class="t_40pe s_09 pl4">积分</span></p>';
                            if (d.saleCnyPrice) {
                                html += '<p><span class="item_totalP">' + d.saleCnyPrice + '</span><span class="t_40pe s_09 pl4">元</span></p>';
                            }
                            '<p class="t_80">×<span>' + d.quantity + '</span></p></div></div></a></li>';
                            //items.push(d);
                        }
                        html += '</ul>';
                        //var html = contentTmpl1({ items: items });
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
                        $("#cont").hide();
                        $("#items-cont").append(center);
                        $("#totalAmount").html((totalCount / 1000).toFixed(0));
                        if (cnyTotalCount) {
                            $("#mAdd, #cnyDiv").removeClass("hidden");
                            $("#totalCnyAmount").html((cnyTotalCount / 1000).toFixed(2))
                        }
                    } else {
                        $("#cont").hide();
                        doError("#items-cont");
                    }
                } else {
                    $("#cont").hide();
                    doError("#items-cont");
                }
            });
    }
    //单种商品点击购买后查询相关信息
    function getModel() {
        var url = APIURL + '/commodity/queryListModel',
            config = {
                "modelCode": code
            };
        Ajax.get(url, config)
            .then(function(response) {
                if (response.success) {
                    var data = response.data[0],
                        items = [],
                        html = '';
                    var eachCount = +data.discountPrice * +q;
                    data.totalAmount = (eachCount / 1000).toFixed(0);
                    data.discountPrice = (+data.discountPrice / 1000).toFixed(0);
                    if (data.cnyPrice && +data.cnyPrice) {
                        data.cnyPrice = (+data.cnyPrice / 1000).toFixed(2);
                        $("#mAdd, #cnyDiv").removeClass("hidden");
                        $("#totalCnyAmount").html((data.cnyPrice * +q).toFixed(2))
                    }
                    data.quantity = q;
                    data.modelName = data.model.name;
                    data.code = data.model.code;
                    data.productName = data.model.productName;
                    data.pic1 = data.model.pic1;
                    items.push(data);

                    html += '<ul class="b_bd_b">' +
                        '<li class="ptb8 clearfix b_bd_b plr10" modelCode="' + data.code + '">' +
                        '<a href="../operator/buy.html?code=' + data.code + '" class="show p_r min-h100p">' +
                        '<div class="order-img-wrap tc default-bg"><img class="center-img1" src="' + data.pic1 + '"/></div>' +
                        '<div class="order-right-wrap clearfix"><div class="fl wp60">' +
                        '<p class="tl line-tow">' + data.modelName + '</p>' +
                        '<p class="tl pt4 line-tow">' + data.productName + '</p>' +
                        '</div>' +
                        '<div class="fl wp40 tr s_10">' +
                        '<p><span class="item_totalP">' + data.discountPrice + '</span><span class="t_40pe s_09 pl4">积分</span></p>';
                    if (data.cnyPrice) {
                        html += '<p><span class="item_totalP">' + data.cnyPrice + '</span><span class="t_40pe s_09 pl4">元</span></p>';
                    }
                    html += '<p class="t_80">×<span>' + data.quantity + '</span></p></div></div></a></li></ul>';
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
                    //var html = contentTmpl({ items: items });
                    $("#items-cont").append(center);
                    $("#totalAmount").html(data.totalAmount);
                    $("#cont").hide();
                } else {
                    doError("#items-cont");
                }
            });
    }

    function addListeners() {
        //地址栏按钮
        $("#addressDiv").on("click", "a", function() {
            //如果没有地址，调到添加地址页
            if (this.id == "add-addr") {
                location.href = "./add_address.html?return=" + encodeURIComponent(location.pathname + location.search);
                //调到地址列表页
            } else {
                location.href = "./address_list.html?c=" + $(this).attr("code") + "&return=" + encodeURIComponent(location.pathname + location.search);
            }
        });
        //提交订单按钮
        $("#sbtn").on("click", function() {
            var $a = $("#addressDiv>a");
            //如果不是选择自提的方式，则判断是否选择地址
            if ($("#psfs").val() == "1") {
                if (!$a.length) {
                    showMsg("未选择地址");
                    return;
                }
            }
            /*var receiptT = $("#receiptTitle").val(),
            	receiptV = $("#receipt").val();*/
            //发票抬头过长
            /*if(receiptT.length > 32){
            	showMsg("发票抬头字数必须少于32位");
            	return;
            }*/
            //备注过长
            if ($("#apply_note").val().length > 255) {
                showMsg("备注字数必须少于255位");
                return;
            }
            //如果发票类型和抬头只填写了一种，则提示用户
            /*if(receiptT.length && receiptV == "0" || !receiptT.length && receiptV != "0"){
            	if(receiptT.length){
            		$("#od-tipbox>div:eq(1)").text("您还未选择发票类型，确定提交订单吗？");
            	}else{
            		$("#od-tipbox>div:eq(1)").text("您还未填写发票抬头，确定提交订单吗？");
            	}
            	$("#od-mask, #od-tipbox").removeClass("hidden");
            	return;
            }*/
            //提交订单前准备相关参数
            PrepareConfig();
        });
        /*****提示用户发票信息未填完整时start****/
        //点击确认
        /*$("#odOk").on("click", function(){
				PrepareConfig();
	        	$("#od-mask, #od-tipbox").addClass("hidden");
	        });*/
        //点击取消
        /*$("#odCel").on("click", function(){
        	$("#od-mask, #od-tipbox").addClass("hidden");
        });*/
        /*****提示用户发票信息未填完整时end****/
        //配送方式
        $("#psfs").on("change", function() {
            var me = $(this);
            if (me.val() == "2") {
                $("#zt").addClass("hidden");
                $("#sj").removeClass("hidden");
            } else {
                $("#sj").addClass("hidden");
                $("#zt").removeClass("hidden")
            }
        });
    }
    //提交订单前准备相关参数
    function PrepareConfig() {
        var url = APIURL + '/operators/submitOrder',
            config;
        //如果是单种商品购买
        if (type == 1) {
            var tPrice = (+$("#items-cont").find(".item_totalP").text()) * 1000;
            config = {
                "modelCode": code,
                "quantity": q,
                "addressCode": $("#addressDiv>a").attr("code"),
                /* "receiptType": ($("#receipt").val() == "0" ? "": $("#receipt").val()),
                 "receiptTitle": $("#receiptTitle").val(),*/
                "applyNote": $("#apply_note").val() || ""
            };
            //如果是购物车购买
        } else if (type == 2) {
            var cartList = [],
                $lis = $("#items-cont > ul > li");
            for (var i = 0, len = $lis.length; i < len; i++) {
                cartList.push($($lis[i]).attr("modelCode"));
            }
            var config = {
                "addressCode": $("#addressDiv>a").attr("code"),
                /*"receiptType": ($("#receipt").val() == "0" ? "": $("#receipt").val()),
                "receiptTitle": $("#receiptTitle").val(),*/
                "applyNote": "",
                "cartCodeList": cartList
            };
            url = APIURL + '/operators/submitCart';
        } else {
            showMsg("类型错误，无法提交订单");
            return;
        }
        //提交订单
        doSubmitOrder(config, url);
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
    //提交订单
    function doSubmitOrder(config, url) {
        //如果是配送的
        if ($("#psfs").val() == "1") {
            config.toUser = toUser;
            //自提的方式
        } else {
            config.toUser = $("#seller").val();
            config.addressCode = "";
            if (!config.toUser) {
                showMsg("商家不能为空");
                return;
            }
        }
        //提交订单
        Ajax.post(url, config)
            .then(function(response) {
                if (response.success) {
                    var code = response.data || response.data.code;
                    location.href = './pay_order.html?code=' + code;
                } else {
                    showMsg(response.msg);
                }
            });
    }
});