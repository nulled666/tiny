define([
    './ie8shim',
    './polyfills',
    './base',
    './console',
    './message',
    './route',
    './storage',
    './q',
    './lang',
    './format',
], function (ie8shim, polyfills, tiny) {

    'use strict';

    return (window.tiny = tiny);

});