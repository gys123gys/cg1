define([
    'app/controller/base',
    'app/util/ajax',
    'Handlebars'
], function (base, Ajax, Handlebars) {
    $(function () {
		var url = APIURL + "";
		initView();
        function initView(){
			addListeners();
		}
    	function addListeners(){
    		$("#ol-ul").on("click", "li .th_btn", function(){
    			location.href="./refund.html";
				return false;
    		});
    	}

    	function addLoading(){

    	}
    	function noData(){
    		
    	}
        function doError() {
            $("#searchUl").html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂无数据</div>');
        }
    });
});