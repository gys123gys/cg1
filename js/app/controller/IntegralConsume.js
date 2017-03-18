define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dialog',
    'lib/handlebars.runtime-v3.0.3'
], function (base, Ajax, dialog, Handlebars) {
    var code = base.getUrlParam("c") || "",
        name = base.getUrlParam("n");
    
    initView();

    function initView(){
        if(code){
            if(name){
                $("#name").text(name);
                $("#loaddingIcon").addClass('hidden');
                addListeners();
            }else{
                business();
            }
        }else{
            showMsg("未传入商家编号!");
        }
    }
    //根据code搜索商家信息
    function business(){
        Ajax.post(APIURL + '/commodity/business', {code: code})
            .then(function (response) {
                $("#cont").remove();
                $("#loaddingIcon").addClass('hidden');
                if (response.success) {
                    var data = response.data;
                    $("#name").text(data.name);                    
                    addListeners();
                }else{
                    showMsg("无法获取商家信息!");
                }
            });
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
    function addListeners() {
        //积分数量输入框
        $("#amount").on("keyup", function (e) {
            var keyCode = e.charCode || e.keyCode;
            var me = $(this);
            if(!isSpecialCode(keyCode) && !isNumber(keyCode)){
                me.val(me.val().replace(/[^\d]/g, ""));
            }
        });
        //确认按钮
        $("#sbtn").on("click", function(){
            var aVal = $("#amount").val();
            if(!aVal){
                showMsg("消费积分不能为空!");
            }else if(!/^\d+$/gi.test(aVal)){
                showMsg("消费积分必须为整数!");
            }else if(+aVal <= 0){
                showMsg("消费积分必须大于0!");
            }else{
                $("#integral").text(aVal);                
                $("#od-mask, #od-tipbox").removeClass("hidden");
            }
        });
        //提示框确认按钮
        $("#odOk").on("click", function(){
            integralConsume();
        });
        //提示框取消按钮
        $("#odCel").on("click", function(){
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
    }
    //消费积分
    function integralConsume(){
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post(APIURL + "/account/integral/consume", {
            toMerchant: code,
            amount: +$("#amount").val() * 1000
        }).then(function (response) {
                $("#loaddingIcon").addClass("hidden");
                $("#od-mask, #od-tipbox").addClass("hidden");
                if (response.success) {
                    location.href = "./consume_success.html?m=" + response.data;
                }else if(response.timeout){
                    location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
                }else{
                    showMsg(response.msg);
                    setTimeout(function(){
                        location.href = "../user/user_info.html";
                    }, 2000);
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