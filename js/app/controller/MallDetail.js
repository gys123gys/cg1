define([
    'app/controller/base',
    'app/util/ajax',
    'Handlebars'
], function(base, Ajax, Handlebars) {
    $(function() {
        var first = true,
            isEnd = false,
            canScrolling = true;
        var category = base.getUrlParam("c") || "",
            productCode = base.getUrlParam("pc") || "",
            type = base.getUrlParam("t") || "";
        var config = {
                limit: 10,
                start: 1,
                category: category,
                type: type,
                productCode: productCode
            },
            url = APIURL + '/commodity/queryPageModel';

        init();

        function init() {
            queryPageModel();
            addListeners();
        }

        function queryPageModel() {
            Ajax.get(url, config, true)
                .then(function(res) {
                    if (res.success) {
                        var data = res.data,
                            list = data.list;
                        if (+data.totalCount < config.limit || list.length < config.limit) {
                            isEnd = true;
                        }
                        if (list.length) {
                            var html = "";
                            list.forEach(function(d) {
                                var price = +d.discountPrice / 1000;
                                var model = d.model;
                                html += '<li class="ptb8 clearfix b_bd_b plr10">' +
                                    '<a class="show p_r min-h100p" href="../operator/buy.html?code=' + model.code + '">' +
                                    '<div class="order-img-wrap tc default-bg"><img class="center-img1 center-lazy" src="' + model.pic1 + '"/></div>' +
                                    '<div class="order-right-wrap clearfix">' +
                                    '<p class="t_323232 s_12 line-tow">' + model.name + '</p>' +
                                    '<p class="t_999 s_10 line-tow">' + model.productName + '</p>' +
                                    '<p class="t_red">' + price.toFixed(0) + '<span class="s_10 t_40pe pl4">积分</span>';
                                if (d.cnyPrice) {
                                    html += "+" + (+d.cnyPrice / 1000).toFixed(2) + '<span class="s_10 t_40pe pl4">元</span></p>';
                                } else {
                                    html += '</p>';
                                }
                                if (d.originalPrice) {
                                    html += '<p class="s_10">市场参考价：<span>' + (+d.originalPrice / 1000).toFixed(2) + '</span>元</p>';
                                }
                                html += '</div></a></li>';
                            });
                            var center = $(html);
                            var imgs = center.find("img.center-lazy");
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
                                    img.removeClass("center-lazy").closest(".default-bg").removeClass("default-bg");
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
                                        img.removeClass("center-lazy").closest(".default-bg").removeClass("default-bg");
                                    });
                                })(img);
                            }
                            removeLoading();
                            $("#contUl").append(center);
                            config.start += 1;
                        } else {
                            if (first) {
                                doError();
                            } else {
                                removeLoading();
                            }
                        }
                    } else {
                        if (first) {
                            doError();
                        } else {
                            removeLoading();
                        }
                    }
                    first = false;
                    canScrolling = true;
                });
        }

        function addListeners() {
            $(window).on("scroll", function() {
                var me = $(this);
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                    canScrolling = false;
                    addLoading();
                    queryPageModel();
                }
            });
            $("#searchIcon").on("click", function() {
                var sVal = $("#searchInput").val().trim();
                sVal = decodeURIComponent(sVal);
                location.href = "./search.html?s=" + sVal;
            });
        }

        function doError() {
            $("#contUl").html('<li class="bg_fff" style="text-align: center;line-height: 150px;">暂无相关商品信息</li>');
        }

        function addLoading() {
            $("#contUl").append('<li class="scroll-loadding"></li>');
        }

        function removeLoading() {
            $("#contUl").find(".scroll-loadding").remove();
        }
    });
});