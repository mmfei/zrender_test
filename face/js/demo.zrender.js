/**
 * Created by ChenCen on 2017/12/20
 */
 
 
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('viewer', ['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})(function ($) {
    'use strict';
 
    var $window = $(window);
    var $document = $(document);
 
    // Constants
    var NAMESPACE = 'dircard';
    var ELEMENT_VIEWER = document.createElement(NAMESPACE);
 
    function isUndefined(u) {
        return typeof u === 'undefined';
    }
    function isNumber(n) {
        return typeof n === 'number' && !isNaN(n);
    }
    function isString(s) {
        return typeof s === 'string';
    }
    function toArray(obj, offset) {
        var args = [];
        if (isNumber(offset)) { // It's necessary for IE8
            args.push(offset);
        }
        return args.slice.apply(obj, args);
    }
 
    //globle
    var stroke="#C0D0E0";
 
    function dirCard(element, options) {
        this.element=element;
        this.$element = $(element);
        this.options =$.extend({}, dirCard.DEFAULTS, options);
        this.zr = zrender.init(this.element);
        this.w= this.zr.getWidth();
        this.h = this.zr.getHeight();
 
        this.disLeft=0.1;
        this.disTop=0.1;
        this.disBottom=0.1;
        this.disRight=0.05;
 
        this.zrEleArray=[];
        this.preZrEle='';
        this.originLinearColor='';
 
        this.init();
    }
 
    dirCard.DEFAULTS={
        data:[],
        wellSec:'段',
        //展示的列
        showCol:'',
        //柱颜色
        barColor:['#48c15e','#dff0d8'],
        //选中颜色
        checkColor:['#ff5454','#FF8053'],
        //背景色
        backgroundColor:'#fff',
        //绘制完成后的回调函数
        rowAfter:false
    };
 
    dirCard.prototype = {
        constructor: dirCard,
        //初始化
        init: function () {
            var options = this.options;
            var beginSec, endSec, length;
            var sec = [options.wellSec];
            var minData, maxData, i;
            var data = options.data;
            var showCol = options.showCol;
 
            this.length = length = data.length;
            if (!length || length == 0 || (!data[0][sec]))
                return;
            if (!data[0][showCol]) {
                console.log('provide the wrong clunmn name!');
                return
            }
            if ((data[0][sec]).split('-').length == 2) {
                this.split = "-";
                beginSec = (data[0][sec]).split('-')[0];
                endSec = (data[length - 1][sec]).split('-')[1];
 
            }
            else if ((data[0][sec]).split('~').length == 2) {
                this.split = "~";
                beginSec = (data[0][sec]).split('~')[0];
                endSec = (data[length - 1][sec]).split('~')[1];
            }
            if (beginSec && Number(beginSec) < Number(endSec)) {
                this.beginSec = Number(beginSec);
                this.endSec = Number(endSec);
                minData = Number(data[0][showCol]);
                maxData = Number(data[0][showCol]);
                for (i = 1; i < length; i++) {
                    if (minData > Number(data[i][showCol]))
                        minData = Number(data[i][showCol]);
                    if (maxData < Number(data[i][showCol]))
                        maxData = Number(data[i][showCol]);
                }
                this.maxData = maxData;
                this.minData = minData;
 
                console.log('max:' + this.beginSec + ' min:' + this.endSec);
                this.drawBG();
 
                if(maxData==0&&maxData==0)
                {
                    console.log('all the value is zero');
                }
                else if(maxData<0||minData<0)
                {
                    console.log('not handle this');
                }
                else
                {
                    this.drawEle();
                }
 
                // callBack after draw
                if (options.rowAfter) {
                    options.rowAfter();
                }
            }
            else {
                console.log('there must be something wrong！');
            }
        },
 
        //draw background
        drawBG: function () {
            var zr = this.zr;
            var w = this.w;
            var h = this.h;
            var showCol = this.options.showCol;
            var backgroundColor=this.options.backgroundColor;
 
            var disLeft=this.disLeft*w;
            var disRight=this.disRight*w;
            var disTop=this.disTop*h;
            var disBottom=this.disBottom*h;
            var i;
            var dis=this.dis=((this.endSec-this.beginSec)/4).toFixed(0);
            var wRadio=(w-disLeft-disRight)/(this.endSec-this.beginSec);
 
            console.log(dis);
 
            var bg = new zrender.Rect({
                shape: {
                    cx: 0,
                    cy: 0,
                    width: w,
                    height: h
                },
 
                style: {
                    fill:backgroundColor
                }
                /*zlevel: -1*/
            });
            zr.add(bg);
            var roundRect = new zrender.Rect({
                shape: {
                    cx: 0,
                    cy: 0,
                    width: 0.98*w,
                    height:0.98*h
                },
                style: {
                    stroke:stroke,
                    fill:'#fff',
                },
                position: [0.01*w,0.01*h]
 
            });
            zr.add(roundRect);
            //axis
            var xline =new zrender.Line({
                shape: {
                    x1:disLeft,
                    y1:h-disTop,
                    x2:disLeft+wRadio*(4*dis),
                    y2:h-disTop
                },
                style: {
                    stroke:stroke
                }
            });
            var yline =new zrender.Line({
                shape: {
                    x1:disLeft,
                    y1:disTop,
                    x2:disLeft,
                    y2:h-disTop
                },
                style: {
                    stroke:stroke
                }
            });
            zr.add(xline);
            zr.add(yline);
            for(i=0;i<5;i++)
            {
                var smline =new zrender.Line({
                    shape: {
                        x1:0,
                        y1:0,
                        x2:0,
                        y2:0.02*h
                    },
                    style: {
                        stroke:stroke
                    },
                    position: [disLeft+wRadio*(i*dis), h-disBottom]
                });
                var smText = new zrender.Text({
                    style: {
                        stroke: '#434348',
                        text:this.beginSec+(i*dis),
                        fontSize: '11',
                        textAlign:'center'
                    },
                    position: [disLeft+wRadio*(i*dis), h-disBottom+0.03*h]
                });
                zr.add(smline);
                zr.add(smText);
            }
 
        },
 
        //draw all ele
        drawEle: function () {
            var self = this;
            var options = this.options;
            var showCol = options.showCol;
            var sec=options.wellSec;
            var color=options.barColor;
            var zr = this.zr;
            var w = this.w;
            var h = this.h;
 
            var disLeft=this.disLeft*w;
            var disRight=this.disRight*w;
            var disTop=this.disTop*h;
            var disBottom=this.disBottom*h;
            var i;
            var wRadio=(w-disLeft-disRight)/(this.endSec-this.beginSec);
            var hRadio=(h-disTop-disBottom)/(this.maxData-this.minData);
 
            for (i = 0; i < this.length; i++) {
                var barValue=Number(options.data[i][showCol]);
                var bg = (options.data[i][sec]).split(this.split)[0];
                bg = Number(bg);
                var ed = (options.data[i][sec]).split(this.split)[1];
                ed = Number(ed);
 
                this.originLinearColor = new zrender.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: color[0]
                    },
                    {
                        offset: 1,
                        color: color[1]
                    }
                ]);
                var zrEle = new zrender.Rect({
                    shape: {
                        cx: 0,
                        cy: 0,
                        width: wRadio * (ed - bg),
                        height:0
                    },
                    style: {
                        fill: this.originLinearColor
                    },
                    position: [disLeft+wRadio*(bg-this.beginSec),h-disBottom]
                    // silent: true  不响应鼠标事件
                });
 
                zrEle.rowIndex=i;
                //bind click event
                self.clickEle(zrEle);
 
                zrEle.animateTo({
                    shape: {
                        cx: 0,
                        cy: 0,
                        width: wRadio * (ed - bg),
                        height:hRadio*(barValue-this.minData)
                    },
                    position: [disLeft+wRadio*(bg-this.beginSec),h-disBottom-hRadio*(barValue-this.minData)]
                }, 500, i * 100, 'linear');
                zr.add(zrEle);
 
                this.zrEleArray.push(zrEle);
            }
        },
 
        //click and change style for one ele
        activeEle: function (index) {
            var zr = this.zr;
            var options=this.options;
            var showCol = options.showCol;
            var sec=options.wellSec;
            var checkColor = options.checkColor;
            var w = this.w;
            var h = this.h;
 
            var disLeft=this.disLeft*w;
            var disRight=this.disRight*w;
            var disTop=this.disTop*h;
            var disBottom=this.disBottom*h;
            var wRadio=(w-disLeft-disRight)/(this.endSec-this.beginSec);
            var hRadio=(h-disTop-disBottom)/(this.maxData-this.minData);
 
            var barValue=Number(options.data[index][showCol]);
            var bg = (options.data[index][sec]).split(this.split)[0];
            bg = Number(bg);
            var ed = (options.data[index][sec]).split(this.split)[1];
            ed = Number(ed);
 
            if (index < this.length) {
                //恢复移除部分
                if (this.preZrEle) {
                    this.preZrEle.attr({
                        style: {
                            stroke: null,
                            lineWidth:0,
                            fill: this.originLinearColor
                        }
                    });
                }
                if(this.tipLine)
                {
                    zr.remove(this.tipLine);
                }
                if(this.tipText)
                {
                    zr.remove(this.tipText);
                }
                //改变添加部分
                var checkZr = this.zrEleArray[index];
                if (checkZr) {
                    this.preZrEle = checkZr;
                    //设置元素属性
                    checkZr.attr({
                        style: {
                           /* stroke: '#FF5454',*/
                            lineWidth:4,
                            fill: new zrender.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: checkColor[0]
                                },
                                {
                                    offset: 1,
                                    color: checkColor[1]
                                }
                            ])
                        }
                    });
                    //提示虚线
                    var tipLine = new zrender.Line({
                        shape: {
                            x1:disLeft,
                            y1:h-disBottom-hRadio*(barValue-this.minData),
                            x2:disLeft+wRadio*(ed-this.beginSec),
                            y2:h-disBottom-hRadio*(barValue-this.minData),
                            percent:0
                        },
                        style: {
                            stroke:'#434348',
                            lineDash:[5,5]
                        }
                    });
                    tipLine.animate('shape', false)
                        .when(500, {
                            percent: 1
                        }).start();
                    zr.add(tipLine);
                    this.tipLine=tipLine;
 
                    //提示文字
                    var tipText = new zrender.Text({
                        style: {
                            stroke: '#434348',
                            text:barValue,
                            fontSize: '10'
                        },
                        position: [disLeft+wRadio*(ed-this.beginSec),h-disBottom-hRadio*(barValue-this.minData)]
                    });
                    zr.add(tipText);
                    this.tipText=tipText;
 
                }
            }
            else {
                console.log('该索引下没有zrender元素');
            }
        },
 
        clickEle:function(zrEle){
            var self=this;
            zrEle.on('click',function(){
                var rowIndex=zrEle.rowIndex;
                self.activeEle(rowIndex);
            });
        },
 
        //销毁实例
        dispose:function(){
            var zr = this.zr;
            zrender.dispose(zr);
            //移除反向绑定
            this.$element.removeData(NAMESPACE);
        }
    };
    // Register as jQuery plugin
    $.fn.dirCard = function (options) {
        var args = toArray(arguments, 1);
        var result;
 
        this.each(function () {
            //console.log(this);
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var fn;
 
            if (!data) {
                $this.data(NAMESPACE, (data = new dirCard(this, options)));
            }
 
            if (isString(options) && $.isFunction(fn = data[options])) {
                result = fn.apply(data, args);
            }
        });
        return isUndefined(result) ? this : result;
    };
 
});