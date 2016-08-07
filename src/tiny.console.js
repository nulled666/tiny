define([
    "./global",
    "./tiny.base"
], function (G, tiny) {
    "use strict";

    //////////////////////////////////////////////////////////
    // CONSOLE SHORTHAND METHODS
    //////////////////////////////////////////////////////////
    var _log, _dir, _info, _warn, _error;
    var _win = window;
    var _con = console;

    tiny.x.add({
        inspect: _inspect,
        time: perf_time,
        output: output_level
    });

    // default output level
    var DEFAULT_OUTPUT_LEVEL = 'warn error';

    // enable console shorthands now
    output_level();

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
    function _inspect(obj, filter_out, log) {

        log = log == false ? false :
            filter_out === false ? false : true;

        filter_out = filter_out || null;

        if (filter_out) {
            if (_type(filter_out) !== 'Array') filter_out = [filter_out];
            filter_out = '|' + filter_out.join('|') + '|';
        }

        var result = JSON.stringify(obj, function (name, value) {

            if (filter_out && filter_out.includes('|' + name + '|')) return undefined;

            switch (typeof value) {
                case 'function':
                    return '[function ' + value.name + '()]';
                case 'undefined':
                    return '[undefined]';
                default:
                    return value;
            }

        }, 4);

        if (log == false) return result;

        _info('%c' + result, 'padding: 0 8px;color:#292;background:#f9fff9;border-radius: 1em;');

    }

    // privates for pref_time()
    var _perf_time = {};
    var _perf = _win.performance || {};
    var _perf_now = _win.performance.now
        ? function () { return _win.performance.now() }
        : function () { return (new Date()).getTime() };

    /**
     * Get performance time
     */
    function perf_time(id, log) {
        if (!_perf_time[id]) {
            _perf_time[id] = _perf_now();
        } else {
            var time = (_perf_now() - _perf_time[id]);
            _perf_time[id] = false;
            if (log != false)
                _info('%c' + id + ': ' + time.toFixed(3) + 'ms', 'padding: 0 8px;color:#33c;background:#f9f9ff;border-radius: 1em;');
            return time;
        }
    }

    // lazy function
    function noop(){}

    /**
     * Enable/disable console method output
     * ```
     *   tiny.output('none');      // disable all
     *   tiny.output('all');       // enable all = 'log|info|warn|error', 'log' flag includes dir()
     *   tiny.output('log|error'); // console.log() & console.error() only
     *   tiny.output();            // default = 'warn|error' only
     * ```
     */
    function output_level(on) {

        on = on == undefined || typeof on != 'string' ? DEFAULT_OUTPUT_LEVEL :
            on == 'none' ? '' :
                on == 'all' ? 'log info warn error' :
                    on;

        _log = on.includes('log') ? _con.log.bind(_con) : noop;
        _dir = on.includes('log') ? _con.dir.bind(_con) : noop;
        _info = on.includes('info') ? _con.info.bind(_con) : noop;
        _warn = on.includes('warn') ? _con.warn.bind(_con) : noop;
        _error = on.includes('error') ? _con.error.bind(_con) : noop;

        tiny.x.add({
            log: _log,
            dir: _dir,
            info: _info,
            warn: _warn,
            error: _error
        });

        if (G.GLOBAL_INJECTED) {
            _win._log = _log;
            _win._dir = _dir;
            _win._info = _info;
            _win._warn = _warn;
            _win._error = _error;
        }

    }

});