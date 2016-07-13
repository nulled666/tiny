
define(function () {
    'use strict';

    // Required ES5 Features
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    }
    if (!Array.isArray) {
        Array.isArray = function (obj) {
            return Object.prototype.toString.call(obj) == '[object Array]';
        }
    }

})