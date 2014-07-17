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
    var pluginName = "Slidedown",
        defaults = {
            menu:     'nav',        // The element that displays the currently selected option
            padding:      10       // Is there a fixed height for the <ul> dropdown menu. Default: auto
        };

    // The plugin constructor
    // @param element {raw DOM element} the element selected by user to be activated as container for dropdown
    // @param options {object} key value pairs of options. See defaults above of available key values
    function Slidedown(element, options) {

        this.element = element;                                     // Root raw element
        this.$element = $(element);                                 // Root jQuery element
        this.$slidedown = $('.SlideDown');                          // The SlideDown container
        this.$slidedownMenu = $('.js-slideDownMenu');               // The SlideDown menu
        this._data = this.$element.data();
        this.state = 'closed';

        // Hierarchy of settings: ( lowest < highest )
        // defaults < options passed to JS invocation < data attributes on element
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;

        //initialize the dropdown
        this.init();
    }

    Slidedown.prototype = {
        // sets up the event listeners and hidden <select> menu
        init: function () {

            var slidedown = this,
                $this = this.$element;

            // Bind the trigger element for each dropdown to the open function
            $this.on('click.Slidedown ', function (e) {
                e.preventDefault();

                $.proxy(slidedown.toggle, slidedown)();
            });

             $this.on('touchstart.Slidedown', function (e) {
                $.proxy(slidedown.toggle, slidedown)();
            });

            $(document).on('click.Slidedown', function (e) {
                e.preventDefault();

                if($(e.target).hasClass('js-slideDown') === false && $(e.target).closest('.SubNav').length === 0 && slidedown.state === 'open') {
                    $.proxy(slidedown.close, slidedown)();
                }
            });

            $(document).on('touchstart.Slidedown', function (e) {
                e.preventDefault();

                if($(e.target).hasClass('js-slideDown') === false && $(e.target).closest('.SubNav').length === 0 && slidedown.state === 'open') {
                    $.proxy(slidedown.close, slidedown)();
                }
            });
        },

        // creates an optional, hidden <select> menu that mimicks the values of the dropdown
        toggle: function () {
            var $Slidedown = this.$element;

            this.$slidedownMenu.addClass('u-visuallyHidden');

            if($Slidedown.hasClass('is-active')) {
                $Slidedown.removeClass('is-active');
                this.$slidedown.addClass('u-visuallyHidden');
                this.$slidedown.attr('data-SlideDown-state','closed');
                this.state = 'closed';
            } else {
                $('.js-slideDown').removeClass('is-active');
                $Slidedown.addClass('is-active');
                $(this.element.hash).removeClass('u-visuallyHidden');
                this.$slidedown.removeClass('u-visuallyHidden');
                // this.$slidedown.css('margin-bottom', this.$slidedown.outerHeight() * -1 + 10);
                this.$slidedown.attr('data-SlideDown-state','open');
                this.state = 'open';
            }
        },

        close: function() {
            $('.js-slideDown').removeClass('is-active');
            $('.js-slideDown').attr('data-SlideDown-state','closed');
            $('.SubNav').addClass('u-visuallyHidden');
            this.state = 'closed';
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
                $this.data( 'plugin_' + pluginName, (data = new Slidedown(this, options)));
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