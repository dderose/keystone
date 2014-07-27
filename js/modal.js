;(function ( $, window, document, undefined ) {

		"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "modal",
			defaults = {
				modalTemplate: $('<div class="Modal Modal--hidden"><div class="Modal-inner"><button title="Close (Esc)" type="button" class="Icon--close Modal-close js-modalClose"></button></div></div>'),
				disableClose: false,
				autoOpen: false
		};

		// The actual plugin constructor
		function Modal (element, options) {
				this.element = element;
        		this.$element = $(element);
        		this.$modal = null;
        		this.state = 'hidden';

        		// Hierarchy of settings: ( lowest < highest )
        		// defaults < options passed to JS invocation < data attributes on element
        		this.settings = $.extend({}, defaults, options);
				this._defaults = defaults;
				this._name = pluginName;
				this.options = options || {};

        		//initialize the modal
				this.init();
		}

		Modal.prototype = {
			init: function () {
					var modal = this,
            			$this = this.$element;

        			// Create modals for dynamically loaded content
					$.proxy(modal.create, modal)($this);

        			// Check to see if the Modal is supposed to open on page load
            		if(this.settings.autoOpen === true) {
            			this.show($this);
            		}

            		// If the Modal is initialized from static content, bind the trigger to the show and hide functions
            		if($this.hasClass('js-modal') === true) {
						$this.on('click.modal touchstart.modal', function(e) {
						// $(document).on('click.modal touchstart.modal', '.js-modal', function(e) {
							e.preventDefault();
	        			
	        				modal.$modal = $($(this).data('modal-id'));

							$.proxy(modal.show, modal)();
						})
					}

					// Bind the close button to the close function
					$(document).on('click.modal touchstart.modal', '.js-modalClose', function(e) {
						if (modal.state === 'shown') {
							$.proxy(modal.hide, modal)();
						}
					});

					// Bind the esc key to the hide function
					$(document).on('keydown.modal', function(e) {
						if(e.which === 27 && modal.state === 'shown') {
							e.preventDefault();
							$.proxy(modal.hide, modal)();
						}
					})

					// Bind clicking on the overlay background to the hide function; this is delegated and will work with dynamically added content
					$(document).on('click.modal touchstart.modal', '.Modal', function(e) {
						if (modal.state === 'shown' && $(e.target).closest('.Modal-inner').length === 0) {
							$.proxy(modal.hide, modal)();
						}
					})
			},

			show: function () {
				this.$modal.removeClass('Modal--hidden');
				this.state = 'shown';
				this.lockScroll();
			},

			hide: function () {
				this.$modal.addClass('Modal--hidden');
				this.state = 'hidden';
				this.unlockScroll();
			},

			destroy: function(obj) {
				var $this = $(obj);
				var $isChild = $this.closest('.Modal');

				if($isChild.length > 0) {
					$isChild.remove();
				} else {
					$this.remove();
				}
			},

			disableClose: function(obj) {

			},

			lockScroll: function() {
			    var $html = $('html'); 
			    var $body = $('body'); 
			    var initWidth = $body.outerWidth();
			    var initHeight = $body.outerHeight();

			    var scrollPosition = [
			        self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
			        self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
			    ];
			    $html.data('scroll-position', scrollPosition);
			    $html.data('previous-overflow', $html.css('overflow'));
			    $html.css('overflow', 'hidden');
			    window.scrollTo(scrollPosition[0], scrollPosition[1]);   

			    var marginR = $body.outerWidth()-initWidth;
			    var marginB = $body.outerHeight()-initHeight; 
			    $body.css({'margin-right': marginR,'margin-bottom': marginB});
			},

			unlockScroll: function() {
			    var $html = $('html');
			    var $body = $('body');
			    $html.css('overflow', $html.data('previous-overflow'));
			    var scrollPosition = $html.data('scroll-position');
			    window.scrollTo(scrollPosition[0], scrollPosition[1]);    
			},

			create: function($obj) {
				// If an object was passed on init and it was not a trigger with the .js-modal class or does not include full Modal structure then create the modal structure and insert the object inside and append to the body
				if($obj.hasClass('Modal') === true) {
					this.$modal = $obj;
					this.$modal.appendTo('body');
				}
				else if($obj.closest('.js-modal').length === 0) {
					var $modalTemplate = this.settings.modalTemplate.clone();
					$modalTemplate.find('.Modal-inner').append($obj);
					this.$modal = $modalTemplate;
					this.$modal.appendTo('body');
				}

				// If an AJAX request is specified through the data-async attribute then fetch the data, insert it into the Modal structure, and append to the body
				if(this.$element.data('async') === true) {
					var $this = this;
					var id = this.$element.data('modal-id');
					var content = this.settings.modalTemplate.clone().attr('id',id.slice(1));

					$.ajax({
						url: this.element.href,
						type: 'get',
						dataType: 'html',
						async: true,
						success: function(data) {
							content.find('.Modal-inner').append($(data));
							$('body').append(content);
							// content.find('.Modal-inner').append($(data).filter(".Modal-container"));
						}
					});
				}
			}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[pluginName] = function (options) {
	        var args = Array.prototype.slice.call(arguments);

	        this.each(function () {

	            var $this = $(this),
	                data = $this.data('plugin_' + pluginName);

	            //if Modal not instantiated on this DOM element, instantiate
	            if (!data) {
	                $this.data( 'plugin_' + pluginName, (data = new Modal(this, options)));
	            }
	            if (typeof options === 'string') {
	                //else if options is a string, try to invoke it as a method
	                //enables open/close
	                data[options](this);
	            }
	        });

	        // chain jQuery functions
	        return this;
	    };

})( jQuery, window, document );