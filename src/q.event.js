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
        off: event_remove_listener,
        trigger: false
    });


    var TAG_Q = TinyQ.x.TAG;
    var SEE_ABOVE = G.SEE_ABOVE;
    var EVENT_MARK = 'tinyQ-EVENT-';

    var _error = tiny.error;


    // event handler reference list
    var _event_handlers = {};
    var _handler_id = 0;
    var _data_id = 0;


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

        // get handler wrapper function
        var handler = get_event_handler(func, filter, data);

        // multiple event support
        var event_list = event.split(' ');

        for (var e = 0, e_len = event_list.length; e < e_len; ++e) {

            var event = event_list[e];
            var event_mark = EVENT_MARK + event;

            for (var i = 0, nodes = tinyq.nodes, len = nodes.length; i < len; ++i) {
                var node = get_valid_event_target(nodes[i]);
                if (!node) continue;
                if (!node[event_mark]) node[event_mark] = '';
                node[event_mark] += ',' + handler.dataList;
                node.addEventListener(event, handler, capture);
                handler.referCount++;
            }

        }

        return tinyq;

    }

    // get valid event target
    function get_valid_event_target(obj) {
        if (!obj) return false;
        var type = obj.nodeType;
        if (obj != obj.window && type != 1 && type != 9) return false;
        return obj;
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
        var handler_id = func[EVENT_MARK];
        var data_id = data != undefined ? ++_data_id : 0;  // 0 = unique no data handler wrapper

        var handler;
        if (handler_id) {
            // ==> already bundled
            var handler_list = _event_handlers[handler_id];
            // find the unique handler without data
            if (!data) {
                handler = handler_list[0]; // = undefined if removed
            }
        } else {
            // ==> save a mark on original function
            handler_id = ++_handler_id;
            func[EVENT_MARK] = handler_id;
            _event_handlers[handler_id] = {};
        }

        if (!handler) {
            // create the wrapper function for new handler or handler with new data value
            handler = create_event_handler_wrapper(func, filter);
            if (_data_id != 0) {
                handler = handler.bind(data);
            }
            handler.dataList = data_id;
            handler.referCount = 0;
            // store a reference = handler;
            _event_handlers[handler_id][data_id] = handler;
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
     */
    function event_remove_listener(event, func) {

        if (typeof event != 'string') {
            _error(TAG_Q, 'Expect an event string. > Got "' + typeof event + '": ', event);
            throw new TypeError(SEE_ABOVE);
        }
        if (typeof func != 'function') {
            _error(TAG_Q, 'Expect an function for event handle. > Got "' + typeof func + '": ', func);
            throw new TypeError(SEE_ABOVE);
        }

        var tinyq = this;

        // get handler list
        var handler_list;
        var handler_id = func[EVENT_MARK];
        if (handler_id) {
            handler_list = _event_handlers[handler_id];
        } else {
            handler_list = { 0: func };
        }


        // remove handlers
        if (handler_list) {

            var len_handlers = handler_list.length;

            // multiple event support
            var event_list = event.split(' ');

            for (var e = 0, e_len = event_list.length; e < e_len; ++e) {

                var event = event_list[e];
                var event_mark = EVENT_MARK + event;

                for (var i = 0, nodes = tinyq.nodes, len = nodes.length; i < len; ++i) {

                    var node = get_valid_event_target(nodes[i]);
                    if (!node) continue;

                    // get data_id list
                    var data_id_list = node[event_mark];
                    if (!data_id_list) continue;
                    data_id_list = data_id_list.split(',');

                    // remove handlers which have matching data_id
                    for (var j = 1, j_len = data_id_list.length; j < j_len; ++j) {
                        var data_id = data_id_list[j];
                        var handler = handler_list[data_id];
                        if (handler) {
                            node.removeEventListener(event, handler);
                            handler.referCount--;
                            if (handler.referCount == 0)
                                delete handler_list[data_id];
                        }
                    }

                // end for(i)
                }

            // end for(e)
            }
            
        // end if(handler_list)
        }

        return tinyq;

    }

});