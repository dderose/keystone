/* fed.js version 0.0.14: Front-End Development Framework. Copyright Constant Contact */+function() {
    "use strict";
    (function(o_o) {
        typeof define == "function" && define.amd ? define([ "jquery" ], o_o) : typeof exports == "object" ? o_o(require("jquery")) : o_o(jQuery);
    })(function($) {
        var Collapse = function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Collapse.DEFAULTS, options);
            this.transitioning = null;
            if (this.options.parent) this.$parent = $(this.options.parent);
            if (this.options.toggle) this.toggle();
        };
        Collapse.VERSION = "3.1.1";
        Collapse.DEFAULTS = {
            toggle: true
        };
        Collapse.prototype.dimension = function() {
            var hasWidth = this.$element.hasClass("width");
            return hasWidth ? "width" : "height";
        };
        Collapse.prototype.show = function() {
            if (this.transitioning || this.$element.hasClass("in")) return;
            var startEvent = $.Event("show.bs.collapse");
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented()) return;
            var actives = this.$parent && this.$parent.find("> .panel > .in");
            if (actives && actives.length) {
                var hasData = actives.data("bs.collapse");
                if (hasData && hasData.transitioning) return;
                Plugin.call(actives, "hide");
                hasData || actives.data("bs.collapse", null);
            }
            var dimension = this.dimension();
            this.$element.removeClass("collapse").addClass("collapsing")[dimension](0);
            this.transitioning = 1;
            var complete = function() {
                this.$element.removeClass("collapsing").addClass("collapse in")[dimension]("");
                this.transitioning = 0;
                this.$element.trigger("shown.bs.collapse");
            };
            if (!$.support.transition) return complete.call(this);
            var scrollSize = $.camelCase([ "scroll", dimension ].join("-"));
            this.$element.one("bsTransitionEnd", $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize]);
        };
        Collapse.prototype.hide = function() {
            if (this.transitioning || !this.$element.hasClass("in")) return;
            var startEvent = $.Event("hide.bs.collapse");
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented()) return;
            var dimension = this.dimension();
            this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
            this.$element.addClass("collapsing").removeClass("collapse").removeClass("in");
            this.transitioning = 1;
            var complete = function() {
                this.transitioning = 0;
                this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse");
            };
            if (!$.support.transition) return complete.call(this);
            this.$element[dimension](0).one("bsTransitionEnd", $.proxy(complete, this)).emulateTransitionEnd(350);
        };
        Collapse.prototype.toggle = function() {
            this[this.$element.hasClass("in") ? "hide" : "show"]();
        };
        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data("bs.collapse");
                var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == "object" && option);
                if (!data && options.toggle && option == "show") option = !option;
                if (!data) $this.data("bs.collapse", data = new Collapse(this, options));
                if (typeof option == "string") data[option]();
            });
        }
        var old = $.fn.collapse;
        $.fn.collapse = Plugin;
        $.fn.collapse.Constructor = Collapse;
        $.fn.collapse.noConflict = function() {
            $.fn.collapse = old;
            return this;
        };
        $(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function(e) {
            var href;
            var $this = $(this);
            var target = $this.attr("data-target") || e.preventDefault() || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "");
            var $target = $(target);
            var data = $target.data("bs.collapse");
            var option = data ? "toggle" : $this.data();
            var parent = $this.attr("data-parent");
            var $parent = parent && $(parent);
            if (!data || !data.transitioning) {
                if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass("is-collapsed");
                $this[$target.hasClass("in") ? "addClass" : "removeClass"]("is-collapsed");
            }
            Plugin.call($target, option);
        });
    });
}();

(function($, window, document, undefined) {
    "use strict";
    var pluginName = "Dropdown", defaults = {
        display: "span",
        option: "li",
        select: null,
        emitChange: true,
        height: null,
        preselected: null,
        vposition: "below",
        hposition: "left"
    };
    function Dropdown(element, options) {
        this.element = element;
        this.$element = $(element);
        this.$menu = this.$element.find(".Dropdown-menu");
        this.$trigger = this.$element.find(".Dropdown-toggle");
        this.zIndex = 1;
        this.state = "closed";
        this._data = this.$element.data();
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Dropdown.prototype = {
        init: function() {
            var dropdown = this, $this = this.$element;
            if (this.settings.select) {
                this.createSelect();
            }
            if (this.settings.height) {
                this.setFixedHeight();
            }
            if (this.settings.preselected) {
                this.preselectOption();
            }
            $this.on("click.FED-Dropdown touchstart.FED.Dropdown", ".js-dropdownTrigger", function(e) {
                e.preventDefault();
                $.proxy(dropdown.open, dropdown)();
            });
            $(document).on("click.FED.Dropdown touchstart.FED.Dropdown", function(e) {
                if ($(e.target).closest($this).length === 0 && dropdown.state === "open") {
                    $.proxy(dropdown.close, dropdown)();
                }
            });
            $this.on("click.FED.Dropdown", "li", function(e) {
                if (!$(this).hasClass("Dropdown-menu-header")) {
                    $.proxy(dropdown.select, dropdown, $(this))();
                }
            });
        },
        createSelect: function() {
            var $select, $options, i, value, text, $dropdown = this.$element;
            $select = $('<select style="display:none;" id="' + this.settings.select + '" aria-hidden="true"></select>');
            $options = $dropdown.find(this.settings.option);
            for (i = 0; i < $options.length; i++) {
                value = $($options[i]).data("value") || null;
                text = $($options[i]).text();
                $('<option value="' + value + '">' + text + "</option>").appendTo($select);
            }
            $dropdown.after($select);
        },
        open: function() {
            if (this.state === "open") {
                this.close();
            } else {
                var e = $.Event("open.fed.dropdown");
                this.$element.trigger(e);
                this.state = "open";
                this.$element.removeClass("is-closed").addClass("is-open");
                this.setPosition();
            }
        },
        close: function() {
            this.state = "closed";
            this.$element.addClass("is-closed").removeClass("is-open");
            var e = $.Event("close.fed.dropdown");
            this.$element.trigger(e);
            if (this.settings.hposition === "right") {
                this.$menu.css("right", "");
            } else {
                this.$menu.css("left", "");
            }
        },
        select: function($item) {
            if (!$item) return;
            var $dropdown = this.$element, $objSelect;
            $dropdown.find("li").removeAttr("selected");
            $item.attr("selected", "selected");
            $dropdown.find("li").removeClass("is-selected");
            $item.addClass("is-selected");
            this.$trigger.find(this.settings.display).text($item.text());
            if (this.settings.select) {
                $objSelect = $dropdown.next("select");
                $objSelect.val($item.data("value"));
                if (this.settings.emitChange) {
                    $objSelect.trigger("change");
                }
            }
            this.close();
        },
        setFixedHeight: function() {
            this.$menu.css({
                height: this.settings.height,
                overflowY: "scroll"
            });
        },
        setPosition: function() {
            var positionTop = this.$element.outerHeight();
            if (this.settings.vposition === "above") {
                positionTop = -10 - this.$menu.outerHeight();
            }
            this.$menu.css({
                top: positionTop,
                zIndex: this.zIndex
            });
            if (this.settings.hposition === "right") {
                this.$menu.css({
                    right: 0,
                    left: "auto"
                });
            } else {
                this.$menu.css("left", 0);
            }
        },
        preselectOption: function() {
            var $item = this.$menu.find('[data-value="' + this.settings.preselected + '"]');
            this.select($item);
        }
    };
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments);
        this.each(function() {
            var $this = $(this), data = $this.data("plugin_" + pluginName);
            if (!data) {
                $this.data("plugin_" + pluginName, data = new Dropdown(this, options));
            }
            if (options === "select") {
                data.select(args[1]);
            }
            if (typeof options === "string") {
                data[options]();
            }
        });
        return this;
    };
})(jQuery, window, document);

"svg use".replace(/\w+/g, function(element) {
    document.createElement(element);
});

/MSIE\s[678]\b/.test(navigator.userAgent) && document.attachEvent("onreadystatechange", function() {
    for (var all = document.getElementsByTagName("use"), index = 0, use; use = all[index]; ++index) {
        var img = new Image();
        img.src = use.getAttribute("xlink:href").replace("#", ".") + ".png";
        use.parentNode.replaceChild(img, use);
    }
});

