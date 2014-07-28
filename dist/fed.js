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

$(document).on("click.keystone", ".js-search", function() {
    var searchID = $(this).data("searchid");
    $("#" + searchID).toggleClass("is-closed");
});

$(".Offcanvas-submenuItem").on("click.keystone", "a", function() {
    $.sidr("close", "slideOutNav");
});

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

(function($, window, document, undefined) {
    "use strict";
    var pluginName = "modal", defaults = {
        modalTemplate: $('<div class="Modal Modal--hidden"><div class="Modal-inner"><button title="Close (Esc)" type="button" class="Icon--close Modal-close js-modalClose"></button></div></div>'),
        disableClose: false,
        autoOpen: false
    };
    function Modal(element, options) {
        this.element = element;
        this.$element = $(element);
        this.$modal = null;
        this.state = "hidden";
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.options = options || {};
        this.init();
    }
    Modal.prototype = {
        init: function() {
            var modal = this, $this = this.$element;
            $.proxy(modal.create, modal)($this);
            if (this.settings.autoOpen === true) {
                this.show($this);
            }
            if ($this.hasClass("js-modal") === true) {
                $this.on("click.modal touchstart.modal", function(e) {
                    e.preventDefault();
                    modal.$modal = $($(this).data("modal-id"));
                    $.proxy(modal.show, modal)();
                });
            }
            $(document).on("click.modal touchstart.modal", ".js-modalClose", function(e) {
                if (modal.state === "shown") {
                    $.proxy(modal.hide, modal)();
                }
            });
            $(document).on("keydown.modal", function(e) {
                if (e.which === 27 && modal.state === "shown") {
                    e.preventDefault();
                    $.proxy(modal.hide, modal)();
                }
            });
            $(document).on("click.modal touchstart.modal", ".Modal", function(e) {
                if (modal.state === "shown" && $(e.target).closest(".Modal-inner").length === 0) {
                    $.proxy(modal.hide, modal)();
                }
            });
        },
        show: function() {
            this.$modal.removeClass("Modal--hidden");
            this.state = "shown";
            this.lockScroll();
        },
        hide: function() {
            this.$modal.addClass("Modal--hidden");
            this.state = "hidden";
            this.unlockScroll();
        },
        destroy: function(obj) {
            var $this = $(obj);
            var $isChild = $this.closest(".Modal");
            if ($isChild.length > 0) {
                $isChild.remove();
            } else {
                $this.remove();
            }
        },
        disableClose: function(obj) {},
        lockScroll: function() {
            var $html = $("html");
            var $body = $("body");
            var initWidth = $body.outerWidth();
            var initHeight = $body.outerHeight();
            var scrollPosition = [ self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft, self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop ];
            $html.data("scroll-position", scrollPosition);
            $html.data("previous-overflow", $html.css("overflow"));
            $html.css("overflow", "hidden");
            window.scrollTo(scrollPosition[0], scrollPosition[1]);
            var marginR = $body.outerWidth() - initWidth;
            var marginB = $body.outerHeight() - initHeight;
            $body.css({
                "margin-right": marginR,
                "margin-bottom": marginB
            });
        },
        unlockScroll: function() {
            var $html = $("html");
            var $body = $("body");
            $html.css("overflow", $html.data("previous-overflow"));
            var scrollPosition = $html.data("scroll-position");
            window.scrollTo(scrollPosition[0], scrollPosition[1]);
        },
        create: function($obj) {
            if ($obj.hasClass("Modal") === true) {
                this.$modal = $obj;
                this.$modal.appendTo("body");
            } else if ($obj.closest(".js-modal").length === 0) {
                var $modalTemplate = this.settings.modalTemplate.clone();
                $modalTemplate.find(".Modal-inner").append($obj);
                this.$modal = $modalTemplate;
                this.$modal.appendTo("body");
            }
            if (this.$element.data("async") === true) {
                var $this = this;
                var id = this.$element.data("modal-id");
                var content = this.settings.modalTemplate.clone().attr("id", id.slice(1));
                $.ajax({
                    url: this.element.href,
                    type: "get",
                    dataType: "html",
                    async: true,
                    success: function(data) {
                        content.find(".Modal-inner").append($(data));
                        $("body").append(content);
                    }
                });
            }
        }
    };
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments);
        this.each(function() {
            var $this = $(this), data = $this.data("plugin_" + pluginName);
            if (!data) {
                $this.data("plugin_" + pluginName, data = new Modal(this, options));
            }
            if (typeof options === "string") {
                data[options](this);
            }
        });
        return this;
    };
})(jQuery, window, document);

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
                        position: "relative"
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
        this.state = "closed";
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Slidedown.prototype = {
        init: function() {
            var slidedown = this, $this = this.$element;
            $this.on("click.Slidedown", function(e) {
                if (e.type !== "touchstart") {
                    e.preventDefault();
                }
                $.proxy(slidedown.toggle, slidedown)();
            });
            $(document).on("click.Slidedown touchstart.Slidedown", function(e) {
                if ($(e.target).hasClass("js-slideDown") === false && $(e.target).closest(".SubNav").length === 0 && slidedown.state === "open") {
                    $.proxy(slidedown.close, slidedown)();
                }
            });
            $(".SubNav-item").on("click.Slidedown", "a", function() {
                $.proxy(slidedown.close, slidedown)();
            });
        },
        toggle: function() {
            var $Slidedown = this.$element;
            if ($Slidedown.hasClass("is-active")) {
                $Slidedown.removeClass("is-active");
                this.$slidedown.removeClass("is-open");
                this.state = "closed";
            } else {
                this.$slidedownMenu.addClass("u-visuallyHidden");
                $(".js-slideDown").removeClass("is-active");
                $Slidedown.addClass("is-active");
                $(this.element.hash).removeClass("u-visuallyHidden");
                this.$slidedown.addClass("is-open");
                this.state = "open";
            }
        },
        close: function() {
            $(".js-slideDown").removeClass("is-active");
            $(".SubNav").removeClass("is-open");
            this.state = "closed";
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

(function(document, uses, requestAnimationFrame, CACHE, LTEIE8, IE9TO11) {
    function embed(svg, g) {
        if (g) {
            var viewBox = g.getAttribute("viewBox"), fragment = document.createDocumentFragment(), clone = g.cloneNode(true);
            if (viewBox) {
                svg.setAttribute("viewBox", viewBox);
            }
            while (clone.childNodes.length) {
                fragment.appendChild(clone.childNodes[0]);
            }
            svg.appendChild(fragment);
        }
    }
    function onload() {
        var xhr = this, x = document.createElement("x"), s = xhr.s;
        x.innerHTML = xhr.responseText;
        xhr.onload = function() {
            s.splice(0).map(function(array) {
                embed(array[0], x.querySelector("#" + array[1].replace(/(\W)/g, "\\$1")));
            });
        };
        xhr.onload();
    }
    function onframe() {
        var use;
        while (use = uses[0]) {
            if (LTEIE8) {
                var img = new Image();
                img.src = use.getAttribute("xlink:href").replace("#", ".").replace(/^\./, "") + ".png";
                use.parentNode.replaceChild(img, use);
            } else {
                var svg = use.parentNode, url = use.getAttribute("xlink:href").split("#"), url_root = url[0], url_hash = url[1];
                svg.removeChild(use);
                if (url_root.length) {
                    var xhr = CACHE[url_root] = CACHE[url_root] || new XMLHttpRequest();
                    if (!xhr.s) {
                        xhr.s = [];
                        xhr.open("GET", url_root);
                        xhr.onload = onload;
                        xhr.send();
                    }
                    xhr.s.push([ svg, url_hash ]);
                    if (xhr.readyState === 4) {
                        xhr.onload();
                    }
                } else {
                    embed(svg, document.getElementById(url_hash));
                }
            }
        }
        requestAnimationFrame(onframe);
    }
    if (LTEIE8 || IE9TO11) {
        onframe();
    }
})(document, document.getElementsByTagName("use"), window.requestAnimationFrame || window.setTimeout, {}, /MSIE\s[1-8]\b/.test(navigator.userAgent), /Trident\/[567]\b/.test(navigator.userAgent) || (navigator.userAgent.match(/AppleWebKit\/(\d+)/) || [])[1] < 537, document.createElement("svg"), document.createElement("use"));

(function($, window, document, undefined) {
    "use strict";
    var pluginName = "Tab", defaults = {};
    function Tab(element, options) {
        this.element = element;
        this.$element = $(element);
        this.$slidedown = $(".SlideDown");
        this._data = this.$element.data();
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Tab.prototype = {
        init: function() {
            var tab = this, $this = this.$element;
            $this.on("click.Tab", function(e) {
                e.preventDefault();
                $.proxy(tab.toggle, tab)(this);
            });
        },
        toggle: function(o) {
            $(".js-tabContent").addClass("u-visuallyHidden");
            $(".js-tab").removeClass("is-selected");
            var $tab = $(o);
            $tab.addClass("is-selected");
            var $tabContent = $(o.hash);
            $tabContent.removeClass("u-visuallyHidden");
        }
    };
    $.fn[pluginName] = function(options) {
        var args = Array.prototype.slice.call(arguments);
        this.each(function() {
            var $this = $(this), data = $this.data("plugin_" + pluginName);
            if (!data) {
                $this.data("plugin_" + pluginName, data = new Tab(this, options));
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