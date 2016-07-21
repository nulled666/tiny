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
    if (!Element.prototype.getElementsByClassName) {
        window.Element.prototype.getElementsByClassName = document.constructor.prototype.getElementsByClassName = function (search) {
            if (typeof search != 'string') return null;
            search = search.trim().split(' ');
            search = '.' + search.join('.');
            return this.querySelectorAll(search);
        }
    }
    if (Object.defineProperty
        && Object.getOwnPropertyDescriptor
        && Object.getOwnPropertyDescriptor(Element.prototype, "textContent")
        && !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get) {
        (function () {
            var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
            Object.defineProperty(Element.prototype, "textContent",
                {
                    get: function () {
                        return innerText.get.call(this);
                    },
                    set: function (s) {
                        return innerText.set.call(this, s);
                    }
                }
            );
        })();
    }

});