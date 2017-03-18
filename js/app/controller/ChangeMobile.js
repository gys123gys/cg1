define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function (base, Ajax, dialog) {
    $(function () {
    	initView();
	    function initView() {
            addListeners();
	    }

	    function addListeners(){
	    	$("#verification").on("change",validate_verification);
	    	$("#mobile").on("change", validate_mobile);
            $("#sbtn").on("click", function (e) {
                changeMobile();
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
            Ajax.post(APIURL + '/gene/changemobile/send',
                {
                    "mobile": $("#mobile").val()
                }).then(function (response) {
                    if (response.success) {
                        for (var i = 0; i <= 60; i++) {
                            (function (i) {
                                setTimeout(function () {
                                    if (i < 60) {
                                        $("#getVerification").text((60 - i) + "s");
                                    } else {
                                    	$("#getVerification").text("获取验证码").removeClass("cancel-send")
			                            	.one("click", function innerFunc(){
			                                	if(validate_mobile()){
			                                		handleSendVerifiy();
			                                	}else{
                                                    $("#getVerification").one("click", innerFunc);
                                                }
			                            	});
                                    }
                                }, 1000 * i);
                            })(i);
                        }
                    } else {
                    	$("#getVerification").one("click", function(){
                        	if(validate_mobile()){
                        		handleSendVerifiy();
                        	}else{
                                $("#getVerification").one("click", innerFunc);
                            }
                    	});
		            	var parent = $("#verification").parent();
	                    var span = parent.find("span.warning")[2];
	                    $(span).fadeIn(150).fadeOut(3000);
                    }
                });
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

	    function validate(){
            if(validate_mobile() && validate_verification()){
                return true;
            }
            return false;
        }
        function checkMobile (){
            Ajax.post(APIURL + '/user/mobile/check',
                {"loginName": $("#mobile").val()})
                .then(function (response) {
                    if (response.success) {
                        finalChangeMobile();
                    } else {
                    	var parent = $("#mobile").parent();
                    	var span = parent.find("span.warning")[2];
	                    $(span).fadeIn(150).fadeOut(3000);
                        
                    }
                });
        }
        function doSuccess(){
        	$("#sbtn").text("设置");
	        showMsg("恭喜您，手机号修改成功！");
	        setTimeout(function(){
	        	location.href = './user_info.html';
	        }, 1000);
        }
        function finalChangeMobile() {
        	$("#sbtn").attr("disabled", "disabled").text("设置中...");
            var param = {
                "newMobile": $("#mobile").val(),
                "tradePwd": $("#password").val(),
                "smsCaptcha": $("#verification").val()
            };
            Ajax.post(APIURL + '/user/mobile/change', param)
                .then(function (response) {
                    if (response.success) {
                        doSuccess();
                    } else {
                    	$("#sbtn").removeAttr("disabled").text("设置");
	                    showMsg(response.msg);
                    }
                });
        }
        function changeMobile(){
            if(validate()){
                checkMobile();
            }
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
	});
});