/Trident\/[567]\b/.test(navigator.userAgent) && document.addEventListener("DOMContentLoaded", function() {
    [].forEach.call(document.querySelectorAll("use"), function(use) {
        var svg = use.parentNode, url = use.getAttribute("xlink:href");
        if (url) {
            var xhr = new XMLHttpRequest(), x = document.createElement("x");
            xhr.open("GET", url.replace(/#.+$/, ""));
            xhr.onload = function() {
                x.innerHTML = xhr.responseText;
                svg.replaceChild(x.querySelector(url.replace(/.+#/, "#")), use);
            };
            xhr.send();
        }
    });
});

(function($) {
    var CLOSE_EVENT = "Close", BEFORE_CLOSE_EVENT = "BeforeClose", AFTER_CLOSE_EVENT = "AfterClose", BEFORE_APPEND_EVENT = "BeforeAppend", MARKUP_PARSE_EVENT = "MarkupParse", OPEN_EVENT = "Open", CHANGE_EVENT = "Change", NS = "mfp", EVENT_NS = "." + NS, READY_CLASS = "mfp-ready", REMOVING_CLASS = "mfp-removing", PREVENT_CLOSE_CLASS = "mfp-prevent-close";
    MODAL_CLASS = "Modal";
    var mfp, MagnificPopup = function() {}, _isJQ = !!window.jQuery, _prevStatus, _window = $(window), _body, _document, _prevContentType, _wrapClasses, _currPopupType;
    var _mfpOn = function(name, f) {
        mfp.ev.on(NS + name + EVENT_NS, f);
    }, _getEl = function(className, appendTo, html, raw) {
        var el = document.createElement("div");
        el.className = "mfp-" + className;
        if (html) {
            el.innerHTML = html;
        }
        if (!raw) {
            el = $(el);
            if (appendTo) {
                el.appendTo(appendTo);
            }
        } else if (appendTo) {
            appendTo.appendChild(el);
        }
        return el;
    }, _mfpTrigger = function(e, data) {
        mfp.ev.triggerHandler(NS + e, data);
        if (mfp.st.callbacks) {
            e = e.charAt(0).toLowerCase() + e.slice(1);
            if (mfp.st.callbacks[e]) {
                mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [ data ]);
            }
        }
    }, _getCloseBtn = function(type) {
        if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
            mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace("%title%", mfp.st.tClose));
            _currPopupType = type;
        }
        return mfp.currTemplate.closeBtn;
    }, _checkInstance = function() {
        if (!$.magnificPopup.instance) {
            mfp = new MagnificPopup();
            mfp.init();
            $.magnificPopup.instance = mfp;
        }
    }, supportsTransitions = function() {
        var s = document.createElement("p").style, v = [ "ms", "O", "Moz", "Webkit" ];
        if (s.transition !== undefined) {
            return true;
        }
        while (v.length) {
            if (v.pop() + "Transition" in s) {
                return true;
            }
        }
        return false;
    };
    MagnificPopup.prototype = {
        constructor: MagnificPopup,
        init: function() {
            var appVersion = navigator.appVersion;
            mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1;
            mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
            mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
            mfp.isAndroid = /android/gi.test(appVersion);
            mfp.isIOS = /iphone|ipad|ipod/gi.test(appVersion);
            mfp.supportsTransition = supportsTransitions();
            mfp.probablyMobile = mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
            _document = $(document);
            mfp.popupsCache = {};
        },
        open: function(data) {
            if (!_body) {
                _body = $(document.body);
            }
            var i;
            if (data.isObj === false) {
                mfp.items = data.items.toArray();
                mfp.index = 0;
                var items = data.items, item;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.parsed) {
                        item = item.el[0];
                    }
                    if (item === data.el[0]) {
                        mfp.index = i;
                        break;
                    }
                }
            } else {
                mfp.items = $.isArray(data.items) ? data.items : [ data.items ];
                mfp.index = data.index || 0;
            }
            if (mfp.isOpen) {
                mfp.updateItemHTML();
                return;
            }
            mfp.types = [];
            _wrapClasses = "";
            if (data.mainEl && data.mainEl.length) {
                mfp.ev = data.mainEl.eq(0);
            } else {
                mfp.ev = _document;
            }
            if (data.key) {
                if (!mfp.popupsCache[data.key]) {
                    mfp.popupsCache[data.key] = {};
                }
                mfp.currTemplate = mfp.popupsCache[data.key];
            } else {
                mfp.currTemplate = {};
            }
            mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
            mfp.fixedContentPos = mfp.st.fixedContentPos === "auto" ? !mfp.probablyMobile : mfp.st.fixedContentPos;
            if (mfp.st.modal) {
                mfp.st.closeOnContentClick = false;
                mfp.st.closeOnBgClick = false;
                mfp.st.showCloseBtn = false;
                mfp.st.enableEscapeKey = false;
            }
            if (!mfp.bgOverlay) {
                mfp.bgOverlay = _getEl("bg").on("click" + EVENT_NS, function() {
                    mfp.close();
                });
                mfp.wrap = _getEl("wrap").attr("tabindex", -1).on("click" + EVENT_NS, function(e) {
                    if (mfp._checkIfClose(e.target)) {
                        mfp.close();
                    }
                });
                mfp.container = _getEl("container", mfp.wrap);
            }
            mfp.contentContainer = _getEl("content");
            if (mfp.st.preloader) {
                mfp.preloader = _getEl("preloader", mfp.container, mfp.st.tLoading);
            }
            var modules = $.magnificPopup.modules;
            for (i = 0; i < modules.length; i++) {
                var n = modules[i];
                n = n.charAt(0).toUpperCase() + n.slice(1);
                mfp["init" + n].call(mfp);
            }
            _mfpTrigger("BeforeOpen");
            if (mfp.st.showCloseBtn) {
                if (!mfp.st.closeBtnInside) {
                    mfp.wrap.append(_getCloseBtn());
                } else {
                    _mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
                        values.close_replaceWith = _getCloseBtn(item.type);
                    });
                    _wrapClasses += " mfp-close-btn-in";
                }
            }
            if (mfp.st.alignTop) {
                _wrapClasses += " mfp-align-top";
            }
            if (mfp.fixedContentPos) {
                mfp.wrap.css({
                    overflow: mfp.st.overflowY,
                    overflowX: "hidden",
                    overflowY: mfp.st.overflowY
                });
            } else {
                mfp.wrap.css({
                    top: _window.scrollTop(),
                    position: "absolute"
                });
            }
            if (mfp.st.fixedBgPos === false || mfp.st.fixedBgPos === "auto" && !mfp.fixedContentPos) {
                mfp.bgOverlay.css({
                    height: _document.height(),
                    position: "absolute"
                });
            }
            if (mfp.st.enableEscapeKey) {
                _document.on("keyup" + EVENT_NS, function(e) {
                    if (e.keyCode === 27) {
                        mfp.close();
                    }
                });
            }
            _window.on("resize" + EVENT_NS, function() {
                mfp.updateSize();
            });
            if (!mfp.st.closeOnContentClick) {
                _wrapClasses += " mfp-auto-cursor";
            }
            if (_wrapClasses) mfp.wrap.addClass(_wrapClasses);
            var windowHeight = mfp.wH = _window.height();
            var windowStyles = {};
            if (mfp.fixedContentPos) {
                if (mfp._hasScrollBar(windowHeight)) {
                    var s = mfp._getScrollbarSize();
                    if (s) {
                        windowStyles.marginRight = s;
                    }
                }
            }
            if (mfp.fixedContentPos) {
                if (!mfp.isIE7) {
                    windowStyles.overflow = "hidden";
                } else {
                    $("body, html").css("overflow", "hidden");
                }
            }
            var classesToadd = mfp.st.mainClass;
            if (mfp.isIE7) {
                classesToadd += " mfp-ie7";
            }
            if (classesToadd) {
                mfp._addClassToMFP(classesToadd);
            }
            mfp.updateItemHTML();
            _mfpTrigger("BuildControls");
            $("html").css(windowStyles);
            mfp.bgOverlay.add(mfp.wrap).prependTo(mfp.st.prependTo || _body);
            mfp._lastFocusedEl = document.activeElement;
            setTimeout(function() {
                if (mfp.content) {
                    mfp._addClassToMFP(READY_CLASS);
                    mfp._setFocus();
                } else {
                    mfp.bgOverlay.addClass(READY_CLASS);
                }
                _document.on("focusin" + EVENT_NS, mfp._onFocusIn);
            }, 16);
            mfp.isOpen = true;
            mfp.updateSize(windowHeight);
            _mfpTrigger(OPEN_EVENT);
            return data;
        },
        close: function() {
            if (!mfp.isOpen) return;
            _mfpTrigger(BEFORE_CLOSE_EVENT);
            mfp.isOpen = false;
            if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
                mfp._addClassToMFP(REMOVING_CLASS);
                setTimeout(function() {
                    mfp._close();
                }, mfp.st.removalDelay);
            } else {
                mfp._close();
            }
        },
        _close: function() {
            _mfpTrigger(CLOSE_EVENT);
            var classesToRemove = REMOVING_CLASS + " " + READY_CLASS + " ";
            mfp.bgOverlay.detach();
            mfp.wrap.detach();
            mfp.container.empty();
            if (mfp.st.mainClass) {
                classesToRemove += mfp.st.mainClass + " ";
            }
            mfp._removeClassFromMFP(classesToRemove);
            if (mfp.fixedContentPos) {
                var windowStyles = {
                    marginRight: ""
                };
                if (mfp.isIE7) {
                    $("body, html").css("overflow", "");
                } else {
                    windowStyles.overflow = "";
                }
                $("html").css(windowStyles);
            }
            _document.off("keyup" + EVENT_NS + " focusin" + EVENT_NS);
            mfp.ev.off(EVENT_NS);
            mfp.wrap.attr("class", "mfp-wrap").removeAttr("style");
            mfp.bgOverlay.attr("class", "mfp-bg");
            mfp.container.attr("class", "mfp-container");
            if (mfp.st.showCloseBtn && (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
                if (mfp.currTemplate.closeBtn) mfp.currTemplate.closeBtn.detach();
            }
            if (mfp._lastFocusedEl) {
                $(mfp._lastFocusedEl).focus();
            }
            mfp.currItem = null;
            mfp.content = null;
            mfp.currTemplate = null;
            mfp.prevHeight = 0;
            _mfpTrigger(AFTER_CLOSE_EVENT);
        },
        updateSize: function(winHeight) {
            if (mfp.isIOS) {
                var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
                var height = window.innerHeight * zoomLevel;
                mfp.wrap.css("height", height);
                mfp.wH = height;
            } else {
                mfp.wH = winHeight || _window.height();
            }
            if (!mfp.fixedContentPos) {
                mfp.wrap.css("height", mfp.wH);
            }
            _mfpTrigger("Resize");
        },
        updateItemHTML: function() {
            var item = mfp.items[mfp.index];
            mfp.contentContainer.detach();
            if (mfp.content) mfp.content.detach();
            if (!item.parsed) {
                item = mfp.parseEl(mfp.index);
            }
            var type = item.type;
            _mfpTrigger("BeforeChange", [ mfp.currItem ? mfp.currItem.type : "", type ]);
            mfp.currItem = item;
            if (!mfp.currTemplate[type]) {
                var markup = mfp.st[type] ? mfp.st[type].markup : false;
                _mfpTrigger("FirstMarkupParse", markup);
                if (markup) {
                    mfp.currTemplate[type] = $(markup);
                } else {
                    mfp.currTemplate[type] = true;
                }
            }
            if (_prevContentType && _prevContentType !== item.type) {
                mfp.container.removeClass("mfp-" + _prevContentType + "-holder");
            }
            var newContent = mfp["get" + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
            mfp.appendContent(newContent, type);
            item.preloaded = true;
            _mfpTrigger(CHANGE_EVENT, item);
            _prevContentType = item.type;
            mfp.container.prepend(mfp.contentContainer);
            _mfpTrigger("AfterChange");
        },
        appendContent: function(newContent, type) {
            mfp.content = newContent;
            if (newContent) {
                if (mfp.st.showCloseBtn && mfp.st.closeBtnInside && mfp.currTemplate[type] === true) {
                    if (!mfp.content.find(".Modal-close").length) {
                        mfp.content.append(_getCloseBtn());
                    }
                } else {
                    mfp.content = newContent;
                }
            } else {
                mfp.content = "";
            }
            _mfpTrigger(BEFORE_APPEND_EVENT);
            mfp.container.addClass("mfp-" + type + "-holder");
            mfp.contentContainer.append(mfp.content);
        },
        parseEl: function(index) {
            var item = mfp.items[index], type;
            if (item.tagName) {
                item = {
                    el: $(item)
                };
            } else {
                type = item.type;
                item = {
                    data: item,
                    src: item.src
                };
            }
            if (item.el) {
                var types = mfp.types;
                for (var i = 0; i < types.length; i++) {
                    if (item.el.hasClass("mfp-" + types[i])) {
                        type = types[i];
                        break;
                    }
                }
                item.src = item.el.attr("data-mfp-src");
                if (!item.src) {
                    item.src = item.el.attr("href");
                }
            }
            item.type = type || mfp.st.type || "inline";
            item.index = index;
            item.parsed = true;
            mfp.items[index] = item;
            _mfpTrigger("ElementParse", item);
            return mfp.items[index];
        },
        addGroup: function(el, options) {
            var eHandler = function(e) {
                e.mfpEl = this;
                mfp._openClick(e, el, options);
            };
            if (!options) {
                options = {};
            }
            var eName = "click.magnificPopup";
            options.mainEl = el;
            if (options.items) {
                options.isObj = true;
                el.off(eName).on(eName, eHandler);
            } else {
                options.isObj = false;
                if (options.delegate) {
                    el.off(eName).on(eName, options.delegate, eHandler);
                } else {
                    options.items = el;
                    el.off(eName).on(eName, eHandler);
                }
            }
        },
        _openClick: function(e, el, options) {
            var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;
            if (!midClick && (e.which === 2 || e.ctrlKey || e.metaKey)) {
                return;
            }
            var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;
            if (disableOn) {
                if ($.isFunction(disableOn)) {
                    if (!disableOn.call(mfp)) {
                        return true;
                    }
                } else {
                    if (_window.width() < disableOn) {
                        return true;
                    }
                }
            }
            if (e.type) {
                e.preventDefault();
                if (mfp.isOpen) {
                    e.stopPropagation();
                }
            }
            options.el = $(e.mfpEl);
            if (options.delegate) {
                options.items = el.find(options.delegate);
            }
            mfp.open(options);
        },
        updateStatus: function(status, text) {
            if (mfp.preloader) {
                if (_prevStatus !== status) {
                    mfp.container.removeClass("mfp-s-" + _prevStatus);
                }
                if (!text && status === "loading") {
                    text = mfp.st.tLoading;
                }
                var data = {
                    status: status,
                    text: text
                };
                _mfpTrigger("UpdateStatus", data);
                status = data.status;
                text = data.text;
                mfp.preloader.html(text);
                mfp.preloader.find("a").on("click", function(e) {
                    e.stopImmediatePropagation();
                });
                mfp.container.addClass("mfp-s-" + status);
                _prevStatus = status;
            }
        },
        _checkIfClose: function(target) {
            if ($(target).hasClass(PREVENT_CLOSE_CLASS)) {
                return;
            }
            var closeOnContent = mfp.st.closeOnContentClick;
            var closeOnBg = mfp.st.closeOnBgClick;
            if (closeOnContent && closeOnBg) {
                return true;
            } else {
                if (!mfp.content || $(target).hasClass("Modal-close") || mfp.preloader && target === mfp.preloader[0]) {
                    return true;
                }
                if (target !== mfp.content[0] && !$.contains(mfp.content[0], target)) {
                    if (closeOnBg) {
                        if ($.contains(document, target)) {
                            return true;
                        }
                    }
                } else if (closeOnContent) {
                    return true;
                }
            }
            return false;
        },
        _addClassToMFP: function(cName) {
            mfp.bgOverlay.addClass(cName);
            mfp.wrap.addClass(cName);
        },
        _removeClassFromMFP: function(cName) {
            this.bgOverlay.removeClass(cName);
            mfp.wrap.removeClass(cName);
        },
        _hasScrollBar: function(winHeight) {
            return (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height());
        },
        _setFocus: function() {
            (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
        },
        _onFocusIn: function(e) {
            if (e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target)) {
                mfp._setFocus();
                return false;
            }
        },
        _parseMarkup: function(template, values, item) {
            var arr;
            if (item.data) {
                values = $.extend(item.data, values);
            }
            _mfpTrigger(MARKUP_PARSE_EVENT, [ template, values, item ]);
            $.each(values, function(key, value) {
                if (value === undefined || value === false) {
                    return true;
                }
                arr = key.split("_");
                if (arr.length > 1) {
                    var el = template.find(EVENT_NS + "-" + arr[0]);
                    if (el.length > 0) {
                        var attr = arr[1];
                        if (attr === "replaceWith") {
                            if (el[0] !== value[0]) {
                                el.replaceWith(value);
                            }
                        } else if (attr === "img") {
                            if (el.is("img")) {
                                el.attr("src", value);
                            } else {
                                el.replaceWith('<img src="' + value + '" class="' + el.attr("class") + '" />');
                            }
                        } else {
                            el.attr(arr[1], value);
                        }
                    }
                } else {
                    template.find(EVENT_NS + "-" + key).html(value);
                }
            });
        },
        _getScrollbarSize: function() {
            if (mfp.scrollbarSize === undefined) {
                var scrollDiv = document.createElement("div");
                scrollDiv.id = "mfp-sbm";
                scrollDiv.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;";
                document.body.appendChild(scrollDiv);
                mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv);
            }
            return mfp.scrollbarSize;
        }
    };
    $.magnificPopup = {
        instance: null,
        proto: MagnificPopup.prototype,
        modules: [],
        open: function(options, index) {
            _checkInstance();
            if (!options) {
                options = {};
            } else {
                options = $.extend(true, {}, options);
            }
            options.isObj = true;
            options.index = index || 0;
            return this.instance.open(options);
        },
        close: function() {
            return $.magnificPopup.instance && $.magnificPopup.instance.close();
        },
        registerModule: function(name, module) {
            if (module.options) {
                $.magnificPopup.defaults[name] = module.options;
            }
            $.extend(this.proto, module.proto);
            this.modules.push(name);
        },
        defaults: {
            disableOn: 0,
            key: null,
            midClick: false,
            mainClass: "",
            preloader: true,
            focus: "",
            closeOnContentClick: false,
            closeOnBgClick: true,
            closeBtnInside: true,
            showCloseBtn: true,
            enableEscapeKey: true,
            modal: false,
            alignTop: false,
            removalDelay: 0,
            prependTo: null,
            fixedContentPos: "auto",
            fixedBgPos: "auto",
            overflowY: "auto",
            closeMarkup: '<button title="%title%" type="button" class="Icon--close Modal-close"></button>',
            tClose: "Close (Esc)",
            tLoading: "Loading..."
        }
    };
    $.fn.magnificPopup = function(options) {
        _checkInstance();
        var jqEl = $(this);
        if (typeof options === "string") {
            if (options === "open") {
                var items, itemOpts = _isJQ ? jqEl.data("magnificPopup") : jqEl[0].magnificPopup, index = parseInt(arguments[1], 10) || 0;
                if (itemOpts.items) {
                    items = itemOpts.items[index];
                } else {
                    items = jqEl;
                    if (itemOpts.delegate) {
                        items = items.find(itemOpts.delegate);
                    }
                    items = items.eq(index);
                }
                mfp._openClick({
                    mfpEl: items
                }, jqEl, itemOpts);
            } else {
                if (mfp.isOpen) mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
            }
        } else {
            options = $.extend(true, {}, options);
            if (_isJQ) {
                jqEl.data("magnificPopup", options);
            } else {
                jqEl[0].magnificPopup = options;
            }
            mfp.addGroup(jqEl, options);
        }
        return jqEl;
    };
    var INLINE_NS = "inline", _hiddenClass, _inlinePlaceholder, _lastInlineElement, _putInlineElementsBack = function() {
        if (_lastInlineElement) {
            _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
            _lastInlineElement = null;
        }
    };
    $.magnificPopup.registerModule(INLINE_NS, {
        options: {
            hiddenClass: "u-visuallyHidden",
            markup: "",
            tNotFound: "Content not found"
        },
        proto: {
            initInline: function() {
                mfp.types.push(INLINE_NS);
                _mfpOn(CLOSE_EVENT + "." + INLINE_NS, function() {
                    _putInlineElementsBack();
                });
            },
            getInline: function(item, template) {
                _putInlineElementsBack();
                if (item.src) {
                    var inlineSt = mfp.st.inline, el = $(item.src);
                    if (el.length) {
                        var parent = el[0].parentNode;
                        if (parent && parent.tagName) {
                            if (!_inlinePlaceholder) {
                                _hiddenClass = inlineSt.hiddenClass;
                                _inlinePlaceholder = _getEl(_hiddenClass);
                                _hiddenClass = _hiddenClass;
                            }
                            _lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
                        }
                        mfp.updateStatus("ready");
                    } else {
                        mfp.updateStatus("error", inlineSt.tNotFound);
                        el = $("<div>");
                    }
                    item.inlineElement = el;
                    return el;
                }
                mfp.updateStatus("ready");
                mfp._parseMarkup(template, {}, item);
                return template;
            }
        }
    });
    var AJAX_NS = "ajax", _ajaxCur, _removeAjaxCursor = function() {
        if (_ajaxCur) {
            _body.removeClass(_ajaxCur);
        }
    }, _destroyAjaxRequest = function() {
        _removeAjaxCursor();
        if (mfp.req) {
            mfp.req.abort();
        }
    };
    $.magnificPopup.registerModule(AJAX_NS, {
        options: {
            settings: null,
            cursor: "mfp-ajax-cur",
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },
        proto: {
            initAjax: function() {
                mfp.types.push(AJAX_NS);
                _ajaxCur = mfp.st.ajax.cursor;
                _mfpOn(CLOSE_EVENT + "." + AJAX_NS, _destroyAjaxRequest);
                _mfpOn("BeforeChange." + AJAX_NS, _destroyAjaxRequest);
            },
            getAjax: function(item) {
                if (_ajaxCur) _body.addClass(_ajaxCur);
                mfp.updateStatus("loading");
                var opts = $.extend({
                    url: item.src,
                    success: function(data, textStatus, jqXHR) {
                        var temp = {
                            data: data,
                            xhr: jqXHR
                        };
                        _mfpTrigger("ParseAjax", temp);
                        mfp.appendContent($('<div class="' + MODAL_CLASS + '"></div>').append($(temp.data)), AJAX_NS);
                        item.finished = true;
                        _removeAjaxCursor();
                        mfp._setFocus();
                        setTimeout(function() {
                            mfp.wrap.addClass(READY_CLASS);
                        }, 16);
                        mfp.updateStatus("ready");
                        _mfpTrigger("AjaxContentAdded");
                    },
                    error: function() {
                        _removeAjaxCursor();
                        item.finished = item.loadError = true;
                        mfp.updateStatus("error", mfp.st.ajax.tError.replace("%url%", item.src));
                    }
                }, mfp.st.ajax.settings);
                mfp.req = $.ajax(opts);
                return "";
            }
        }
    });
    var hasMozTransform, getHasMozTransform = function() {
        if (hasMozTransform === undefined) {
            hasMozTransform = document.createElement("p").style.MozTransform !== undefined;
        }
        return hasMozTransform;
    };
    $.magnificPopup.registerModule("zoom", {
        options: {
            enabled: false,
            easing: "ease-in-out",
            duration: 300,
            opener: function(element) {
                return element.is("img") ? element : element.find("img");
            }
        },
        proto: {
            initZoom: function() {
                var zoomSt = mfp.st.zoom, ns = ".zoom", image;
                if (!zoomSt.enabled || !mfp.supportsTransition) {
                    return;
                }
                var duration = zoomSt.duration, getElToAnimate = function(image) {
                    var newImg = image.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"), transition = "all " + zoomSt.duration / 1e3 + "s " + zoomSt.easing, cssObj = {
                        position: "fixed",
                        zIndex: 9999,
                        left: 0,
                        top: 0,
                        "-webkit-backface-visibility": "hidden"
                    }, t = "transition";
                    cssObj["-webkit-" + t] = cssObj["-moz-" + t] = cssObj["-o-" + t] = cssObj[t] = transition;
                    newImg.css(cssObj);
                    return newImg;
                }, showMainContent = function() {
                    mfp.content.css("visibility", "visible");
                }, openTimeout, animatedImg;
                _mfpOn("BuildControls" + ns, function() {
                    if (mfp._allowZoom()) {
                        clearTimeout(openTimeout);
                        mfp.content.css("visibility", "hidden");
                        image = mfp._getItemToZoom();
                        if (!image) {
                            showMainContent();
                            return;
                        }
                        animatedImg = getElToAnimate(image);
                        animatedImg.css(mfp._getOffset());
                        mfp.wrap.append(animatedImg);
                        openTimeout = setTimeout(function() {
                            animatedImg.css(mfp._getOffset(true));
                            openTimeout = setTimeout(function() {
                                showMainContent();
                                setTimeout(function() {
                                    animatedImg.remove();
                                    image = animatedImg = null;
                                    _mfpTrigger("ZoomAnimationEnded");
                                }, 16);
                            }, duration);
                        }, 16);
                    }
                });
                _mfpOn(BEFORE_CLOSE_EVENT + ns, function() {
                    if (mfp._allowZoom()) {
                        clearTimeout(openTimeout);
                        mfp.st.removalDelay = duration;
                        if (!image) {
                            image = mfp._getItemToZoom();
                            if (!image) {
                                return;
                            }
                            animatedImg = getElToAnimate(image);
                        }
                        animatedImg.css(mfp._getOffset(true));
                        mfp.wrap.append(animatedImg);
                        mfp.content.css("visibility", "hidden");
                        setTimeout(function() {
                            animatedImg.css(mfp._getOffset());
                        }, 16);
                    }
                });
                _mfpOn(CLOSE_EVENT + ns, function() {
                    if (mfp._allowZoom()) {
                        showMainContent();
                        if (animatedImg) {
                            animatedImg.remove();
                        }
                        image = null;
                    }
                });
            },
            _allowZoom: function() {
                return mfp.currItem.type === "image";
            },
            _getItemToZoom: function() {
                if (mfp.currItem.hasSize) {
                    return mfp.currItem.img;
                } else {
                    return false;
                }
            },
            _getOffset: function(isLarge) {
                var el;
                if (isLarge) {
                    el = mfp.currItem.img;
                } else {
                    el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
                }
                var offset = el.offset();
                var paddingTop = parseInt(el.css("padding-top"), 10);
                var paddingBottom = parseInt(el.css("padding-bottom"), 10);
                offset.top -= $(window).scrollTop() - paddingTop;
                var obj = {
                    width: el.width(),
                    height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
                };
                if (getHasMozTransform()) {
                    obj["-moz-transform"] = obj.transform = "translate(" + offset.left + "px," + offset.top + "px)";
                } else {
                    obj.left = offset.left;
                    obj.top = offset.top;
                }
                return obj;
            }
        }
    });
    var IFRAME_NS = "iframe", _emptyPage = "//about:blank", _fixIframeBugs = function(isShowing) {
        if (mfp.currTemplate[IFRAME_NS]) {
            var el = mfp.currTemplate[IFRAME_NS].find("iframe");
            if (el.length) {
                if (!isShowing) {
                    el[0].src = _emptyPage;
                }
                if (mfp.isIE8) {
                    el.css("display", isShowing ? "block" : "none");
                }
            }
        }
    };
    $.magnificPopup.registerModule(IFRAME_NS, {
        options: {
            markup: '<div class="mfp-iframe-scaler">' + '<div class="Icon--close Modal-close"></div>' + '<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>' + "</div>",
            srcAction: "iframe_src",
            patterns: {
                youtube: {
                    index: "youtube.com",
                    id: "v=",
                    src: "//www.youtube.com/embed/%id%?autoplay=1"
                },
                vimeo: {
                    index: "vimeo.com/",
                    id: "/",
                    src: "//player.vimeo.com/video/%id%?autoplay=1"
                },
                gmaps: {
                    index: "//maps.google.",
                    src: "%id%&output=embed"
                }
            }
        },
        proto: {
            initIframe: function() {
                mfp.types.push(IFRAME_NS);
                _mfpOn("BeforeChange", function(e, prevType, newType) {
                    if (prevType !== newType) {
                        if (prevType === IFRAME_NS) {
                            _fixIframeBugs();
                        } else if (newType === IFRAME_NS) {
                            _fixIframeBugs(true);
                        }
                    }
                });
                _mfpOn(CLOSE_EVENT + "." + IFRAME_NS, function() {
                    _fixIframeBugs();
                });
            },
            getIframe: function(item, template) {
                var embedSrc = item.src;
                var iframeSt = mfp.st.iframe;
                $.each(iframeSt.patterns, function() {
                    if (embedSrc.indexOf(this.index) > -1) {
                        if (this.id) {
                            if (typeof this.id === "string") {
                                embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id) + this.id.length, embedSrc.length);
                            } else {
                                embedSrc = this.id.call(this, embedSrc);
                            }
                        }
                        embedSrc = this.src.replace("%id%", embedSrc);
                        return false;
                    }
                });
                var dataObj = {};
                if (iframeSt.srcAction) {
                    dataObj[iframeSt.srcAction] = embedSrc;
                }
                mfp._parseMarkup(template, dataObj, item);
                mfp.updateStatus("ready");
                return template;
            }
        }
    });
    _checkInstance();
})(window.jQuery || window.Zepto);

