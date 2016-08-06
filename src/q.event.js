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
    var EVENT_HANDLER_MARK = 'tinyQ-EVENT';

    var _error = tiny.error;


    /**
     * TinyQ.on() method
     * .on(event, handle)
     * .on(event, selector, data, handle)
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
            if (type_filter == 'string') {
                // create filter function with selector
                filter = matches_helper.bind(filter);
            } else if (type_filter != 'function') {
                _error(TAG_Q, 'Expect a filter string or function for delegation. > Got "' + type_filter + '": ', filter);
                throw new TypeError(SEE_ABOVE);
            }

        }

        // -> data
        var data;
        if (arg_len > 1) data = args[1];

        var handler = create_event_handler(func, filter, data);
        _log(event, func, filter, data, handler);

    }

    // helper function for delegate selector match
    function matches_helper(node) {
        return node && node.nodeType == 1 && node.matches(this);
    }

    var _event_handlers = {};

    function create_event_handler(func, filter, data) {

        // assign a guid for func
        var guid;
        if (func[EVENT_HANDLER_MARK]) {
            guid = func[EVENT_HANDLER_MARK];
        } else {
            guid = tiny.guid();
            func[EVENT_HANDLER_MARK] = guid;
        }

        // create a wrapper
        var handler = function (event) {

            var node = this;

            // filter check
            if (filter & !filter(node)) return;

            //event = normalize_event(event);

            // attach user data
            event.data = data;

            // call with this element
            return func.call(this, event);

        }

        // store a reference
        _event_handlers[guid] = handler;

        return handler;

    }



});