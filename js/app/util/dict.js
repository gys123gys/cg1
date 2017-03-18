define([
    'app/controller/base',
    'app/util/ajax'
], function(base, ajax) {
    var dict = {
        receiptType: {
            "1": "个人",
            "2": "企业"
        },
        fastMail: {
            "EMS": "邮政EMS",
            "STO": "申通快递",
            "ZTO": "中通快递",
            "YTO": "圆通快递",
            "HTKY": "汇通快递",
            "ZJS": "宅急送",
            "SF": "顺丰快递",
            "TTKD": "天天快递"
        },
        fundType: {
            "5": "首次登录送积分",
            "11": "充值",
            "-11": "取现",
            "19": "蓝补",
            "-19": "红冲",
            "-110": "取现冻结",
            "-111": "取现解冻",
            "21": "注册送积分",
            "-21": "注册扣积分",
            "12": "卖货",
            "-12": "消费",
            "13": "退款返现",
            "-13": "退款扣款",
            '22': '活动送积分',
            '-22': '活动扣积分',
            "31": "购买加积分",
            "-31": "购买扣积分",
            "-32": "兑现扣积分",
            "32": "兑现加积分",
            "-33": "兑现冻结",
            "33": "兑现解冻",
            "41": "积分兑现",
            "-41": "购买积分",
            "42": "抵现加积分",
            "-42": "抵现扣积分",
            "43": "返现加钱",
            "-43": "返现扣钱"
        },
        orderStatus: {
            "1": "待支付",
            "2": "待发货",
            "20": "已取消",
            "3": "待收货",
            "30": "不发货取消订单",
            "4": "已收货",
            "5": "已结清",
            "6": "待退货审核",
            "7": "退货审核通过",
            "70": "退货审核不通过",
            "8": "已退款",
            "9": "已完成"
        },
        currencyUnit: {
            '': '',
            'USB': '$',
            'CNY': '￥',
            'XB': 'S$',
            'SGD': 'S$'
        },
        categoryId: {
            "CJ": "茶酒",
            "ZZJF": "针织家纺",
            "RYBH": "日用百货",
            "CFYP": "厨房用品",
            "XBPJ": "箱包皮具",
            "JYDQ": "家用电器",
            "TC": "陶瓷",
            "RH": "日化",
            "QCYP": "汽车用品",
            "QT": "其他"
        },
        indexTopImg: ['/static/images/ht1.jpg', '/static/images/ht2.jpg', '/static/images/ht3.jpg'],
        telephone: "400-0579-228",
        consumeType: {
            "1": "美食",
            "2": "KTV",
            "3": "电影",
            "4": "酒店",
            "5": "休闲娱乐",
            "6": "汽车",
            "7": "周边游",
            "8": "足疗按摩",
            "9": "生活服务",
            "10": "旅游"
        },
        gmjfdh_rate: "GMJFDH_RATE",
        sjxffx_rate: "SJXFFX_RATE"
    };

    var changeToObj = function(data) {
        var data = data || [],
            obj = {};
        data.forEach(function(item) {
            obj[item.dkey] = item.dvalue;
        });
        return obj;
    };

    return {
        get: function(code) {
            return dict[code];
        }
    }
});