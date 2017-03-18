define([
	'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function (base, Ajax, dialog) {
	$(function(){
		var integralCode = base.getUrlParam("i");
		var config = {"integralCode": integralCode};
		Ajax.get(APIURL + "/operators/integral/recharge", config, true)
			.then(function(res){
				$("#cont").remove();
				if(res.success){
					if(res.data.status == "0"){
						$("#content1").removeClass("hidden");
					}else{
						$("#content").removeClass("hidden");
					}
				}else{
					showMsg(res.msg);
				}
			});
		
		function showMsg(msg){
			var content = "<div class='tc'>非常遗憾，积分充值失败！<br/>页面将在3秒后跳到菜狗商城首页。</div>";
			if(msg.indexOf("登录后") != -1){
				content = msg;
				var d = dialog({
					content: content,
					quickClose: true
				});
				d.show();
				setTimeout(function () {
					d.close().remove();
				}, 2000);
				setTimeout(function(){
					location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
				}, 2000);
			}else{
				var d = dialog({
					content: content,
					quickClose: true
				});
				d.show();
				setTimeout(function () {
					d.close().remove();
				}, 2000);
				setTimeout(function(){
					location.href = "../home/index.html";
				}, 3000);
			}
		}
	});
});