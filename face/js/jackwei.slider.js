;
(function($, window, document, undefined) {
    'use strict';
    var pluginName = "jackWeiSlider";
    var defaults = {
        width: '400px',
        handleSrc: 'http://www.jq22.com/demo/JackWeiSlider201808130834/img/slider_handle.png',
        progress: 0.3,
        isCustomText: false
    };

    function JackWeiSlider(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.isEnable = true;
        this.dcX = 0;
        this.barW = 0;
        this.currW = 0;
        this.haMarginL = -12;
        this.txMarginL = -40;
        this.isDrag = false;
        this.progress = 0;
        this.onStartDragCallback;
        this.onDragCallback;
        this.onStopDragCallback;
        this.maxW = parseInt(this.settings.width.split('px')[0]);
        this.isCustomText = this.settings.isCustomText;
        this.init();
    }
    JackWeiSlider.prototype = {
        init: function() {
            var that = this;
            var settings = that.settings;
            var $element = $(this.element);
            $element.append('<div style="width:' + settings.width + ';">\n' +
                '        <div class="jws-outside-bar">\n' +
                '            <div class="jws-inside-bar" style="background-color: ' + settings.color + '"></div>\n' +
                '            <img class="jws-handle" src=' + settings.handleSrc + '>\n' +
                '            <div class="jws-text"></div>\n' +
                '        </div>\n' +
                '    </div>');
            this.setProgress(settings.progress);
            $(document).on('mousedown', '.jws-handle', function(e) {
                if (!that.isEnable) return;
                that.isDrag = true;
                that.dcX = e.clientX;
                if (typeof that.onStartDragCallback === 'function')
                    that.onStartDragCallback();
                e.preventDefault();
            });
            $(document).mousemove(function(e) {
                if (!that.isDrag) return;
                e.preventDefault();
                that.move(e.clientX - that.dcX);
                if (typeof that.onDragCallback === 'function')
                    that.onDragCallback(that.progress);
            });
            $(document).mouseup(function(e) {
                if (!that.isDrag) return;
                that.isDrag = false;
                that.updateData(that);
                if (typeof that.onStopDragCallback === 'function')
                    that.onStopDragCallback();
            });
        },
        enable: function() {
            this.isEnable = true;
            return this;
        },
        disEnable: function() {
            this.isEnable = false;
            return this;
        },
        setText: function(text) {
            $(this.element).find('.jws-text').text(text);
            this.isCustomText = true;
            return this;
        },
        updateData: function() {
            var $element = $(this.element);
            this.currW = this.barW = parseInt($element.find('.jws-inside-bar').css('width').split("px")[0]);
            this.haMarginL = parseInt($element.find('.jws-handle').css('margin-left').split("px")[0]);
            this.txMarginL = parseInt($element.find('.jws-text').css('margin-left').split("px")[0]);
        },
        move: function(offset) {
            var w = Math.round(this.barW + offset);
            var hml = Math.round(this.haMarginL + offset);
            var tml = Math.round(this.txMarginL + offset);
            console.log('w:' + w + ' hml:' + hml + ' tml:' + tml);
            if (w < 0 || hml < -12 || tml < -40) return;
            if (w > this.maxW || hml > -12 + this.maxW || tml > -40 + this.maxW) return;
            this.progress = w / this.maxW;
            var $element = $(this.element);
            $element.find('.jws-inside-bar').css('width', w);
            $element.find('.jws-handle').css('margin-left', hml);
            $element.find('.jws-text').css('margin-left', tml);
            if (!this.isCustomText)
                $element.find('.jws-text').text(Math.round(this.progress * 100) + "%");
        },
        setProgress: function(progress) {
            var offset = progress * this.maxW - this.currW;
            this.move(offset, this);
            this.updateData(this);
            return this;
        },
        setOnStartDragCallback: function(callback) {
            this.onStartDragCallback = callback;
            return this;
        },
        setOnDragCallback: function(callback) {
            this.onDragCallback = callback;
            return this;
        },
        setOnStopDragCallback: function(callback) {
            this.onStopDragCallback = callback;
            return this;
        }
    }
    $.fn.jackWeiSlider = function(options) {
        return new JackWeiSlider(this, options);
    }
})(jQuery, window, document);