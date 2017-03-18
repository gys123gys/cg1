define([
    'app/controller/base',
    'app/util/ajax',
    'Handlebars'
], function (base, Ajax, Handlebars) {
    $(function () {
		var url = APIURL + "";
        function initView(){
			addListeners();
		}
    	function addListeners(){
    		$("#sbtn").on("click", function(){

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