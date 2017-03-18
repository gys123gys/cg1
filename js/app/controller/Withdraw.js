define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function(base, Ajax, dialog) {
    $(function() {
        var config = {
                "accountNumber": "",
                "amount": "",
                "toCode": "",
                "toBelong": ""
            },
            AMOUNT;

        initView();

        function initView() {
            Ajax.get(APIURL + "/account/get", { "currency": "CNY" }, true)
                .then(function(response) {
                    if (response.success) {
                        var data = response.data;
                        config.accountNumber = data.accountNumber;
                        AMOUNT = data.amount;
                        $("#kyje").text("￥" + (+AMOUNT / 1000).toFixed(2));
                    } else {
                        showMsg("账户信息获取失败！");
                        $("#wdBtn").attr("disabled", "disabled");
                    }
                });
            addListeners();
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

        function addListeners() {
            $("#account").on("change", validate_account);
            $("#amount").on("change", validate_amount);
            $("#realName").on("change", validate_realName);
            $("#sbtn").on("click", function() {
                if (validate()) {
                    $(this).attr("disabled", "disabled").val("提交中...");
                    config.amount = (+$("#amount").val()) * 1000;
                    config.toCode = $("#account").val();
                    config.toBelong = $("#realName").val();
                    withdraw();
                }
            });
        }

        function validate_amount() {
            var flag = true,
                me = $("#amount"),
                amount = me.val();
            if (amount == undefined || amount === "") {
                showMsg("取现金额不能为空！");
                flag = false;
            } else if (isNaN(amount)) {
                showMsg("取现金额只能是数字！");
                flag = false;
            } else if (!/^-?\d+(?:\.\d{1,2})?$/.test(amount)) {
                showMsg("取现金额只能是两位以内小数！");
                flag = false;
            } else if (+amount <= 0) {
                showMsg("取现金额必须大于0！");
                flag = false;
            } else if ((+amount * 1000) > AMOUNT) {
                showMsg("取现金额必须小于可用金额！");
                flag = false;
            } else if (+amount < 100) {
                showMsg("单笔取现金额不能少于100元！");
                flag = false;
            }
            return flag;
        }

        function validate_realName() {
            var value = $("#realName").val();
            var reg = /^([\u4E00-\u9FA5])*$/;
            if (value == undefined || trim(value) === "") {
                showMsg("真实姓名不能为空!");
                return false;
            } else if (value.length > 20) {
                showMsg("真实姓名过长!");
                return false;
            } else if (!reg.test(value)) {
                showMsg("姓名格式错误!");
                return false;
            }
            return true;
        }

        function validate_account() {
            var value = $("#account").val();
            var reg_mail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/g;
            var reg_mobile = /^1[3,4,5,7,8]\d{9}$/g;
            if (!value || !value.trim()) {
                showMsg("支付账号不能为空!");
                return false;
            } else if (value.length > 32) {
                showMsg("支付宝账号过长!");
                return false;
            } else if (!reg_mail.test(value) && !reg_mobile.test(value)) {
                showMsg("支付宝账号格式错误!");
                return false;
            }
            return true;
        }

        function validate() {
            return validate_amount() && validate_realName() && validate_account();
        }

        function trim(str) {
            return str == undefined ? "" : str.replace(/^\s*|\s*$/ig, "");
        }

        function withdraw() {
            Ajax.post(APIURL + "/account/doWithdraw", config)
                .then(function(response) {
                    if (response.success) {
                        $("#sbtn").val("提交");
                        showMsg("取现申请提交成功！");
                        setTimeout(function() {
                            location.href = "../user/user_info.html";
                        }, 1000);
                    } else {
                        showMsg(response.msg);
                        $("#sbtn").removeAttr("disabled").val("提交");
                    }
                });
        }
    });
});