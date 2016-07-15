define(function () {
    'use strict';

    //////////////////////////////////////////////////////////
    // REQUIRED ES5 FEATURE POLYFILLS
    //////////////////////////////////////////////////////////

    // String.prototype
    // 	.includes()    <ES6 FEATURE> - IE*, Safari<9, Android<6, iOS<9
    //	.startsWith()  <ES6 FEATURE> - IE*, Safari<9, Android<6, iOS<9
    //  .endsWith()    <ES6 FEATURE> - IE*, Safari<9, Android<6, iOS<9
    //  .repeat()      <ES6 FEATURE> - IE*, Safari<9, Android<6, iOS<9
    var sp = String.prototype;
    if (!sp.includes) {
        sp.includes = function (search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        }
    }
    if (!sp.startsWith) {
        sp.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        }
    }
    if (!sp.endsWith) {
        sp.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    }
    if (!sp.repeat) {
        sp.repeat = function (count) {
            if (typeof count !== 'number') {
                count = 0;
            }
            if (count < 1) {
                return '';
            }
            return Array(count + 1).join(this);
        }
    }

});