/**
* Dropdown jQuery plugin
*
* DESCRIPTION: Given specific markup, activates a trigger and configurable dropdown menu.
*
* DEPENDENCIES: FED v0.0.6+, jQuery
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
* INITIALIZATION: if ( $( '.js-dropdown' ).length ) { $( '.js-dropdown' ).Dropdown(); }
*
* OPTIONS: data-attributes and jQuery options to alter default behavior of plugin
*    - Fixed height: Limit the height of the dropdown menu.
*        - Default: auto.
*        - EX: data-height="100" or $('.js-dropdown').Dropdown({height: '100'});
*    - Vertical positioning: Position the dropdown below or above the trigger.
*        - Default: below.
*        - EX: data-vposition="above" or $('.js-dropdown').Dropdown({vposition: 'above'});
*    - Horizontal positioning: Align the dropdown with the left or right edge of the trigger.
*        - Default: left.
*        - EX: data-hposition="right" or $('.js-dropdown').Dropdown({hposition: 'right'});
*    - Preselected option: Upon initial load of the dropdown, have an item preseleced. The value of this options should match the data-value of the <li class="Dropdown-menu-item">.
*        - Default: none selected.
*        - EX: data-preselected="Two" or $('.js-dropdown').Dropdown({preselected: 'Two'});
*    - Auto-create hidden <select>: Mimick the dropdown and its values in a hidden select element. The vaule becomes the id attribute of the <select> menu.
*        - Default: not created.
*        - EX: data-select="uniqueID" or $('.js-dropdown').Dropdown({select: 'uniquID'});
*
* PUBLIC API:
*    - Open a dropdown (this can be used to toggle open/close)
*        - $('#someID').Dropdown('open');
*    - Close a dropdown
*        - $('#someID').Dropdown('close');
*    - Select an option of a Dropdown
*        - $('#someID').Dropdown('select', $jQueryObject<li class="Dropdown-menu-item">);
*
* BROADCAST EVENTS:
*    - 'open.fed.dropdown': when the dropdown opens, attached to .js-dropdown
*    - 'close.fed.dropdown': when the dropdown closes, attached to .js-dropdown
*/


