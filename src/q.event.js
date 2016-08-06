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
        on: event_add_listener,
        off: event_remove_listener
    });


    var TAG_Q = TinyQ.x.TAG;
    var SEE_ABOVE = G.SEE_ABOVE;
    var EVENT_HANDLER_MARK = 'tinyQ-EVENT';

    var _error = tiny.error;
    var _get_valid_element = TinyQ.x.getElement;


    /**
     * .on(event, selector, data, handle)
     */
    function event_add_listener() {

        var tinyq = this;
        var args = tiny.x.toArray(arguments);

        // -> event, func
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

        var arg_len = args.length;

        // -> filter, capture
        var filter, capture = false;
        if (arg_len > 0) {

            filter = args[0];
            var type_filter = typeof filter;

            if (filter === true) {
                // ==> (event, capture, [data,] handler)
                capture = true;
                filter = false;
            } else if (type_filter == 'string') {
                // ==> (event, selector, [data,] handler)
                filter = matches_helper.bind(filter);
            } else if (type_filter == 'function') {
                // ==> (event, filter_func, [data,] handler)
            } else {
                // ==> treat as (event, [data,] handler)
                data = filter;
                filter = false;
            }

        }

        // -> data
        var data = arg_len > 1 ? args[1] : undefined;

        var handler = create_event_handler(func, filter, data);

        for (var i = 0, nodes = tinyq.nodes, len = nodes.length; i < len; ++i) {
            var node = _get_valid_element(nodes[i]);
            if (!node) continue;
            node.addEventListener(event, handler, capture);
        }

        return tinyq;

    }


    // helper function for delegate selector match
    function matches_helper(node) {
        return node && node.nodeType == 1 && node.matches(this);
    }


    // event handler reference list
    var _event_handlers = {};

    /**
     * create a handler function which wraps original function
     * TODO: support different data in reference dict
     */
    function create_event_handler(func, filter, data) {

        // assign a guid for func
        var guid;
        var handler;
        if (func[EVENT_HANDLER_MARK]) {
            guid = func[EVENT_HANDLER_MARK];
            handler = _event_handlers[guid];
        } else {
            guid = tiny.guid();
            handler = function (event) {
                var node;
                if (!filter) {
                    // ==> direct listen
                    node = this;
                } else {
                    // ==> delegate
                    var target = event.target;
                    // get real target we want
                    while (target != node) {
                        if (filter(target)) {
                            node = target;
                            break;
                        }
                        target = target.parentNode;
                    }
                    // no matching found
                    if (!node) return;
                }
                return func.call(node, event, data);
            }
            // save a mark
            func[EVENT_HANDLER_MARK] = guid;
            _event_handlers[guid] = handler;
        }

        // store a reference

        return handler;

    }


    /**
     * .off()
     * TODO: remove all
     */
    function event_remove_listener(event, func) {

        var tinyq = this;

        // get handler wrapper function
        var guid = func[EVENT_HANDLER_MARK];
        if (guid) {
            var handler = _event_handlers[guid];
            if (handler) func = handler;
        }

        // remove handler
        for (var i = 0, nodes = tinyq.nodes, len = nodes.length; i < len; ++i) {
            var node = _get_valid_element(nodes[i]);
            if (!node) continue;
            node.removeEventListener(event, func);
        }

    }

});