define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog'
], function (base, Ajax, dialog) {
    $(function () {
    	$("#loginOut").on("click", function(){
    		$("#loaddingIcon").removeClass("hidden");
    		Ajax.post(APIURL + "/user/logout")
    			.then(function(res){
    				$("#loaddingIcon").addClass("hidden");
    				if(res.success){
						sessionStorage.setItem("user", "0");
                        location.href = '../home/index.html';
                    }else{
                    	showMsg(res.msg);
                    }
    			});
    	});
    	
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