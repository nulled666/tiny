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


    // event handler reference list
    var _event_handlers = {};


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

        var handler = get_event_handler(func, filter, data);

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


    /**
     * get a wrapper function for event handler
     */
    function get_event_handler(func, filter, data) {

        // get the wrapper function
        var guid = func[EVENT_HANDLER_MARK];
        var handler;
        if (guid) {
            // ==> already bundled
            var handler_list = _event_handlers[guid];
            // find the unique handler without data
            if (!data) {
                var i = handler_list.length, item;
                while (item = handler_list[--i]) {
                    if (!handler.hasData) {
                        handler = item;
                        break;
                    }
                }
            }
        } else {
            // ==> save a mark on original function
            guid = tiny.guid();
            func[EVENT_HANDLER_MARK] = guid;
            _event_handlers[guid] = [];
        }

        if (!handler) {
            // create the wrapper function for new handler or handler with new data value
            handler = create_event_handler_wrapper(func, filter);
            if (data) {
                handler.hasData = true;
                handler = handler.bind(data);
            }
            // store a reference = handler;
            _event_handlers[guid].push(handler);
        }

        return handler;

    }

    // create event handler wrapper
    function create_event_handler_wrapper(func, filter) {

        return function (event) {

            // get event target
            var node;
            var target = event.target;

            if (!filter) {
                // ==> direct listen
                node = target;
            } else {
                // ==> delegate mode, find real target
                while (target != node) {
                    if (filter(target)) {
                        node = target;
                        break;
                    }
                    target = target.parentNode;
                }
                // no match found - jump out
                if (!node) return;
            }

            // call the real handler - this = data
            return func.call(node, event, this);

        }

    }


    /**
     * .off()
     * TODO: remove all
     */
    function event_remove_listener(event, func) {

        var tinyq = this;

        // get handler list
        var handler_list;
        var guid = func[EVENT_HANDLER_MARK];
        if (guid) {
            handler_list = _event_handlers[guid];
        } else {
            handler_list = [func];
        }

        // remove handlers
        if (handler_list) {
            var len_handlers = handler_list.length;
            for (var i = 0, nodes = tinyq.nodes, len = nodes.length; i < len; ++i) {
                var node = _get_valid_element(nodes[i]);
                if (!node) continue;
                for (var j = 0; j < len_handlers; ++j)
                    node.removeEventListener(event, handler_list[j]);
            }
        }

        // clean list
        if (guid) _event_handlers[guid] = [];

        return tinyq;

    }

});