define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function(base, Ajax, dialog) {
    $(function() {
        var url = APIURL + '/commodity/business/page',
            type = base.getUrlParam("t") || "",
            prov = base.getUrlParam("p") || "",
            city = base.getUrlParam("c") || "",
            conTypes = {},
            config = {
                type: type,
                province: "",
                city: "",
                area: "",
                limit: 15,
                start: 1,
                orderDir: "desc",
                orderColumn: "total_dz_num"
            },
            first = true,
            isEnd = false,
            canScrolling = false,
            areaOrCity = city ? "area" : "city", //如果不是直辖市，则当前页面按照area搜索，否则按照city搜索
            citylist, areaArr = [];

        initView();

        function initView() {
            getNavList();
            base.getAddress()
                .then(function(data) {
                    citylist = data.citylist;
                    config.province = citylist[prov].p
                    if (city) {
                        config.city = citylist[prov].c[city].n;
                    }
                    addLoading();
                    addAreas();
                    businessPage();
                    addListeners();
                });
        }
        //添加类型列表
        function getNavList() {
            Ajax.get(APIURL + "/gene/nav/list")
                .then(function(res) {
                    if (res.success && res.data.length) {
                        for (var i = 0, html = ""; i < res.data.length; i++) {
                            conTypes[res.data[i].code] = res.data[i].name;
                            html += '<li l-type="' + res.data[i].code + '">' + res.data[i].name + '</li>';
                        }
                        $("#consumeUl").html(html)
                            .find("li[l-type='" + type + "']").addClass("on");
                        $("#lTypes").find("span").text(conTypes[type]);
                    } else {
                        showMsg("暂时无法获取分类列表");
                    }
                }, function() {
                    showMsg("暂时无法获取分类列表");
                });
        }
        //添加地区列表
        function addAreas() {
            var html = "<li class='all'>全部</li>";
            if (city) {
                areaArr = citylist[prov].c[city].a;
                $.each(areaArr, function(i, area) {
                    html += '<li>' + area.s + '</li>';
                });
            } else {
                areaArr = citylist[prov].c;
                $.each(areaArr, function(i, area) {
                    html += '<li>' + area.n + '</li>';
                });
            }
            $("#consumeAreaUl").html(html);
            $("#lAreas").find("span").text("全部");
        }

        function addListeners() {
            //点赞
            $("#consume-ul").on("click", ".good-div", function(e) {
                var me = $(this),
                    $img = me.find("img");
                e.preventDefault();
                e.stopPropagation();
                if ($img.attr("src").indexOf("/good.png") != -1) {
                    praise(this, $img);
                } else {
                    praise(this, $img, true);
                }
            });
            //下拉加载
            $(window).on("scroll", function() {
                var me = $(this);
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())
                    //列表下拉框未显示时才加载
                    &&
                    $("#mask").hasClass("hidden")) {

                    canScrolling = false;
                    addLoading();
                    businessPage();
                }
            });
            //搜索
            // $("#searchInput").on("keyup", function(){
            // 	var sVal = $(this).val();
            // 	if(!sVal || sVal.trim() === ""){
            // 		$("#searchUl").addClass("hidden").empty();
            // 	}else{
            // 		base.throttle(searchBusiness, this, 150);
            // 	}
            // });
            (function() {
                var str = "";

                $("#searchInput").on("focus", function() {
                    var time = setInterval(hasInput, 150);
                    $(this).on('blur', function() {
                        clearInterval(time);
                    });
                    hideMaskAndUl();
                });

                function hasInput() {
                    var sVal = $("#searchInput").val();
                    if (!sVal || sVal.trim() === "") {
                        $("#searchUl").addClass("hidden").empty();
                        str = "";
                    } else if (sVal != str) {
                        searchBusiness($('#searchInput')[0]);
                        str = sVal;
                    }
                }
            })();
            //类型选择按钮
            $("#lTypes").on("click", function() {
                var mask = $("#mask"),
                    cList = $("#cListDiv");
                if (cList.hasClass("hidden")) {
                    if (mask.hasClass("hidden")) {
                        mask.removeClass("hidden");
                    } else {
                        $("#cAreaDiv").addClass("hidden");
                    }
                    cList.removeClass("hidden");
                } else {
                    mask.addClass("hidden");
                    cList.addClass("hidden");
                }
            });
            //类型选择列表（酒店、周边游等）
            $("#consumeUl").on("click", "li", function() {
                config.type = $(this).attr("l-type");
                $("#lTypes").find("span").text(conTypes[config.type]);
                $("#consumeUl").find("li.on").removeClass("on")
                    .siblings("li[l-type='" + config.type + "']").addClass("on");
                doAreaOrTypeChose();
            });
            //选择区域按钮
            $("#lAreas").on("click", function() {
                var mask = $("#mask"),
                    cAreaDiv = $("#cAreaDiv");
                if (cAreaDiv.hasClass("hidden")) {
                    if (mask.hasClass("hidden")) {
                        mask.removeClass("hidden");
                    } else {
                        $("#cListDiv").addClass("hidden");
                    }
                    cAreaDiv.removeClass("hidden");
                } else {
                    mask.addClass("hidden");
                    cAreaDiv.addClass("hidden");
                }
            });
            //区域选择列表
            $("#consumeAreaUl").on("click", "li", function() {
                var me = $(this);
                if (me.hasClass("all")) {
                    config[areaOrCity] = "";
                    $("#lAreas").find("span").text("全部");
                } else {
                    config[areaOrCity] = me.text();
                    $("#lAreas").find("span").text(config[areaOrCity]);
                }
                doAreaOrTypeChose();
            });
            //点击覆盖层时，隐藏下拉列表
            $("#mask").on("click", function() {
                hideMaskAndUl();
            })
        }
        //重新选择区域或类型后重新加载
        function doAreaOrTypeChose() {
            canScrolling = false;
            isEnd = false;
            first = true;
            config.start = 1;
            $("#consume-ul").empty();
            addLoading();
            businessPage();
            hideMaskAndUl();
        }
        //隐藏列表
        function hideMaskAndUl() {
            $("#mask, #cListDiv, #cAreaDiv").addClass("hidden");
        }
        //搜索商家
        function searchBusiness(me) {
            var sConfig = {
                province: config.province,
                city: config.city,
                area: config.area,
                type: config.type,
                name: me.value,
                limit: 10,
                start: 1,
                orderDir: "desc",
                orderColumn: "total_dz_num"
            };
            Ajax.post(url, sConfig)
                .then(function(response) {
                    if (response.success) {
                        var html = "",
                            curList = response.data.list;
                        if (curList.length) {
                            curList.forEach(function(item) {
                                html += '<li><a class="show" href="./detail.html?c=' + item.code + '">' + item.name + '</a></li>';
                            });
                            $("#searchUl").removeClass("hidden").html(html);
                        } else {
                            $("#searchUl").empty().addClass("hidden");
                        }
                    }
                });
        }
        //点赞
        function praise(me, img, flag) {
            var $me = $(me),
                code = $me.closest("li[code]").attr("code"),
                span = $me.find("span");
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post(APIURL + "/operators/praise", { toMerchant: code })
                .then(function(response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        if (!flag) {
                            span.text(+span.text() + 1);
                            img.attr("src", "/static/images/good1.png");
                        } else {
                            span.text(+span.text() - 1);
                            img.attr("src", "/static/images/good.png");
                        }
                    } else if (response.timeout) {
                        location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
                    } else {
                        showMsg(response.msg);
                    }
                });
        }
        //分页查询商家
        function businessPage() {
            Ajax.post(url, config)
                .then(function(response) {
                    if (response.success) {
                        var data = response.data,
                            totalCount = +data.totalCount,
                            curList = data.list;
                        if (totalCount <= config.limit || curList.length < config.limit) {
                            isEnd = true;
                        }
                        if (curList.length) {
                            var html = "";
                            for (var i = 0; i < curList.length; i++) {
                                html += '<li class="ptb8 clearfix b_bd_b plr10" code="' + curList[i].code + '">' +
                                    '<a class="show p_r clearfix" href="./detail.html?c=' + curList[i].code + '">' +
                                    '<div class="fl wp30 tc"><img class="mh100p" src="' + curList[i].pic1 + '"/></div>' +
                                    '<div class="fl wp60 pl12">' +
                                    '<p class="tl line-tow t_bold">' + curList[i].name + '</p>' +
                                    '<p class="tl pt4 line-tow s_10 t_80">' + curList[i].advert + '</p>' +
                                    '</div>' +
                                    '<div class="good-div">';
                                if (!curList[i].isDZ) {
                                    html += '<img src="/static/images/good.png"/><span class="inline_block va-m pl6 t_80">' + curList[i].totalDzNum + '</span>';
                                } else {
                                    html += '<img src="/static/images/good1.png"/><span class="inline_block va-m pl6 t_80">' + curList[i].totalDzNum + '</span>';
                                }
                                html += '</div></a></li>';
                            }
                            $("#consume-ul").append(html);
                            removeLoading();
                            config.start += 1;
                        } else {
                            judgeError();
                        }
                    } else {
                        judgeError();
                    }
                    first = false;
                    canScrolling = true;
                });
        }
        //处理异常情况
        function judgeError() {
            if (first) {
                doError();
            } else {
                removeLoading();
            }
        }
        //添加下拉加载时的loading图标
        function addLoading() {
            $("#consume-ul").append('<li class="scroll-loadding"></li>');
        }
        //移除下拉加载时的loading图标
        function removeLoading() {
            $("#consume-ul").find(".scroll-loadding").remove();
        }

        function doError() {
            $("#consume-ul").html('<li style="text-align: center;line-height: 93px;">暂时无法获取商家信息</li>');
        }

        function showMsg(cont, time) {
            var d = dialog({
                content: cont,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 2000);
        }
    });
});