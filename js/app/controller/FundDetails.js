define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'app/util/dict',
    'Handlebars'
], function (base, Ajax, dialog, Dict, Handlebars) {
    $(function () {
    	var config = {
		        "dateStart": "",
		        "dateEnd": "",
		        "start": 1,
		        "limit": 15,
		        "bizType": "",
		        "accountNumber": ""
		    }, first = true, isEnd = false, canScrolling = true, unit = "积分",
		    fundType = Dict.get("fundType"), m = base.getUrlParam("m") || "", precision = 0;

		initView();

	    function initView() {
			if(m){
				document.title = "资金明细";
				var $iframe = $('<iframe src="/static/images/favicon.ico"></iframe>');
				$iframe.on('load',function() {
					setTimeout(function() {
						$iframe.off('load').remove();
					}, 0);
				}).appendTo($("body"));
			}
	        Ajax.get(APIURL + "/account/infos/page", {"start": 0, "limit": 8}, true)
	            .then(function (response) {
	                if(response.success){
	                	var list1 = response.data.list[0], list2 = response.data.list[1];
	                	//人民币
	                	if(m){
	                		unit = "元";
							precision = 2;
	                		config.accountNumber = list1.currency == "CNY" ? list1.accountNumber : list2.accountNumber;
	                	}else{
	                		config.accountNumber = list1.currency == "CNY" ? list2.accountNumber : list1.accountNumber;
	                	}
	                    queryFundDetails();
	                    addListeners();
	                }else{
	                	doError();
	                }
	            });
	    }

	    function doError(msg) {
            $("#fd-ul").html('<li class="bg_fff" style="text-align: center;line-height: 93px;">'+(msg ? msg : "暂时无法查到数据!")+'</li>');
        }

	    function queryFundDetails(){
	    	if(!first){
	    		addLoading();
	    	}
	        var url = APIURL + "/account/detail/page";
	        Ajax.get(url, config, true)
	            .then(function (response) {
	                if(response.success){
	                    var data = response.data,
	                        list = data.list,
	                        totalCount = +data.totalCount;
	                    if(totalCount < config.limit || list.length < config.limit){
	                    	isEnd = true;
	                    }
	                    if(list.length){
	                        var html = "";
	                        list.forEach(function (ll) {
	                        	var flag = +ll.transAmount >= 0 ? true : false,
	                        		t_class = flag && "t_f64444" || "t_21b504",
	                        		prev_f = flag && "+" || "",
	                        		bType = ll.bizType, bName = "";
	                        	
	                        	if(bType == "21" || bType == "22"){
	                        		bName = ll.remark;
	                        	}else{
	                        		bName = fundType[ll.bizType] || "未知类型";
	                        	}
	                            html += '<li class="plr20 ptb20 b_bd_b clearfix lh15rem">' +
							                '<div class="wp60 fl s_10">' +
							                    '<p class="t_4d">'+bName+'</p>' +
							                    '<p class="s_09 t_999 pt10">'+getMyDate(ll.createDatetime)+'</p>' +
							                '</div>' +
							                '<div class="wp40 fl tr '+t_class+' s_10">' +
							                    '<span class="inline_block va-m pt1em">' + prev_f + (+ll.transAmount / 1000).toFixed(precision) + unit + '</span>' +
							                '</div>' +
							            '</li>';
	                        });
	                        if(first){
	                        	$("#fd-ul").html(html);
	                        }else {
	                        	removeLoading();
	                        	$("#fd-ul").append(html);
	                        }
	                        config.start += 1;
	                    }else{
	                    	if(first){
	                    		doError("暂无资金流水!");
	                    	}else{
	                    		removeLoading();
	                    	}
	                    }
	                }else{
	                    if(first){
                    		doError();
                    	}else{
                    		removeLoading();
                    	}
	                }
	                first = false;
	                canScrolling = true;
	            });
	    }

	    function addLoading() {
	        $("#fd-ul").append('<li class="scroll-loadding"></li>');
	    }
	    function removeLoading(){
	    	$("#fd-ul").find(".scroll-loadding").remove();
	    }

	    function getMyDate(value) {
	        var date = new Date(value);
	        return get2(date.getFullYear()) + "-" + get2(date.getMonth() + 1) + "-" + get2(date.getDate()) + " " +
	            get2(date.getHours()) + ":" + get2(date.getMinutes()) + ":" + get2(date.getSeconds());
	    }

	    function get2(val) {
	        if(val < 10){
	            return "0" + val;
	        }else{
	            return val;
	        }
	    }

	    function addListeners() {
	        $(window).on("scroll", function(){
	        	var me = $(this);
	        	if( canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop()) ){
	        		canScrolling = false;
	        		queryFundDetails();
	        	}
	        });
	    }
    });
});