define([
    './global'
], function (G) {

    'use strict';

    //////////////////////////////////////////////////////////
    // TINY BASE OBJECT
    //////////////////////////////////////////////////////////

    var tiny = {};

    var _prototype_extensions = [];

    // extend the tiny object
    add_to_tiny({

        import: inject_globals,
        me: show_tiny_definition,

        noop: _noop,
        type: _type,
        each: _each,
        extend: _extend,
        namespace: _namespace,

        // functions shared by internal functions
        fn: {
            add: add_to_tiny,
            getFuncName: get_function_name
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
            tiny = _extend(tiny, obj);
        }

    }

    /**
     * get a function's name
     */
    function get_function_name(func) {

        if (typeof func !== 'function')
            return '';
        if (func.name !== undefined)
            return func.name;

        var match = func.toString().match(/function ([^\(]+)/);
        if (match && match[1])
            return match[1];

        return '';

    }


    // skip this method when export to global namespace
    var SKIP_GLOBAL = ',fn,consts,import,me,verbose,';

    /**
    * Register functions to G namespace
    */
    function inject_globals() {

        G.INJECT_G = true;

        var win = window;

        if (!win) {
            console.error(G.TAG_TINY, 'window object is not available. global functions will not be registered.');
            return;
        }

        // inject G functions
        _each(tiny, function (item, label) {

            if (SKIP_GLOBAL.includes(label)) return;

            if (win['_' + label] !== undefined) {
                console.error(G.TAG_TINY, 'global function name already taken : ', '_' + label);
                throw new Error(G.SEE_ABOVE);
            }

            win['_' + label] = item;

        });

        // inject object prototype extensions
        _each(_prototype_extensions, function (item, index) {

            if (typeof item[0] !== 'function') {
                console.error(G.TAG_TINY, 'Prototype not found : ', item[0]);
                throw new Error(G.SEE_ABOVE);
            }

            _extend(item[0].prototype, item[1]);

        })

        console.info(G.TAG_TINY, 'global objects imported.');

    }

    /**
     * show _tiny namespace structure
     */
    function show_tiny_definition() {

        // show the namespace
        _warn('tiny = ' + _inspect(tiny, ['fn', 'consts']));

        // show G objects
        if (_injected_Gs !== true) return;

        var win = window;
        var result = 'Injected G objects:';

        _each(tiny, function (item, label) {

            if (SKIP_GLOBAL.includes(label)) return;

            var value = win['_' + label];
            value = _inspect(value);

            result += '\n_' + label + ' = ' + value;
        });
        _warn(result);

        // show prototype extensions
        result = 'Injected prototype extensions:';

        _each(_prototype_extensions, function (item, label) {

            var name = get_function_name(item[0]);
            var value = _inspect(item[1]);

            result += '\n' + name + '.prototype + ' + value;
        });
        _warn(result);

    }




    //////////////////////////////////////////////////////////
    // CORE FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * A blank no-operation placeholder function
     */
    function _noop() { }

    /**
     * Get exact type of an object
     * ```
     *   _type([]) == 'Array'
     *   _type({}) == 'Object'
     *   _type() == 'Undefined'
     * ```
     */
    function _type(obj) {
        return Object.prototype.toString.call(obj)
            .replace('[object ', '').replace(']', '');
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
            console.error(TAG_EACH, 'Iteration callback function required. > Got "' + typeof func + '": ', func);
            throw new TypeError(G.SEE_ABOVE);
        }

        var ARRAY_LIKE = ',NodeList,Arguments,HTMLCollection,';
        var OBJECT_LIKE = ',Object,Map,Function,Storage,';
        var type = _type(obj);


        var result;

        if (Array.isArray(obj) || ARRAY_LIKE.includes(type)) {

            // ==> Array
            for (var i = start_index, len = obj.length; i < len; ++i) {
                result = func.call(this_arg, obj[i], i, obj);
                if (result !== undefined) return result;
            }

        } else if (OBJECT_LIKE.includes(type)) {

            if (obj.jquery && typeof obj.get == 'function') {

                // ==> jQuery Object
                for (var i = start_index, len = obj.length; i < len; ++i) {
                    result = func.call(this_arg, obj.get(i), i, obj);
                    if (result !== undefined) return result;
                }

                return;

            }

            // ==> Object
            for (var label in obj) {
                result = func.call(this_arg, obj[label], label, obj);
                if (result !== undefined) return result;
            }

        } else if (type === 'String') {

            // ==> String
            for (var i = start_index, len = obj.length; i < len; ++i) {
                result = func.call(this_arg, obj.charAt(i), i, obj);
                if (result !== undefined) return result;
            }

        } else if (type === 'Number') {

            // ==> Number
            for (var i = start_index, len = obj; i < len; ++i) {
                result = func.call(this_arg, i + 1, i, obj);
                if (result !== undefined) return result;
            }

        } else {

            console.error(TAG_EACH, 'Only Array, Object, Number and String types are supported. > Got "' + typeof obj + '": ', obj);
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
            console.error(TAG_EXTEND, 'Only Object & Function can be extended. > Got "' + type + '": ', target);
            throw new TypeError(G.SEE_ABOVE);
        }
        if (typeof extensions !== 'object') {
            console.error(TAG_EXTEND, 'Extension should be an Object. > Got "' + typeof extensions + '": ', extensions);
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


    var TAG_NS = '_namespace()' + G.TAG_SUFFIX;
    /**
     * Create and bind a namespace
     * ```
     *    _namespace('my.project');  // just create the namespace object
     *    _namespace('my.project.lib', {nothing: true});
     * ```
     */
    function _namespace(ns_string, ext) {

        if (typeof ns_string != 'string') {
            console.error(TAG_NS, 'Expect a namespace string. > Got "' + typeof ns_string + '": ', ns_string);
            throw new TypeError(G.SEE_ABOVE);
        }

        var ns_parts = ns_string.split('.');
        var parent_ns = window;

        for (var i = 0, len = ns_parts.length; i < len; ++i) {

            var name = ns_parts[i];

            if (!parent_ns[name])
                parent_ns[name] = {};

            parent_ns = parent_ns[name];

        }

        // apply extensions if given
        if (ext) _extend(parent_ns, ext);

        return parent_ns;

    }


    return tiny;

});