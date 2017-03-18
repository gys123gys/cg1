define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'lib/swiper-3.3.1.jquery.min'
], function(base, Ajax, dialog, Swiper) {
    $(function() {
        var mySwiper, rspData, user, code = base.getUrlParam("code") || "";
        Ajax.get(APIURL + '/commodity/queryListModel', {
                modelCode: code
            }, true)
            .then(function(res) {
                if (res.success) {
                    var data = res.data,
                        imgs_html = "";
                    if (data.length) {
                        rspData = data[0];
                        $("#buyBtn").click(function() {
                            if (!$(this).hasClass("no-buy-btn")) {
                                var choseCode = code;
                                location.href = "./submit_order.html?code=" + choseCode + "&q=" + $("#buyCount").val();
                            }
                        });
                        $("#addCartBtn").click(function() {
                            if (!$(this).hasClass("no-buy-btn")) {
                                add2Cart();
                            }
                        });
                        addListeners();
                        choseImg();
                        $("#cont").remove();
                    } else {
                        doError("暂无数据");
                    }
                } else {
                    doError("暂无数据");
                }
            });
        if (sessionStorage.getItem("user") !== "1") {
            base.getUser()
                .then(function(response) {
                    if (response.success) {
                        user = response.data;
                    }
                });
        } else {
            user = true;
        }

        function doError(msg) {
            var d = dialog({
                content: msg,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, 2000);
        }

        function addListeners() {
            $("#subCount").on("click", function() {
                var orig = $("#buyCount").val();
                if (orig == undefined || orig == "" || orig == "0" || orig == "1") {
                    orig = 2;
                }
                orig = +orig - 1;
                $("#buyCount").val(orig);
                $("#buyCount").change();
            });
            $("#addCount").on("click", function() {
                var orig = $("#buyCount").val();
                if (orig == undefined || orig == "") {
                    orig = 0;
                }
                orig = +orig + 1;
                $("#buyCount").val(orig);
                $("#buyCount").change();
            });
            $("#buyCount").on("keyup", function(e) {
                var keyCode = e.charCode || e.keyCode;
                var me = $(this);
                if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                    me.val(me.val().replace(/[^\d]/g, ""));
                }
                if (!me.val()) {
                    me.change();
                }
            }).on("change", function(e) {
                var keyCode = e.charCode || e.keyCode;
                var me = $(this);
                if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                    me.val(me.val().replace(/[^\d]/g, ""))
                }
                if (!me.val()) {
                    me.val("1");
                }
                if (me.val() == "0") {
                    me.val("1");
                }
            });
        }

        function choseImg() {
            var msl = rspData,
                modelData = rspData.model,
                table_html = "<tbody>";
            if (!mySwiper) {
                $("#btlImgs").children("div.swiper-slide:not(.swiper-slide-duplicate)")
                    .find("img")
                    .each(function(i, item) {
                        $(item).attr("src", modelData["pic" + (i + 1)]);
                    });
                mySwiper = new Swiper('.swiper-container', {
                    'direction': 'horizontal',
                    'loop': true,
                    'autoplay': 5000,
                    'pagination': '.swiper-pagination'
                });
            }
            if (msl.modelSpecsList && msl.modelSpecsList.length) {
                msl.modelSpecsList.forEach(function(data) {
                    table_html += "<tr><th>" + data.dkey + "</th><td>" + data.dvalue + "</td></tr>";
                });
                table_html += "</tbody>";
                $("#bb-table").html(table_html);
            } else {
                $("#i-tip,#bb-table").addClass("hidden");
            }
            $("#btr-name").text(modelData.name);
            $("#btr-description").html(modelData.description);
            var totalPrice;
            var discPrice = +msl.discountPrice;
            $("#discountPrice").text((discPrice / 1000).toFixed(0) + "积分");
            $("#addCartBtn, #buyBtn").removeClass("no-buy-btn");
            if (msl.cnyPrice && +msl.cnyPrice) {
                $("#cnySpan").removeClass("hidden");
                $("#cnyPrice").text((+msl.cnyPrice / 1000).toFixed(2) + "元");
            }
        }

        function isNumber(code) {
            if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
                return true;
            }
            return false;
        }

        function isSpecialCode(code) {
            if (code == 37 || code == 39 || code == 8 || code == 46) {
                return true;
            }
            return false;
        }

        function add2Cart() {
            if (user) {
                a2cart();
            } else {
                location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
            }
        }

        function a2cart() {
            var choseCode = code,
                config = {
                    modelCode: choseCode || "",
                    quantity: $("#buyCount").val()
                },
                url = APIURL + '/operators/add2Cart';
            Ajax.post(url, config)
                .then(function(response) {
                    var msg;
                    if (response.success) {
                        msg = "添加购物车成功!";
                    } else {
                        msg = "添加购物车失败!";
                    }
                    var d = dialog({
                        content: msg,
                        quickClose: true
                    });
                    d.show();
                    setTimeout(function() {
                        d.close().remove();
                    }, 2000);
                });
        }
    });
});