define(function () {

    // Element.matches support for tinyQ
    
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) { }
                return i > -1;
            };
    }

    // IE8 Polyfills
    // Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
    if (!("nextElementSibling" in document.documentElement)) {
        Object.defineProperty(Element.prototype, "nextElementSibling", {
            get: function () {
                var e = this.nextSibling;
                while (e && 1 !== e.nodeType)
                    e = e.nextSibling;
                return e;
            }
        });
    }
    if (!("previousElementSibling" in document.documentElement)) {
        Object.defineProperty(Element.prototype, "previousElementSibling", {
            get: function () {
                var e = this.previousSibling;
                while (e && 1 !== e.nodeType)
                    e = e.previousSibling;
                return e;
            }
        });
    }

});