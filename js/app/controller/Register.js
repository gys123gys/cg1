define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function(base, Ajax, dialog) {
    $(function() {
        var count = 1,
            returnUrl = base.getUrlParam("return"),
            userReferee = base.getUrlParam("u"),
            toUser;
        addListeners();
        init();

        function init() {
            $("#captchaImg").click();
            var url = "./login.html";
            if (returnUrl) {
                url = url + "?return=" + encodeURIComponent(returnUrl);
            }
            $("#toLogin").attr("href", url);
            getTjr();
        }

        function addListeners() {
            $("#mobile").on("change", validate_mobile);
            $("#captcha").on("change", validate_captcha);
            $("#registerBtn").on("click", function(e) {
                register();
            });
            $("#captchaImg").on("click", function() {
                $(this).attr('src', APIURL + '/captcha?_=' + new Date().getTime());
            });

            $("#verification").on("change", validate_verification);

            $("#password").on("change", validate_password)
                .on("focus", function() {
                    $(this).siblings(".register_verifycon")
                        .css({
                            "display": "block"
                        });
                })
                .on("blur", function() {
                    $(this).siblings(".register_verifycon")
                        .css({
                            "display": "none"
                        });
                });
            $("#getVerification").one("click", function innerFunc() {
                if (validate_mobile() && validate_captcha()) {
                    handleSendVerifiy();
                } else {
                    $("#getVerification").one("click", innerFunc);
                }
            });
        }

        function handleSendVerifiy() {
            $("#getVerification").addClass("cancel-send");
            Ajax.post(APIURL + '/gene/register/send', {
                "captcha": $("#captcha").val(),
                "mobile": $("#mobile").val()
            }).then(function(response) {
                if (response.success) {
                    for (var i = 0; i <= 60; i++) {
                        (function(i) {
                            setTimeout(function() {
                                if (i < 60) {
                                    $("#getVerification").text((60 - i) + "s");
                                } else {
                                    $("#getVerification").text("获取验证码").removeClass("cancel-send")
                                        .one("click", function innerFunc() {
                                            if (validate_mobile() && validate_captcha()) {
                                                handleSendVerifiy();
                                            } else {
                                                $("#getVerification").one("click", innerFunc);
                                            }
                                        });
                                }
                            }, 1000 * i);
                        })(i);
                    }
                } else {
                    $("#captchaImg").click();
                    $("#getVerification")
                        .one("click", function innerFunc() {
                            if (validate_mobile() && validate_captcha()) {
                                handleSendVerifiy();
                            } else {
                                $("#getVerification").one("click", innerFunc);
                            }
                        });
                    showMsg(response.msg);
                }
            });
        }

        function validate_verification() {
            var elem = $("#verification")[0],
                parent = elem.parentNode,
                span;
            if (elem.value == "") {
                span = $(parent).find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            } else if (!/^[\d]{4}$/.test(elem.value)) {
                span = $(parent).find("span.warning")[1];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate_password() {
            var elem = $("#password")[0],
                parent = elem.parentNode,
                myreg = /^[^\s]{6,16}$/,
                span;
            if (elem.value == "") {
                span = $(parent).find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            } else if (!myreg.test(elem.value)) {
                span = $(parent).find("span.warning")[1];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function getTjr() {
            Ajax.get(APIURL + '/user/getHpsList', true)
                .then(function(res) {
                    if (res.success) {
                        var data = res.data;
                        for (var i = 0; i < data.length; i++) {
                            var d = data[i];
                            if (d.userReferee.trim() == "") {
                                toUser = d.userId;
                                break;
                            }
                        }
                    }
                });
        }

        function validate_mobile() {
            var $elem = $("#mobile"),
                $parent = $elem.parent(),
                span;
            if ($elem.val() == "") {
                span = $parent.find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            } else if (!/^1[3,4,5,7,8]\d{9}$/.test($elem.val())) {
                span = $parent.find("span.warning")[1];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate_captcha() {
            var $elem = $("#captcha"),
                $parent = $elem.parent(),
                span;
            if ($elem.val() == "") {
                span = $parent.find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            } else if (!/^[\d,a-z,A-Z]{4}$/.test($elem.val())) {
                span = $parent.find("span.warning")[1];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate_userReferee() {
            if ((userReferee == undefined || userReferee.trim() == "") &&
                (toUser == undefined || toUser.trim() == "")) {
                showMsg("推荐人不能为空！");
                return false;
            }
            return true;
        }

        function validate() {
            if (validate_mobile() && validate_verification() && validate_password() &&
                validate_captcha() && validate_userReferee()) {
                return true;
            }
            return false;
        }

        function finalRegister() {
            var param = {
                "mobile": $("#mobile").val(),
                "userReferee": userReferee || toUser,
                "loginPwd": $("#password").val(),
                "smsCaptcha": $("#verification").val()
            };
            Ajax.post(APIURL + '/user/reg', param)
                .then(function(response) {
                    if (response.success) {
                        var amount = 0;
                        if (amount = response.data.amount) {
                            showMsg("恭喜您注册成功<br/>获得积分+" + (+amount / 1000), 3000);
                            setTimeout(function() {
                                doLogin();
                            }, 1000);
                        } else {
                            showMsg("恭喜您注册成功！");
                            doLogin();
                        }
                    } else {
                        $("#captchaImg").click();
                        showMsg(response.msg);
                        $("#registerBtn").removeAttr("disabled").val("注册");
                    }
                });
        }

        function doLogin() {
            var param = {
                    loginName: $("#mobile").val(),
                    loginPwd: $("#password").val(),
                    terminalType: "1"
                },
                url = APIURL + "/user/login";
            Ajax.post(url, param)
                .then(function(res) {
                    if (res.success) {
                        sessionStorage.setItem("user", "1");
                        location.href = returnUrl || "./user_info.html";
                    } else {
                        sessionStorage.setItem("user", "0");
                        location.href = "./login.html?return=" + encodeURIComponent(returnUrl);
                    }
                })
        }

        function showMsg(msg, time) {
            var d = dialog({
                content: msg,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 2000);
        }

        function register() {
            if (validate()) {
                count = 1;
                $("#registerBtn").attr("disabled", "disabled").val("注册中...");
                finalRegister();
            }
        }
    });
});