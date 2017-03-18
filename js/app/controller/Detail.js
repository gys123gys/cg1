define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function(base, Ajax, dialog) {
    $(function() {
        var url = APIURL + '/commodity/business',
            code = base.getUrlParam("c") || "",
            config = {
                code: code
            };

        initView();

        function initView() {
            if (code) {
                business();
                addListeners();
            } else {
                $("#cont").remove();
                showMsg("未传入商家编号!");
            }
        }

        function addListeners() {
            //点赞
            $("#dzIcon").on("click", function() {
                var $img = $("#goodImg");
                $img.attr("src");
                if ($img.attr("src").indexOf("/good.png") != -1) {
                    praise();
                } else {
                    praise(true);
                }
            });
            //积分消费
            $("#sbtn").on("click", function() {
                location.href = "./integral_consume.html?c=" + code + "&n=" + $("#name").text();
            });
        }
        //点赞
        function praise(flag) {
            var span = $("#totalDzNum"),
                img = $("#goodImg");
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
        //根据code搜索商家信息
        function business() {
            Ajax.post(url, config)
                .then(function(response) {
                    $("#cont").remove();
                    if (response.success) {
                        var data = response.data;
                        if (data.isDZ) {
                            $("#goodImg").attr("src", "/static/images/good1.png");
                        }
                        $("#pic1").attr("src", data.pic1);
                        $("#name").text(data.name);
                        $("#totalDzNum").text(data.totalDzNum);
                        $("#advert").text(data.advert);
                        $("#address").text(data.province + " " + data.city + " " + data.area + " " + data.address);
                        $("#detailCont").append('<a class="fr clearfix" href="tel://' + data.bookMobile + '"><span class="pr6 va-m inline_block">' + data.bookMobile + '</span><img class="wp18p va-m" src="/static/images/phone.png"/></a>');
                        $("#description").html(data.description);
                    } else {
                        doError();
                    }
                });
        }


        function doError() {
            $("#description").html('<div class="bg_fff tc wp100">暂时无法获取商家信息</div>');
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