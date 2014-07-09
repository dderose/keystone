/* jshint -W030, -W084 */

'svg use'.replace(/\w+/g, function (element) {
    document.createElement(element);
});

/MSIE\s[678]\b/.test(navigator.userAgent) && document.attachEvent('onreadystatechange', function () {
    for (var all = document.getElementsByTagName('use'), index = 0, use; use = all[index]; ++index) {
        var img = new Image();

        img.src = use.getAttribute('xlink:href').replace('#', '.')+'.png';

        use.parentNode.replaceChild(img, use);
    }
});

/Trident\/[567]\b/.test(navigator.userAgent) && document.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(document.querySelectorAll('use'), function (use) {
        var svg = use.parentNode, url = use.getAttribute('xlink:href');

        if (url) {
            var xhr = new XMLHttpRequest(), x = document.createElement('x');

            xhr.open('GET', url.replace(/#.+$/, ''));

            xhr.onload = function () {
                x.innerHTML = xhr.responseText;

                svg.replaceChild(x.querySelector(url.replace(/.+#/, '#')), use);
            };

            xhr.send();
        }
    });
});