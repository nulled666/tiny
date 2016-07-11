define([
    './global',
    "./base",
], function (G, tiny) {
    "use strict";

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

    tiny.fn.add({
        route: _route
    });

    // route match route & handler registry
    var _route_rules_ = {};
    var _route_handlers_ = {};
    var _route_on_ = false;
    var _route_bind_event_ = false;

    var TAG_RT_WATCH = '_route.watch()' + G.TAG_SUFFIX;
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

            tiny.error(TAG_RT_WATCH, 'Expect a string or RegExp. > Got "' + typeof route + '": ', route);
            throw new TypeError(G.SEE_ABOVE);

        }

        rule.matched = false; // set last match state to false

        if (!_route_rules_[route])
            _route_rules_[route] = rule;

        if (!_route_handlers_[route])
            _route_handlers_[route] = [];

        if (typeof handler !== 'function') {
            tiny.error(TAG_RT_WATCH, 'Expect a function. > Got "' + typeof handler + '": ', handler);
            throw new TypeError(G.SEE_ABOVE);
        }

        _route_handlers_[route].push(handler);

        tiny.log(TAG_RT_WATCH, 'Watch route: "' + route + '" ', rule);

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

    var TAG_RT_CHECK = '_route.check()' + G.TAG_SUFFIX;
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
            tiny.error(TAG_RT_WATCH, 'Expect a route string. > Got "' + typeof str + '": ', str);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (str === undefined) str = route_get();

        var q = str.replace(/^#/, '');

        tiny.log(TAG_RT_CHECK, 'Check route: "' + q + '"');

        if (q == '') q = '/';

        var found = false;

        tiny.each(_route_rules_, function (rule, route) {

            if (!rule.re) return;

            var match = rule.re.exec(q);

            if (match) {

                // -> matching
                rule.matched = true;

                match.shift(); // remove first match - full string

                // prepare parameters
                var params = {};

                if (rule.param_names) {
                    tiny.each(rule.param_names, function (name, index) {
                        params[name] = match[index];
                    });
                } else if (rule.is_regexp) {
                    params = [];
                    tiny.each(match, function (value, index) {
                        params[index] = value;
                    });
                } else {
                    params = true;
                }

                // call handlers
                tiny.info(TAG_RT_CHECK, 'Route match: "' + route + '" + ', params);
                route_invoke_handlers(_route_handlers_[route], q, params);

                found = true;

            } else {

                // -> not matching but previously matched
                if (rule.matched) {
                    tiny.info(TAG_RT_CHECK, 'Previously matched: "' + route + '" + ', false);
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
        tiny.each(handlers, function (handler) {
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

    var TAG_RT_GET = '_route.get()' + G.TAG_SUFFIX;
    /**
     * Get current route string
     * ```
     *   _route.get()
     * ```
     */
    function route_get() {
        return window.location.hash.replace(/^#/, '');
    }

    var TAG_RT_SET = '_route.set()' + G.TAG_SUFFIX;
    /**
     * Set route
     * ```
     *   _route.set('/test/name/4123')         // set to given route
     *   _route.set('/test/name/4123', false)  // set to given route without trigger event
     * ```
     */
    function route_set(route, trigger) {

        if (typeof route !== 'string') {
            tiny.error(TAG_RT_WATCH, 'Expect a route string. > Got "' + typeof route + '": ', route);
            throw new TypeError(G.SEE_ABOVE);
        }

        trigger = (trigger !== false);

        window.location.hash = route;

        if (trigger && _route_on_)
            _route.check();

        return _route;

    }


    var TAG_RT_APPEND = '_route.append()' + G.TAG_SUFFIX;
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
            tiny.error(TAG_RT_WATCH, 'Expect a string or array. > Got "' + typeof str_or_arr + '": ', str_or_arr);
            throw new TypeError(G.SEE_ABOVE);
        }

        route_set(route, trigger);

        return _route;

    }


    var TAG_RT_REMOVE = '_route.remove()' + G.TAG_SUFFIX;
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
            tiny.error(TAG_RT_REMOVE, 'Expect a string. > Got "' + typeof str + '": ', str);
            throw new TypeError(G.SEE_ABOVE);
        }

        var pos = route.indexOf(str);
        if (pos > -1) {
            route = route.substr(0, pos);
            route_set(route, trigger);
        }

        return _route;

    }

});