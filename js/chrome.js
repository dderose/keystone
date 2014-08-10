$(document).on('click.keystone', '.js-search', function(e) {
	e.preventDefault();
    var searchID = $(this).data('searchid');
    $('#' + searchID).toggleClass('is-closed');
});

$('.Offcanvas').on('click.keystone', '.js-offCanvasItem', function() {
	$.sidr('close', 'slideOutNav');	
});