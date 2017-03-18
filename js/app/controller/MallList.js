define([
    'app/controller/base',
    'app/util/ajax',
    'IScroll'
], function(base, Ajax, IScroll) {
    $(function() {
        var cate = base.getUrlParam("c") || "",
            imgWidth = (($(window).width() - 20) / 3 - 20) + "px",
            myScroll;
        init();

        function init() {
            var html = '',
                html1 = "";
            addListeners();
            Ajax.get(APIURL + '/general/dict/list', { parentKey: "pro_category", "orderColumn": "id", "orderDir": "asc" })
                .then(function(res) {
                    if (res.success) {
                        var cateData = res.data;
                        for (var i = 0; i < cateData.length; i++) {
                            var d = cateData[i];
                            html += '<li l_type="' + d.dkey + '">' + d.dvalue + '</li>';
                            html1 += '<li l_type="' + d.dkey + '" class="wp33 tl fl">' + d.dvalue + '</li>';
                        }
                        var scroller = $("#scroller");
                        scroller.find("ul").html(html);
                        $("#allItem").find("ul").html(html1);
                        addCategory();
                        cate == cate || cateData[0].dkey;
                        scroller.find("ul>li[l_type='" + cate + "']").click();
                    }
                });
        }

        function addCategory() {
            var scroller = $("#scroller");
            var lis = scroller.find("ul li");
            for (var i = 0, width = 0; i < lis.length; i++) {
                width += $(lis[i]).width() + 29;
            }
            $("#scroller").css("width", width);
            myScroll = new IScroll('#mallWrapper', { scrollX: true, scrollY: false, mouseWheel: true, click: true });
        }

        function addListeners() {
            /**大类start */
            $("#down").on("click", function() {
                var me = $(this);
                if (me.hasClass("down-arrow")) {
                    $("#allCont").removeClass("hidden");
                    me.removeClass("down-arrow").addClass("up-arrow");
                } else {
                    $("#allCont").addClass("hidden");
                    me.removeClass("up-arrow").addClass("down-arrow");
                }
            });
            $("#mall-mask").on("click", function() {
                $("#down").click();
            });
            $("#allItem").on("click", "li", function() {
                var lType = $(this).attr("l_type");
                $("#scroller").find("li[l_type='" + lType + "']").click();
                $("#down").click();
            });
            $("#scroller").on("click", "li", function() {
                var me = $(this);
                $("#mallWrapper").find(".current").removeClass("current");
                me.addClass("current");
                myScroll.scrollToElement(this);
                lType = me.attr("l_type");
                getProduces(lType);
                var allItem = $("#allItem");
                allItem.find("li.current").removeClass("current");
                allItem.find("li[l_type='" + lType + "']").addClass("current");
            });
            /**大类end */
        }

        function getProduces(category) {
            var url = APIURL + "/commodity/subdivision/list";
            Ajax.get(url, { "category": category }, true)
                .then(function(res) {
                    if (res.success) {
                        var data = res.data;
                        if (data.length) {
                            var html = '';
                            for (var i = 0, len = data.length; i < len; i += 3) {
                                if (i + 2 <= len - 1) {
                                    html += '<tr><td><a class="wp100 b_radius6 default-bg p_r over-hide" style="height: ' + imgWidth + '" href="./mall_detail.html?c=' + category + '&t=' + data[i].type + '">' +
                                        '<img class="center-img1" src="' + data[i].typePic + '"/></a></td>' +
                                        '<td><a class="wp100 b_radius6 default-bg p_r over-hide" style="height: ' + imgWidth + '" href="./mall_detail.html?c=' + category + '&t=' + data[i + 1].type + '">' +
                                        '<img class="center-img1" src="' + data[i + 1].typePic + '"/></a></td>' +
                                        '<td><a class="wp100 b_radius6 default-bg p_r over-hide" style="height: ' + imgWidth + '" href="./mall_detail.html?c=' + category + '&t=' + data[i + 2].type + '">' +
                                        '<img class="center-img1" src="' + data[i + 2].typePic + '"/></a></td></tr>';
                                } else if (i + 1 <= len - 1) {
                                    html += '<tr><td><a class="wp100 b_radius6 default-bg p_r over-hide" style="height: ' + imgWidth + '" href="./mall_detail.html?c=' + category + '&t=' + data[i].type + '">' +
                                        '<img class="center-img1" src="' + data[i].typePic + '"/></a></td>' +
                                        '<td><a class="wp100 b_radius6 default-bg p_r over-hide" style="height: ' + imgWidth + '" href="./mall_detail.html?c=' + category + '&t=' + data[i + 1].type + '">' +
                                        '<img class="center-img1" src="' + data[i + 1].typePic + '"/></a></td><td></td></tr>';
                                } else {
                                    html += '<tr><td><a class="wp100 b_radius6 default-bg p_r over-hide" style="height: ' + imgWidth + '" href="./mall_detail.html?c=' + category + '&t=' + data[i].type + '">' +
                                        '<img class="center-img1" src="' + data[i].typePic + '"/></a></td>' +
                                        '<td></td><td></td></tr>';
                                }
                            }
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
                            $("#mlTable").empty().append(center);
                        } else {
                            doError();
                        }
                    } else {
                        doError();
                    }
                });
        }

        function doError() {
            $("#cont").hide();
            $("#mlTable").html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂无商品</div>');
        }
    });
});