(function($, undefined) {
    $.widget("daredevel.tree", {
        _attachLi: function(li, parent, position) {
            var ul = parent.find("ul:first");
            if (ul.length) {
                if (undefined === position || ul.children("li").length < position) {
                    ul.append(li);
                } else {
                    if (position === 0) {
                        position = position + 1;
                    }
                    ul.children("li:nth-child(" + position + ")").before(li);
                }
            } else {
                ul = $("<ul/>");
                parent.append(ul.append(li));
            }
        },
        _attachNode: function(li, parentLi, position) {
            if (undefined === parentLi) {
                var parent = this.element;
                this._attachLi(li, parent, position);
                this._initializeNode(li);
            } else {
                var parent = parentLi;
                this._attachLi(li, parent, position);
                parent.removeClass("leaf collapsed").addClass("expanded");
                this._initializeNode(li);
                this._initializeNode(parent);
            }
        },
        _buildNode: function(attributes) {
            attributes = $.extend(true, this.options.defaultNodeAttributes, attributes);
            var span = $("<span/>", attributes.span);
            var li = $("<li/>", attributes.li);
            if ($.inArray("checkbox", this.options.components) > -1) {
                var input = $("<input/>", attributes.input);
                li.append(input);
            }
            li.append(span);
            return li;
        },
        _create: function() {
            var t = this;
            this.options.core = this;
            this.element.addClass("ui-widget ui-widget-content daredevel-tree");
            if (this.options.checkbox) {
                this._createCheckbox();
            }
            if (this.options.collapsible) {
                this._createCollapsible();
            }
            if (this.options.dnd) {
                this._createDnd();
            }
            if (this.options.selectable) {
                this._createSelectable();
            }
            this.element.find("li").each(function() {
                t._initializeNode($(this));
            });
            if (this.options.nodes !== null) {
                $.each(this.options.nodes, function(key, value) {
                    t.options.core.addNode(value);
                });
            }
        },
        _destroy: function() {
            $.Widget.prototype.destroy.call(this);
        },
        _detachNode: function(li) {
            var parentLi = this.options.core.parentNode(li);
            var ul = parentLi.find("ul:first");
            if (ul.children().length == 1) {
                ul.detach();
                parentLi.removeClass("collapsed expanded").addClass("leaf");
            } else {
                li.detach();
            }
            this.options.core._initializeNode(parentLi);
        },
        _initializeComponents: function() {
            for (var i in this.options.components) {
                var initializeComponent = "element.tree" + this.options.components[i] + "(options);";
                run = new Function("options", "element", initializeComponent);
                run(this.options, this.element);
            }
        },
        _initializeNode: function(li) {
            li.children("span:last").addClass("daredevel-tree-label");
            if (this.options.checkbox) {
                this._initializeCheckboxNode(li);
            }
            if (this.options.collapsible) {
                this._initializeCollapsibleNode(li);
            }
            if (this.options.dnd) {
                this._initializeDndNode(li);
            }
            if (this.options.selectable) {
                this._initializeSelectableNode(li);
            }
        },
        addNode: function(attributes, parentLi, position) {
            var t = this;
            var li = this._buildNode(attributes);
            if (undefined === parentLi || 0 === parentLi.length) {
                this._attachNode($(li), undefined, position);
            } else {
                this._attachNode($(li), $(parentLi), position);
            }
            if (undefined !== attributes.children) {
                $.each(attributes.children, function(key, value) {
                    t.addNode(value, li);
                });
            }
            t._trigger("add", true, li);
        },
        isRoot: function(li) {
            li = $(li);
            var parents = li.parentsUntil(".daredevel-tree");
            return 1 == parents.length;
        },
        moveNode: function(li, parentLi, position) {
            this._detachNode($(li));
            if (undefined === parentLi || 0 === parentLi.length) {
                this._attachNode($(li), undefined, position);
            } else {
                this._attachNode($(li), $(parentLi), position);
            }
            this._trigger("move", true, $(li));
        },
        parentNode: function(li) {
            return $(li).parents("li:first");
        },
        removeNode: function(li) {
            this._detachNode($(li));
            this._trigger("remove", true, $(li));
        },
        _allDescendantChecked: function(li) {
            return li.find("li input:checkbox:not(:checked)").length === 0;
        },
        _checkAncestors: function(li) {
            li.parentsUntil("daredevel-tree").filter("li").find("input:checkbox:first:not(:checked)").prop("checked", true).change();
        },
        _checkDescendants: function(li) {
            li.find("li input:checkbox:not(:checked)").prop("checked", true).change();
        },
        _checkOthers: function(li) {
            var t = this;
            li.addClass("exclude");
            li.parents("li").addClass("exclude");
            li.find("li").addClass("exclude");
            $(this.element).find("li").each(function() {
                if (!$(this).hasClass("exclude")) {
                    $(this).find("input:checkbox:first:not(:checked)").prop("checked", true).change();
                }
            });
            $(this.element).find("li").removeClass("exclude");
        },
        _createCheckbox: function() {
            var t = this;
            this.element.on("click", "input:checkbox:not(:checked)", function() {
                t.uncheck(t.options.core.parentNode($(this)));
            });
            this.element.on("click", "input:checkbox:checked", function() {
                t.check(t.options.core.parentNode($(this)));
            });
            if (this.options.onUncheck.node == "collapse") {
                this.element.on("click", "input:checkbox:not(:checked)", function() {
                    t.options.core.collapse(t.options.core.parentNode($(this)));
                });
            } else if (this.options.onUncheck.node == "expand") {
                this.element.on("click", "input:checkbox:not(:checked)", function() {
                    t.options.core.expand(t.options.core.parentNode($(this)));
                });
            }
            if (this.options.onCheck.node == "collapse") {
                this.element.on("click", "input:checkbox:checked", function() {
                    t.options.core.collapse(t.options.core.parentNode($(this)));
                });
            } else if (this.options.onCheck.node == "expand") {
                this.element.on("click", "input:checkbox:checked", function() {
                    t.options.core.expand(t.options.core.parentNode($(this)));
                });
            }
        },
        _initializeCheckboxNode: function(li) {},
        _uncheckAncestors: function(li) {
            li.parentsUntil("daredevel-tree").filter("li").find("input:checkbox:first:checked").prop("checked", false).change();
        },
        _uncheckDescendants: function(li) {
            li.find("li input:checkbox:checked").prop("checked", false).change();
        },
        _uncheckOthers: function(li) {
            var t = this;
            li.addClass("exclude");
            li.parents("li").addClass("exclude");
            li.find("li").addClass("exclude");
            $(this.element).find("li").each(function() {
                if (!$(this).hasClass("exclude")) {
                    $(this).find("input:checkbox:first:checked").prop("checked", false).change();
                }
            });
            $(this.element).find("li").removeClass("exclude");
        },
        check: function(li) {
            li = $(li);
            li.find("input:checkbox:first:not(:checked)").prop("checked", true).change();
            if (this.options.onCheck.others == "check") {
                this._checkOthers(li);
            } else if (this.options.onCheck.others == "uncheck") {
                this._uncheckOthers(li);
            }
            if (this.options.onCheck.descendants == "check") {
                this._checkDescendants(li);
            } else if (this.options.onCheck.descendants == "uncheck") {
                this._uncheckDescendants(li);
            }
            if (this.options.onCheck.ancestors == "check") {
                this._checkAncestors(li);
            } else if (this.options.onCheck.ancestors == "uncheck") {
                this._uncheckAncestors(li);
            } else if (this.options.onCheck.ancestors == "checkIfFull") {
                var isRoot = this.options.core.isRoot(li);
                var allDescendantChecked = this._allDescendantChecked(this.options.core.parentNode(li));
                if (!isRoot && allDescendantChecked) {
                    this.check(this.options.core.parentNode(li));
                }
            }
        },
        checkAll: function() {
            $(this.element).find("input:checkbox:not(:checked)").prop("checked", true).change();
        },
        uncheck: function(li) {
            li = $(li);
            li.find("input:checkbox:first:checked").prop("checked", false).change();
            if (this.options.onUncheck.others == "check") {
                this._checkOthers(li);
            } else if (this.options.onUncheck.others == "uncheck") {
                this._uncheckOthers(li);
            }
            if (this.options.onUncheck.descendants == "check") {
                this._checkDescendants(li);
            } else if (this.options.onUncheck.descendants == "uncheck") {
                this._uncheckDescendants(li);
            }
            if (this.options.onUncheck.ancestors == "check") {
                this._checkAncestors(li);
            } else if (this.options.onUncheck.ancestors == "uncheck") {
                this._uncheckAncestors(li);
            }
        },
        uncheckAll: function() {
            $(this.element).find("input:checkbox:checked").prop("checked", false).change();
        },
        _createCollapsible: function() {
            var t = this;
            this.element.on("click", "li span.daredevel-tree-anchor", function() {
                var li = t.options.core.parentNode($(this));
                if (li.hasClass("collapsed")) {
                    t.expand(li);
                } else if (li.hasClass("expanded")) {
                    t.collapse(li);
                }
            });
        },
        _initializeCollapsibleNode: function(li) {
            var t = this;
            var anchor = li.children("span.daredevel-tree-anchor");
            if (anchor.length < 1) {
                li.prepend($("<span />", {
                    "class": "daredevel-tree-anchor"
                }));
            }
            if (li.hasClass("leaf")) {
                t._markAsLeaf(li);
            } else if (li.hasClass("collapsed")) {
                t.collapse(li, false, true);
            } else if (li.hasClass("expanded")) {
                t.expand(li, false, true);
            } else if (li.is("li:not(:has(ul))")) {
                t._markAsLeaf(li);
            } else {
                t._markAsExpanded(li);
            }
        },
        _markAsCollapsed: function(li) {
            var anchor = li.children("span.daredevel-tree-anchor");
            anchor.removeClass("ui-icon " + this.options.expandUiIcon + " " + this.options.leafUiIcon);
            if (this.options.collapseUiIcon.length > 0) {
                anchor.addClass("ui-icon " + this.options.collapseUiIcon);
            }
            li.removeClass("leaf").removeClass("expanded").addClass("collapsed");
        },
        _markAsExpanded: function(li) {
            var anchor = li.children("span.daredevel-tree-anchor");
            anchor.removeClass("ui-icon " + this.options.collapseUiIcon + " " + this.options.leafUiIcon);
            if (this.options.expandUiIcon.length > 0) {
                anchor.addClass("ui-icon " + this.options.expandUiIcon);
            }
            li.removeClass("leaf").removeClass("collapsed").addClass("expanded");
        },
        _markAsLeaf: function(li) {
            var anchor = li.children("span.daredevel-tree-anchor");
            anchor.removeClass("ui-icon " + this.options.collapseUiIcon + " " + this.options.expandUiIcon);
            if (this.options.leafUiIcon.length > 0) {
                anchor.addClass("ui-icon " + this.options.leafUiIcon);
            }
            li.removeClass("collapsed").removeClass("expanded").addClass("leaf");
        },
        _unmark: function() {
            li.removeClass("collapsed expanded leaf");
        },
        collapse: function(li, effect, force) {
            li = $(li);
            if (force === undefined) {
                force = false;
            }
            if (!force && (li.hasClass("collapsed") || li.hasClass("leaf"))) {
                return;
            }
            if (effect === undefined) {
                effect = true;
            }
            var t = this;
            if (effect) {
                li.children("ul").hide(this.options.collapseEffect, {}, this.options.collapseDuration);
                setTimeout(function() {
                    t._markAsCollapsed(li, t.options);
                }, t.options.collapseDuration);
            } else {
                li.children("ul").hide();
                t._markAsCollapsed(li, t.options);
            }
            t.options.core._trigger("collapse", true, li);
        },
        collapseAll: function() {
            var t = this;
            $(this.element).find("li.expanded").each(function() {
                t.collapse($(this));
            });
        },
        expand: function(li, effect, force) {
            li = $(li);
            if (force === undefined) {
                force = false;
            }
            if (!force && (li.hasClass("expanded") || li.hasClass("leaf"))) {
                return;
            }
            if (effect === undefined) {
                effect = true;
            }
            var t = this;
            if (effect) {
                li.children("ul").show(t.options.expandEffect, {}, t.options.expandDuration);
                setTimeout(function() {
                    t._markAsExpanded(li, t.options);
                }, t.options.expandDuration);
            } else {
                li.children("ul").show();
                t._markAsExpanded(li, t.options);
            }
            t.options.core._trigger("expand", true, li);
        },
        expandAll: function() {
            var t = this;
            $(this.element).find("li.collapsed").each(function() {
                t.expand($(this));
            });
        },
        _createDnd: function() {
            var t = this;
        },
        _initializeDndNode: function(li) {
            var t = this;
            var span = $("<span/>", {
                "class": "prepended",
                html: "<br/>"
            }).droppable({
                hoverClass: "over",
                drop: function(event, ui) {
                    var li = $(this).closest("li");
                    if (t.options.core.isRoot(li)) {
                        var parentLi = undefined;
                        var droppable = t.options.core.element;
                    } else {
                        var parentLi = li.parent().closest("li");
                        var droppable = parentLi;
                        if ($(ui.draggable.parent("li")).find(parentLi).length) {
                            return;
                        }
                    }
                    var position = $($(this).parent("li")).index() + 1;
                    t.options.core.moveNode(ui.draggable.parent("li"), parentLi, position);
                    t._trigger("drop", event, {
                        draggable: ui.draggable,
                        droppable: parentLi
                    });
                }
            });
            $(li).find(".daredevel-tree-label:first").after(span);
            $(li).find(".daredevel-tree-label:first").draggable({
                start: function(event, ui) {
                    $(this).parent("li").find("ul, .prepended").css("visibility", "hidden");
                    $(this).parent("li").find(".droppable-label").css("display", "none");
                },
                stop: function(event, ui) {
                    $(this).parent("li").find("ul").css("visibility", "visible");
                    $(this).parent("li").find(".prepended").css("visibility", "");
                    $(this).parent("li").find(".droppable-label").css("display", "inherit");
                },
                revert: true,
                revertDuration: 0
            });
            var span = $("<span/>", {
                "class": "droppable-label",
                html: "<br/>"
            }).droppable({
                drop: function(event, ui) {
                    var li = $(this).closest("li");
                    if ($(ui.draggable.parent("li")).find(li).length) {
                        return;
                    }
                    t.options.core.moveNode(ui.draggable.parent("li"), li, 1);
                    t._trigger("drop", event, {
                        draggable: ui.draggable,
                        droppable: li
                    });
                },
                over: function(event, ui) {
                    $(this).parent("li").find(".daredevel-tree-label:first").addClass("ui-state-hover");
                },
                out: function(event, ui) {
                    $(this).parent("li").find(".daredevel-tree-label:first").removeClass("ui-state-hover");
                }
            });
            $(li).find(".daredevel-tree-label:first").after(span);
        },
        _createSelectable: function() {
            var t = this;
            this.element.on("click", ".daredevel-tree-label", function() {
                var li = $(this);
                if (li.hasClass(t.options.selectUiClass)) {
                    t.deselect($(this).parent(li));
                } else {
                    t.select($(this).parent("li"));
                }
            });
        },
        _deselect: function(li) {
            li.find("span.daredevel-tree-label:first").removeClass(this.options.selectUiClass);
            this._trigger("deselect", true, li);
        },
        _deselectAll: function() {
            var t = this;
            this.element.find(".daredevel-tree-label." + this.options.selectUiClass).each(function() {
                t._deselect($(this).parent("li"));
            });
        },
        _destroySelectable: function() {},
        _initializeSelectableNode: function(li) {},
        _select: function(li) {
            li.find("span.daredevel-tree-label:first").addClass(this.options.selectUiClass);
            this._trigger("select", true, li);
        },
        deselect: function(li) {
            li = $(li);
            this._deselect(li);
        },
        select: function(li) {
            li = $(li);
            if (this.options.selectUnique) {
                this._deselectAll();
            }
            this._select(li);
        },
        selected: function() {
            var selected = this.element.find(".daredevel-tree-label." + this.options.selectUiClass);
            return $(selected).parent();
        },
        options: {
            defaultNodeAttributes: {
                span: {
                    html: "new node"
                },
                li: {
                    "class": "leaf"
                },
                input: {
                    type: "checkbox"
                }
            },
            nodes: null,
            checkbox: true,
            onCheck: {
                ancestors: "check",
                descendants: "check",
                node: "",
                others: ""
            },
            onUncheck: {
                ancestors: "",
                descendants: "uncheck",
                node: "",
                others: ""
            },
            collapsible: true,
            collapseDuration: 500,
            collapseEffect: "blind",
            collapseUiIcon: "ui-icon-triangle-1-e",
            expandDuration: 500,
            expandEffect: "blind",
            expandUiIcon: "ui-icon-triangle-1-se",
            leafUiIcon: "",
            dnd: true,
            drop: function(event, element) {},
            selectable: true,
            deselect: function(event, element) {},
            selectUiClass: "ui-state-active",
            selectUnique: true,
            select: function(event, element) {}
        }
    });
    $.ui.draggable.prototype._getRelativeOffset = function() {
        if (this.cssPosition == "relative") {
            var p = this.element.position();
            return {
                top: p.top - (parseInt(this.helper.css("top"), 10) || 0),
                left: p.left - (parseInt(this.helper.css("left"), 10) || 0)
            };
        } else {
            return {
                top: 0,
                left: 0
            };
        }
    };
})(jQuery);

