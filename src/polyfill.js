define([
    './base'
], function (tiny) {
    
    'use strict';

    //////////////////////////////////////////////////////////
    // REQUIRED ECMASCRIPT 5+ FEATURE POLYFILLS
    //////////////////////////////////////////////////////////

    // String.prototype
    //  .trim()
    // 	.includes()
    //	.startsWith()
    //  .endsWith()
    //  .repeat()
    tiny.extend(String.prototype, {

        trim: function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        },

        includes: function (search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        },

        startsWith: function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        },

        endsWith: function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        },

        repeat: function (count) {
            if (typeof count !== 'number') {
                count = 0;
            }
            if (count < 1) {
                return '';
            }
            return Array(count + 1).join(this);
        }

    }, false);

    // Array.prototype
    //  .isArray()
    //  .includes()
    tiny.extend(Array, {
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) == '[object Array]';
        },
        includes: function (searchElement /*, fromIndex*/) {
            var O = Object(this);
            var len = parseInt(O.length, 10) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1], 10) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) { k = 0; }
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                ++k;
            }
            return false;
        }
    }, false);

});