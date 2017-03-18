define([
    'app/controller/base',
    'app/util/dialog'
], function (base, dialog) {
    $(function () {
        init();
        
        function init(){
            addListeners();
        }
        
        function addListeners(){
            /*var clipboard = new Clipboard('#copy');
            clipboard.on('success', function(e) {    
                showMsg("复制成功!");
                e.clearSelection();    
            });
            clipboard.on('error', function(e) {
            	showMsg("非常抱歉，账号复制失败!");
            });*/
        }

        function showMsg(cont){
            var d = dialog({
                        content: cont,
                        quickClose: true
                    });
            d.show();
            setTimeout(function () {
                d.close().remove();
            }, 1500);
        }
    });
});
