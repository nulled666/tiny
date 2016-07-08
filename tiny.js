'use strict';

///////////////////////////////////////////////////////////////////
//
//   The Tiny (Mostly Non-DOM-related) Function Library
//
//   Supported Browsers:
//     IE 8+, Firefox 45+, Chrome 29+, Safari 9.1+
//
//   v1.84 by SiC
//
///////////////////////////////////////////////////////////////////

var tiny = (function () {

    var _verbose_mode = false;
    var _injected_globals = false;

    var _tiny_definition = {};
    var _prototype_extensions = [];
    var _skip_global = ',import,me,verbose,';

    var TAG_TINY = 'tiny ::';
    var TAG_SUFFIX = ' :: ';
    var SEE_ABOVE = '^^^ See Above for Details ^^^ ';

    /**
     * Exports methods & properties
     */
    function _exports() {

        return _tiny_definition;

    }

    /**
    * Register functions to global namespace
    */
    function inject_globals() {

        _injected_globals = true;

        var win = window

        if (!win) {
            _error(TAG_TINY, 'window object is not available. global functions will not be registered.');
            return;
        }

        // inject global functions
        _each(_tiny_definition, function (item, label) {

            if (_skip_global.includes(label)) return;

            if (win['_' + label] !== undefined) {
                _error(TAG_TINY, 'global function name already taken : ', '_' + label);
                throw new Error(SEE_ABOVE);
            }

            win['_' + label] = item;

        });

        // inject object prototype extensions
        _each(_prototype_extensions, function (item, index) {

            if (typeof item[0] !== 'function') {
                _error(TAG_TINY, 'Prototype not found : ', item[0]);
                throw new Error(SEE_ABOVE);
            }

            _extend(item[0].prototype, item[1]);

        })

        _info(TAG_TINY, 'global objects imported.');

    }

    add_to_tiny_definition({ import: inject_globals });

    /**
     * show _tiny namespace structure
     */
    function show_tiny_definition() {

        // show the namespace
        _warn('tiny = ' + inspect_object(_tiny_definition));

        // show global objects
        if (_injected_globals !== true) return;

        var win = window;
        var result = 'Injected global objects:';

        _each(_tiny_definition, function (item, label) {

            if (_skip_global.includes(label)) return;

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

    add_to_tiny_definition({ me: show_tiny_definition });

    /**
     * Add entry to _tiny_definition
     */
    function add_to_tiny_definition(ext) {
        _tiny_definition = _extend(_tiny_definition, ext);
    }

    /**
     * Add entry to Prototype list
     */
    function add_to_prototype(ext) {
        _prototype_extensions.push(ext);
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

    //////////////////////////////////////////////////////////
    // CONSOLE SHORTHAND METHODS
    //////////////////////////////////////////////////////////
    var _log, _dir, _info, _warn, _error;
    var _inspect = inspect_object;

    /**
     * Assign the console shorthands
     */
    function assign_console_shorthand() {

        // IE8 polyfill
        if (typeof console === "undefined") console = {};

        _each(['log', 'dir', 'info', 'warn', 'error'], function (item) {
            if (typeof console[item] === "undefined")
                console[item] = console_method_polyfill;
        });

        _info = console.info.bind(window.console);
        _warn = console.warn.bind(window.console);
        _error = console.error.bind(window.console);
        verbose_output(_verbose_mode);

    }
    // execute immediately
    // following functions might need them
    assign_console_shorthand();

    // append to definition
    add_to_tiny_definition({
        log: _log,
        dir: _dir,
        info: _info,
        warn: _warn,
        error: _error,
        verbose: verbose_output,
        inspect: inspect_object
    });

    /**
     * a polyfill function for console methods
     */
    function console_method_polyfill() {
        var arr = Array.prototype.slice.call(arguments);
        var msg = 'Console Output >>>\n' + arr.join('\n');
        alert(msg);
    }

    /**
     * Enable/disable console.log & console.dir output
     * Other console output types should never be disabled
     * ```
     *   tiny.verbose(true);
     * ```
     */
    function verbose_output(on) {

        if (on) {
            _log = console.log.bind(window.console);
            _dir = console.dir.bind(window.console);
            _warn(TAG_TINY, '_log() & _dir() output is enabled');
        } else {
            _log = _dir = function () { };
            _info(TAG_TINY, '_log() & _dir() output is disabled');
        }

        if (_injected_globals) {
            window._log = _log;
            window._dir = _dir;
        }

    }

    /**
     * Expand object to an JSON string
     * Helper function for display nested object in console
     * ```
     *   _log( _inspect({text: 'test', func: test_func}) )
     *   // {
     *   //   "text": "test",
     *   //   "func": "[function]"
     *   // }
     * ```
     */
    function inspect_object(obj) {

        return JSON.stringify(obj, function (name, value) {
            switch (typeof value) {
                case 'function':
                    return '[Function]';
                case 'undefined':
                    return '[undefined]';
                default:
                    return value;
            }
        }, 4);

    }

    //////////////////////////////////////////////////////////
    // BASE FUNCTIONS
    //////////////////////////////////////////////////////////
    add_to_tiny_definition({
        type: _type,
        each: _each,
        extend: _extend,
        namespace: _namespace
    });

    add_to_prototype([Array, { _each: each_extension }]);
    add_to_prototype([String, { _each: each_extension }]);

    function each_extension(start, func, this_arg) {
        return _each(this.valueOf(), start, func, this_arg);
    }

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

    var TAG_EACH = '_each()' + TAG_SUFFIX;
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
            _error(TAG_EACH, 'Iteration callback function required. > Got "' + typeof func + '": ', func);
            throw new TypeError(SEE_ABOVE);
        }


        var ARRAY_LIKE = ',NodeList,Arguments,HTMLCollection,';
        var OBJECT_LIKE = ',Object,Map,Function,Storage,';
        var type = _type(obj);

        // treat jquery object as array
        if(type == 'Object' && obj.jquery) type = 'NodeList';

        var result;

        if (Array.isArray(obj) || ARRAY_LIKE.includes(type)) {

            // ==> Array
            for (var i = start_index, len = obj.length; i < len; i++) {
                result = func.call(this_arg, obj[i], i, obj);
                if (result !== undefined) return result;
            }

        } else if (OBJECT_LIKE.includes(type)) {

            // ==> Object
            for (var label in obj) {
                result = func.call(this_arg, obj[label], label, obj);
                if (result !== undefined) return result;
            }

        } else if (type === 'String') {

            // ==> String
            for (var i = start_index, len = obj.length; i < len; i++) {
                result = func.call(this_arg, obj.charAt(i), i, obj);
                if (result !== undefined) return result;
            }

        } else if (type === 'Number') {

            // ==> Number
            for (var i = start_index, len = obj; i < len; i++) {
                result = func.call(this_arg, i + 1, i, obj);
                if (result !== undefined) return result;
            }

        } else {

            _error(TAG_EACH, 'Only Array, Object, Number and String types are supported. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(SEE_ABOVE);

        }

    }


    var TAG_EXTEND = '_extend()' + TAG_SUFFIX;
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
            _error(TAG_EXTEND, 'Only Object & Function can be extended. > Got "' + type + '": ', target);
            throw new TypeError(SEE_ABOVE);
        }
        if (typeof extensions !== 'object') {
            _error(TAG_EXTEND, 'Extension should be an Object. > Got "' + typeof extensions + '": ', extensions);
            throw new TypeError(SEE_ABOVE);
        }

        _each(extensions, function (item, name) {
            // no self reference - continue
            if (target === item) return;
            // exists and no overwrite - continue
            if (!overwrite && (typeof target[name] !== 'undefined')) return;
            // set extension
            target[name] = item;
        })

        return target;

    }

    var TAG_NS = '_namespace()' + TAG_SUFFIX;
    /**
     * Create and bind a namespace
     * ```
     *    _namespace('my.project');  // just create the namespace object
     *    _namespace('my.project.lib', {nothing: true});
     * ```
     */
    function _namespace(ns_string, ext) {

        if (typeof ns_string != 'string') {
            _error(TAG_NS, 'Expect a namespace string. > Got "' + typeof ns_string + '": ', ns_string);
            throw new TypeError(SEE_ABOVE);
        }

        var ns_parts = ns_string.split('.');
        var parent_ns = window;

        _each(ns_parts, function (name) {

            if (!parent_ns[name])
                parent_ns[name] = {};

            parent_ns = parent_ns[name];

        });

        // apply extensions if given
        if (ext) _extend(parent_ns, ext);

        return parent_ns;

    }


    //////////////////////////////////////////////////////////
    // SIMPLE MESSAGE SYSTEM
    //////////////////////////////////////////////////////////
    var _message = {
        listen: listen_message,
        post: post_message,
        postDelayed: post_delayed_message
    };

    add_to_tiny_definition({ message: _message });

    // internal registry of message handlers
    var _message_handlers = {};
    var _delayed_messages = {};

    var TAG_MSG_LISTEN = '_message.listen()' + TAG_SUFFIX;
    /**
     * Add a custom message listener
     * ```
     *   _message.listen('my_message', message_handler)
     *   _message.post('my_message', param1, param2, ...)
     *     -> message_handler('my_message', param1, param2, ...)
     * ```
     */
    function listen_message(msg, handler) {

        if (typeof msg !== 'string') {
            _error(TAG_MSG_LISTEN, 'Expect a message string. > Got "' + typeof msg + '": ', msg);
            throw new TypeError(SEE_ABOVE);
        }

        if (typeof handler !== 'function') {
            _error(TAG_MSG_LISTEN, 'Expect a function. > Got "' + typeof handler + '": ', handler);
            throw new TypeError(SEE_ABOVE);
        }

        if (!_message_handlers[msg])
            _message_handlers[msg] = [];

        _log(TAG_MSG_LISTEN, 'Listen to message: "' + msg + '" + ', get_function_name(handler) + '()');

        _message_handlers[msg].push(handler);

        return _message;

    }

    var TAG_MSG_POST = '_message.post()' + TAG_SUFFIX;
    /**
     * Trigger a custom message with any number of arguments
     * ```
     *    _message.post('my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_message(msg) {

        if (typeof msg !== 'string') {
            _error(TAG_MSG_POST, 'Expect a message string. > Got "' + typeof msg + '": ', msg);
            throw new TypeError(SEE_ABOVE);
        }

        var sliced_args = Array.prototype.slice.call(arguments, 1);
        _info(TAG_MSG_POST, 'Post message "' + msg + '" + ', sliced_args);

        var handles = _message_handlers[msg];

        if (!handles || handles.length < 1) {
            _warn(TAG_MSG_POST, 'Nobody is listen to this message');
            return _message;
        }

        // call handles
        _each(handles, function (callback) {
            callback.apply(this, sliced_args);
        });

        _log(TAG_MSG_POST, handles.length + ' message handlers triggered');

        return _message;

    }

    var TAG_MSG_POST_DELAYED = '_message.postDelayed()' + TAG_SUFFIX;
    /**
     * Post a delayed message
     * ```
     *    _message.post(1000, 'my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_delayed_message(delay, msg) {

        if (typeof delay !== 'number') {
            _error(TAG_MSG_POST_DELAYED, 'Expect a delay time in milliseconds. > Got "' + typeof delay + '": ', delay);
            throw new TypeError(SEE_ABOVE);
        }

        if (typeof msg !== 'string') {
            _error(TAG_MSG_POST_DELAYED, 'Expect a message string. > Got "' + typeof msg + '": ', msg);
            throw new TypeError(SEE_ABOVE);
        }

        var sliced_args = Array.prototype.slice.call(arguments, 1);
        if (_delayed_messages[msg] !== undefined)
            clearTimeout(_delayed_messages[msg]);

        _delayed_messages[msg] = setTimeout(function () {
            post_message.apply(this, sliced_args);
        }, delay);

        return _message;

    }

    //////////////////////////////////////////////////////////
    // SIMPLE ROUTE SYSTEM
    //////////////////////////////////////////////////////////
    var _route = {
        watch: route_watch,
        check: route_check,
        on: route_mode_on,
        off: route_mode_off,
        get: route_get,
        set: route_set,
        append: route_append,
        remove: route_remove
    };

    add_to_tiny_definition({ route: _route });

    // route match route & handler registry
    var _route_rules_ = {};
    var _route_handlers_ = {};
    var _route_on_ = false;
    var _route_bind_event_ = false;

    var TAG_RT_WATCH = '_route.watch()' + TAG_SUFFIX
    /**
     * Set a function to watch specific route
     * This simple route system only watches window.location.hash
     * ```
     *   _route.watch('/item/{name}/{id}', event_handler)
     *   // When URL changed to: http://domain.com/index.htm#/item/test/123/other
     *   // _route.check() will be triggered automatically
     *   // You only need to call it manually for init load
     *   _route.check()
     *     do event_handler('/item/test/123/other', {name: 'test', id: '123'})
     *        -> return _tiny.BREAK; // to stop further route matching
     *   // You can also use RegExp
     *   _route.watch(/\/item\/([a-z]+)\/([0-9]+)/, event_handler)
     *     do event_handler('/item/test/123/other', ['test', '123'])
     * ```
     */
    function route_watch(route, handler) {

        var rule;

        if (typeof route == 'string') {
            // -> string
            rule = route_prepare_rule(route);

        } else if (route instanceof RegExp) {
            // -> RegExp

            // remove the 'g' flag - it should not be used here
            route = route.toString();
            var flags = route.toString();
            flags = flags.slice(flags.lastIndexOf('/') + 1);
            flags = flags.replace('g', '');

            var re = new RegExp(route.source, flags);
            rule = { is_regexp: true, re: re };
        } else {

            _error(TAG_RT_WATCH, 'Expect a string or RegExp. > Got "' + typeof route + '": ', route);
            throw new TypeError(SEE_ABOVE);

        }

        rule.matched = false; // set last match state to false

        if (!_route_rules_[route])
            _route_rules_[route] = rule;

        if (!_route_handlers_[route])
            _route_handlers_[route] = [];

        if (typeof handler !== 'function') {
            _error(TAG_RT_WATCH, 'Expect a function. > Got "' + typeof handler + '": ', handler);
            throw new TypeError(SEE_ABOVE);
        }

        _route_handlers_[route].push(handler);

        _log(TAG_RT_WATCH, 'Watch route: "' + route + '" ', rule);

        return _route;

    }

    /**
     * Prepare route rule
     * @param {string} route - Route string
     */
    function route_prepare_rule(route) {

        var rule = {};

        if (route == '') route = '/';

        // ==> special index route
        if (route == '/') {
            return { re: /^\/$/ };
        }

        // ==> normal rules
        var re = route;
        re = re.replace(/([:|$?.*=\(\)\\\/^])/g, '\\$1');

        if (re.indexOf('\\/') == 0) {
            re = '^' + re;
        } else {
            re = '(?:\/)' + re;
        }

        re += '(?:\/|$)';

        var param_re = /\{([a-zA-Z0-9-_]+)\}/g;
        var param_names = [];

        var match;
        while (match = param_re.exec(re)) {
            param_names.push(match[1]);
        }

        re = re.replace(param_re, '([a-zA-Z0-9-_]+)');

        rule.re = new RegExp(re);
        if (param_names.length > 0)
            rule.param_names = param_names;

        return rule;

    }

    var TAG_RT_CHECK = '_route.check()' + TAG_SUFFIX;
    /**
     * Parse a route string or window.location
     * ```
     *   _route.check() // parse window.location.hash
     *   _route.check('/test/name/4123')  // parse given string
     *     -> return true // when match found
     * ```
     */
    function route_check(str) {

        if (str !== undefined && typeof str !== 'string') {
            _error(TAG_RT_WATCH, 'Expect a route string. > Got "' + typeof str + '": ', str);
            throw new TypeError(SEE_ABOVE);
        }

        if (str === undefined) str = route_get();

        var q = str.replace(/^#/, '');

        _log(TAG_RT_CHECK, 'Check route: "' + q + '"');

        if (q == '') q = '/';

        var found = false;

        _each(_route_rules_, function (rule, route) {

            if (!rule.re) return;

            var match = rule.re.exec(q);

            if (match) {

                // -> matching
                rule.matched = true;

                match.shift(); // remove first match - full string

                // prepare parameters
                var params = {};

                if (rule.param_names) {
                    _each(rule.param_names, function (name, index) {
                        params[name] = match[index];
                    });
                } else if (rule.is_regexp) {
                    params = [];
                    _each(match, function (value, index) {
                        params[index] = value;
                    });
                } else {
                    params = true;
                }

                // call handlers
                _info(TAG_RT_CHECK, 'Route match: "' + route + '" + ', params);
                route_invoke_handlers(_route_handlers_[route], q, params);

                found = true;

            } else {

                // -> not matching but previously matched
                if (rule.matched) {
                    _info(TAG_RT_CHECK, 'Previously matched: "' + route + '" + ', false);
                    route_invoke_handlers(_route_handlers_[route], q, false);
                }

                rule.matched = false;

            }

        });

        return found;

    }

    /**
     * Helper function for route_check
     */
    function route_invoke_handlers(handlers, q, params) {
        _each(handlers, function (handler) {
            handler(q, params);
        });
    }

    /**
     * Monitoring on hashchange event and check current hash string immediately
     */
    function route_mode_on() {

        // bind event if not
        if (!_route_bind_event_) {
            window.addEventListener('hashchange', route_on_window_hash_change);
        }

        _route_on_ = true;
        route_check();

        return _route;

    }

    /**
     * Turn off monitoring
     */
    function route_mode_off() {

        _route_on_ = false;

        return _route;
    }

    /**
     * Event listener for window.location.hash change
     */
    function route_on_window_hash_change(e) {
        if (_route_on_)
            route_check();
    }

    var TAG_RT_GET = '_route.get()' + TAG_SUFFIX;
    /**
     * Get current route string
     * ```
     *   _route.get()
     * ```
     */
    function route_get() {
        return window.location.hash.replace(/^#/, '');
    }

    var TAG_RT_SET = '_route.set()' + TAG_SUFFIX;
    /**
     * Set route
     * ```
     *   _route.set('/test/name/4123')         // set to given route
     *   _route.set('/test/name/4123', false)  // set to given route without trigger event
     * ```
     */
    function route_set(route, trigger) {

        if (typeof route !== 'string') {
            _error(TAG_RT_WATCH, 'Expect a route string. > Got "' + typeof route + '": ', route);
            throw new TypeError(SEE_ABOVE);
        }

        trigger = (trigger !== false);

        window.location.hash = route;

        if (trigger && _route_on_)
            _route.check();

        return _route;

    }


    var TAG_RT_APPEND = '_route.append()' + TAG_SUFFIX;
    /**
     * Append sections to current route
     * ```
     *   _route.append('name/4123');             // append a string
     *   _route.append(['name','4123'], false);  // append without trigger event
     * ```
     */
    function route_append(str_or_arr, trigger) {

        var route = route_get();
        if (!route.endsWith('/')) route += '/';

        if (typeof str_or_arr == 'string') {
            // string
            route += str_or_arr;
        } else if (Array.isArray(str_or_arr)) {
            // array
            route += str_or_arr.join('/');
        } else {
            _error(TAG_RT_WATCH, 'Expect a string or array. > Got "' + typeof str_or_arr + '": ', str_or_arr);
            throw new TypeError(SEE_ABOVE);
        }

        route_set(route, trigger);

        return _route;

    }


    var TAG_RT_REMOVE = '_route.remove()' + TAG_SUFFIX;
    /**
     * Remove child levels from section with given start string
     * ```
     *   //  without trigger event
     *   _route.remove('name', false);
     * ```
     */
    function route_remove(str, trigger) {

        var route = route_get();

        if (typeof str !== 'string') {
            _error(TAG_RT_REMOVE, 'Expect a string. > Got "' + typeof str + '": ', str);
            throw new TypeError(SEE_ABOVE);
        }

        var pos = route.indexOf(str);
        if (pos > -1) {
            route = route.substr(0, pos);
            route_set(route, trigger);
        }

        return _route;

    }

    //////////////////////////////////////////////////////////
    // LOCAL STORAGE ACCESS
    //////////////////////////////////////////////////////////
    var _storage = local_storage;

    // Custom key prefix for data entry filtering
    _storage.keyPrefix = '';

    add_to_tiny_definition({ storage: _storage });

    var TAG_STORAGE = '_storage()' + TAG_SUFFIX;
    /**
     * Simple window.localStorage wrapper
     * Integer, Boolean, Array, Date & Object types will be converted automatically
     * ```
     *   // filter keys by prefix, default is ''
     *   tiny.storage.keyPrefix = 'your_prefix'
     *   _storage()            // return all values as an Object
     *   _storage(key)         // get value
     *   _storage(key, value)  // set value
     *   _storage(key, null)   // delete value of given key
     *   _storage(null, null)  // delete all contents
     *   _storage({key1: value1, key2: null, ...})  // batch process
     * ```
     */
    function local_storage(key, value) {

        var storage = window.localStorage;

        if (typeof key === 'string') {

            key = _storage.keyPrefix == '' ? key : _storage.keyPrefix + '_' + key;

            if (value === undefined) {

                // ==> READ
                var result = storage[key];
                result = storage_output_type_conversion(result);
                return result;

            } else if (value === null) {

                // ==> DELETE
                _log(TAG_STORAGE, 'Deleted window.localStorage item: "' + key + '"');
                return storage.removeItem(key);

            } else {

                // ==> WRITE
                value = storage_input_type_conversion(value);
                storage.setItem(key, value);
                _log(TAG_STORAGE, 'Set window.localStorage item: "' + key + '" = ', value);

            }

        } else if (key === undefined) {

            // ==> READ ALL
            var check_prefix = _storage.keyPrefix !== '';
            var result = {};

            _each(storage, function (item, label) {
                if (check_prefix) {
                    if (label.startsWith(_storage.keyPrefix + '_') == false) return;
                    label = label.replace(_storage.keyPrefix + '_', '');
                }
                result[label] = storage_output_type_conversion(item);
            });

            return result;

        } else if (key === null && value === null) {

            // ==> DELETE ALL
            if (_storage.keyPrefix == '') {

                // the quick way
                _warn(TAG_STORAGE, 'All items in window.localStorage are cleared');
                storage.clear();

            } else {

                // have to check every key for prefix
                _each(storage, function (item, label) {
                    if (label.startsWith(_storage.keyPrefix + '_'))
                        storage.removeItem(label);
                });

                _warn(TAG_STORAGE, 'All items in window.localStorage with prefix "' + _storage.keyPrefix + '" are cleared');

            }

        } else if (typeof key === 'object') {

            // ==> BATCH OPERATION
            _each(key, function (item, label) {
                _storage(label, item);
            });

        } else {

            _error(TAG_STORAGE, 'Expect a string, object or null. > Got "' + typeof key + '": ', key);
            throw new TypeError(SEE_ABOVE);

        }

    }

    /**
     * Automatic convert types to special type strings
     */
    function storage_input_type_conversion(value) {

        if (value === true)
            return 'TRUE';

        if (value === false)
            return 'FALSE';

        if (typeof value == 'object') {

            if (value instanceof Date) {
                return '[Date]' + JSON.stringify(value);
            }

            return JSON.stringify(value);

        }

        return value;

    }

    /**
     * Automatic convert strings to matching types
     */
    function storage_output_type_conversion(value) {

        // boolean
        if (value == 'TRUE')
            return true;

        if (value == 'FALSE')
            return false;

        if (typeof value == 'string') {

            // integer
            if (/^[0-9]+$/.test(value)) {

                return parseInt(value, 10);
            }

            // Date
            if (value.indexOf('[Date]') == 0) {
                value = JSON.parse(value.replace('[Date]', ''));
                return new Date(value);
            }

            // Array & Object
            if (value.length > 5) {

                var start = value[0], end = value[value.length - 1];

                if ((start == '{' && end == '}') || (start == '[' && end == ']')) {
                    return JSON.parse(value);
                }

            }

        }

        return value;

    }


    //////////////////////////////////////////////////////////
    // MULTILINGUE SUPPORT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _lang = get_lang_string;
    _lang.strings = {};
    _lang.set = set_language;

    add_to_tiny_definition({ lang: _lang });

    // get language string if not empty
    function get_lang_string(str) {

        var lang_str = _lang.strings[str];

        if (typeof lang_str != 'string') {
            _warn(CONSOLE_TAG['lang'], 'Language string not found: ', lang_str);
            lang_str = str;
        }

        return lang_str;

    }

    function set_language(lang) {

    }


    //////////////////////////////////////////////////////////
    // FORMAT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _format = format_template;

    add_to_tiny_definition({ format: _format });
    add_to_tiny_definition({ formatNumber: format_number });
    add_to_tiny_definition({ formatDate: format_date });
    add_to_tiny_definition({ htmlSafe: html_safe });

    add_to_prototype([Number, { _format: format_number_extension }]);
    add_to_prototype([Date, { _format: format_date_extension }]);
    add_to_prototype([String, {
        _htmlSafe: html_safe_extension,
        _format: format_extension
    }]);

    function format_number_extension(format) {
        return format_number(this.valueOf(), format);
    }

    function format_date_extension(format, names) {
        return format_date(this.valueOf(), format, names);
    }

    function html_safe_extension(keep_spaces) {
        return html_safe(this.valueOf(), keep_spaces);
    }

    function format_extension(obj) {
        return format_template(this.valueOf(), obj);
    }


    var TAG_HTML_SAFE = '_htmlSafe()' + TAG_SUFFIX;
    /**
     * Make string HTML-safe
     * ```
     *   var str = 'task:\n   >> done';
     *   // escape special chars
     *   _htmlSafe(str);
     *   str._htmlSafe() == 'task:<br/>   &gt;&gt; done'
     *   // set true to escape white spaces
     *   str._htmlSafe(true) == 'task:<br/>&nbsp;&nbsp;&nbsp;&gt;&gt;&nbsp;done'
      * ```
     */
    function html_safe(str, keep_spaces) {

        if (typeof str !== 'string') {
            _error(TAG_HTML_SAFE, 'Expect a string. > Got "' + typeof str + '": ', str);
            throw new TypeError(SEE_ABOVE);
        }

        str = str.replace(/\&/g, '&amp;')
            .replace(/\>/g, '&gt;')
            .replace(/\</g, '&lt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&#39;')
            .replace(/\n/g, '<br/>');

        if (keep_spaces)
            str = str.replace(/\s/g, '&nbsp;');

        return str;

    }


    // defaults for _formatNumber()
    _format.currencyFormat = '$(,.00)';
    _format.decimalDelimiter = '.';
    _format.thousandsDelimiter = ',';

    var TAG_FORMAT_NUMBER = '_formatNumber()' + TAG_SUFFIX;
    /**
     * Number format function
     * ```
     *   var num = 123456.789;
     *   num._format() == '123456.789'
     *   num._format('.') == '123457' // round to point
     *   num._format('.00') == '123456.79'
     *   num._format(',') == '123,456.789'
     *   num._format(',.00') == '123,456.79'
     *   num._format(',.00%') == '12,345,678.90%'
     *   num._format('x') == '1e240.c9fbe76c9'
     *   num._format('X.') == '1E241' // uppercase & rounded
     *   num._format('X.00') == '1E240.C9'
     *   num._format('$') == '$123,456.79'  // currency format
     * ```
     */
    function format_number(num, format) {

        format = format || '';

        if (format == '$') format = _format.currencyFormat;

        if (typeof num !== 'number') {
            _error(TAG_FORMAT_NUMBER, 'Expect a number. > Got "' + typeof num + '": ', num);
            throw new TypeError(SEE_ABOVE);
        }

        if (typeof format !== 'string') {
            _error(TAG_FORMAT_NUMBER, 'Expect a format string. > Got "' + typeof format + '": ', format);
            throw new TypeError(SEE_ABOVE);
        }

        var token_start = format.indexOf('(');
        var token_end = format.indexOf(')');
        var token;
        if (token_start > -1 && token_end > -1 && token_end > token_start) {
            token_start++;
            token = format.substring(token_start, token_end);
            format = format.substring(0, token_start) + format.substr(token_end);
        } else {
            token = format;
            format = '()';
        }

        var result;
        if (token.includes('x') || token.includes('X')) {
            result = format_hex_number(num, token);
        } else {
            result = format_decimal_number(num, token);
        }

        return format.replace('()', result);
    }

    /**
     * Format Decimal Number
     */
    function format_decimal_number(num, format) {

        // Add commas
        var add_comma = format.includes(',');

        // Percent number
        var is_percent = false;
        if (format.includes('%')) {
            num = num * 100;
            is_percent = true;
        }

        // leave only number and dot chars
        var parts = format.replace(/[^0\.]/g, '').split('.');
        var target_width = 0;

        // set precision
        if (parts.length > 1) {
            num = num.toFixed(parts[1].length);
            target_width = parts[0].length;
        } else {
            num = num.toString();
            target_width = format.length;
        }

        parts = num.split('.');
        var integer_part = parts[0];
        var decimal_part = parts.length > 1 ? _format.decimalDelimiter + parts[1] : '';

        // pad zero
        integer_part = pad_start_with_zero(target_width, integer_part);

        // add commas
        if (add_comma) {
            var regex = /(\d+)(\d{3})/;
            while (regex.test(integer_part)) {
                integer_part = integer_part.replace(regex, '$1' + _format.thousandsDelimiter + '$2');
            }
        }

        num = integer_part + decimal_part;

        if (is_percent) num += '%';

        return num;

    }

    /**
     * Format number to hex string
     */
    function format_hex_number(num, format) {

        // Add commas
        var add_comma = format.includes(',');
        var to_uppercase = format.includes('X');

        var dot_pos = format.indexOf('.');
        var float_len = -1;

        if (dot_pos > -1) {
            float_len = format.length - 1 - dot_pos;
        }

        if (float_len == 0) {
            num = Math.round(num);
        }

        num = num.toString(16);

        if (float_len > 0) {
            num = num.substring(0, num.indexOf('.') + float_len + 1);
        }

        if (to_uppercase)
            num = num.toUpperCase();

        return num;
    }

    function pad_start_with_zero(width, str) {
        width -= str.length;
        if (width < 1) return str;
        return '0'.repeat(width) + str;
    }


    // localizable date names for date formatting
    _format.dateNames = {
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayAbbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ap: ['AM', 'PM']
    }

    // default format string for Date.prototype._format()
    _format.dateFormat = 'datetime';

    var TAG_FORMAT_DATE = '_formatDate()' + TAG_SUFFIX;
    /**
     * Format Date
     * ```
     *   // set custom localized date name strings
     *   _tiny.format.dateNames = custom_names
     *   // set default format string
     *   _tiny.format.dateFormat = 'datetime'
     *   var d = new Date(1118102950753)
     *   d._format() == d._format('datetime') == '2005-06-07 08:09:10'
     *   d._format('date') == '2005-06-07' // yyyy-MM-dd
     *   d._format('time') == '08:09:10'   // HH:mm:ss
     *   d._format('iso') == '2005-06-07T00:09:10.753Z' // ISO 8601
     *   // FROMAT STRING CODES:
     *    '[]'   = keep raw text, '[yyyy]-M-d' => 'yyyy-6-7'
     *    'yyyy' = 2009, 'yy' = 09,   'y' = 9        // Year
     *    'M'    = 6,    'MM' = 06                   // Numeric month
     *    'MMM'  = Jun,  'MMMM' = June               // Month name
     *    'd'    = 7,    'dd' = 07                   // Day of the month
     *    'D'    = Tue,  'DD' = Tuesday              // Day of the week
     *    'h'    = 8,    'hh' = 08                   // 12 Hour clock
     *    'H'    = 8,    'HH' = 08                   // 24 Hour clock 
     *    'm'    = 9,    'mm' = 09                   // Minutes
     *    's'    = 10,   'ss' = 10,    'sss' = 753   // Seconds & Milliseconds
     *    'z'    = +08,  'zz' = +0800, 'ZZ' = +08:00 // Timezone
     *    't'    = AM,   // AM / PM
     * ```
     */
    function format_date(date_in, format, names) {

        var date = new Date(); // make a copy to manipulate
        format = format || _format.dateFormat;
        names = names || _format.dateNames;

        if (typeof date_in === 'number') {
            date.setTime(date_in);
        } else if (Object.prototype.toString.call(date_in) === "[object Date]") {
            date.setTime(date_in.getTime());
        } else {
            _error(TAG_FORMAT_DATE, 'Expect a Date.getTime() number or Date object. > Got "' + typeof date + '": ', date);
            throw new TypeError(SEE_ABOVE);
        }

        if (typeof format != 'string') {
            _error(TAG_FORMAT_NUMBER, 'Expect a format string. > Got "' + typeof format + '": ', format);
            throw new TypeError(SEE_ABOVE);
        }

        // Make a copy of current date

        if (format == 'iso') {
            format = 'yyyy-MM-ddTHH:mm:ss.sssZ';
            // convert to UTC time
            date.setMinutes((date.getMinutes() + date.getTimezoneOffset()));
        } else if (format == 'datetime') {
            format = 'yyyy-MM-dd HH:mm:ss';
        } else if (format == 'date') {
            format = 'yyyy-MM-dd';
        } else if (format == 'time') {
            format = 'HH:mm:ss';
        }

        // build tokens
        var d = {
            y: date.getYear() % 100,
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours() % 12,
            H: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
            sss: (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5),
            z: Math.abs(Math.round(date.getTimezoneOffset() / 60))
        }

        var dd = {};
        for (var i in d) {
            dd[i + i] = d[i] < 10 ? '0' + d[i] : d[i];
        }

        var tokens = {
            yyyy: date.getFullYear(),
            MMMM: names.month[d.M - 1],
            MMM: names.monthAbbr[d.M - 1],
            DD: names.day[date.getDay()],
            D: names.dayAbbr[date.getDay()],
            t: d.H > 12 ? names.ap[1] : names.ap[0]
        }

        _extend(tokens, dd);
        _extend(tokens, d);

        tokens.z = (date.getTimezoneOffset() < 0 ? '+' : '-') + dd.zz;
        tokens.zz = tokens.z + '00';
        tokens.ZZ = tokens.z + ':00';

        // process tokens
        // this algorithm should be faster than regexp
        format += '\x7f';  // manually add an ending char

        var result = '';
        var in_txt = false;

        var token = '';
        var chr = '';
        var last_chr = '';

        for (var i = 0, len = format.length; i < len; i++) {

            last_chr = chr;
            chr = format.charAt(i);

            // preserve text
            if (in_txt) {
                if (chr == ']') {
                    in_txt = false;
                } else {
                    result += chr;
                }
                continue;
            }

            // read token
            if (chr === last_chr) {
                token += chr;
                continue;
            }

            // resolve token
            if (tokens[token]) {
                result += tokens[token];
            } else {
                result += token;
            }

            token = chr;

            // enter text mode
            if (chr === '[') {
                in_txt = true;
                last_chr = '';
                token = '';
                continue;
            }

        }

        // done
        return result;

    }


    var TAG_FORMAT = '_format()' + TAG_SUFFIX;
    /**
     * Template Format function
     * ```
     *   // expand shorthand template inline
     *   _format('>> ul#my-list.active > li.item > .title :{}', 'text content');
     * 
     *   // expand a template inside <script> tag in a HTML file
     *   _format('#my-template-id', data_object);
     *   // in html file - shorthand template starts with >>
     *   <script type="x-template" id="my-template-id">
     *   ...
     *   ul #my-list .active
     *     li.item
     *       .title :{object_key}
     *   </script>
     * ```
     */
    function format_template(template_str, obj) {

        if (typeof template_str != 'string') {
            _error(TAG_FORMAT, 'Expect a template string. > Got "' + typeof template_str + '": ', template_str);
            throw new TypeError(SEE_ABOVE);
        }

        var template_container;
        var template = template_str.valueOf();

        if (template.startsWith('#')) {
            // getting template text from document element
            var id = template.replace('#', '');
            template_container = document.getElementById(id);
            if (!template_container) {
                _error(TAG_FORMAT, 'Template container not found: #' + id);
                throw new ReferenceError(SEE_ABOVE);
            }
            template = template_container.innerHTML;
            if (template.includes('{#' + id + '}')) {
                _error(TAG_FORMAT, 'Circular reference to self detected : #' + id);
                throw new ReferenceError(SEE_ABOVE);
            }
        }

        // check if it is a shorthand template
        if (template.trim().startsWith('...')) {
            // process shorthand template
            template = template.replace('...', '');
            template = expand_shorthand_template(template);

            // cache expanded template
            if (template_container)
                template_container.innerHTML = template;
        }

        // return template string if no data object is given
        if (obj === undefined) {
            return template;
        }

        // fill template with data content and return
        return render_template(template, obj);

    }


    ////////////////////////////////////////////////////
    // Shorthand Template Processor
    ////////////////////////////////////////////////////
    var _expanded_shorthand_template_cache = {};
    var SINGLETON_TAGS = ',br,img,hr,link,meta,input,';

    /**
     * Fast Hash function for cache id - https://github.com/darkskyapp/string-hash
     */
    function __fast_hash(str) {
        var hash = 5381, i = str.length;
        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        return hash;
    }

    /**
     * Expand Shorthand Template to HTML Template
     */
    function expand_shorthand_template(template) {

        var hash = __fast_hash(template, true).toString(16);

        if (_expanded_shorthand_template_cache[hash]) {
            return _expanded_shorthand_template_cache[hash];
        }

        // trim end to place our ending mark
        template = template.replace(/[\s\uFEFF\xA0]+$/ig, '');
        // add ending mark (0x7f = DEL)
        template += '\x7f';

        var result = '';
        var chr = '';
        var last_chr = '';
        var token = '';

        var pos = 0;
        var len = template.length;

        var tag_lines = [];
        var last_line_indent = 0;
        var line_indent = 0;
        var indent_counter = 0;
        var indent_base = -1;

        var in_content = false;

        for (pos = 0; pos < len; pos++) {

            last_chr = chr;
            chr = template.charAt(pos);

            // detect line start and indent
            if (token == '') {
                if (chr == '\t' || chr == ' ') {
                    indent_counter++;
                    continue;
                } else {
                    line_indent = indent_counter;
                    indent_counter = 0;
                }
            }

            if (chr == ':') {
                in_content = true;
            }

            // line end
            if ('\r\n\x7f'.includes(chr) || (chr == '>' && !in_content)) {

                // drop blank line
                if (token == '') {
                    line_indent = 0;
                    indent_counter = 0;
                    continue;
                }

                // use first line's indent as base
                if (indent_base == -1)
                    indent_base = line_indent;

                line_indent -= indent_base;

                // process result when go up level
                if (line_indent < last_line_indent)
                    result = build_result_to_level(line_indent, tag_lines);

                // expand token to tag
                token = token.trim();
                var tag = expand_shorthand_token(token);
                tag_lines.push([line_indent, tag]);

                token = '';
                last_line_indent = line_indent;

                // inline indent with >
                if (chr == '>') {
                    indent_counter = line_indent + 1;
                }

                // end with \x7f
                if (chr == '\x7f')
                    result = build_result_to_level(0, tag_lines);

                continue;

            }

            token += chr;

        }

        // cache the result
        _expanded_shorthand_template_cache[hash] = result;

        return result;

    }

    /**
     * Expand nested template up to given level
     */
    function build_result_to_level(limit_level, lines) {

        var result = '';
        var item;
        var last_level = -1;
        var level, tag;

        while (item = lines.pop()) {

            level = item[0];

            if (level < limit_level) {
                lines.push(item);
                break;
            }

            tag = item[1];

            if (tag == 'R') {
                result = item[2] + result;
                continue;
            }

            var indent = ' '.repeat(level);

            if (tag.end == '') {
                // singleton tags or text content
                result = indent + tag.start + '\n' + result;
            } else if (level < last_level) {
                // tags which have children
                result = indent + tag.start + '\n' + result + indent + tag.end + '\n';
            } else {
                // tags without children
                result = indent + tag.start + tag.end + '\n' + result;
            }

            last_level = level;
        }

        lines.push([last_level, 'R', result]);

        return result;

    }

    /**
     * Render shorthand token to full tag string
     */
    function expand_shorthand_token(tag_str) {

        var tag = '';
        var open_tag = '';
        var close_tag = '';
        var content = '';
        var is_singleton_tag = false;

        var chr = '';
        var last_mark = '';
        var in_attribute = false;
        var in_content_block = false;
        var in_mustache = 0;

        tag_str += '\n'; // add an ending char for it (0x7F = DEL)

        var pos = 0;
        var len = tag_str.length;

        // 1-pass loop, should be faster than RegExp
        for (pos = 0; pos < len; pos++) {

            chr = tag_str.charAt(pos);

            // output content block 
            if (in_content_block) {
                if (chr == '\n') break; // end of string
                content += chr;
                continue;
            } else if (chr == ':') {
                // start content block
                in_content_block = true;
            }

            // keep our {} tokens
            if (chr == '}') in_mustache--;
            if (chr == '{') in_mustache++;
            if (in_mustache) {
                open_tag += chr;
                continue;
            }

            // attribute block
            if (in_attribute && !',=]\n'.includes(chr)) {
                open_tag += chr;
                continue;
            }

            // general checks
            if ('#.:[\n'.includes(chr)) {

                // check for tag name
                if (open_tag == '' && chr != ':') // content block don't need a wrapper tag
                    open_tag = 'div';

                if (last_mark == '' && open_tag != '') {
                    is_singleton_tag = SINGLETON_TAGS.indexOf(',' + open_tag + ',') > -1;
                    tag = open_tag;
                }

                // close attribute
                if (last_mark == '#') {
                    open_tag += '"';
                }
                if (last_mark == '.' && chr != '.') {
                    open_tag += '"';
                }

                // end the process
                if (chr == '\n')
                    break;

            }

            switch (chr) {

                case '#':
                    open_tag += ' id="';
                    break;

                case '.':
                    open_tag += last_mark == '.' ? ' ' : ' class="';
                    break;

                case '[':
                    in_attribute = true;
                    open_tag += ' ';
                    break;

                case '=':
                    open_tag += '="';
                    break;

                case ']':
                case ',':
                    if (last_mark == '=')
                        open_tag += '"';
                    if (chr == ',') {
                        open_tag += ' ';
                    } else {
                        in_attribute = false;
                    }
                    break;

                case ':':
                case ' ':
                    // just drop it
                    break;

                default:
                    open_tag += chr;

            }

            if ('#.[]='.includes(chr)) {
                last_mark = chr;
            }

        }

        // build the complete tag
        content = content.trim();

        if (tag == '') {
            open_tag = content;
        } else if (is_singleton_tag) {
            open_tag = '<' + open_tag + '/>' + content;
        } else {
            open_tag = '<' + open_tag + '>' + content;
            close_tag = '</' + tag + '>';
        }

        return { start: open_tag, end: close_tag };

    }


    /**
     * Parse & render {} tokens in HTML template string
     */
    function render_template(template, data_obj, parsed_token) {

        var parsed_token = parsed_token || {}; // Processed token cache

        var result = '';

        var pos = 0;
        var len = template.length + 1; // process beyond end, chr == ''

        var chr = '';
        var last_chr = '';
        var next_chr = '';

        var token = '';
        var in_mustache = 0;
        var in_bracket = false;

        // 1-pass loop, should be faster than RegExp
        for (pos = -1; pos < len; pos++) {

            last_chr = chr;
            chr = next_chr;
            next_chr = template.charAt(pos);

            // {(preserved text)}
            if (chr == '{' && next_chr == '(') {
                in_bracket = true;
                next_chr = '';
                continue;
            } else if (in_bracket && chr == ')' && next_chr == '}') {
                in_bracket = false;
                next_chr = '';
                continue;
            }
            if (in_bracket) {
                result += chr;
                continue;
            }

            if (in_mustache && '{\n'.includes(chr)) {
                _error(TAG_FORMAT, 'Missing close "}" at ' + pos + '. token: "' + token + '"');
                throw new SyntaxError(SEE_ABOVE);
            }

            // 2/ process tokens
            switch (chr) {

                case '{':
                    if (next_chr == '{') {
                        // {{ = {
                        result += '{';
                        next_chr = '';
                    } else {
                        // start a token
                        in_mustache++;
                    }
                    break;

                case '}':

                    if (in_mustache) {

                        // end a token

                        if (token.startsWith('?') || token.startsWith('!')) {

                            // -> conditional block: {?key}{/?key} & {!key}{/!key}
                            var r = parse_conditional_template_block(token, pos, template, data_obj);
                            result = result + '\n' + r.output + '\n';
                            pos = r.end;   // skip to block ending
                            next_chr = ''; // skip next char - it's inside the block

                        } else if (token.startsWith('#')) {

                            // -> refer to other template by id: {#template-id}
                            result += format_template(token, data_obj, parsed_token);

                        } else {

                            // -> common tokens
                            // ignore block close token
                            if (!token.startsWith('/')) {
                                // render token
                                result += render_token(token, data_obj, parsed_token);
                            }

                        }

                        token = '';
                        in_mustache--;

                        continue;

                    }

                    if (next_chr == '}') {
                        // }} = }
                        result += '}';
                        next_chr = '';
                    }
                    break;

                default:

                    if (in_mustache) {
                        token += chr;
                    } else {
                        result += chr;
                    }

            }

        }

        if (in_bracket) {
            _error(TAG_FORMAT, 'Missing close ")}" in template string.');
            throw new SyntaxError(SEE_ABOVE);
        }

        if (in_mustache) {
            _error(TAG_FORMAT, 'Missing close "}" in template string.');
            throw new SyntaxError(SEE_ABOVE);
        }

        return result;

    }

    /**
     * Parse condition block {?token}{/?token} {!token}{/!token}
     */
    function parse_conditional_template_block(token, pos, template, data_obj) {

        var result = {
            end: pos,
            output: ''
        };

        // seek for close token
        var open_tag = '{' + token + '}';
        var close_tag = '{/' + token + '}';
        var duplicate_start = pos;
        var end = pos + 1;

        // seek for outmost close tag
        while (end > duplicate_start && end > -1 && duplicate_start > -1) {
            duplicate_start = template.indexOf(open_tag, duplicate_start + 1);
            end = template.indexOf(close_tag, end + 1);
        }

        if (end < 0) {
            _error(TAG_FORMAT, 'Missing close token: ' + close_tag);
            throw new SyntaxError(SEE_ABOVE);
        }

        result.end = end + close_tag.length;

        // prepare for child template rendering
        var mark = token.slice(0, 1);
        var real_token = token.substr(1);
        var child_data = fetch_value_by_key(data_obj, real_token);
        var child_template = template.substring(pos, end).trim();

        if (mark == '?' && child_data) {

            // ==> {?token}
            if (!(child_data instanceof Array))
                child_data = [child_data];

            _each(child_data, function (item) {
                result.output += render_template(child_template, item);
            });

        } else if (mark == '!' && !child_data) {

            // ==> {!token}
            result.output = render_template(child_template, data_obj);

        }

        result.ok = true;

        return result;

    }

    /**
     * {} Token Renderer
     */
    function render_token(token, obj, parsed_token) {

        // 1/ check for cache

        var value = parsed_token[token];
        if (value != undefined)
            return value;

        // 2/ prepare key & format string

        var split_pos = token.indexOf('|');
        if (split_pos < 0)
            split_pos = token.length;

        var key = token.substring(0, split_pos);
        var format = token.substring(split_pos + 1);

        // 3/ get value by key

        if (key == '') {

            // use full object for value
            value = obj;

        } else if (key.startsWith('$')) {

            // language string
            value = _lang(key.replace('$'), '');

        } else {

            // multi-level key
            value = fetch_value_by_key(obj, key);

        }

        // 4/ render value by format

        switch (typeof value) {

            case 'string':
                if (format != '' && format != '!html') {
                    // cut string
                    var add_dot = format.indexOf('.') > -1;
                    var len = parseInt(format);
                    if (!isNaN(len)) {
                        var str_len = value.length;
                        if (Math.abs(len) < str_len) {
                            value = len > 0 ? value.substr(0, len) : value.substr(len);
                            if (add_dot)
                                value = len > 0 ? value + '...' : '...' + value;
                        }
                    }
                }
                break;

            case 'number':
                value = format_number(value, format);
                break;

            case 'object':
                if (value instanceof Date) {
                    value = format_date(value, format);
                } else {
                    value = JSON.stringify(obj);
                }
                break;

            default:
                value = '';
                break;
        }

        if (!(format == '!html')) {
            value = html_safe(value);
        }

        parsed_token[token] = value;

        return value;

    }

    /**
     * Fetch value from data object
     */
    function fetch_value_by_key(obj, key) {

        if (typeof obj !== 'object') {
            _error(TAG_FORMAT, 'Expect a data Object. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(SEE_ABOVE);
        }

        // single level key
        if (!key.includes('.'))
            return obj[key];

        // multi-level key
        var keys = key.split('.');
        var sub_obj = obj;
        var child_obj;

        _each(keys, function (name) {

            child_obj = sub_obj[name];
            if (child_obj !== undefined) {
                sub_obj = child_obj;
            } else {
                _log(TAG_FORMAT, 'Template token value is undefined: {' + key + '}');
                sub_obj = '';
                return false;
            }

        });

        return sub_obj;

    }

    //// EXPORTS
    return _exports();

})();




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
            k++;
        }
        return false;
    }
}, false);

