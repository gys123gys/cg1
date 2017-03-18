define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    $(function() {
        var url = APIURL + "",
            sVal = base.getUrlParam("s") || "",
            first = true,
            isEnd = false,
            canScrolling = false,
            searchConfig = {
                limit: 10,
                start: 1
            },
            searchUrl = APIURL + '/commodity/queryPageModel';

        initView();

        function initView() {
            addListeners();
            if (sVal) {
                $("#searchInput").val(sVal);
                $("#searchIcon").click();
            }
        }

        function addListeners() {
            //搜索按钮
            $("#searchIcon").on("click", function() {
                var vv = $("#searchInput").val();
                if (vv = vv && vv.trim()) {
                    sVal = vv;
                    first = true;
                    isEnd = false;
                    searchConfig.start = 1;
                    canScrolling = false;
                    $("#searchUl").empty();
                    doSearch();
                }
            });
            //页面下拉加载数据
            $(window).on("scroll", function() {
                var me = $(this);
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                    canScrolling = false;
                    doSearch();
                }
            });
        }

        function doSearch() {
            addLoading();
            searchConfig.modelName = sVal;
            Ajax.get(searchUrl, searchConfig, true)
                .then(function(res) {
                    if (res.success) {
                        var data = res.data,
                            list = data.list;
                        if (+data.totalCount <= searchConfig.limit || list.length < searchConfig.limit) {
                            isEnd = true;
                        }
                        if (list.length) {
                            var html = "";
                            list.forEach(function(d) {
                                var price = +d.discountPrice / 1000;
                                var model = d.model;
                                html += '<li class="ptb8 clearfix b_bd_b">' +
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
                            $("#searchUl").append(center);
                            searchConfig.start += 1;
                        } else {
                            if (first) {
                                doError("没有相关商品");
                            } else {
                                removeLoading();
                            }
                            isEnd = true;
                        }
                    } else {
                        if (first) {
                            doError();
                        } else {
                            removeLoading();
                        }
                        isEnd = true;
                    }
                    first = false;
                    canScrolling = true;
                });
        }

        function addLoading() {
            $("#searchUl").append('<li class="scroll-loadding"></li>');
        }

        function doError(msg) {
            msg = msg || "暂时无法获取商品信息";
            $("#searchUl").html('<li class="bg_fff" style="text-align: center;line-height: 150px;">' + msg + '</li>');
        }

        function removeLoading() {
            $("#searchUl").find(".scroll-loadding").remove();
        }
    });
});