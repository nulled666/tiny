define([
    './global',
    './tiny._polyfills'
], function (G) {

    'use strict';

    //////////////////////////////////////////////////////////
    // TINY BASE OBJECT
    //////////////////////////////////////////////////////////

    var TAG_TINY = 'tiny ::';

    var _tiny = {};
    var _prototype_extensions = [];
    var _global_prefix = '_';

    // skip this method when export to global namespace
    var SKIP_GLOBAL = ',x,import,me,output,';

    // a quick reference to console object
    var _con = console;

    // extend the tiny object
    add_to_tiny({

        import: import_globals,
        me: show_tiny_definition,

        type: _type,
        each: _each,
        extend: _extend,
        guid: generate_guid,
        hash: murmur3,

        // functions shared by internal functions
        x: {
            add: add_to_tiny,
            toArray: to_array,
            isArrayLike: is_array_like
        }

    });

    // prototype extensions
    add_to_tiny([
        [Array, { _each: each_extension }],
        [String, { _each: each_extension }]
    ]);
    function each_extension(start, func, this_arg) { return _each(this.valueOf(), start, func, this_arg) }


    /**
     * Add entry to _tiny_definition
     */
    function add_to_tiny(obj) {

        if (typeof obj != 'object')
            throw new Error('Expect an Object or Array.');

        if (obj && obj.length) {
            _prototype_extensions = _prototype_extensions.concat(obj);
        } else {
            _tiny = _extend(_tiny, obj);
        }

    }


    /**
    * Register functions to G namespace
    */
    function import_globals(prefix) {

        if (typeof prefix == 'string') _global_prefix = prefix;

        G.GLOBAL_INJECTED = true;

        var win = window;

        if (!win) {
            _con.error(TAG_TINY, 'window object is not available. global functions will not be registered.');
            return;
        }

        // inject G functions
        _each(_tiny, function (item, label) {

            if (SKIP_GLOBAL.includes(label)) return

            if (win[_global_prefix + label] !== undefined)
                throw new Error(TAG_TINY + 'global function name already taken : ' +  _global_prefix + label)

            win[_global_prefix + label] = item;

        })

        // inject object prototype extensions
        _each(_prototype_extensions, function (item, index) {

            if (typeof item[0] !== 'function')
                throw new Error(TAG_TINY + 'No `prototype` to extend : ' + item[0])

            _extend(item[0].prototype, item[1]);

        })

        _con.info(TAG_TINY, 'global objects imported.');

    }

    /**
     * show _tiny namespace structure
     */
    function show_tiny_definition() {

        // show the namespace
        _con.info('tiny = ' + _inspect(_tiny, ['x'], false));

        // show global objects
        if (G.GLOBAL_INJECTED !== true) return;

        var win = window;
        var result = 'Injected global objects:';
        _each(_tiny, function (item, label) {

            if (SKIP_GLOBAL.includes(label)) return;

            var value = win[_global_prefix + label];
            value = _inspect(value, false);

            result += '\n' + _global_prefix + label + ' = ' + value;
        });
        _con.info(result);

        // show prototype extensions
        result = 'Injected prototype extensions:';
        _each(_prototype_extensions, function (item, label) {

            var name = item[0].name;
            var value = _inspect(item[1], false);

            result += '\n' + name + '.prototype + ' + value;
        });
        _con.info(result);

    }


    //////////////////////////////////////////////////////////
    // CORE FUNCTIONS
    //////////////////////////////////////////////////////////
    var TYPE_CACHE = { '[object Object]': 'object' };

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
            } else if (Array.isArray(obj)) {
                type = 'Array';
            } else {
                // this is a detail but slow method
                var tmp = Object.prototype.toString.call(obj);
                type = TYPE_CACHE[tmp];
                if (!type) {
                    type = tmp.replace('[object ', '').replace(']', '');
                    TYPE_CACHE[tmp] = type;
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

        if (!obj) return;

        var start_index = typeof start == 'number' ? start : 0;

        if (typeof start == 'function') {
            // shift parameters
            this_arg = func;
            func = start;
        }

        if (typeof func !== 'function') {
            throw new TypeError(TAG_EACH + 'Iteration callback function required. > Got "' + typeof func + '"');
        }

        this_arg = this_arg || obj;

        var type = typeof obj;

        if (obj.jquery) type = 'q';
        if (obj.tinyQ) obj = obj.nodes;

        if (is_array_like(obj)) {

            // ==> Array
            for (var f = func, t = this_arg, i = start_index, len = obj.length; i < len; ++i) {
                var r = f.call(t, obj[i], i, obj);
                if (r !== undefined) return r;
            }

        } else if (type == 'object') {

            // ==> Object
            var f = func, t = this_arg;
            for (var label in obj) {
                var r = f.call(t, obj[label], label, obj);
                if (r !== undefined) return r;
            }

        } else if (type == 'q') {

            // ==> jQuery & TinyQ
            for (var f = func, t = this_arg, i = start_index, len = obj.length; i < len; ++i) {
                var r = f.call(t, obj.get(i), i, obj);
                if (r !== undefined) return r;
            }

        } else if (type === 'string') {

            // ==> String
            for (var f = func, t = this_arg, i = start_index, len = obj.length; i < len; ++i) {
                var r = f.call(t, obj.charAt(i), i, obj);
                if (r !== undefined) return r;
            }

        } else if (type === 'number') {

            // ==> Number
            for (var f = func, t = this_arg, i = start_index, len = obj; i < len; ++i) {
                var r = f.call(t, i + 1, i, len);
                if (r !== undefined) return r;
            }

        } else {

            throw new TypeError(TAG_EACH + 'Only Array, Object, Number and String types are supported. > Got "' + typeof obj + '"');

        }

    }


    /**
     * Check if an object is array-like
     */
    function is_array_like(obj) {
        return Array.isArray(obj) ||
            typeof obj == 'object' && "length" in obj && typeof obj.length == 'number'
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
        if (type !== 'object' && type !== 'function')
            throw new TypeError(TAG_EXTEND + 'Only Object & Function can be extended. > Got "' + type + '"')

        if (typeof extensions !== 'object')
            throw new TypeError(TAG_EXTEND + 'Extension should be an Object. > Got "' + typeof extensions + '"')

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
     * A simple guid generator
     */
    function generate_guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
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

    return _tiny;

});