define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'Handlebars'
], function (base, Ajax, dialog, Handlebars) {
    $(function () {
    	var url = APIURL + '/user/queryAddresses',
                config = {
                    "isDefault": ""
                },
            code = base.getUrlParam("c"),
            returnUrl = base.getUrlParam("return"),
            contentTmpl = __inline("../ui/address-items.handlebars");
            Ajax.get(url, config)
                .then(function(response){
                	$("#cont").remove();
                    if(response.success){
                        var data = response.data,
                            html = "";
                        if(data.length){
                        	var html = contentTmpl({items: data});
	                    	$("#addressDiv").append(html);
	                    	$("#addressDiv").find("a[code="+code+"] .radio-tip").addClass("active");
	                    	$("footer").removeClass("hidden");
                        }else{
                            doError("#addressDiv", 1);
                        }
                    }else{
                    	doError("#addressDiv");
                    }
                });
        $("#addressDiv").on("click", "a", function(){
            var me = $(this);
            $("#loaddingIcon").removeClass("hidden");
			var config = {
                "addressee": me.find(".a-addressee").text(),
                "mobile": me.find(".a-mobile").text(),
                "province": me.find(".a-province").text(),
                "city": me.find(".a-city").text(),
                "district": me.find(".a-district").text(),
                "detailAddress": me.find(".a-detailAddress").text(),
                "isDefault": "1",
                "code": me.attr("code")
            };
            Ajax.post(APIURL + "/user/edit/address", config)
                .then(function (response) {
                    if(response.success){
                        location.href = returnUrl;
                    }else{
                        $("#loaddingIcon").addClass("hidden");
                    }
                });
        });
        
        $("#addressDiv").on("touchstart", ".addr_div", function(e){
        	e.stopPropagation();
        	var touches = e.originalEvent.targetTouches[0],
        		me = $(this);
        	var left = me.offset().left;
        	me.data("x",touches.clientX);
        	me.data("offsetLeft", left);
        });
        $("#addressDiv").on("touchmove", ".addr_div", function(e){
        	e.stopPropagation();
        	var touches =  e.originalEvent.changedTouches[0],
        		me = $(this),
	            ex = touches.clientX,
	            xx = parseInt(me.data("x")) - ex,
        	    left = me.data("offsetLeft");
	        if( xx > 10 ){
	        	me.css({
	        		"transition": "none",
	        		"transform": "translate3d("+(-xx/2)+"px, 0px, 0px)"
	        	});
	        }else if(xx < -10){
	        	var left = me.data("offsetLeft");
	        	me.css({
	        		"transition": "none",
	        		"transform": "translate3d("+(left + (-xx/2))+"px, 0px, 0px)"
	        	});
	        }
        });
        $("#addressDiv").on("touchend", ".addr_div", function(e){
        	e.stopPropagation();
        	var me = $(this);
            var touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
        	if( xx > 56 ){
        		me.css({
	        		"transition": "-webkit-transform 0.2s ease-in",
	        		"transform": "translate3d(-56px, 0px, 0px)"
	        	});
            }else{
            	me.css({
	        		"transition": "-webkit-transform 0.2s ease-in",
	        		"transform": "translate3d(0px, 0px, 0px)"
	        	});
            }
        });
        var currentElem;
        $("#addressDiv").on("click", ".al_addr_del", function(e){
        	e.stopPropagation();
        	currentElem = $(this);
        	$("#od-mask, #od-tipbox").removeClass("hidden");
        });

        $("#sbtn").on("click", function(){
        	location.href = "./add_address.html?return=" + encodeURIComponent(returnUrl);
        });
        
        $("#odOk").on("click", function(){
        	deleteAddress();
        	$("#od-mask, #od-tipbox").addClass("hidden");
        })
        $("#odCel").on("click", function(){
        	$("#od-mask, #od-tipbox").addClass("hidden");
        })
        
        function deleteAddress(){
        	$("#loaddingIcon").removeClass("hidden");
			Ajax.post(APIURL + '/user/delete/address', {"code": currentElem.prev().find("a").attr("code")})
				.then(function (response) {
					$("#loaddingIcon").addClass("hidden");
				    if(response.success){
				    	var addrD = $("#addressDiv");
				    	if(addrD.children("div").length == 1){
				    		doError("#addressDiv", 1);
				    	}else{
				    		var $parent = currentElem.parent();
					    	
					    	if(currentElem.prev().find(".radio-tip.active").length){
					    		if(!$parent.index()){
					    			$parent.next().find(".radio-tip").addClass("active");
					    		}else{
					    			addrD.children("div:first").find(".radio-tip").addClass("active");
					    		}
					    	}
					    	$parent.remove();
				    	}
				    	showMsg('恭喜您，收货地址删除成功！');
					}else{
						showMsg('很遗憾，收货地址删除失败！');
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
        
        function doError(cc, flag) {
        	var msg = "暂时无法获取数据"
        	if(flag){
        		msg = "暂时没有收货地址";
        		$("footer").removeClass('hidden');
        	}
            $(cc).replaceWith('<div class="bg_fff" style="text-align: center;line-height: 150px;">'+msg+'</div>');
        }
    });
});