;(function ($, window, document, undefined) {

    "use strict";

    // Create the defaults
    var pluginName = "Dropdown",
        defaults = {
            display:     'span',        // The element that displays the currently selected option
            option:      'li',          // The element containing a dropdown option
            select:      null,          // Will there be a hidden <select>. Default: no
            emitChange:  true,          // Emit a "change" event when updating an associated <select> value. Default: true
            height:      null,          // Is there a fixed height for the <ul> dropdown menu. Default: auto
            preselected: null,          // Is there an option pre-selected. Default: none selected
            vposition:   'below',       // Where is the dropdown menu <ul> is vertically positioned. Default: below
            hposition:   'left'         // Where the dropdown menu <ul> is horizontally positioned. Default: left
        };

    // The plugin constructor
    // @param element {raw DOM element} the element selected by user to be activated as container for dropdown
    // @param options {object} key value pairs of options. See defaults above of available key values
    function Dropdown(element, options) {

        this.element = element;                                     // Root raw element
        this.$element = $(element);                                 // Root jQuery element
        this.$menu = this.$element.find('.Dropdown-menu');          // The submenu
        this.$trigger = this.$element.find('.Dropdown-toggle');     // Button to show/hide
        this.zIndex = 1;                                            // Keep track of the z-index to show the latest dropdown on top
        this.state = 'closed';                                      // Track if dropdown is open/closed
        this._data = this.$element.data();

        // Hierarchy of settings: ( lowest < highest )
        // defaults < options passed to JS invocation < data attributes on element
        this.settings = $.extend({}, defaults, options, this._data);
        this._defaults = defaults;
        this._name = pluginName;

        //initialize the dropdown
        this.init();
    }

    Dropdown.prototype = {
        // sets up the event listeners and hidden <select> menu
        init: function () {

            var dropdown = this,
                $this = this.$element;

            // if settings request a hiddned dropdown, create select fields for form elements
            if ( this.settings.select ) { this.createSelect(); }

            // if settings request fixed height, set <ul> to fixed height with scrolling
            if ( this.settings.height ) { this.setFixedHeight(); }

            // if settings request non-defalut positioning, reposition the <ul>
            if ( this.settings.preselected ) { this.preselectOption(); }

            // Bind the trigger element for each dropdown to the open function
            $this.on('click.FED-Dropdown touchstart.FED.Dropdown', '.js-dropdownTrigger', function (e) {
                e.preventDefault();
                $.proxy(dropdown.open, dropdown)();
            });

            // Bind a click event on the document for hiding the dropdown
            $(document).on('click.FED.Dropdown touchstart.FED.Dropdown', function (e) {
                // If not clicking a dropdown and dropdown is open
                if ($(e.target).closest($this).length === 0 && dropdown.state === 'open') {
                    $.proxy(dropdown.close, dropdown)();
                }
            });

            // Bind each list item in the dropdown to the select function
            $this.on('click.FED.Dropdown', 'li', function (e) {
                // if not a heading item
                if ( !$(this).hasClass('Dropdown-menu-header') ) {
                    $.proxy(dropdown.select, dropdown, $(this))();
                }
            });
        },

        // creates an optional, hidden <select> menu that mimicks the values of the dropdown
        createSelect: function () {

            var $select, $options, i, value, text,
                $dropdown = this.$element;

            // create the <select>
            $select = $('<select style="display:none;" id="' + this.settings.select + '" aria-hidden="true"></select>');

            // collect all the items that need to be mimicked as <option>s
            $options = $dropdown.find(this.settings.option);

            // Iterate through each item creating an <option> and append it to the <select>
            for ( i = 0; i < $options.length; i++) {
                value = $($options[i]).data('value') || null;
                text = $($options[i]).text();
                $('<option value="' + value + '">' + text + '</option>').appendTo($select);
            }

            // Append the new <select> after the dropdown
            $dropdown.after($select);
        },

        // Shows a dropdown
        open: function () {

            // already open, close dropdown
            if ( this.state === 'open' ) {
                this.close();
            }
            else {
                //broadcast event
                var e = $.Event('open.fed.dropdown');
                this.$element.trigger(e);

                // mark as open state
                this.state = 'open';

                // style as open state
                this.$element.removeClass('is-closed').addClass('is-open');

                // dynamically adjust positioning on each open
                this.setPosition();
            }
        },

        // Hides a dropdown
        close: function () {

            // update dropdown state, update styles via classes swap
            this.state = 'closed';
            this.$element.addClass('is-closed').removeClass('is-open');

            //broadcast event
            var e = $.Event('close.fed.dropdown');
            this.$element.trigger(e);

            // conditionally reset the position of the dropdown
            if (this.settings.hposition === 'right') {
                this.$menu.css('right', '');
            } else {
                this.$menu.css('left', '');
            }
        },

        // Updates which item has been selected and optionally updates a hidden select element's value
        // @param $item {jQuery element} jQuery <li> element that was selected
        select: function ($item) {

            if ( !$item ) return;

            var $dropdown = this.$element,
                $objSelect;

            // removes the selected attribute from the previous selection
            $dropdown.find('li').removeAttr('selected');
            $item.attr('selected', 'selected');

            // marks currently selected item as such
            $dropdown.find('li').removeClass('is-selected');
            $item.addClass('is-selected');

            // update the button's text to selected item value
            this.$trigger.find(this.settings.display).text($item.text());

            // if this is a hidden select element update its value to match selected item
            if ( this.settings.select ) {
                $objSelect = $dropdown.next('select');
                $objSelect.val( $item.data('value') );

                if ( this.settings.emitChange ) {
                    $objSelect.trigger('change');
                }
            }

            this.close();
        },

        // set the dropdown <ul> to fixed height with internal scrolling
        setFixedHeight: function() {
            this.$menu.css({
                height: this.settings.height,
                overflowY: 'scroll'
            });
        },

        // set the position of dropdown <ul> compared to trigger
        setPosition: function() {
            // assume alignment below trigger
            var positionTop = this.$element.outerHeight();

            // reset positionTop if it needs to be above the trigger
            if ( this.settings.vposition === 'above' ) {
                positionTop = -10 - this.$menu.outerHeight();
            }

            // set vertical positioning w/ z-index
            this.$menu.css({
                'top': positionTop,
                'zIndex': this.zIndex
            });

            // set horizontal position
            if (this.settings.hposition === "right") {
                this.$menu.css({'right': 0, 'left': 'auto'});
            } else {
                this.$menu.css('left', 0);
            }
        },

        // preselect and display an option in the dropdown
        preselectOption: function() {
            var $item = this.$menu.find('[data-value="'+this.settings.preselected+'"]');

            this.select($item);
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
                $this.data( 'plugin_' + pluginName, (data = new Dropdown(this, options)));
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