(function($) {
    var sidrMoving = false, sidrOpened = false;
    var privateMethods = {
        isUrl: function(str) {
            var pattern = new RegExp("^(https?:\\/\\/)?" + "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + "((\\d{1,3}\\.){3}\\d{1,3}))" + "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + "(\\?[;&a-z\\d%_.~+=-]*)?" + "(\\#[-a-z\\d_]*)?$", "i");
            if (!pattern.test(str)) {
                return false;
            } else {
                return true;
            }
        },
        loadContent: function($menu, content) {
            $menu.html(content);
        },
        addPrefix: function($element) {
            var elementId = $element.attr("id"), elementClass = $element.attr("class");
            if (typeof elementId === "string" && "" !== elementId) {
                $element.attr("id", elementId.replace(/([A-Za-z0-9_.\-]+)/g, "sidr-id-$1"));
            }
            if (typeof elementClass === "string" && "" !== elementClass && "sidr-inner" !== elementClass) {
                $element.attr("class", elementClass.replace(/([A-Za-z0-9_.\-]+)/g, "sidr-class-$1"));
            }
            $element.removeAttr("style");
        },
        execute: function(action, name, callback) {
            if (typeof name === "function") {
                callback = name;
                name = "sidr";
            } else if (!name) {
                name = "sidr";
            }
            var $menu = $("#" + name), $body = $($menu.data("body")), $html = $("html"), menuWidth = $menu.outerWidth(true), speed = $menu.data("speed"), side = $menu.data("side"), displace = $menu.data("displace"), onOpen = $menu.data("onOpen"), onClose = $menu.data("onClose"), bodyAnimation, menuAnimation, scrollTop, bodyClass = name === "sidr" ? "sidr-open" : "sidr-open " + name + "-open";
            if ("open" === action || "toggle" === action && !$menu.is(":visible")) {
                if ($menu.is(":visible") || sidrMoving) {
                    return;
                }
                if (sidrOpened !== false) {
                    methods.close(sidrOpened, function() {
                        methods.open(name);
                    });
                    return;
                }
                sidrMoving = true;
                if (side === "left") {
                    bodyAnimation = {
                        left: menuWidth + "px"
                    };
                    menuAnimation = {
                        left: "0px"
                    };
                } else {
                    bodyAnimation = {
                        right: menuWidth + "px"
                    };
                    menuAnimation = {
                        right: "0px"
                    };
                }
                if ($body.is("body")) {
                    scrollTop = $html.scrollTop();
                    $html.css("overflow-x", "hidden").scrollTop(scrollTop);
                }
                if (displace) {
                    $body.addClass("sidr-animating").css({
                        width: $body.width(),
                        position: "absolute"
                    }).animate(bodyAnimation, speed, function() {
                        $(this).addClass(bodyClass);
                    });
                } else {
                    setTimeout(function() {
                        $(this).addClass(bodyClass);
                    }, speed);
                }
                $menu.css("display", "block").animate(menuAnimation, speed, function() {
                    sidrMoving = false;
                    sidrOpened = name;
                    if (typeof callback === "function") {
                        callback(name);
                    }
                    $body.removeClass("sidr-animating");
                });
                onOpen();
            } else {
                if (!$menu.is(":visible") || sidrMoving) {
                    return;
                }
                sidrMoving = true;
                if (side === "left") {
                    bodyAnimation = {
                        left: 0
                    };
                    menuAnimation = {
                        left: "-" + menuWidth + "px"
                    };
                } else {
                    bodyAnimation = {
                        right: 0
                    };
                    menuAnimation = {
                        right: "-" + menuWidth + "px"
                    };
                }
                if ($body.is("body")) {
                    scrollTop = $html.scrollTop();
                    $html.removeAttr("style").scrollTop(scrollTop);
                }
                $body.addClass("sidr-animating").animate(bodyAnimation, speed).removeClass(bodyClass);
                $menu.animate(menuAnimation, speed, function() {
                    $menu.removeAttr("style").hide();
                    $body.removeAttr("style");
                    $("html").removeAttr("style");
                    sidrMoving = false;
                    sidrOpened = false;
                    if (typeof callback === "function") {
                        callback(name);
                    }
                    $body.removeClass("sidr-animating");
                });
                onClose();
            }
        }
    };
    var methods = {
        open: function(name, callback) {
            privateMethods.execute("open", name, callback);
        },
        close: function(name, callback) {
            privateMethods.execute("close", name, callback);
        },
        toggle: function(name, callback) {
            privateMethods.execute("toggle", name, callback);
        },
        toogle: function(name, callback) {
            privateMethods.execute("toggle", name, callback);
        }
    };
    $.sidr = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "function" || typeof method === "string" || !method) {
            return methods.toggle.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.sidr");
        }
    };
    $.fn.sidr = function(options) {
        var settings = $.extend({
            name: "sidr",
            speed: 200,
            side: "left",
            source: null,
            renaming: true,
            body: "body",
            displace: true,
            onOpen: function() {},
            onClose: function() {}
        }, options);
        var name = settings.name, $sideMenu = $("#" + name);
        if ($sideMenu.length === 0) {
            $sideMenu = $("<div />").attr("id", name).appendTo($("body"));
        }
        $sideMenu.addClass("sidr").addClass(settings.side).data({
            speed: settings.speed,
            side: settings.side,
            body: settings.body,
            displace: settings.displace,
            onOpen: settings.onOpen,
            onClose: settings.onClose
        });
        if (typeof settings.source === "function") {
            var newContent = settings.source(name);
            privateMethods.loadContent($sideMenu, newContent);
        } else if (typeof settings.source === "string" && privateMethods.isUrl(settings.source)) {
            $.get(settings.source, function(data) {
                privateMethods.loadContent($sideMenu, data);
            });
        } else if (typeof settings.source === "string") {
            var htmlContent = "", selectors = settings.source.split(",");
            $.each(selectors, function(index, element) {
                htmlContent += '<div class="sidr-inner">' + $(element).html() + "</div>";
            });
            if (settings.renaming) {
                var $htmlContent = $("<div />").html(htmlContent);
                $htmlContent.find("*").each(function(index, element) {
                    var $element = $(element);
                    privateMethods.addPrefix($element);
                });
                htmlContent = $htmlContent.html();
            }
            privateMethods.loadContent($sideMenu, htmlContent);
        } else if (settings.source !== null) {
            $.error("Invalid Sidr Source");
        }
        return this.each(function() {
            var $this = $(this), data = $this.data("sidr");
            if (!data) {
                $this.data("sidr", name);
                if ("ontouchstart" in document.documentElement) {
                    $this.bind("touchstart", function(e) {
                        var theEvent = e.originalEvent.touches[0];
                        this.touched = e.timeStamp;
                    });
                    $this.bind("touchend", function(e) {
                        var delta = Math.abs(e.timeStamp - this.touched);
                        if (delta < 200) {
                            e.preventDefault();
                            methods.toggle(name);
                        }
                    });
                } else {
                    $this.click(function(e) {
                        e.preventDefault();
                        methods.toggle(name);
                    });
                }
            }
        });
    };
})(jQuery);

