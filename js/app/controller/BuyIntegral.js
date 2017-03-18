define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
	'app/util/dict'
], function (base, Ajax, dialog, dict) {
    $(function () {
    	var config = {
	        "amount": ""
	    }, AMOUNT, RATEKEY = dict.get("gmjfdh_rate"), RATE;
	    
	    initView();

	    function initView() {
			$.when( Ajax.get(APIURL + "/account/get", {"currency": "CNY"}, true),
			 		Ajax.get(APIURL + "/general/dict/key", {"key": RATEKEY}, true) 
			 )
			 .then(function(res1, res2){
				 res1 = res1[0];
				res2 = res2[0];
				if(res1.success && res2.success){
					var data = res1.data;
					AMOUNT = data.amount;
					$("#kyje").text("￥" + (+AMOUNT / 1000).toFixed(2));
					RATE = res2.data.value;
				}else{
					showMsg("账户信息获取失败！");
					$("#sbtn").attr("disabled", "disabled");
				}
			 });
	        addListeners();
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

	    function addListeners() {
			//购买积分输入框
	        $("#quality").on("keyup", function(e){
				var keyCode = e.charCode || e.keyCode;
				var me = $(this);
				if(!isSpecialCode(keyCode) && !isNumber(keyCode)){
					me.val(me.val().replace(/[^\d]/g, ""));
				}
				var newVal = me.val(),
					$amount = $("#amount");
				if(!newVal){
					$amount.empty();
				}else{
					$amount.text( (+newVal * RATE).toFixed(2) );
				}
			});
			//确认按钮
	        $("#sbtn").on("click", function () {
	            if(validate()){
					$("#integral").text($("#quality").val());
					$("#money").text("￥" + $("#amount").text());
	                $("#od-mask, #od-tipbox").removeClass("hidden");
	            }
	        });
			//提示框确认按钮
			$("#odOk").on("click", function(){
				buyIntegral();
			});
			//提示框取消按钮
			$("#odCel").on("click", function(){
				$("#od-mask, #od-tipbox").addClass("hidden");
			});
	    }
		
		function validate(){
			var quality = $("#quality").val(),	//	购买数量
				$amount = $("#amount"),
				amount = $amount.text();	//	所需金额
			
			if(!quality){
                showMsg("购买数量不能为空!");
				return false;
            }else if(!/^\d+$/gi.test(quality)){
                showMsg("购买数量必须为整数!");
				return false;
            }else if(+quality <= 0){
                showMsg("购买数量必须大于0!");
				return false;
            }
			amount = amount || (+quality * RATE).toFixed(2);
			$amount.text(amount);
			if(+amount * 1000 > AMOUNT){
				showMsg("可用余额不足!");
				return false;
			}
			config.amount = +quality * 1000;
			return true;
		}
	    //购买积分
	    function buyIntegral() {
			$("#loaddingIcon").removeClass("hidden");
	        Ajax.post(APIURL + "/account/buyIntegral", config)
	            .then(function (response) {
					$("#loaddingIcon").addClass("hidden");
					$("#od-mask, #od-tipbox").addClass("hidden");
	                if(response.success){
	                    showMsg("积分购买成功！");
	                    setTimeout(function(){
	                    	location.href = "../user/user_info.html";
	                    }, 1500);
	                }else{
	                    showMsg(response.msg);
	                    $("#sbtn").removeAttr("disabled").val("提交");
	                }
	            });
	    }
		//是否是数字
		function isNumber(code){
			if(code >= 48 && code <= 57 || code >= 96 && code <= 105){
				return true;
			}
			return false;
		}
		//左、右、backspace、delete
		function isSpecialCode(code) {
			if(code == 37 || code == 39 || code == 8 || code == 46){
				return true;
			}
			return false;
		}
    });
});