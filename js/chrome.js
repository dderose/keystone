$(document).on('click', '.js-search', function() {
    var searchID = $(this).data('searchid');
    $('#' + searchID).toggleClass('is-closed');
});