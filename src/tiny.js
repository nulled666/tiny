define([
    './base',
    './polyfill',
    './console',
    './message',
    './route',
    './storage',
    './q',
    './lang',
    './format',
], function (tiny) {

    'use strict';

    return (window.tiny = tiny);

});