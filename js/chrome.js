$(document).on('click', '.js-search', function() {
    var searchID = $(this).data('searchid');
    $('#' + searchID).toggleClass('is-closed');
});

$('.Offcanvas-submenuItem').on('click', 'a', function() {
	$.sidr('close', 'slideOutNav');	
});