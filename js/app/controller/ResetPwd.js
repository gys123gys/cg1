define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function (base, Ajax, dialog) {
    $(function () {
    	initView();

	    function initView() {
	        $("#origPassword").on("change",validate_origPassword)
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

	    }
	    function valide() {
	        if(validate_origPassword() && validate_password() && validate_repassword()){
	            resetPassword();
	        }
	    }
	    function resetPassword() {
	        $("#sbtn").attr("disabled", "disabled").text("设置中...");
	        Ajax.post(APIURL + '/user/loginpwd/reset',
	            {
	                "oldLoginPwd": $("#origPassword").val(),
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
	    function doSuccess(){
	    	sessionStorage.setItem("user", "0");
	    	$("#sbtn").text("设置");
	        showMsg("登录密码修改成功!");
	        sessionStorage.setItem("user", "0");
	        setTimeout(function(){
	        	location.href = './login.html';
	        }, 1000);
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
	    function validate_origPassword(){
	        var elem = $("#origPassword")[0],
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
});