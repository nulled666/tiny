define([
    "./global",
    "./base"
], function (G, tiny) {
    "use strict";

    //////////////////////////////////////////////////////////
    // CONSOLE SHORTHAND METHODS
    //////////////////////////////////////////////////////////
    var _log, _dir, _info, _warn, _error;

    // assgin immediately
    assign_console_shorthand();

    tiny.fn.add({
        log: _log,
        dir: _dir,
        info: _info,
        warn: _warn,
        error: _error,
        inspect: _inspect,
        time: pref_time,
        verbose: verbose_output
    });

    var _verbose_mode = false;

    /**
     * Assign the console shorthands
     */
    function assign_console_shorthand() {

        // IE8 polyfill
        if (typeof console === "undefined") console = {};

        tiny.each(['log', 'dir', 'info', 'warn', 'error'], function (item) {
            if (typeof console[item] === "undefined")
                console[item] = console_method_polyfill;
        });

        _info = console.info.bind(window.console);
        _warn = console.warn.bind(window.console);
        _error = console.error.bind(window.console);
        
        verbose_output(_verbose_mode);

    }

    /**
     * a polyfill function for console methods
     */
    function console_method_polyfill() {
        var arr = Array.prototype.slice.call(arguments);
        var msg = 'Console Output >>>\n' + arr.join('\n');
        alert(msg);
    }


    /**
     * Expand object to an JSON string
     * Helper function for display nested object in console
     * ```
     *   _log( _inspect({text: 'test', func: test_func, out: 11}), "out" )
     *   // {
     *   //   "text": "test",
     *   //   "func": "[function]"
     *   // }
     * ```
     */
    function _inspect(obj, filter_out) {

        filter_out = filter_out || false;

        if (filter_out) {
            if (_type(filter_out) !== 'Array') filter_out = [filter_out];
            filter_out = '|' + filter_out.join('|') + '|';
        }

        return JSON.stringify(obj, function (name, value) {

            if (filter_out && filter_out.includes('|' + name + '|')) return undefined;

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

    // privates for pref_time()
    var _pref_time = {};
    var _perf = window.performance || {};
    var _perf_now = window.performance.now
        ? function () { return window.performance.now() }
        : function () { return (new Date()).getTime() };

    /**
     * Get performance time
     */
    function pref_time(id) {
        if (!_pref_time[id]) {
            _pref_time[id] = _perf_now();
        } else {
            var time = (_perf_now() - _pref_time[id]);
            _pref_time[id] = false;
            return time;
        }
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
            _warn(G.TAG_TINY, '_log() & _dir() output is enabled');
        } else {
            _log = _dir = tiny.fn.noop;
            _info(G.TAG_TINY, '_log() & _dir() output is disabled');
        }

        if (G.GLOBAL_INJECTED) {
            window._log = _log;
            window._dir = _dir;
        }

    }
    
});