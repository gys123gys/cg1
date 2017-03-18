define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'lib/handlebars.runtime-v3.0.3'
], function (base, Ajax, dialog, Handlebars) {
    var money = base.getUrlParam("m") || "";
    initView();
    function initView(){
        if(money){
            $("#money").text( (+money / 1000).toFixed(2) + "元" );
        }else{
            showMsg("无法获取返现金额!");
        }
    }

    function showMsg(msg){
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function () {
            d.close().remove();
        }, 2000);
    }
});