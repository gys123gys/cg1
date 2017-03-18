define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
	'app/util/dict',
    'Handlebars'
], function (base, Ajax, dialog, dict, Handlebars) {
    $(function () {
    	var XNBAccount, CNYAccount;
    	if(sessionStorage.getItem("user") == "1"){
    		$("#cont").remove();
    		$(".hidden").removeClass("hidden");
			$("#telephone").text(dict.get("telephone"));
    		initView();
    	}
	    function initView() {
	        Ajax.get(APIURL + '/user', {})
	            .then(function (response) {
	                if (response.success) {
	                    var data = response.data;
	                    $("#mobile").text(data.mobile);
	                    sessionStorage.setItem("m", data.mobile);
	                } else {
	                	showMsg("暂时无法获取用户信息！");
	                }
	            });

	        Ajax.get(APIURL + "/account/infos/page", {"start": 0, "limit": 8}, true)
	            .then(function (response) {
	                if(response.success){
	                	if(response.data.list[0].currency == "CNY"){
	                		CNYAccount = response.data.list[0];
	                		XNBAccount = response.data.list[1];
	                	}else{
	                		CNYAccount = response.data.list[1];
	                		XNBAccount = response.data.list[0];
	                	}
	                    $("#amount").text((+XNBAccount.amount / 1000).toFixed(0));
	                    $("#mAmount").text((+CNYAccount.amount / 1000).toFixed(2));
	                }else{
	                    $("#amount").text("--");
	                    $("#mAmount").parent().text("--");
	                }
	            });

	        $("#fundList").on("click", function () {
	            location.href = "../account/fundDetails.html";
	        });
	        $("#mFundList").on("click", function () {
	            location.href = "../account/fundDetails.html?m=1";
	        });
			$("#fundBuy").on("click", function(){
				location.href = "./buy_integral.html";
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
    });
});