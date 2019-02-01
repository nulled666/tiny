define([
    "./global",
    "./tiny.base"
], function (G, tiny) {
    "use strict";

    //////////////////////////////////////////////////////////
    // CONSOLE SHORTHAND METHODS
    //////////////////////////////////////////////////////////
    var _log, _info, _warn, _error;
    var _group, _timer;
    var _win = window;
    var _con = console;

    tiny.x.add({
        output: output_level,
        inspect: _inspect
    })
    /*
        Might also add following methods to tiny.*()
        (depends on output level)
            con = window.console
            group()
            timer()
            log()
            info()
            warn()
            error()
    */

    // default output level
    var DEFAULT_OUTPUT_LEVEL = 'warn error';

    // enable console shorthands now
    output_level();

    // enable global error handling
    set_window_error_handler(true)


    // do nothing function
    function noop() { }

    // console.group() wrapper function
    var _expand_group = true
    var _collapse_nest_counter = 0

    function console_group(name, real_name) {

        // enable collapse only when `collapse` is set to false

        if (name == true || name == false) {
            _expand_group = name == true
            name = real_name
        }

        if (name) {
            // => has a name - start a group

            if (_expand_group) {
                _con.group(name)
            } else {
                _con.groupCollapsed(name)
                _collapse_nest_counter++
            }

        } else {
            // => no name - end a group

            _con.groupEnd()

            // auto end collapsing when the starting collpased group ends
            _collapse_nest_counter--
            if (_collapse_nest_counter < 1)
                _expand_group = true
        }

    }


    // console.time() wrapper function
    var _current_timer;

    function console_timer(name) {
        name
            ? (_con.time(name), _current_timer = name)
            : _con.timeEnd(_current_timer)
    }


    var _show_error_popup = true

    /**
     * console.error() wrapper function
     * @param {boolean} flag whether show a popup meesage on web page
     */
    function console_error(flag) {

        if (flag == true || flag == false) {
            _show_error_popup = flag
            set_window_error_handler(flag)
            return
        }

        _con.error.apply(_con, arguments)

        if (_show_error_popup)
            show_error_popup(
                Array.prototype.slice.call(arguments).join(', ')
            )
    }

    function set_window_error_handler(flag) {
        if (!window) return
        flag
            ? window.addEventListener('error', on_window_error)
            : window.removeEventListener('error', on_window_error)
    }

    function on_window_error(event) {
        show_error_popup(event.message + '<br>' + event.lineno + ' @ ' + event.filename)
    }

    function show_error_popup(msg) {

        if (!document || !document.body || !document.body.append) return

        var elem = document.createElement('div')
        elem.innerHTML =
            '<div style="position: fixed; z-index: 999999; left: 10px; bottom: 10px; padding: 16px; ' +
            'font-size: 12px; color: #fff; background: #C00; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,.2)" >' +
            '<b style="cursor:pointer" onclick="this.parentNode.style.display = \'none\'">ERROR:</b> ' + msg +
            '</div>'

        document.body.append(elem)
    }

    /**
     * Enable/disable console method output
     * ```
     *   tiny.output('none');      // disable all
     *   tiny.output('all');       // enable all = 'log|info|warn|error', 'log'
     *   tiny.output('log|error'); // console.log() & console.error() only
     *   tiny.output();            // default = 'warn|error' only
     * ```
     */
    function output_level(on) {

        on = on == undefined || typeof on != 'string' ? DEFAULT_OUTPUT_LEVEL :
            on == 'none' ? '' :
                on == 'all' ? 'log info warn error' :
                    on;

        _con.info('tiny :: output => "' + on + '"');

        _group = on.includes('info') ? console_group : noop;
        _timer = on.includes('log') ? console_timer : noop;
        _log = on.includes('log') ? _con.log.bind(_con) : noop;
        _info = on.includes('info') ? _con.info.bind(_con) : noop;
        _warn = on.includes('warn') ? _con.warn.bind(_con) : noop;
        _error = on.includes('error') ? console_error : noop;

        tiny.x.add({
            con: _con,
            group: _group,
            timer: _timer,
            log: _log,
            info: _info,
            warn: _warn,
            error: _error
        });

        if (G.GLOBAL_INJECTED) {
            _win._con = _con;
            _win._group = _group;
            _win._timer = _timer;
            _win._log = _log;
            _win._info = _info;
            _win._warn = _warn;
            _win._error = _error;
        }

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

        _info('%c' + result, 'padding: 0 8px;color:#000;background:#f9f9ff;border-radius: 1em;');

    }

});