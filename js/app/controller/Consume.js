define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function(base, Ajax, dialog) {
    $(function() {
        var url = APIURL + '/commodity/business/page',
            config = {
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
            searchData = [], //保存全国的城市信息，供搜索用
            PROVINCE, CITY; //当前定位的城市

        initView();

        function initView() {
            PROVINCE = sessionStorage.getItem("province") || "";
            CITY = sessionStorage.getItem("city") || "";
            //如果session中没有保存地理信息，则重新获取
            if (!PROVINCE) {
                //获取金纬度
                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function(r) {
                    if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                        PROVINCE = r.address.province;
                        CITY = r.address.city;
                    } else {
                        showMsg("定位失败");
                    }
                    getLocationJSON();
                }, { enableHighAccuracy: true });
            } else {
                /*oss端保存 北京->朝阳区时，是province=北京、city=朝阳区、area=0；而保存浙江->杭州->余杭区时，是province=浙江、city=杭州、area=余杭区。
                  当前页面是按照倒数第二级去查找。如果是 北京->朝阳区，则按北京查，如果是 浙江->杭州->余杭区，则按 浙江->杭州去查询。
                  百度定位里，如果是 北京->朝阳区 这种，它返回的信息是 province=北京，city=北京。
                */
                CITY = CITY || PROVINCE;
                getLocationJSON();
            }
            addListeners();
        }
        //获取全国所有城市信息
        function getLocationJSON() {
            $("#loaddingIcon").addClass("hidden");
            addLoading();
            getNavList();
            base.getAddress()
                .then(function(data) {
                    citylist = data.citylist;
                    var html = "",
                        k = 0;
                    $.each(citylist, function(i, prov) {
                        //省市区
                        if (prov.c[0].a) {
                            $.each(prov.c, function(j, city) {
                                //按顺序保存位置信息，工搜索用
                                searchData.push(city.n);
                                //如果是当前定位的位置，则显示并保存到session中
                                if (city.n == CITY || CITY.indexOf(city.n) != -1 || city.n.indexOf(CITY) != -1) {
                                    html += '<li class="cityn on" prov="' + i + '" city="' + j + '">' + city.n + '</li>';
                                    $("#nowDiv").html('<input type="button" class="btn" id="nowCity" prov="' + i + '" city="' + j + '" value="' + city.n + '"/>');
                                    config.province = prov.p;
                                    config.city = city.n;
                                    $("#city").find("span").text(city.n);
                                    sessionStorage.setItem("province", prov.p);
                                    sessionStorage.setItem("city", city.n);
                                    //根据当前位置区查找商家信息
                                    businessPage();
                                } else {
                                    html += '<li class="cityn" prov="' + i + '" city="' + j + '">' + city.n + '</li>';
                                }
                            });
                            //市区
                        } else {
                            //按顺序保存位置信息，供搜索用
                            searchData.push(prov.p);
                            //如果是当前定位的位置，则显示并保存到session中
                            if (prov.p == PROVINCE || PROVINCE.indexOf(prov.p) != -1 || prov.p.indexOf(PROVINCE) != -1) {
                                $("#nowDiv").html('<input type="button" class="btn" id="nowCity" prov="' + i + '" value="' + prov.p + '"/>');
                                html += '<li class="cityn on" prov="' + i + '">' + prov.p + '</li>';
                                config.province = prov.p;
                                config.city = "";
                                sessionStorage.setItem("province", prov.p);
                                sessionStorage.setItem("city", "");
                                $("#city").find("span").text(config.province);
                                //根据当前位置区查找商家信息
                                businessPage();
                            } else {
                                html += '<li class="cityn" prov="' + i + '">' + prov.p + '</li>';
                            }
                        }
                    });
                    $("#consumeUl").html(html);
                    !PROVINCE ? (removeLoading(), doError()) : "";
                });
        }
        var count = 1;

        function getNavList() {
            $("#con-table").html('<i class="icon-loading3"></i>');
            Ajax.get(APIURL + "/gene/nav/list")
                .then(function(res) {
                    if (res.success && res.data.length) {
                        for (var i = 0, html = ""; i < res.data.length; i++) {
                            if (i % 5 == 0) {
                                if (i == 0) {
                                    html += '<tr>';
                                } else {
                                    html += '</tr><tr>'
                                }
                            }
                            html += '<td><a href="javascript:void(0)" l_type="' + res.data[i].code + '">' +
                                '<div class="pb2em"><img src="' + res.data[i].pic + '" /></div>' +
                                '<span class="consume-top-span">' + res.data[i].name + '</span>'
                            '</a></td>';
                        }
                        html += '</tr>';
                        var center = $(html),
                            imgs = center.find('img'),
                            length = imgs.length;
                        count = length;
                        for (var i = 0; i < length; i++) {
                            var img = imgs.eq(i);
                            if (img[0].complete) {
                                isReady();
                                continue;
                            }
                            (function(img) {
                                img[0].onload = (function() {
                                    isReady();
                                });
                            })(img);
                        }
                        $("#con-table").empty().append(center);
                    } else {
                        $("#con-table").html('<tr style="line-height: 140px;"><td>暂无分类信息</td></tr>');
                    }
                }, function() {
                    $("#con-table").html('<tr style="line-height: 140px;"><td>暂无分类信息</td></tr>');
                });
        }

        function isReady() {
            if (!--count) {
                var height = $("#conTop")[0].offsetHeight + $("#tableWrap")[0].offsetHeight;
                $("#marginTop").css("height", height);
            }
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
            //页面下拉加载
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
            //搜索商家
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
            //选择城市按钮
            $("#city").on("click", function() {
                if ($("#consumeDiv").hasClass("hidden")) {
                    $("#noResult").addClass("hidden");
                    //$("#consumeUl").find("li.on").removeClass("on");
                    $("#mask, #consumeDiv").removeClass("hidden");
                } else {
                    $("#mask, #consumeDiv").addClass("hidden");
                }

            });
            //城市选择列表
            $("#consumeUl").on("click", "li.cityn", function() {
                var li = $(this),
                    value = li.text(),
                    prov = li.attr("prov"),
                    city = li.attr("city");
                $("#consumeUl").find("li.on").removeClass("on");
                li.addClass("on");
                //根据当前选择的城市更新config和session
                config.province = citylist[prov].p;
                config.city = city && citylist[prov].c[city].n || "";
                config.start = 1;
                sessionStorage.setItem("province", config.province);
                sessionStorage.setItem("city", config.city);
                $("#nowCity").val(value);
                $("#city").find("span").text(value);
                //重新获取商家信息
                doCityChose();
            });
            //点击覆盖层时，隐藏下拉列表
            $("#mask").on("click", function() {
                hideMaskAndUl();
            });
            //搜索城市
            $("#searchCity").on("click", function() {
                var name = $("#cityInput").val().trim(),
                    flag = false;
                if (!name) {
                    return;
                }
                $("#sResult").addClass("hidden")
                for (var i = 0; i < searchData.length; i++) {
                    //找到用户搜索的城市
                    if (searchData[i].indexOf(name) != -1) {
                        var li = $("#consumeUl").find("li:eq(" + i + ")");
                        var prov = li.attr("prov"),
                            city = li.attr("city");
                        $("#sResult").removeClass("hidden").html('<input class="btn" type="button" value="' + searchData[i] + '" indx="' + i + '"/>');
                        flag = true;
                        break;
                    }
                }
                //如果没有找到相关城市
                if (!flag) {
                    $("#sResult").addClass("hidden");
                    $("#noResult").removeClass("hidden");
                } else {
                    $("#noResult").addClass("hidden");
                }
            });
            //用户选择类型时（美食、电影等）
            $("#con-table").on("click", "a", function() {
                var type = $(this).attr("l_type"),
                    li = $("#consumeUl").find("li.on"),
                    url = "";
                url = "./list.html?t=" + type + "&p=" + li.attr("prov");
                var city = li.attr("city");
                if (city) {
                    url += "&c=" + li.attr("city") || "";
                }
                location.href = url;
            });
            //用户点击搜索城市结果的按钮
            $("#sResult").on("click", "input", function() {
                var idx = $(this).attr("indx"),
                    $conUl = $("#consumeUl");
                var li = $conUl.find("li:eq(" + idx + ")");
                li.click();
                $("#sResult").addClass("hidden");
            });
        }

        //重新选择区域或类型后重新加载
        function doCityChose() {
            canScrolling = false;
            isEnd = false;
            first = true;
            $("#consume-ul").empty();
            addLoading();
            businessPage();
            hideMaskAndUl();
        }
        //隐藏列表
        function hideMaskAndUl() {
            $("#mask, #consumeDiv").addClass("hidden");
        }
        //搜索商家
        function searchBusiness(me) {
            var sConfig = {
                province: config.province,
                city: config.city,
                area: config.area,
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
            $("#loaddingIcon1").removeClass("hidden");
            Ajax.post(APIURL + "/operators/praise", { toMerchant: code })
                .then(function(response) {
                    $("#loaddingIcon1").addClass("hidden");
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
        //获取商家
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
                                    '<a class="show p_r min-h80p" href="./detail.html?c=' + curList[i].code + '">' +
                                    '<div class="consume-center-wrap default-bg"><img class="center-img1 center-lazy" src="' + curList[i].pic1 + '"/></div>' +
                                    '<div class="consume-right-wrap">' +
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
                            $("#consume-ul").append(center);
                            removeLoading();
                            config.start += 1;
                        } else {
                            judgeError();
                        }
                    } else {
                        judgeError();
                    }
                    if (first) {
                        if ($("#con-table").find("img").length) {
                            var height = $("#conTop")[0].offsetHeight + $("#tableWrap")[0].offsetHeight;
                            $("#marginTop").css("height", height);
                        }
                    }
                    first = false;
                    canScrolling = true;
                });
        }

        function judgeError() {
            if (first) {
                doError();
            } else {
                removeLoading();
            }
        }

        function addLoading() {
            $("#consume-ul").append('<li class="scroll-loadding"></li>');
        }

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