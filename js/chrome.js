$(document).on('click.keystone', '.js-search', function(e) {
	e.preventDefault();
    var searchID = $(this).data('searchid');
    $('#' + searchID).toggleClass('is-closed');
});

$('.Offcanvas-submenuItem').on('click.keystone', 'a', function() {
	$.sidr('close', 'slideOutNav');	
});