(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }
})(function($) {
    "use strict";
    var Slick = window.Slick || {};
    Slick = function() {
        var instanceUid = 0;
        function Slick(element, settings) {
            var _ = this, responsiveSettings, breakpoint;
            _.defaults = {
                accessibility: true,
                arrows: true,
                autoplay: false,
                autoplaySpeed: 3e3,
                centerMode: false,
                centerPadding: "50px",
                cssEase: "ease",
                customPaging: function(slider, i) {
                    return '<button type="button">' + (i + 1) + "</button>";
                },
                dots: false,
                draggable: true,
                easing: "linear",
                fade: false,
                infinite: true,
                lazyLoad: "ondemand",
                onBeforeChange: null,
                onAfterChange: null,
                onInit: null,
                onReInit: null,
                pauseOnHover: true,
                responsive: null,
                slide: "div",
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 300,
                swipe: true,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                vertical: false
            };
            _.initials = {
                animating: false,
                autoPlayTimer: null,
                currentSlide: 0,
                currentLeft: null,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false
            };
            $.extend(_, _.initials);
            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.paused = false;
            _.positionProp = null;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.windowWidth = 0;
            _.windowTimer = null;
            _.options = $.extend({}, _.defaults, settings);
            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;
            if (responsiveSettings && responsiveSettings.length > -1) {
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[breakpoint].breakpoint] = responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function(a, b) {
                    return b - a;
                });
            }
            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.instanceUid = instanceUid++;
            _.init();
        }
        return Slick;
    }();
    Slick.prototype.addSlide = function(markup, index, addBefore) {
        var _ = this;
        if (typeof index === "boolean") {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }
        _.unload();
        if (typeof index === "number") {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }
        _.$slides = _.$slideTrack.children(this.options.slide);
        _.$slideTrack.children(this.options.slide).remove();
        _.$slideTrack.append(_.$slides);
        _.$slidesCache = _.$slides;
        _.reinit();
    };
    Slick.prototype.animateSlide = function(targetLeft, callback) {
        var animProps = {}, _ = this;
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }
        } else {
            if (_.cssTransitions === false) {
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        if (_.options.vertical === false) {
                            animProps[_.animType] = "translate(" + now + "px, 0px)";
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = "translate(0px," + now + "px)";
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });
            } else {
                _.applyTransition();
                if (_.options.vertical === false) {
                    animProps[_.animType] = "translate3d(" + targetLeft + "px, 0px, 0px)";
                } else {
                    animProps[_.animType] = "translate3d(0px," + targetLeft + "px, 0px)";
                }
                _.$slideTrack.css(animProps);
                if (callback) {
                    setTimeout(function() {
                        _.disableTransition();
                        callback.call();
                    }, _.options.speed);
                }
            }
        }
    };
    Slick.prototype.applyTransition = function(slide) {
        var _ = this, transition = {};
        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + " " + _.options.speed + "ms " + _.options.cssEase;
        } else {
            transition[_.transitionType] = "opacity " + _.options.speed + "ms " + _.options.cssEase;
        }
        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };
    Slick.prototype.autoPlay = function() {
        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }
    };
    Slick.prototype.autoPlayClear = function() {
        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
    };
    Slick.prototype.autoPlayIterator = function() {
        var _ = this;
        if (_.options.infinite === false) {
            if (_.direction === 1) {
                if (_.currentSlide + 1 === _.slideCount - 1) {
                    _.direction = 0;
                }
                _.slideHandler(_.currentSlide + _.options.slidesToScroll);
            } else {
                if (_.currentSlide - 1 === 0) {
                    _.direction = 1;
                }
                _.slideHandler(_.currentSlide - _.options.slidesToScroll);
            }
        } else {
            _.slideHandler(_.currentSlide + _.options.slidesToScroll);
        }
    };
    Slick.prototype.buildArrows = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow = $('<button type="button" class="slick-prev"></button>').appendTo(_.$slider);
            _.$nextArrow = $('<button type="button" class="slick-next"></button>').appendTo(_.$slider);
            if (_.options.infinite !== true) {
                _.$prevArrow.addClass("slick-disabled");
            }
        }
    };
    Slick.prototype.buildDots = function() {
        var _ = this, i, dotString;
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            dotString = '<ul class="slick-dots">';
            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += "<li>" + _.options.customPaging.call(this, _, i) + "</li>";
            }
            dotString += "</ul>";
            _.$dots = $(dotString).appendTo(_.$slider);
            _.$dots.find("li").first().addClass("slick-active");
        }
    };
    Slick.prototype.buildOut = function() {
        var _ = this;
        _.$slides = _.$slider.children(_.options.slide + ":not(.slick-cloned)").addClass("slick-slide");
        _.slideCount = _.$slides.length;
        _.$slidesCache = _.$slides;
        _.$slider.addClass("slick-slider");
        _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();
        _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();
        _.$slideTrack.css("opacity", 0);
        if (_.options.centerMode === true) {
            _.options.infinite = true;
            _.options.slidesToScroll = 1;
            if (_.options.slidesToShow % 2 === 0) {
                _.options.slidesToShow = 3;
            }
        }
        $("img[data-lazy]", _.$slider).not("[src]").addClass("slick-loading");
        _.setupInfinite();
        _.buildArrows();
        _.buildDots();
        if (_.options.accessibility === true) {
            _.$list.prop("tabIndex", 0);
        }
        _.setSlideClasses(0);
        if (_.options.draggable === true) {
            _.$list.addClass("draggable");
        }
    };
    Slick.prototype.checkResponsive = function() {
        var _ = this, breakpoint, targetBreakpoint;
        if (_.originalSettings.responsive && _.originalSettings.responsive.length > -1 && _.originalSettings.responsive !== null) {
            targetBreakpoint = null;
            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if ($(window).width() < _.breakpoints[breakpoint]) {
                        targetBreakpoint = _.breakpoints[breakpoint];
                    }
                }
            }
            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint = targetBreakpoint;
                        _.options = $.extend({}, _.defaults, _.breakpointSettings[targetBreakpoint]);
                        _.refresh();
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    _.options = $.extend({}, _.defaults, _.breakpointSettings[targetBreakpoint]);
                    _.refresh();
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = $.extend({}, _.defaults, _.originalSettings);
                    _.refresh();
                }
            }
        }
    };
    Slick.prototype.changeSlide = function(event) {
        var _ = this;
        switch (event.data.message) {
          case "previous":
            _.slideHandler(_.currentSlide - _.options.slidesToScroll);
            break;

          case "next":
            _.slideHandler(_.currentSlide + _.options.slidesToScroll);
            break;

          case "index":
            _.slideHandler($(event.target).parent().index() * _.options.slidesToScroll);
            break;

          default:
            return false;
        }
    };
    Slick.prototype.destroy = function() {
        var _ = this;
        _.autoPlayClear();
        _.touchObject = {};
        $(".slick-cloned", _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.unwrap().unwrap();
        _.$slides.removeClass("slick-slide slick-active slick-visible").removeAttr("style");
        _.$slider.removeClass("slick-slider");
        _.$slider.removeClass("slick-initialized");
        _.$list.off(".slick");
        $(window).off(".slick-" + _.instanceUid);
    };
    Slick.prototype.disableTransition = function(slide) {
        var _ = this, transition = {};
        transition[_.transitionType] = "";
        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };
    Slick.prototype.fadeSlide = function(slideIndex, callback) {
        var _ = this;
        if (_.cssTransitions === false) {
            _.$slides.eq(slideIndex).css({
                zIndex: 1e3
            });
            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);
        } else {
            _.applyTransition(slideIndex);
            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1e3
            });
            if (callback) {
                setTimeout(function() {
                    _.disableTransition(slideIndex);
                    callback.call();
                }, _.options.speed);
            }
        }
    };
    Slick.prototype.filterSlides = function(filter) {
        var _ = this;
        if (filter !== null) {
            _.unload();
            _.$slideTrack.children(this.options.slide).remove();
            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);
            _.reinit();
        }
    };
    Slick.prototype.getCurrent = function() {
        var _ = this;
        return _.currentSlide;
    };
    Slick.prototype.getDotCount = function() {
        var _ = this, breaker = 0, dotCounter = 0, dotCount = 0, dotLimit;
        dotLimit = _.options.infinite === true ? _.slideCount + _.options.slidesToShow - _.options.slidesToScroll : _.slideCount;
        while (breaker < dotLimit) {
            dotCount++;
            dotCounter += _.options.slidesToScroll;
            breaker = dotCounter + _.options.slidesToShow;
        }
        return dotCount;
    };
    Slick.prototype.getLeft = function(slideIndex) {
        var _ = this, targetLeft, verticalHeight, verticalOffset = 0;
        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();
        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                verticalOffset = verticalHeight * _.options.slidesToShow * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = _.slideCount % _.options.slidesToShow * _.slideWidth * -1;
                    verticalOffset = _.slideCount % _.options.slidesToShow * verticalHeight * -1;
                }
            }
        } else {
            if (_.slideCount % _.options.slidesToShow !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = _.options.slidesToShow * _.slideWidth - _.slideCount % _.options.slidesToShow * _.slideWidth;
                    verticalOffset = _.slideCount % _.options.slidesToShow * verticalHeight;
                }
            }
        }
        if (_.options.centerMode === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        }
        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }
        return targetLeft;
    };
    Slick.prototype.init = function() {
        var _ = this;
        if (!$(_.$slider).hasClass("slick-initialized")) {
            $(_.$slider).addClass("slick-initialized");
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.checkResponsive();
        }
        if (_.options.onInit !== null) {
            _.options.onInit.call(this, _);
        }
    };
    Slick.prototype.initArrowEvents = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on("click.slick", {
                message: "previous"
            }, _.changeSlide);
            _.$nextArrow.on("click.slick", {
                message: "next"
            }, _.changeSlide);
        }
    };
    Slick.prototype.initDotEvents = function() {
        var _ = this;
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $("li", _.$dots).on("click.slick", {
                message: "index"
            }, _.changeSlide);
        }
    };
    Slick.prototype.initializeEvents = function() {
        var _ = this;
        _.initArrowEvents();
        _.initDotEvents();
        _.$list.on("touchstart.slick mousedown.slick", {
            action: "start"
        }, _.swipeHandler);
        _.$list.on("touchmove.slick mousemove.slick", {
            action: "move"
        }, _.swipeHandler);
        _.$list.on("touchend.slick mouseup.slick", {
            action: "end"
        }, _.swipeHandler);
        _.$list.on("touchcancel.slick mouseleave.slick", {
            action: "end"
        }, _.swipeHandler);
        if (_.options.pauseOnHover === true && _.options.autoplay === true) {
            _.$list.on("mouseenter.slick", _.autoPlayClear);
            _.$list.on("mouseleave.slick", _.autoPlay);
        }
        if (_.options.accessibility === true) {
            _.$list.on("keydown.slick", _.keyHandler);
        }
        $(window).on("orientationchange.slick.slick-" + _.instanceUid, function() {
            _.checkResponsive();
            _.setPosition();
        });
        $(window).on("resize.slick.slick-" + _.instanceUid, function() {
            if ($(window).width !== _.windowWidth) {
                clearTimeout(_.windowDelay);
                _.windowDelay = window.setTimeout(function() {
                    _.windowWidth = $(window).width();
                    _.checkResponsive();
                    _.setPosition();
                }, 50);
            }
        });
        $(window).on("load.slick.slick-" + _.instanceUid, _.setPosition);
    };
    Slick.prototype.initUI = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.show();
            _.$nextArrow.show();
        }
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            _.$dots.show();
        }
        if (_.options.autoplay === true) {
            _.autoPlay();
        }
    };
    Slick.prototype.keyHandler = function(event) {
        var _ = this;
        if (event.keyCode === 37) {
            _.changeSlide({
                data: {
                    message: "previous"
                }
            });
        } else if (event.keyCode === 39) {
            _.changeSlide({
                data: {
                    message: "next"
                }
            });
        }
    };
    Slick.prototype.lazyLoad = function() {
        var _ = this, loadRange, cloneRange, rangeStart, rangeEnd;
        if (_.options.centerMode === true || _.options.fade === true) {
            rangeStart = _.options.slidesToShow + _.currentSlide - 1;
            rangeEnd = rangeStart + _.options.slidesToShow + 2;
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
        }
        loadRange = _.$slider.find(".slick-slide").slice(rangeStart, rangeEnd);
        $("img[data-lazy]", loadRange).not("[src]").each(function() {
            $(this).css({
                opacity: 0
            }).attr("src", $(this).attr("data-lazy")).removeClass("slick-loading").load(function() {
                $(this).animate({
                    opacity: 1
                }, 200);
            });
        });
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find(".slick-cloned").slice(0, _.options.slidesToShow);
            $("img[data-lazy]", cloneRange).not("[src]").each(function() {
                $(this).css({
                    opacity: 0
                }).attr("src", $(this).attr("data-lazy")).removeClass("slick-loading").load(function() {
                    $(this).animate({
                        opacity: 1
                    }, 200);
                });
            });
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find(".slick-cloned").slice(_.options.slidesToShow * -1);
            $("img[data-lazy]", cloneRange).not("[src]").each(function() {
                $(this).css({
                    opacity: 0
                }).attr("src", $(this).attr("data-lazy")).removeClass("slick-loading").load(function() {
                    $(this).animate({
                        opacity: 1
                    }, 200);
                });
            });
        }
    };
    Slick.prototype.loadSlider = function() {
        var _ = this;
        _.setPosition();
        _.$slideTrack.css({
            opacity: 1
        });
        _.$slider.removeClass("slick-loading");
        _.initUI();
        if (_.options.lazyLoad === "progressive") {
            _.progressiveLazyLoad();
        }
    };
    Slick.prototype.postSlide = function(index) {
        var _ = this;
        if (_.options.onAfterChange !== null) {
            _.options.onAfterChange.call(this, _, index);
        }
        _.animating = false;
        _.setPosition();
        _.swipeLeft = null;
        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }
    };
    Slick.prototype.progressiveLazyLoad = function() {
        var _ = this, imgCount, targetImage;
        imgCount = $("img[data-lazy]").not("[src]").length;
        if (imgCount > 0) {
            targetImage = $($("img[data-lazy]", _.$slider).not("[src]").get(0));
            targetImage.attr("src", targetImage.attr("data-lazy")).removeClass("slick-loading").load(function() {
                _.progressiveLazyLoad();
            });
        }
    };
    Slick.prototype.refresh = function() {
        var _ = this;
        _.destroy();
        $.extend(_, _.initials);
        _.init();
    };
    Slick.prototype.reinit = function() {
        var _ = this;
        _.$slides = _.$slideTrack.children(_.options.slide).addClass("slick-slide");
        _.slideCount = _.$slides.length;
        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }
        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.setSlideClasses(0);
        _.setPosition();
        if (_.options.onReInit !== null) {
            _.options.onReInit.call(this, _);
        }
    };
    Slick.prototype.removeSlide = function(index, removeBefore) {
        var _ = this;
        if (typeof index === "boolean") {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }
        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }
        _.unload();
        _.$slideTrack.children(this.options.slide).eq(index).remove();
        _.$slides = _.$slideTrack.children(this.options.slide);
        _.$slideTrack.children(this.options.slide).remove();
        _.$slideTrack.append(_.$slides);
        _.$slidesCache = _.$slides;
        _.reinit();
    };
    Slick.prototype.setCSS = function(position) {
        var _ = this, positionProps = {}, x, y;
        x = _.positionProp == "left" ? position + "px" : "0px";
        y = _.positionProp == "top" ? position + "px" : "0px";
        positionProps[_.positionProp] = position;
        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = "translate(" + x + ", " + y + ")";
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = "translate3d(" + x + ", " + y + ", 0px)";
                _.$slideTrack.css(positionProps);
            }
        }
    };
    Slick.prototype.setDimensions = function() {
        var _ = this;
        if (_.options.centerMode === true) {
            _.$slideTrack.children(".slick-slide").width(_.slideWidth);
        } else {
            _.$slideTrack.children(".slick-slide").width(_.slideWidth);
        }
        if (_.options.vertical === false) {
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children(".slick-slide").length));
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: "0px " + _.options.centerPadding
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight() * _.options.slidesToShow);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight() * _.$slideTrack.children(".slick-slide").length));
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + " 0px"
                });
            }
        }
    };
    Slick.prototype.setFade = function() {
        var _ = this, targetLeft;
        _.$slides.each(function(index, element) {
            targetLeft = _.slideWidth * index * -1;
            $(element).css({
                position: "relative",
                left: targetLeft,
                top: 0,
                zIndex: 800,
                opacity: 0
            });
        });
        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1
        });
    };
    Slick.prototype.setPosition = function() {
        var _ = this;
        _.setValues();
        _.setDimensions();
        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }
    };
    Slick.prototype.setProps = function() {
        var _ = this;
        _.positionProp = _.options.vertical === true ? "top" : "left";
        if (_.positionProp === "top") {
            _.$slider.addClass("slick-vertical");
        } else {
            _.$slider.removeClass("slick-vertical");
        }
        if (document.body.style.WebkitTransition !== undefined || document.body.style.MozTransition !== undefined || document.body.style.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }
        if (document.body.style.MozTransform !== undefined) {
            _.animType = "MozTransform";
            _.transformType = "-moz-transform";
            _.transitionType = "MozTransition";
        }
        if (document.body.style.webkitTransform !== undefined) {
            _.animType = "webkitTransform";
            _.transformType = "-webkit-transform";
            _.transitionType = "webkitTransition";
        }
        if (document.body.style.msTransform !== undefined) {
            _.animType = "transform";
            _.transformType = "transform";
            _.transitionType = "transition";
        }
        _.transformsEnabled = _.animType !== null;
    };
    Slick.prototype.setValues = function() {
        var _ = this;
        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();
        if (_.options.vertical === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
        }
    };
    Slick.prototype.setSlideClasses = function(index) {
        var _ = this, centerOffset, allSlides, indexOffset;
        _.$slider.find(".slick-slide").removeClass("slick-active").removeClass("slick-center");
        allSlides = _.$slider.find(".slick-slide");
        if (_.options.centerMode === true) {
            centerOffset = Math.floor(_.options.slidesToShow / 2);
            if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass("slick-active");
            } else {
                indexOffset = _.options.slidesToShow + index;
                allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass("slick-active");
            }
            if (index === 0) {
                allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass("slick-center");
            } else if (index === _.slideCount - 1) {
                allSlides.eq(_.options.slidesToShow).addClass("slick-center");
            }
            _.$slides.eq(index).addClass("slick-center");
        } else {
            if (index > 0 && index < _.slideCount - _.options.slidesToShow) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass("slick-active");
            } else {
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass("slick-active");
            }
        }
        if (_.options.lazyLoad === "ondemand") {
            _.lazyLoad();
        }
    };
    Slick.prototype.setupInfinite = function() {
        var _ = this, i, slideIndex, infiniteCount;
        if (_.options.fade === true || _.options.vertical === true) {
            _.options.centerMode = false;
        }
        if (_.options.infinite === true && _.options.fade === false) {
            slideIndex = null;
            if (_.slideCount > _.options.slidesToShow) {
                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }
                for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone().attr("id", "").prependTo(_.$slideTrack).addClass("slick-cloned");
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone().attr("id", "").appendTo(_.$slideTrack).addClass("slick-cloned");
                }
                _.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                    $(this).attr("id", "");
                });
            }
        }
    };
    Slick.prototype.slideHandler = function(index) {
        var targetSlide, animSlide, slideLeft, unevenOffset, targetLeft = null, _ = this;
        if (_.animating === true) {
            return false;
        }
        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);
        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0 ? _.options.slidesToScroll : 0;
        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;
        if (_.options.infinite === false && (index < 0 || index > _.slideCount - _.options.slidesToShow + unevenOffset)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                _.animateSlide(slideLeft, function() {
                    _.postSlide(targetSlide);
                });
            }
            return false;
        }
        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }
        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount - _.options.slidesToScroll;
            }
        } else if (targetSlide > _.slideCount - 1) {
            animSlide = 0;
        } else {
            animSlide = targetSlide;
        }
        _.animating = true;
        if (_.options.onBeforeChange !== null && index !== _.currentSlide) {
            _.options.onBeforeChange.call(this, _, _.currentSlide, animSlide);
        }
        _.currentSlide = animSlide;
        _.setSlideClasses(_.currentSlide);
        _.updateDots();
        _.updateArrows();
        if (_.options.fade === true) {
            _.fadeSlide(animSlide, function() {
                _.postSlide(animSlide);
            });
            return false;
        }
        _.animateSlide(targetLeft, function() {
            _.postSlide(animSlide);
        });
    };
    Slick.prototype.startLoad = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.hide();
            _.$nextArrow.hide();
        }
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            _.$dots.hide();
        }
        _.$slider.addClass("slick-loading");
    };
    Slick.prototype.swipeDirection = function() {
        var xDist, yDist, r, swipeAngle, _ = this;
        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);
        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }
        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return "left";
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return "left";
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return "right";
        }
        return "vertical";
    };
    Slick.prototype.swipeEnd = function(event) {
        var _ = this;
        _.$list.removeClass("dragging");
        if (_.touchObject.curX === undefined) {
            return false;
        }
        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
            $(event.target).on("click.slick", function(event) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                $(event.target).off("click.slick");
            });
            switch (_.swipeDirection()) {
              case "left":
                _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                _.touchObject = {};
                break;

              case "right":
                _.slideHandler(_.currentSlide - _.options.slidesToScroll);
                _.touchObject = {};
                break;
            }
        } else {
            if (_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }
    };
    Slick.prototype.swipeHandler = function(event) {
        var _ = this;
        if (_.options.swipe === false || "ontouchend" in document && _.options.swipe === false) {
            return undefined;
        } else if (_.options.draggable === false || _.options.draggable === false && !event.originalEvent.touches) {
            return undefined;
        }
        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;
        _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;
        switch (event.data.action) {
          case "start":
            _.swipeStart(event);
            break;

          case "move":
            _.swipeMove(event);
            break;

          case "end":
            _.swipeEnd(event);
            break;
        }
    };
    Slick.prototype.swipeMove = function(event) {
        var _ = this, curLeft, swipeDirection, positionOffset, touches;
        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;
        curLeft = _.getLeft(_.currentSlide);
        if (!_.$list.hasClass("dragging") || touches && touches.length !== 1) {
            return false;
        }
        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;
        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));
        swipeDirection = _.swipeDirection();
        if (swipeDirection === "vertical") {
            return;
        }
        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }
        positionOffset = _.touchObject.curX > _.touchObject.startX ? 1 : -1;
        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + _.touchObject.swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + _.touchObject.swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }
        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }
        _.setCSS(_.swipeLeft);
    };
    Slick.prototype.swipeStart = function(event) {
        var _ = this, touches;
        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }
        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }
        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;
        _.$list.addClass("dragging");
    };
    Slick.prototype.unfilterSlides = function() {
        var _ = this;
        if (_.$slidesCache !== null) {
            _.unload();
            _.$slideTrack.children(this.options.slide).remove();
            _.$slidesCache.appendTo(_.$slideTrack);
            _.reinit();
        }
    };
    Slick.prototype.unload = function() {
        var _ = this;
        $(".slick-cloned", _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.removeClass("slick-slide slick-active slick-visible").removeAttr("style");
    };
    Slick.prototype.updateArrows = function() {
        var _ = this;
        if (_.options.arrows === true && _.options.infinite !== true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass("slick-disabled");
            _.$nextArrow.removeClass("slick-disabled");
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass("slick-disabled");
                _.$nextArrow.removeClass("slick-disabled");
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                _.$nextArrow.addClass("slick-disabled");
                _.$prevArrow.removeClass("slick-disabled");
            }
        }
    };
    Slick.prototype.updateDots = function() {
        var _ = this;
        if (_.$dots !== null) {
            _.$dots.find("li").removeClass("slick-active");
            _.$dots.find("li").eq(_.currentSlide / _.options.slidesToScroll).addClass("slick-active");
        }
    };
    $.fn.slick = function(options) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick = new Slick(element, options);
        });
    };
    $.fn.slickAdd = function(slide, slideIndex, addBefore) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.addSlide(slide, slideIndex, addBefore);
        });
    };
    $.fn.slickCurrentSlide = function() {
        var _ = this;
        return _.get(0).slick.getCurrent();
    };
    $.fn.slickFilter = function(filter) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.filterSlides(filter);
        });
    };
    $.fn.slickGoTo = function(slide) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.slideHandler(slide);
        });
    };
    $.fn.slickNext = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.changeSlide({
                data: {
                    message: "next"
                }
            });
        });
    };
    $.fn.slickPause = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.autoPlayClear();
            element.slick.paused = true;
        });
    };
    $.fn.slickPlay = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.paused = false;
            element.slick.autoPlay();
        });
    };
    $.fn.slickPrev = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.changeSlide({
                data: {
                    message: "previous"
                }
            });
        });
    };
    $.fn.slickRemove = function(slideIndex, removeBefore) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.removeSlide(slideIndex, removeBefore);
        });
    };
    $.fn.slickSetOption = function(option, value, refresh) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.options[option] = value;
            if (refresh === true) {
                element.slick.unload();
                element.slick.reinit();
            }
        });
    };
    $.fn.slickUnfilter = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.unfilterSlides();
        });
    };
    $.fn.unslick = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.destroy();
        });
    };
});

