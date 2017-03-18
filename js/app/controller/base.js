define(['app/util/common', 'app/util/ajax'], function(common, Ajax) {

    //FastClick.attach(document.body);

    // element disabled
    $.fn.disable = function() {
        this.addClass('disabled');
        this[0].disabled = true;
    };

    $.fn.enable = function() {
        this.removeClass('disabled');
        this[0].disabled = false;
    };

    $.fn.tap = function(callback) {
        this.addClass('btn_press');
        this.on('click', function() {
            callback(this);
        });
    };

    // setData
    $.fn.setData = function(data) {
        var data = data || {};
        for (var k in data) {
            $('[data-name=' + k + ']', this).html(data[k]);
        }
    };

    if (Number.prototype.toFixed) {
        var ori_toFixed = Number.prototype.toFixed;
        Number.prototype.toFixed = function() {
            var num = ori_toFixed.apply(this, arguments);
            if (num == 0 && num.indexOf('-') == 0) { // -0 and 0
                num = num.slice(1);
            }
            return num;
        }
    }

    String.prototype.temp = function(obj) {
        return this.replace(/\$\w+\$/gi, function(matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return (returns + "") == "undefined" ? "" : returns;
        });
    };

    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function() {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };
    var Base = {
        staticUrl: requirejs.staticUrl,
        back: window.history.back,
        loadAllTpl: '<div class="all-bar tc bg_fff ptb4"><span class="sr-only">已加载全部</span></div>',
        loadingTpl: '<div class="loading-bar tc"><i class="fa fa-spinner fa-spin fa-3x fa-fw margin-bottom"></i><span class="sr-only">努力加载中...</span></div>',
        loadEmptyTpl: '<div class="flex flex-c flex-dv t_bd hp100"><i class="s_50 fa fa-calendar-o" aria-hidden="true"></i><span class="mt10">暂无相关数据</span></div>',
        loading100Tpl: '<div class="flex flex-c flex-dv hp100 loading-bar"><img src="' + requirejs.staticUrl + '/images/pull.gif"/><span class="sr-only">努力加载中...</span></div>',
        // simple encrypt information with ***
        encodeInfo: function(info, headCount, tailCount, space) {
            headCount = headCount || 0;
            tailCount = tailCount || 0;
            info = info.trim();
            var header = info.slice(0, headCount),
                len = info.length,
                tailer = info.slice(len - tailCount),
                mask = '**************************************************', // allow this length
                maskLen = len - headCount - tailCount;
            if (space) {
                mask = '**** **** **** **** **** **** **** **** **** **** **** ****';
            }
            return maskLen > 0 ? (header + mask.substring(0, maskLen + (space ? maskLen / 4 : 0)) + (space ? ' ' : '') + tailer) : info;
        },
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        fmoney: function(s, n) {
            if (typeof s == 'undefined') {
                return '0.00';
            }
            n = n > 0 && n <= 20 ? n : 0;
            s = +((s / 1000).toFixed(n));
            var unit = '';
            if (('' + s).split('.')[0].length >= 5) {
                s = +((s / 10000).toFixed(n));
                unit = '万';
            }

            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
                r = s.split(".")[1] || '';
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            return t.split("").reverse().join("") + (n == 0 ? "" : ("." + r)) + unit;
        },
        getUser: function(flag) {
            return Ajax.get(APIURL + '/user');
        },
        throttle: function(method, context, t) {
            var tt = t || 100;
            clearTimeout(method.tId);
            method.tId = setTimeout(function() {
                method.call(context);
            }, tt)
        },
        //获取地址json
        getAddress: function() {
            var addr = localStorage.getItem("addr");
            if (addr) {
                var defer = jQuery.Deferred();
                addr = $.parseJSON(addr);
                if (!addr.citylist) {
                    addr = $.parseJSON(addr);
                }
                defer.resolve(addr);
                return defer.promise();
            } else {
                return Ajax.get("/static/js/lib/city.min.json")
                    .then(function(res) {
                        if (res.citylist) {
                            localStorage.setItem("addr", JSON.stringify(res));
                            return res;
                        }
                        localStorage.setItem("addr", JSON.stringify(res));
                        return $.parseJSON(res);
                    });
            }
        },
        defaultBg: "data:image/png;base64,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"
    };
    var pathname = location.pathname;
    if ((pathname.indexOf("/user/") != -1 &&
            (pathname.indexOf("/user/login.html") == -1 && pathname.indexOf("/user/register.html") == -1 &&
                pathname.indexOf("/user/findPwd.html") == -1)) ||
        pathname.indexOf("/account") != -1 ||
        (pathname.indexOf("/operator/") != -1 && pathname.indexOf("/operator/buy.html") == -1)) {
        if (sessionStorage.getItem("user") == "0") {
            location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
            sessionStorage.setItem("trade", "0");
        } else if (sessionStorage.getItem("user") == undefined) {
            Base.getUser().then(function(response) {
                if (!response.success) {
                    sessionStorage.setItem("user", "0");
                    sessionStorage.setItem("trade", "0");
                    location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
                } else {
                    var data = response.data;
                    sessionStorage.setItem("user", "1");
                    location.reload(true);
                }
            });
        }
    }
    return Base;
});