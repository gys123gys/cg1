define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function (base, Ajax, dialog) {
    $(function () {
    	initView();
	    function initView() {
	        $("#mobile").on("change", validate_mobile)
	        $("#verification").on("change", validate_verification);
	        $("#password").on("change", validate_password)
		        .on("focus", function(){
		            $(this).siblings(".register_verifycon")
			            .css({
			                "display": "block"
			            });
		        })
		        .on("blur", function(){
		            $(this).siblings(".register_verifycon")
			            .css({
			                "display": "none"
			            });
		        });
	        $("#repassword").on("change", validate_repassword)
		        .on("focus", function(){
		            $(this).siblings(".register_verifycon")
			            .css({
			                "display": "block"
			            });
		        })
		        .on("blur", function(){
		            $(this).siblings(".register_verifycon")
			            .css({
			                "display": "none"
			            });
		        });
	        $("#sbtn").on("click", function(){
	            valide();
	        });
	        $("#getVerification").one("click", function innerFunc(){
            	if(validate_mobile()){
            		handleSendVerifiy();
            	}else{
            		$("#getVerification").one("click", innerFunc);
            	}
            });
	    }
	    function handleSendVerifiy() {
	    	$("#getVerification").addClass("cancel-send");
	        Ajax.post(APIURL + '/gene/findloginpwd/send',
	            {
	                "mobile": $("#mobile").val()
	            }).then(function (response) {
		            if (response.success) {
		                for(var i = 0; i <= 60; i++){
		                    (function (i) {
		                        setTimeout(function(){
		                            if(i < 60){
		                                $("#getVerification").text((60 - i) + "s");
		                            }else{
		                            	$("#getVerification").text("获取验证码").removeClass("cancel-send")
			                            	.one("click", function(){
			                                	if(validate_mobile()){
			                                		handleSendVerifiy();
			                                	}
			                            	});
		                            }
		                        }, 1000*i);
		                    })(i);
		                }
		            } else {
		            	$("#getVerification").one("click", function(){
		                	if(validate_mobile()){
		                		handleSendVerifiy();
		                	}
		                });
		            	var parent = $("#verification").parent();
	                    var span = parent.find("span.warning")[2];
	                    $(span).fadeIn(150).fadeOut(3000);
		            }
		        });
	    }
	    function checkMobile (){
	        Ajax.post(APIURL + '/user/mobile/check',
	            {"loginName": $("#mobile").val()})
	            .then(function (response) {
	                var parent = $("#mobile").parent();
	                if (!response.success) {
	                    findPassword();
	                } else {
	                    var span = parent.find("span.warning")[2];
	                    $(span).fadeIn(150).fadeOut(3000);
	                }
	            });
	    }
	    function valide() {
	        if(validate_verification() && validate_mobile()
	            && validate_password() && validate_repassword()){
	            checkMobile();
	        }
	    }
	    function findPassword() {
	    	$("#sbtn").attr("disabled", "disabled").text("设置中...");
	        Ajax.post(APIURL + '/user/loginpwd/find',
	            {
	                "mobile": $("#mobile").val(),
	                "smsCaptcha": $("#verification").val(),
	                "newLoginPwd": $("#password").val()
	            })
	            .then(function (response) {
	                if (response.success) {
	                    doSuccess();
	                } else {
	                	$("#sbtn").removeAttr("disabled").text("设置");
	                    showMsg(response.msg);
	                }
	            });
	    }
	    function showMsg(cont){
    		var d = dialog({
						content: cont,
						quickClose: true
					});
			d.show();
			setTimeout(function () {
				d.close().remove();
			}, 2000);
    	}
	    function doSuccess(){
	        $("#sbtn").text("设置");
	        showMsg("恭喜您，密码设置成功！");
	        var returnUrl = base.getUrlParam("return"), url;
	        if(returnUrl){
	        	url = './login.html?return=' + encodeURIComponent(returnUrl);
	        }else{
	        	url = "./login.html";
	        }
	        setTimeout(function(){
	        	location.href = url;
	        }, 1000);
	    }
	    function validate_verification(){
	        var elem = $("#verification")[0],
	            parent = elem.parentNode,
	            span;
	        if(elem.value == ""){
	            span = $(parent).find("span.warning")[0];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }else if(!/^[\d]{4}$/.test(elem.value)){
	            span = $(parent).find("span.warning")[1];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }
	        return true;
	    }
	    function validate_mobile(){
	        var elem = $("#mobile")[0],
	            parent = elem.parentNode,
	            span;
	        if(elem.value == ""){
	            span = $(parent).find("span.warning")[0];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }else if(!/^1[3,4,5,7,8]\d{9}$/.test(elem.value)){
	            span = $(parent).find("span.warning")[1];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }
	        return true;
	    }
	    function validate_password(){
	        var elem = $("#password")[0],
	            parent = elem.parentNode,
	            myreg = /^[^\s]{6,16}$/,
	            span;
	        if(elem.value == ""){
	            span = $(parent).find("span.warning")[0];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }else if(!myreg.test(elem.value)){
	            span = $(parent).find("span.warning")[1];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }
	        return true;
	    }
	    function validate_repassword(){
	        var elem1 = $("#password")[0],
	            elem2 = $("#repassword")[0],
	            parent = elem2.parentNode,
	            span;
	        if(elem2.value == ""){
	            span = $(parent).find("span.warning")[0];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }else if(elem2.value !== elem1.value){
	            span = $(parent).find("span.warning")[1];
	            $(span).fadeIn(150).fadeOut(3000);
	            return false;
	        }
	        return true;
	    }
    });
})