(function($, window, document, undefined) {
    "use strict";
    var pluginName = "Slidedown", defaults = {
        menu: "nav",
        padding: 10
    };
    function Slidedown(element, options) {
        this.element = element;
        this.$element = $(element);
        this.$slidedown = $(".SlideDown");
        this.$slidedownMenu = $(".js-slideDownMenu");
        this._data = this.$element.data();
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Slidedown.prototype = {
        init: function() {
            var slidedown = this, $this = this.$element;
            $this.on("click.Slidedown touchstart.Slidedown", function(e) {
                e.preventDefault();
                $.proxy(slidedown.toggle, slidedown)();
            });
        },
        toggle: function() {
            var $Slidedown = this.$element;
            this.$slidedownMenu.addClass("u-visuallyHidden");
            if ($Slidedown.hasClass("is-active")) {
                $Slidedown.removeClass("is-active");
                this.$slidedown.addClass("u-visuallyHidden");
                this.$slidedown.attr("data-SlideDown-state", "closed");
            } else {
                $(".js-slideDown").removeClass("is-active");
                $Slidedown.addClass("is-active");
                $(this.element.hash).removeClass("u-visuallyHidden");
                this.$slidedown.removeClass("u-visuallyHidden");
                this.$slidedown.css("margin-bottom", this.$slidedown.outerHeight() * -1 + 10);
                this.$slidedown.attr("data-SlideDown-state", "open");
            }
        }
    };
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments);
        this.each(function() {
            var $this = $(this), data = $this.data("plugin_" + pluginName);
            if (!data) {
                $this.data("plugin_" + pluginName, data = new Slidedown(this, options));
            }
            if (options === "select") {
                data.select(args[1]);
            }
            if (typeof options === "string") {
                data[options]();
            }
        });
        return this;
    };
})(jQuery, window, document);

