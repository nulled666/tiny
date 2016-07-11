define([
    './base',
    './polyfill',
    './console',
    './message',
    './route',
    './storage',
    './format',
], function (tiny) {

    'use strict';

    return (window.tiny = tiny);

});