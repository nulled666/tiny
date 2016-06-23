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

var _tiny = (function () {

    var config_ = {
        registerGlobals: true,
        showLog: false
    };

    var _tiny_definition = {};
    var _global_prototype = [];
    var _skip_global = ',showMe,showLog,';

    var TAG_T = '{_tiny}';
    var TAG_SUFFIX = ' -> ';
    var SEE_ABOVE = '^^^ See Above for Details';

    /**
     * Exports methods & properties
     */
    function _exports() {

        if (config_.registerGlobals) {
            register_globals();
            _info(TAG_T, 'Global functions rigistered.');
        }

        return _tiny_definition;

    }

    /**
    * Register functions to global namespace
    * This can be disabled by setting config.registerGlobals = false
    */
    function register_globals() {

        var win = window

        if (!win) {
            _error(TAG_T, 'window object is not available');
            return;
        }

        _each(_tiny_definition, function (item, label) {
            if (_skip_global.includes(label)) return;
            win['_' + label] = item;
        })

    }

    /**
     * show _tiny namespace structure
     */
    function show_tiny_definition() {
        _warn('_tiny = ' + flatten_object(_tiny_definition));
    }

    add_to_tiny_definition({ showMe: show_tiny_definition });

    /**
     * Add entry to _tiny_definition
     */
    function add_to_tiny_definition(ext) {
        _tiny_definition = _extend(_tiny_definition, ext);
    }

    /**
     * Add entry to Prototype list
     */
    function add_to_global_prototype(ext) {
        _global_prototype = _extend(_global_prototype, ext);
    }


    //////////////////////////////////////////////////////////
    // CONSOLE SHORTHAND METHODS
    //////////////////////////////////////////////////////////
    var _log, _info, _warn, _error

    function assign_console_shorthand() {
        _info = console.info.bind(window.console);
        _warn = console.warn.bind(window.console);
        _error = console.error.bind(window.console);
        show_log(config_.showLog);
    }

    // execute immediately - following function might need them
    assign_console_shorthand();

    // append to definition
    add_to_tiny_definition({
        log: _log,
        info: _info,
        warn: _warn,
        error: _error,
        showLog: show_log,
        xObj: flatten_object
    });

    /**
     * Console.log wrapper for fast enable/disable console output
     * Other console output types should not be disabled
     * ```
     *   _tiny.showLog(true);
     * ```
     */
    function show_log(on) {

        if (on) {
            _log = console.log.bind(window.console);
            _warn('{_tiny}', '_log() output is enabled');
        } else {
            _log = function () { }
            _info('{_tiny}', '_log() output is disabled');
        }

        if (config_.registerGlobals) {
            window._log = _log;
        }

    }

    /**
     * Expand object to an JSON string
     * Helper function for display nested object in console
     * ```
     *   _log( _xObj({text: 'test', func: test_func}) )
     *   // {
     *   //   "text": "test",
     *   //   "func": "[function]"
     *   // }
     * ```
     */
    function flatten_object(obj) {

        return JSON.stringify(obj, function (name, value) {
            switch (typeof value) {
                case 'function':
                    return '[Function]';
                case 'undefined':
                    return '[undefined]';
                default:
                    return value;
            }
        }, 4)

    }


    //////////////////////////////////////////////////////////
    // REQUIRED ECMASCRIPT 5+ FEATURE POLYFILLS
    //////////////////////////////////////////////////////////

    // String.prototype
    //  .trim()
    // 	.includes()
    //	.startsWith()
    //  .repeat()
    _extend(String.prototype, {

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

        repeat: function (count) {
            if (typeof count !== 'number') {
                count = 0;
            }
            if (count < 1) {
                return '';
            }
            return Array(count + 1).join(this);
        }

    }, true);

    // Array.prototype
    //  .isArray()
    _extend(Array, {
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) == '[object Array]';
        }
    }, true);

    //////////////////////////////////////////////////////////
    // BASE FUNCTIONS
    //////////////////////////////////////////////////////////
    add_to_tiny_definition({
        each: _each,
        extend: _extend,
        namespace: _namespace
    });

    var TAG_EACH = '_each()' + TAG_SUFFIX
    /**
     * Simply iteration helper function
     * ```
     *   _each( array_or_object , function(value, index, array_or_object){
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
    function _each(obj, func, this_arg) {

        if (typeof obj !== 'object') {
            _error(TAG_EACH, 'Only Array and Object can be iterated\n > Got "' + typeof obj + '"\n > ', obj);
            throw new TypeError(SEE_ABOVE);
        }
        if (typeof func !== 'function') {
            _error(TAG_EACH, 'Iteration callback function required\n > Got "' + typeof func + '"\n > ', func);
            throw new TypeError(SEE_ABOVE);
        }

        var result;

        if (Array.isArray(obj)) {
            // -> Array
            for (var i = 0, len = obj.length; i < len; i++) {
                result = func.call(this_arg, obj[i], i, obj);
                if (result !== undefined) return result;
            }
        } else {
            // -> Object
            for (var label in obj) {
                result = func.call(this_arg, obj[label], label, obj);
                if (result !== undefined) return result;
            }
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
     *   _extand({'old': 1}, {'old': 200}, true)
     *     == {'old': 1}
     * ```
     */
    function _extend(target, extensions, prevent_overwrite) {

        // Don't extend non-objects
        var type = typeof target;
        if (type !== 'object' && type !== 'function') {
            _error(TAG_EXTEND, 'Only Object & Function can be extended\n > Got "' + type + '"\n > ', target);
            throw new TypeError(SEE_ABOVE);
        }
        if (typeof extensions !== 'object') {
            _error(TAG_EXTEND, 'Extension should be an Object\n > Got "' + typeof extensions + '"\n > ', extensions);
            throw new TypeError(SEE_ABOVE);
        }

        _each(extensions, function (item, name) {
            // no self reference - continue
            if (target === item) return;
            // exists and no overwrite - continue
            if (prevent_overwrite && (typeof target[name] !== 'undefined')) return;
            // set extension
            target[name] = item;
        })

        return target;

    }

    var TAG_NS = '_namespace()' + TAG_SUFFIX;
    /**
     * Create and bind a namespace
     * ```
     *    _namespace('my.project')  // just create the namesapce object
     *    _namespace('my.project.lib', {nothing: true})
     * ```
     */
    function _namespace(ns_string, ext) {

        if (typeof ns_string != 'string') {
            _error(TAG_NS, 'Expect a namespace string :\n', ns_string);
            return;
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
    // SIMPLE CUSTOM EVENT SYSTEM
    //////////////////////////////////////////////////////////
    var _message = {
        listen: listen_message,
        post: post_message
    };

    add_to_tiny_definition({ message: _message });

    // internal registry of message handlers
    var _message_handlers = {};

    var TAG_MSG_LISTEN = '_message.listen()' + TAG_SUFFIX;
    /**
     * Add a custom message listener
     * ```
     *   _message.listen('my_message', message_handler)
     *   _message.trigger('my_message', param1, param2, ...)
     *     -> message_handler('my_message', param1, param2, ...)
     * ```
     */
    function listen_message(event, handler) {

        if (!_message_registry[event])
            _message_registry[event] = [];

        _log(TAG_MSG_LISTEN, 'Listen to message: "' + event + '"');

        _message_registry[event].push(handler);

    }

    var TAG_MSG_POST = '_message.post()' + TAG_SUFFIX;
    /**
     * Trigger a custom message with any number of arguments
     * ```
     *    _message.post('my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_message(msg) {

        var msg = arguments[0];
        var handles = _message_registry[msg];

        var sliced_args = Array.prototype.slice.call(arguments, 1);

        _info(TAG_MSG_POST, 'Post message "' + msg + '"\n', sliced_args);

        if (!handles || handles.length < 1) {
            _warn(TAG_MSG_POST, 'Nobody is listen to this message');
            return;
        }

        // call handles
        _each(handles, function (callback) {
            callback.apply(this, sliced_args);
        });

        _log(TAG_MSG_POST, handles.length + ' message handlers triggered');

    }


    //////////////////////////////////////////////////////////
    // SIMPLE ROUTE SYSTEM
    //////////////////////////////////////////////////////////
    var _route = {
        watch: watch_route,
        check: check_route
    };

    add_to_tiny_definition({ route: _route });

    // route match route & handler registry
    var _route_rules = {};
    var _route_handlers = {};

    var TAG_RT_WATCH = '_route.watch()' + TAG_SUFFIX;
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
    function watch_route(route, handler) {

        var rule;

        if (typeof route == 'string') {
            rule = prepare_route(route);
        } else if (route instanceof RegExp) {
            // remove the 'g' flag - it should not be used here
            var flags = route.toString();
            flags = flags.slice(flags.lastIndexOf('/') + 1);
            flags = flags.replace('g', '');
            route = new RegExp(route.source, flags);
            rule = { re: route };
        } else {
            _error(TAG_RT_WATCH, 'Expect string or RegExp :\n', route);
            return;
        }

        if (!_route_rules[route])
            _route_rules[route] = rule;

        if (!_route_handlers[route])
            _route_handlers[route] = [];

        _route_handlers[route].push(handler);

        _log(TAG_RT_WATCH, 'Watch route: "' + route + '"\n', rule);

    }

    /**
     * Prepare route string to RegExp
     * @param {string} route - Route string
     */
    function prepare_route(route) {

        var rule = {};
        var re = route;

        if (re == '') re = '/';

        re = re.replace(/([:|$?.*=\(\)\\\/^])/g, '\\$1');

        if (re.indexOf('\\/') == 0)
            re = '^' + re;

        re += '(?:\/|$)';

        var param_re = /\{([a-zA-Z0-9-_]+)\}/g;
        var param_names = [];

        var match;
        while (match = param_re.exec(re)) {
            param_names.push(match[1]);
        }

        re = re.replace(param_re, '([a-zA-Z0-9-_]+)');

        rule.re = new RegExp(re);
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
    function check_route(str) {

        var q = str || window.location.hash;
        q = q.replace(/^#/, '');

        _log(TAG_RT_CHECK, 'Check route: "' + q + '"');

        var found = false;

        _each(_route_rules, function (rule, route) {

            var match = rule.re.exec(q);

            if (match) {

                match.shift(); // remove first match - full string

                // process params
                var params = {};

                if (rule.param_names) {
                    _each(rule.param_names, function (name, index) {
                        params[name] = match[index];
                    });
                } else {
                    params = [];
                    _each(match, function (value, index) {
                        params[index] = value;
                    });
                }

                _info(TAG_RT_CHECK, 'Invoke route rule:\n', route, q, params);

                // call handlers
                _each(_route_handlers[route], function (handler) {
                    var result = handler(q, params);
                });

                found = true;

            } else {

                // not match - notify them with a false value
                _each(_route_handlers[route], function (handler) {
                    var result = handler(q, false);
                });

            }

        });


        return found;

    }


    /**
     * Event listener for window.location.hash change
     */
    function route_on_window_hash_change(e) {
        check_route();
    }

    // bind listener immediately
    window.addEventListener('hashchange', route_on_window_hash_change);


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
     * ```
     *   // filter keys by prefix, default is ''
     *   _tiny.storage.keyPrefix = 'your_prefix'
     *   _store()           // return all values as an Object
     *   _store(key)        // get value
     *   _store(key, value) // set value
     *   _store(key, null)  // delete value of given key
     *   _store(null)       // delete all contents
     *   // Integer, Boolean, Array, Date & Object types will be converted automatically
     * ```
     */
    function local_storage(key, value) {

        var storage = window.localStorage;

        if (key === undefined) {

            // read all ----------

            var result = {};

            _each(storage, function (item, label) {
                result[label] = storage_output_type_conversion(item);
            });

            return result;

        } else if (key === null) {

            // delete all ----------

            if (_storage.storageKeyPrefix == '') {

                // the easy way
                _warn(TAG_STORAGE, 'All items in window.localStorage are cleared');
                storage.clear();

            } else {

                // have to check every key for prefix

                for (var i = 0; i < storage.length; i++) {
                    var key = storage.key(i);
                    if (key.starsWith(_storage.keyPrefix)) {
                        storage.removeItem(key);
                        i--;
                    }
                }

                _warn(TAG_STORAGE, 'All items in window.localStorage with prefix "' + _storage.keyPrefix + '" arecleared');

            }

        } else {

            // add prefix
            key = _storage.keyPrefix + key;

            if (value === undefined) {

                // read ----------
                var result = storage[key];
                result = storage_output_type_conversion(result);
                return result;

            } else if (value === null) {

                // delete ----------
                _log(TAG_STORAGE, 'Deleted window.localStorage item: "' + key + '"');
                return storage.removeItem(key);

            } else {

                // write ----------
                value = storage_input_type_conversion(value);
                storage.setItem(key, value);
                _log(TAG_STORAGE, 'Set window.localStorage item: "' + key + '" = ', value);

            }

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
    // COOKIES ACCESS
    // This feature requires these functions above:
    //     storage_input_type_conversion()
    //     storage_output_type_conversion()
    //////////////////////////////////////////////////////////

    add_to_tiny_definition({ cookie: _cookie });

    var TAG_COOKIE = '_cookie()' + TAG_SUFFIX;
    /**
     * Simple Cookie Manager
     * ```
     *   _cookie(key)                // get value
     *   _cookie(key, value [, ttl]) // set value
     *   _cookie(key, null)          // delete value of given key
     *   _cookie(null)               // delete all cookies
     *   // Integer, Boolean, Array, Date & Object types will be converted automatically
     * ```
     */
    function _cookie(key, value, ttl) {

        if (key === null) {

            // clean all cookie
            var cookieArray = document.cookie.split('; ');
            for (var i = 0; i < cookieArray.length; i++) {
                var item = cookieArray[i].split('=');
                arguments.callee(item[0], null);
            }
            _warn(TAG_COOKIE, 'All cookies are deleted');

        } else if (value === undefined) {

            // get cookie
            var cookieArray = document.cookie.split('; ');
            for (var i = 0; i < cookieArray.length; i++) {
                var item = cookieArray[i].split('=');
                if (item[0] == key) {
                    return storage_output_type_conversion(item[1]);
                }
            }

            return undefined;

        } else if (value === null) {

            // delete cookie
            document.cookie = key + '=;expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/';
            _warn(TAG_COOKIE, 'Deleted cookie: ' + key);

        } else {

            // set cookie
            ttl = ttl || 365; // default ttl 1 year

            value = storage_input_type_conversion(value);

            var date = new Date();
            date.setTime(date.getTime() + (ttl * 24 * 60 * 60 * 1000));

            document.cookie = key + '=' + value + '; expires=' + date.toGMTString() + '; path=/';

            _log(TAG_COOKIE, 'Set cookie: "' + key + '" = ', value);

        }

    }


    //////////////////////////////////////////////////////////
    // MULTILINGUE SUPPORT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _lang = get_lang_string;
    _lang.strings = {};

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


    //////////////////////////////////////////////////////////
    // FORMAT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _format = format_template; // tricky
    _format.number = format_number;
    _format.date = format_date;

    add_to_tiny_definition({ format: _format });

    // prototypes
    _global_prototype.push(

        [String.prototype,
            {
                _htmlSafe: function () { return html_safe(this.valueOf()); },
                _formatWith: function (obj) { return format_template(this.valueOf(), obj); }
            }],

        [Number.prototype,
            {
                _format: function (format) { return format_number(this.valueOf(), format); }
            }],

        [Date.prototype,
            {
                _format: function (format, names) { return format_date(this, format, names); }
            }
        ]

    );

    /**
     * Make string HTML-safe
     * ```
     *   var str = 'task:\n   >> done';
     *   // escape special chars
     *   str._htmlSafe() == 'task:<br/>   &gt;&gt; done'
     *   // set true to escape white spaces
     *   str._htmlSafe(true) == 'task:<br/>&nbsp;&nbsp;&nbsp;&gt;&gt;&nbsp;done'
      * ```
     */
    function html_safe(str, keep_spaces) {

        if (typeof str != 'string') {
            _error(CONSOLE_TAG['htmlSafe'], 'Expect a string:', str);
            return '';
        }

        str = str.replace(/\&/g, '&amp;')
            .replace(/\>/g, '&gt;')
            .replace(/\</g, '&lt;')
            .replace(/\'/g, '&quot;')
            .replace(/\'/g, '&#39;')
            .replace(/\n/g, '<br/>');

        if (keep_spaces)
            str = str.replace(/\s/g, '&nbsp;');

        return str;

    };

    /**
     * Number format function
     * ```
     *   var num = 123456.789;
     *   num._format() == '123456.789'
     *   num._format('.') == '123457' // round to point
     *   num._format('.00') == '123456.78'
     *   num._format(',') == '123,456'
     *   num._format(',.00') == '123,456.78'
     *   num._format(',.00%') == '12,345,678.90%'
     *   num._format('hex') == '1e240.c9fbe76c9'
     *   num._format('HEX.') == '1E240' // uppercase & rounded
     *   num._format('HEX.00') == '1E240.C9'
     * ```
     */
    function format_number(num, format) {

        if (typeof num != 'number') {
            _error(CONSOLE_TAG['format.number'], 'Expect a number:', num);
            return '';
        }

        format = format || '';

        if (format.includes('hex') || format.includes('HEX')) {
            return format_hex_number(num, format);
        } else {
            return format_dec_number(num, format);
        }
    }

    /**
     * Format Decimal Number
     */
    function format_dec_number(num, format) {

        // Add commas
        var add_comma = format.includes(',');

        // Percent number
        var is_percent = false;
        if (format.includes('%')) {
            num = num * 100;
            is_percent = true;
        }

        var parts = format.replace(/[^\d\.]/g, '').split('.');

        // compute precision
        if (parts.length > 1) {
            // fix number precision - ignore further portions
            num = num.toFixed(parts[1].length);
        }

        num = num.toString();

        // format has comma, then compute commas
        if (add_comma) {

            parts = num.split('.');

            var x1 = parts[0];
            var x2 = parts.length > 1 ? '.' + parts[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }

            num = x1 + x2;

        }

        return num + (is_percent ? '%' : '');

    }

    /**
     * Format number to hex string
     */
    function format_hex_number(num, format) {

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

        if (format.includes('HEX'))
            num = num.toUpperCase();

        return num;
    }


    // localizable date names for date formatting
    _format.dateNames = {
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayAbbr: ['Sun', 'Mon', 'Tue', 'Wedy', 'Thu', 'Fri', 'Sat'],
        month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ap: ['AM', 'PM']
    }

    // default format string for Date.prototype._format()
    _format.defaultDateFormat = 'datetime';

    /**
     * Format Date
     * ```
     *   // set custom localized date name strings
     *   _tiny.format.dateNames = custom_names
     *   // set default format string
     *   _tiny.format.defaultDateFormat = 'datetime'
     *   var d = new Date(1118102950753)
     *   d._format() == d._format('datetime') == '2005-06-07 08:09:10'
     *   d._format('date') == '2005-06-07' // yyyy-MM-dd
     *   d._format('time') == '08:09:10'   // HH:mm:ss
     *   d._format('iso') == '2005-06-07T00:09:10.753Z' // ISO 8601
     *   // format string codes:
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
    function format_date(date, format, names) {

        if (Object.prototype.toString.call(date) !== "[object Date]")
            date = new Date();

        // Make a copy of current date
        date = new Date(date);
        names = names || _format.dateNames;
        format = format || _format.defaultDateFormat;

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
        var result = '';
        var pos = 0;
        while (pos < format.length) {

            var currentChar = format.charAt(pos);
            var currentToken = '';

            while ((format.charAt(pos) == currentChar) && (pos < format.length)) {
                currentToken += currentChar;
                pos++;
            }

            if (tokens[currentToken]) {
                result += tokens[currentToken];
            } else {
                result += currentToken;
            }

        }

        // done
        return result;

    }


    /*
      >> Shorthand Template
      
        // direct call
        _format('>> ul#main-list.active > li.item > .title :{}', 'text content');
      
        // read template from HTML <script> tag
        _format('#template-id');
      
        // in html file
        <script type="x-template" id="template-id">
          >>
          li .item [id={id}]
            .title :{title}
            .tags
              :{plans} PLANS
              i :/
              :{people} PEOPLE
        </script>
      
      >> Shorthand syntax
        >> - mark of a shorthand template
        # - mark start of an ID
        . - mark start of a class
        : - all string after this mark will be treated as content until a newline char is encountered
        > - indicate an inline nest indent (won't work after :)
      
      >> Normal HTML Template
      
        _format('#template-id');
      
        <script type="x-template" id="template-id">
          <li class="item" id="{id}">
            <div class="title">{title}</div>
            <div class="tags">
              {plans} PLANS <i>/</i> {people} PEOPLE
            </div>
          </li>
        </script>
      
      >> Template Tokens for value fill-in
        {index} - refer to Array[index] item by index
        {key} - refer to Object[key] property by key
        {key|format} - set format string for obj[key]
        {} - replace with whole object, format with default style
        {|format} - format whole object with given 'format' string
        {(output text)} - don't process, simple output content inside curl brackets
      
      >> Special Formats
        {key|!html} - don't encode special html chars
        {$key} - refer to a language string by calling _t(key)
        {key|5} - output first 5 chars from beginning
        {key|-5} - output last 5 chars from ending
      
      >> Conditional Block
        {?key}				Show block if Object[key] is not empty or false
          {subkey}		Tokens inside block will be filled will data[key][subkey]
        {/?key}
        
        {^key}				Show block if Object[key] is empty or false
          {other_key}		Tokens inside block will be filled will data[other_key]
        {/^key}
          
      >> Reference to template
        {#template-id}		Same format like refer to template in html file. Beware of circular reference
    */
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
            _error(CONSOLE_TAG.format, 'Please supply a string as template. Recieved: ', template);
            return '[ERROR]';
        }

        var template_container;
        var template = template_str.valueOf();

        if (template.startsWith('#')) {
            // getting template text from document element
            var id = template.replace('#', '');
            template_container = document.getElementById(id);
            if (!template_container) {
                _error(CONSOLE_TAG.format, 'Template container not found: #' + id);
                return '';
            }
            template = template_container.innerHTML;
            if (template.includes('{#' + id + '}')) {
                _error(CONSOLE_TAG.format, 'Circular reference to self detected.');
                return '';
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

        var hash = 5381,
            i = str.length;

        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }

        return hash;

    }

    /**
     * Helper function for error display
     */
    function get_string_fragment(str, pos) {

        var end = pos + 20;
        var start = start < 0 ? 0 : start;
        end = end > str.length ? str.length : end;

        start = str.substring(0, pos);
        end = str.substring(pos + 1, end);

        start = start + ' ^' + str.charAt(pos) + '^ ' + end + '...';
        start = start.replace(/[\n\r]/g, '').replace(/\s+/g, ' ');

        return start;

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
                if (chr == '\t') {
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

            if (level < last_level) {
                result = '\t'.repeat(level) + tag.start + '\n' + result + '\t'.repeat(level) + tag.end + '\n';
            } else {
                result = '\t'.repeat(level) + tag.start + tag.end + '\n' + result;
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

        if (typeof tag_str != 'string') {
            _error(CONSOLE_TAG.format, 'Expecting a string: ', tag_str);
            return { start: '[ERROR]', end: '[/ERROR]' };
        }

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

        tag_str += '\x7f'; // add an ending char for it (0x7F = DEL)

        var pos = 0;
        var len = tag_str.length;

        // 1-pass loop, should be faster than RegExp
        for (pos = 0; pos < len; pos++) {

            chr = tag_str.charAt(pos);

            // output content block 
            if (in_content_block) {
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
            if (in_attribute && !',=]'.includes(chr)) {
                open_tag += chr;
                continue;
            }

            // general checks
            if ('#.:[\x7f'.includes(chr)) {

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
                if (chr == '\x7f')
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

        if (typeof template != 'string') {
            _error(CONSOLE_TAG.format, 'Expect a string for template. Recieved:', template);
            return '[ERROR]';
        }

        var parsed_token = parsed_token || {}; // Processed token cache

        var result = '';

        var pos = 0;
        var len = template.length + 1;

        var chr = '';
        var last_chr = '';
        var next_chr = '';

        var token = '';
        var in_mustache = 0;
        var in_bracket = false;
        var in_format = false;

        // 1-pass loop, should be faster than RegExp
        for (pos = -1; pos < len; pos++) {

            last_chr = chr;
            chr = next_chr;
            next_chr = template.charAt(pos);

            // support for {(preserved text)}
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

                        if (token.startsWith('?') || token.startsWith('^')) {

                            // -> conditional block: {?key}{/?key} & {^key}{/^key}

                            var r = parse_conditional_template_block(token, pos, template, data_obj);

                            if (r.ok) {
                                result += r.output;
                                pos = r.end; // skip to block ending
                            } else {
                                return result; // found error
                            }

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
                        in_format = false;

                        continue;

                    }

                    if (next_chr == '}') {
                        // }} = }
                        result += '}';
                        next_chr = '';
                    }
                    break;

                case '|':
                    // format string
                    if (in_mustache)
                        in_format = true;
                    token += chr;
                    break;

                default:

                    if (in_mustache) {
                        if (!in_format && '<>\n'.includes(chr)) {
                            _error(CONSOLE_TAG.format, 'Missing close "}" at ' + pos + '\n' + get_string_fragment(template, pos - 1));
                            return result;
                        }
                        token += chr;
                    } else {
                        result += chr;
                    }

            }

        }

        if (in_mustache)
            _warn(CONSOLE_TAG.format, 'Possible missing close "}" in template string.');

        return result;

    }

    /**
     * Parse condition block {?token}{/?token} {^token}{/^token}
     */
    function parse_conditional_template_block(token, pos, template, data_obj) {

        var result = {
            ok: false,
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
            _error(CONSOLE_TAG.format, 'Missing close token ' + close_tag + '.');
            result.end = pos + open_tag.length;
            return result;
        }

        result.end = end + close_tag.length;

        // prepare for child template rendering
        var mark = token.slice(0, 1);
        var real_token = token.substr(1);
        var child_data = fetch_value_by_key(data_obj, real_token);
        var child_template = template.substring(pos, end);

        if (mark == '?' && child_data) {

            if (!(child_data instanceof Array))
                child_data = [child_data];

            _each(child_data, function (item) {
                result.output += render_template(child_template, item);
            });

        } else if (mark == '^' && !child_data) {

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
            value = _tiny(key.replace('$'), '');

        } else {

            // multi-level key
            value = fetch_value_by_key(obj, key);

        }

        // 4/ render value by format

        switch (typeof value) {

            case 'string':
                if (format != '' && format != '!html') {
                    var len = parseInt(format);
                    if (!isNaN(len)) {
                        var str_len = value.length;
                        if (Math.abs(len) < str_len) {
                            value = len > 0 ? value.substr(0, len) : value.substr(len);
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

        if (obj === undefined) {
            _error(CONSOLE_TAG.format, 'Empty data object');
            return '';
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
                _error(CONSOLE_TAG.format, 'Template token value is undefined: {' + key + '}');
                sub_obj = '';
                return false;
            }

        });

        return sub_obj;

    }

    //// EXPORTS
    return _exports();

})();



