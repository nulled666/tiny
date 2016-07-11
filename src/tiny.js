define([
    './base',
    './polyfill',
    './console',
    './message',
    './route',
    './storage',
    './lang',
    './format',
], function (tiny) {

    'use strict';

    return (window.tiny = tiny);

});