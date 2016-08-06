define([
    './global',
    './tiny.base',
    './q.base'
], function (G, tiny, TinyQ) {

    'use strict';

    //////////////////////////////////////////////////////////
    // EVENT METHOD FOR TINYQ
    //////////////////////////////////////////////////////////
    tiny.extend(TinyQ.prototype, {
        on: listen_to_event,
        off: false
    });


    var TAG_Q = TinyQ.x.TAG;
    var SEE_ABOVE = G.SEE_ABOVE;

    var _error = tiny.error;



    /**
     * TinyQ.on() method
     * .on(event, handle)
     * .on(event, filter, data, handle)
     */
    function listen_to_event() {

        var args = tiny.x.toArray(arguments);

        // extract required parameters
        var event = args.shift();
        var func = args.pop();

        if (typeof event != 'string') {
            _error(TAG_Q, 'Expect an event string. > Got "' + typeof event + '": ', event);
            throw new TypeError(SEE_ABOVE);
        }
        if (typeof func != 'function') {
            _error(TAG_Q, 'Expect an function for event handle. > Got "' + typeof func + '": ', func);
            throw new TypeError(SEE_ABOVE);
        }

        // check for extra parameters
        var arg_len = args.length;

        // -> filter
        var filter;
        if (arg_len > 0) {

            filter = args[0];

            var type_filter = typeof filter;
            if (!Array.isArray(filter) && type_filter != 'function' && type_filter != 'string') {
                _error(TAG_Q, 'Expect a filter Array or filter string or function for delegation. > Got "' + type_filter + '": ', filter);
                throw new TypeError(SEE_ABOVE);
            }

            // parse and generate filter function
            filter = TinyQ.x.parseFilterList(filter);

            if (!filter) {
                tiny.warn(TAG_Q, 'No valid filter found. ', args);
            } else {
                filter = TinyQ.x.createFilterFunction(filter);
            }

        }

        // -> data
        var data;
        if (arg_len > 1) data = args[1];

        _log(event, func, filter, data);

        var handler = create_event_handler(func, filter, data);

    }


    function create_event_handler(func, filter, data) {

        return function (event) {
            var elem = this;
        }

    }




});