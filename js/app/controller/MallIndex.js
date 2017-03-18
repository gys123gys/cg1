define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'lib/swiper-3.3.1.jquery.min'
], function(base, Ajax, Handlebars, dict) {
    var loadImg = base.defaultBg;
    var idx = 0,
        dataObj = {},
        dataSeq = [];

    init();

    function init() {
        addListeners();
        $.when( //获取大类的数据字典
                Ajax.get(APIURL + '/general/dict/list', { parentKey: "pro_category", "orderColumn": "id", "orderDir": "asc" }),
                //获取产品信息
                Ajax.get(APIURL + '/commodity/product/list', true)
            )
            .then(function(res1, res2) {
                res1 = res1[0];
                res2 = res2[0];
                if (res1.success && res2.success) {
                    /***category遍历***/
                    var cateData = res1.data;
                    for (var i = 0; i < cateData.length; i++) {
                        var d = cateData[i];
                        dataObj[d.dkey] = {
                            "dvalue": d.dvalue,
                            "dkey": d.dkey,
                            "arr": {
                                "productIntype": {},
                                "typeSequence": []
                            }
                        };
                        dataSeq.push(d.dkey);
                    }
                    /**product遍历归类**/
                    var prodData = res2.data;
                    for (var i = 0; i < prodData.length; i++) {
                        var dd = prodData[i],
                            type = dd.type,
                            cateId = dd.category;
                        if (!dataObj[cateId].arr.productIntype[type]) {
                            dataObj[cateId].arr.productIntype[type] = [];
                            dataObj[cateId].arr.typeSequence.push([type, dd.typePic]);
                        }
                        dataObj[cateId].arr.productIntype[type].push(dd);
                    }
                    /**生成html**/
                    for (var j = 0, len = dataSeq.length; j < len; j++) {
                        var mm = dataObj[dataSeq[j]];
                        if (mm.arr.typeSequence.length) {
                            getDLHtml(mm);
                        }
                    }
                    $("img.lazy").lazyload({ effect: "fadeIn" });
                }
            });
    }

    function addListeners() {
        $("#searchIcon").on("click", function() {
            var sVal = $("#searchInput").val().trim();
            sVal = decodeURIComponent(sVal);
            location.href = "./search.html?s=" + sVal;
        });
    }

    //生成大类
    function getDLHtml(obj) {
        var top = getDL(obj.dvalue, obj.dkey); //[html, id]
        var productIntype = obj.arr.productIntype,
            typeSequence = obj.arr.typeSequence;
        doSuccess(productIntype, typeSequence, top[1], obj.dkey, top[0]);
    }

    //生成大类的html
    function getDL(name, cate) {
        var myId = "dlid" + idx;
        return ['<div class="plr10 s_12 ptb10 b_bd_b">' +
            '<img src="/static/images/fljx1.png" class="hp18p va-m"/>' +
            '<span class="pl10 va-m">' + name + '</span>' +
            '<a class="fr" href="../detail/mall_list.html?c=' + cate + '"><span class="s_10 t_60pe">更多></span></a>' +
            '</div>' +
            '<div id="' + myId + '" class="icon-loading2"></div>', myId
        ];
    }
    //每个大类下的html
    function doSuccess(productIntype, typeSequence, eId, category, tmp) {
        var html = '';
        for (var i = 0; i < typeSequence.length; i++) {
            var arr = productIntype[typeSequence[i][0]],
                typePic = typeSequence[i][1];
            html += '<table class="wp100 index-table"><tr><td rowspan="2">' +
                '<a class="pl10" href="../detail/mall_detail.html?t=' + typeSequence[i][0] + '&c=' + category + '"><img class="b_radius6 lazy" src="' + loadImg + '" data-original="' + typePic + '"/></a></td>';
            for (var j = 0, len = arr.length; j < len; j += 2) {
                if (j + 1 <= len - 1) {
                    if (j != 0) {
                        html += '<tr>';
                        if (j > 2) {
                            html += '<td></td>';
                        }
                    }
                    html += '<td class="pl6">' +
                        '<a class="clearfix show" href="../detail/mall_detail.html?t=' + typeSequence[i][0] + '&c=' + category + '&pc=' + arr[j].code + '">' +
                        '<div class="wp55 it-f">' +
                        '<div class="s_10">' + arr[j].name + '</div>' +
                        '<div class="s_08 t_40pe">' + arr[j].advTitle + '</div>' +
                        '</div>' +
                        '<div class="wp45 it-f"><img class="lazy" src="' + loadImg + '" data-original="' + arr[j].advPic + '"></div></a>' +
                        '</td>' +
                        '<td class="pl6">' +
                        '<a class="clearfix show" href="../detail/mall_detail.html?t=' + typeSequence[i][0] + '&c=' + category + '&pc=' + arr[j + 1].code + '">' +
                        '<div class="wp55 it-f">' +
                        '<div class="s_10">' + arr[j + 1].name + '</div>' +
                        '<div class="s_08 t_40pe">' + arr[j + 1].advTitle + '</div>' +
                        '</div>' +
                        '<div class="wp45 it-f"><img class="lazy" src="' + loadImg + '" data-original="' + arr[j + 1].advPic + '"></div></a>' +
                        '</td></tr>';
                } else {
                    if (j != 0) {
                        html += "<tr>";
                        if (j > 2) {
                            html += '<td></td>';
                        }
                    }
                    html += '<td class="pl6">' +
                        '<a class="clearfix show" href="../detail/mall_detail.html?t=' + typeSequence[i][0] + '&c=' + category + '&pc=' + arr[j].code + '">' +
                        '<div class="wp55 it-f">' +
                        '<div class="s_10">' + arr[j].name + '</div>' +
                        '<div class="s_08 t_40pe">' + arr[j].advTitle + '</div>' +
                        '</div>' +
                        '<div class="wp45 it-f"><img class="lazy" src="' + loadImg + '" data-original="' + arr[j].advPic + '"></div></a>' +
                        '</td><td class="pl6"></td></tr>';
                }
            }
            html += '</tr></table>';
        }
        $("#allItems").append(tmp);
        $("#" + eId).replaceWith(html);
    }
});