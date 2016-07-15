define([
    './global',
    './base._polyfills'
], function (G) {

    'use strict';

    //////////////////////////////////////////////////////////
    // TINY BASE OBJECT
    //////////////////////////////////////////////////////////

    var tiny = {};
    var _prototype_extensions = [];

    // skip this method when export to global namespace
    var SKIP_GLOBAL = ',fn,consts,import,me,verbose,fnv1a,';

    // extend the tiny object
    add_to_tiny({

        import: inject_globals,
        me: show_tiny_definition,

        type: _type,
        each: _each,
        extend: _extend,
        hash: murmur3,

        // functions shared by internal functions
        x: {
            add: add_to_tiny,
            funcName: get_function_name,
            toArray: to_array
        }

    });

    // prototype extensions
    add_to_tiny([
        [Array, { _each: each_extension }],
        [String, { _each: each_extension }]
    ]);
    function each_extension(start, func, this_arg) { return _each(this.valueOf(), start, func, this_arg) }

    // a quick reference to console object
    var con = console;

    /**
     * Add entry to _tiny_definition
     */
    function add_to_tiny(obj) {

        if (typeof obj != 'object')
            throw new Error('Expect an Object or Array.');

        if (obj && obj.length) {
            _prototype_extensions = _prototype_extensions.concat(obj);
        } else {
            tiny = _extend(tiny, obj);
        }

    }

    /**
     * get a function's name - with IE8 support
     */
    function get_function_name(func) {

        if (typeof func !== 'function')
            return '';

        // use native if avaiblable - IE 9 and above
        if (func.name !== undefined) return func.name;

        // search for it - for performance, no RegExp
        var str = func.toString();
        var pos1 = str.indexOf('function');
        var pos2 = str.indexOf('(');
        if (pos1 < 0 || pos2 < pos1) return '';
        str = str.substring(pos1 + 8, pos2).trim();

        return str;

    }

    /**
    * Register functions to G namespace
    */
    function inject_globals() {

        G.GLOBAL_INJECTED = true;

        var win = window;

        if (!win) {
            con.error(G.TAG_TINY, 'window object is not available. global functions will not be registered.');
            return;
        }

        // inject G functions
        _each(tiny, function (item, label) {

            if (SKIP_GLOBAL.includes(label)) return;

            if (win['_' + label] !== undefined) {
                con.error(G.TAG_TINY, 'global function name already taken : ', '_' + label);
                throw new Error(G.SEE_ABOVE);
            }

            win['_' + label] = item;

        });

        // inject object prototype extensions
        _each(_prototype_extensions, function (item, index) {

            if (typeof item[0] !== 'function') {
                con.error(G.TAG_TINY, 'Prototype not found : ', item[0]);
                throw new Error(G.SEE_ABOVE);
            }

            _extend(item[0].prototype, item[1]);

        })

        con.info(G.TAG_TINY, 'global objects imported.');

    }

    /**
     * show _tiny namespace structure
     */
    function show_tiny_definition() {

        // show the namespace
        con.info('tiny = ' + _inspect(tiny, ['fn', 'consts']));

        // show global objects
        if (G.GLOBAL_INJECTED !== true) return;

        var win = window;
        var result = 'Injected global objects:';
        _each(tiny, function (item, label) {

            if (SKIP_GLOBAL.includes(label)) return;

            var value = win['_' + label];
            value = _inspect(value);

            result += '\n_' + label + ' = ' + value;
        });
        con.info(result);

        // show prototype extensions
        result = 'Injected prototype extensions:';
        _each(_prototype_extensions, function (item, label) {

            var name = get_function_name(item[0]);
            var value = _inspect(item[1]);

            result += '\n' + name + '.prototype + ' + value;
        });
        con.info(result);

    }


    //////////////////////////////////////////////////////////
    // CORE FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * Get exact type of an object
     * ```
     *   _type([]) == 'Array'
     *   _type({}) == 'Object'
     *   _type() == 'Undefined'
     * ```
     */
    function _type(obj) {

        var type = typeof obj;

        if (type == 'object') {
            if (!obj) {
                type = 'null';
            } else if (obj.nodeType == 1 && obj.nodeType == 9) {
                type = 'node';
            } else if (obj.jquery) {
                type = 'jquery';
            } else if (obj.tinyQ) {
                type = 'q';
            } else {
                type = Object.prototype.toString.call(obj)
                if (type == '[object Object]') {
                    type = 'object';
                } else {
                    type = type.replace('[object ', '').replace(']', '');
                }
            }
        }

        return type;
    }

    var TAG_EACH = '_each()' + G.TAG_SUFFIX;
    /**
     * Simply iteration helper function
     * ```
     *   _each( array_or_object, [start_index,] function(value, index, array_or_object){
     *     return;     // continue to next item
     *   }, this_arg); // this_arg is optional
     *   var result = _each([5, 9, 4], function(val){
     *     if(val/3 == 1)
     *         return val; // break the loop
     *   });
     *   // return anything other than undefined will stop the loop
     *   // and you'll recieve the value as _each()'s return value
     * ```
     */
    function _each(obj, start, func, this_arg) {

        var start_index = typeof start == 'number' ? start : 0;

        if (typeof start == 'function') {
            // shift parameters
            this_arg = func;
            func = start;
        }

        if (typeof func !== 'function') {
            con.error(TAG_EACH, 'Iteration callback function required. > Got "' + typeof func + '": ', func);
            throw new TypeError(G.SEE_ABOVE);
        }

        var ARRAY_LIKE = ',NodeList,Arguments,HTMLCollection,';
        var OBJECT_LIKE = ',object,Map,Function,Storage,';
        var type = _type(obj);


        var result;

        if (Array.isArray(obj) || ARRAY_LIKE.includes(type)) {

            // ==> Array
            for (var i = start_index, len = obj.length; i < len; ++i) {
                result = func.call(this_arg, obj[i], i, obj);
                if (result !== undefined) return result;
            }

        } else if (OBJECT_LIKE.includes(type)) {

            // ==> Object
            for (var label in obj) {
                result = func.call(this_arg, obj[label], label, obj);
                if (result !== undefined) return result;
            }


        } else if (type == 'jquery' || type == 'q') {

            // ==> jQuery or tinyQ Object
            for (var i = start_index, len = obj.length; i < len; ++i) {
                result = func.call(this_arg, obj.get(i), i, obj);
                if (result !== undefined) return result;
            }

        } else if (type === 'string') {

            // ==> String
            for (var i = start_index, len = obj.length; i < len; ++i) {
                result = func.call(this_arg, obj.charAt(i), i, obj);
                if (result !== undefined) return result;
            }

        } else if (type === 'number') {

            // ==> Number
            for (var i = start_index, len = obj; i < len; ++i) {
                result = func.call(this_arg, i + 1, i, obj);
                if (result !== undefined) return result;
            }

        } else {

            con.error(TAG_EACH, 'Only Array, Object, Number and String types are supported. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);

        }

    }


    var TAG_EXTEND = '_extend()' + G.TAG_SUFFIX;
    /**
     * Extends an object
     * ```
     *   _extand({'old': 1}, {'new': 200})
     *     == {'old': 1, 'new': 200}
     *   // duplicate named entry will not be overwritten by default
     *   _extand({'old': 1}, {'old': 200})
     *     == {'old': 200}
     *   // set true in 3rd parameter to prevent overwrite existing items
     *   _extand({'old': 1}, {'old': 200}, false)
     *     == {'old': 1}
     * ```
     */
    function _extend(target, extensions, overwrite) {

        overwrite = (overwrite !== false);

        // Don't extend non-objects
        var type = typeof target;
        if (type !== 'object' && type !== 'function') {
            con.error(TAG_EXTEND, 'Only Object & Function can be extended. > Got "' + type + '": ', target);
            throw new TypeError(G.SEE_ABOVE);
        }
        if (typeof extensions !== 'object') {
            con.error(TAG_EXTEND, 'Extension should be an Object. > Got "' + typeof extensions + '": ', extensions);
            throw new TypeError(G.SEE_ABOVE);
        }

        for (var name in extensions) {
            var item = extensions[name];
            // no self reference - continue
            if (target === item) continue;
            // exists and no overwrite - continue
            if (!overwrite && (typeof target[name] !== 'undefined')) continue;
            // set extension
            target[name] = item;
        }

        return target;

    }

    /**
     * Convert Array-like object into Array
     */
    function to_array(array_like, start) {

        start = typeof start == 'number' ? start : 0;

        if (Array.isArray(array_like)) {
            if (start > 0) {
                return array_like.slice(start);
            }
            return array_like;
        }

        var arr = [];
        for (var i = start, len = array_like.length; i < len; ++i) {
            arr.push(array_like[i]);
        }
        return arr;

    }

    /**
     * 32-bit Murmur3 Hash
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see https://github.com/mikolalysenko/murmurhash-js
     */
    function murmur3(key, seed) {

        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 =
                ((key.charCodeAt(i) & 0xff)) |
                ((key.charCodeAt(++i) & 0xff) << 8) |
                ((key.charCodeAt(++i) & 0xff) << 16) |
                ((key.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
            case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
            case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
            case 1: k1 ^= (key.charCodeAt(i) & 0xff);

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        h1 = h1 >>> 0;

        return h1;

    }

    return tiny;

});