(function(e, t, n, r, i, s) {
    function o(t, n) {
        if (n) {
            var r = n.getAttribute("viewBox"), i = e.createDocumentFragment(), s = n.cloneNode(true);
            if (r) {
                t.setAttribute("viewBox", r);
            }
            while (s.childNodes.length) {
                i.appendChild(s.childNodes[0]);
            }
            t.appendChild(i);
        }
    }
    function u() {
        var t = this, n = e.createElement("x"), r = t.s;
        n.innerHTML = t.responseText;
        t.onload = function() {
            r.splice(0).map(function(e) {
                o(e[0], n.querySelector("#" + e[1].replace(/(\W)/g, "\\$1")));
            });
        };
        t.onload();
    }
    function a() {
        var s;
        while (s = t[0]) {
            if (i) {
                var f = new Image();
                f.src = s.getAttribute("xlink:href").replace("#", ".").replace(/^\./, "") + ".png";
                s.parentNode.replaceChild(f, s);
            } else {
                var l = s.parentNode, c = s.getAttribute("xlink:href").split("#"), h = c[0], p = c[1];
                l.removeChild(s);
                if (h.length) {
                    var d = r[h] = r[h] || new XMLHttpRequest();
                    if (!d.s) {
                        d.s = [];
                        d.open("GET", h);
                        d.onload = u;
                        d.send();
                    }
                    d.s.push([ l, p ]);
                    if (d.readyState === 4) {
                        d.onload();
                    }
                } else {
                    o(l, e.getElementById(p));
                }
            }
        }
        n(a);
    }
    if (i || s) {
        a();
    }
})(document, document.getElementsByTagName("use"), window.requestAnimationFrame || window.setTimeout, {}, /MSIE\s[1-8]\b/.test(navigator.userAgent), /Trident\/[567]\b/.test(navigator.userAgent), document.createElement("svg"), document.createElement("use"));