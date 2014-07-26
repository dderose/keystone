/**
* Slidedown jQuery plugin
*
* DESCRIPTION: Given specific markup, activates a trigger and configurable slidedown menu.
*
* DEPENDENCIES: jQuery
*
* EXAMPLE MARKUP:
*    <div data-height="100" class="Dropdown {$modifiers} js-dropdown u-clearfix is-closed">
*        <button type="button" class="Dropdown-toggle js-dropdownTrigger">
*            <span>fixed height</span>
*            <i class="Icon--roundedCaret"></i>
*        </button>
*        <ul class="Dropdown-menu">
*            <li class="Dropdown-menu-header">Section Heading</li>
*            <li class="Dropdown-menu-item" data-value="One"><span>Link One</span></li>
*            <li class="Dropdown-menu-item" data-value="Two"><span>Link Two</span></li>
*            <li class="Dropdown-menu-item" data-value="Three"><span>Link Three</span></li>
*        </ul>
*    </div>
*
* INITIALIZATION: if ( $( '.js-slidedown' ).length ) { $( '.js-slidedown' ).Slidedown(); }
*
* OPTIONS: data-attributes and jQuery options to alter default behavior of plugin
*
* PUBLIC API:
*
* BROADCAST EVENTS:
**/

;(function ($, window, document, undefined) {

    "use strict";

    // Create the defaults
    var pluginName = "Tab",
        defaults = {

        };

    // The plugin constructor
    // @param element {raw DOM element} the element selected by user to be activated as container for dropdown
    // @param options {object} key value pairs of options. See defaults above of available key values
    function Tab(element, options) {

        this.element = element;                                     // Root raw element
        this.$element = $(element);                                 // Root jQuery element
        this.$slidedown = $('.SlideDown');                          // The SlideDown container
        this._data = this.$element.data();

        // Hierarchy of settings: ( lowest < highest )
        // defaults < options passed to JS invocation < data attributes on element
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;

        //initialize the dropdown
        this.init();
    }

    Tab.prototype = {
        // sets up the event listeners and hidden <select> menu
        init: function () {

            var tab = this,
                $this = this.$element;

            $this.on('click.Tab', function (e) {
                e.preventDefault();
                $.proxy(tab.toggle, tab)(this);
            });
        },

        // creates an optional, hidden <select> menu that mimicks the values of the dropdown
        toggle: function (o) {
            $('.js-tabContent').addClass('u-visuallyHidden');
            $('.js-tab').removeClass('is-selected');

            var $tab = $(o);
            $tab.addClass('is-selected');


            var $tabContent = $(o.hash);
            $tabContent.removeClass('u-visuallyHidden');
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    // Also, make Dropdown methods public
    $.fn[pluginName] = function (options) {
        var args = Array.prototype.slice.call(arguments);

        this.each(function () {

            var $this = $(this),
                data = $this.data('plugin_' + pluginName);

            //if Dropdown not instantiated on this DOM element, instantiate
            if (!data) {
                $this.data( 'plugin_' + pluginName, (data = new Tab(this, options)));
            }
            if (options === 'select') {
                // if invoking the 'select' method, pass the jQuery object of the option you'd like to select
                data.select(args[1]);
            }
            if (typeof options === 'string') {
                //else if options is a string, try to invoke it as a method
                //enables open/close
                data[options]();
            }
        });

        // chain jQuery functions
        return this;
    };

})(jQuery, window, document);



$(document).on('click', '.js-search', function() {
    var searchID = $(this).data('searchid');
    $('#' + searchID).toggleClass('is-closed');
});