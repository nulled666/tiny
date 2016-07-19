define([
    './global',
    './base',
    './q._polyfills'
], function (G, tiny) {
    'use strict';

    //////////////////////////////////////////////////////////
    // TINYQ
    //////////////////////////////////////////////////////////

    tiny.x.add({
        q: _q,
        q1: _q1
    });


    /**
     * ```
     *  _q(html [,parent])              
     *  _q(tag, attr [,parent])          
     *  _q(selector [,filter...])        
     *  _q(selector, nodes [,filter...]) 
     *  _q(nodes [,filter...])   
     * 
     */
    function _q() { return init_q(arguments); }
    function _q1() { return init_q(arguments, 1); }

    /**
     * tinyQ constructor
     */
    var TinyQ = function () {
        return this;
    };

    TinyQ.TAG = '_q()' + G.TAG_SUFFIX;
    TinyQ.OPID = 'tinyqOPID';

    TinyQ.prototype = {

        tinyQ: true,

        // properties
        nodes: [],
        length: 0,
        chain: '',

        is: is_node_of_type,
        q: sub_query_all,
        q1: sub_query_one,
        add: add_nodes,
        filter: filter_nodes,

        first: get_first,
        last: get_last,
        parent: get_parent,
        closest: get_closest,
        prev: get_prev,
        next: get_next,

        get: function (index) { return index < this.nodes.length ? this.nodes[index] : null; },
        each: function (start, func, this_arg) { return tiny.each(this.nodes, start, func, this_arg) },
        toArray: function () { return to_array(this.nodes) },

        after: false,
        before: false,

        offset: false,

        on: false

    };


    //////////////////////////////////////////////////////////
    // INITIALIZATION FUNCTIONS
    //////////////////////////////////////////////////////////
    function init_q(args, set_mode, base_nodes) {

        var tinyq = new TinyQ();

        args = tiny.x.toArray(args);

        var opid = false;
        var query_mode = 0;
        var is_add = false;
        var filter_list = false;
        var result = [];
        var tag = { start: 'q(', obj: '', end: ')', filter: '' };

        if (set_mode == 1) {
            // ==> q1()
            query_mode == 1;
            tag.start = 'q1(';
        }

        if (Array.isArray(base_nodes)) {
            // ==> add() operation
            is_add = true;
            opid = tiny.guid();
            // plant an opid on original array
            for (var i = 0, len = base_nodes.length; i < len; ++i) {
                base_nodes[i][TinyQ.OPID] = opid;
            }
            result = base_nodes;
        }

        var obj = args[0];
        var obj_type = tiny.type(obj);

        obj = check_input_nodelist.call(tag, obj);
        obj_type = get_type(obj);

        if (obj_type == 'Array') {
            // ==> (nodes [,filter...])
            if (args.length > 1) filter_list = create_filter_list.call(tag, args.slice(1));
            result = to_array(obj, filter_list, result, opid);
            tag.start = tag.end = '';
            if (tag.filter) tag.obj += '.filter(' + tag.filter + ')';
        } else if (obj_type == 'string') {
            // ==> (selector, ...
            var param = check_input_nodelist.call(tag, args[1]);
            var param_type = get_type(param);
            if (obj.startsWith('<')) {
                // ==> (html_fragment [,parent])
            } else if (param_type == 'object') {
                // ==> (tag, attribute_object)
            } else {
                if (param_type == 'Array') {
                    // ==> (selector, nodes [,filter...])
                    filter_list = create_filter_list.call(tag, args.slice(2));
                    result = do_query(param, obj, filter_list, query_mode, result, opid);
                    tag.start = tag.obj + '.' + tag.start;
                } else {
                    // ==> (selector [,filter...])
                    filter_list = create_filter_list.call(tag, args.slice(1));
                    result = do_query([document], obj, filter_list, query_mode, result, opid);
                }
                if (tag.filter != '') obj += tag.filter;
                tag.obj = obj;
            }
        } else {
            tiny.error(TinyQ.TAG, 'Invalid parameter. > Got "' + type + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        // set properties to finish
        if (is_add) {
            tinyq.chain = '.add(' + tag.obj + ')';
        } else {
            tinyq.chain = tag.start + tag.obj + tag.end;
        }
        tinyq.nodes = result;
        tinyq.length = tinyq.nodes.length;

        return tinyq;

    }


    /**
     * prepare Array-like Node list objects
     */
    function check_input_nodelist(obj) {
        var type = tiny.type(obj);
        if (is_element(obj)) {
            // single node -> array
            this.obj = '[node]';
            obj = [obj];
        } else if (type == 'q') {
            this.obj = '[' + obj.chain + ']';
            obj = obj.nodes;
        } else if (type == 'Array') {
            this.obj = '[nodes]';
        } else if (type == 'jQuery') {
            this.obj = '[jquery]';
            obj = obj.toArray();
        }
        return obj;
    }

    /**
     * Custom tiny.type() wrapper for tinyQ
     */
    function get_type(obj) {
        var type = tiny.type(obj);
        if (type == 'NodeList' || type == 'HTMLCollection') type = 'Array';
        return type;
    }

    //////////////////////////////////////////////////////////
    // QUERY FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * Execute query on all given nodes and concate the results
     */
    function do_query(nodes, selector, filter, query_mode, base, opid) {

        // only remove duplicate for multiple result sets
        var opid = opid || (nodes.length > 1 ? tiny.guid() : false);

        base = base || [];
        var action = query_mode == 1 ? do_query_one : do_query_all;

        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!is_element(node)) continue;
            var r = action(node, selector);
            if (!r) continue;
            base = to_array(r, filter, base, opid);
        }

        return base;

    }
    function do_query_one(node, selector) {
        var node = node.querySelector(selector);
        return node ? [node] : null;
    }
    function do_query_all(node, selector) {
        return node.querySelectorAll(selector);
    }

    /**
     * Convert NodeList to Arrays, also do copy, filter & merge
     */
    function to_array(nodes, filters, base, opid) {

        if (!nodes) return [];

        // skip operation if it's already an Array and no need to filter or merge
        if (Array.isArray(nodes) && !filters && !base && !opid) return nodes;

        if (!Array.isArray(base)) base = [];
        filters = create_filter_executor(filters);

        // 'this' object shared by all filters
        var this_arg = {};

        // do the loop
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!is_element(node)) continue;
            if (opid) {
                // check for duplicate
                if (node[TinyQ.OPID] == opid) continue;
                node[TinyQ.OPID] = opid;
            }
            if (filters) {
                // do filter
                var r = filters(node, i, nodes, len, this_arg);
                if (r === false) continue;
                if (Array.isArray(r)) return r; // end with returned array
            }
            base.push(node);
        }

        return base;

    }

    /**
     * check if an object is a html element or document node
     */
    function is_element(obj) {
        return obj && (obj.nodeType == 1 || obj.nodeType == 9);
    }

    //////////////////////////////////////////////////////////
    // FILTER FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * create a function wrapper for all filters
     */
    function create_filter_executor(filters) {
        if (!filters) return false;
        return function (node, index, list, len, this_arg) {
            return filter_list_executor.call(filters, node, index, list, len, this_arg);
        }
    }

    /**
     * proxy for executing filter function list
     */
    function filter_list_executor(node, index, list, len, this_arg) {
        var filter_list = this;
        return tiny.each(filter_list, function (filter) {
            this_arg.p = filter[1];
            var r = filter[0].call(this_arg, node, index, list, len);
            if (r == false) return false;
            if (r != true) return r;
        });
    }

    /**
     * build a wrapper function for all filters
     */
    function create_filter_list(args) {
        var prop = this;
        var arr = [];
        tiny.each(args, function (item) {
            if (!item) return;
            arr = parse_arg_to_filter.call(prop, item, arr);
        })
        return arr;
    }


    /**
     * Returns a filter function of given filter type
     */
    function parse_arg_to_filter(arg, list) {

        if (!arg) return false; // no filter is set

        var prop = this;
        var type = typeof arg;
        var func;

        if (type == 'function') {
            // ==> filter() - custom function
            prop.filter += '//*' + tiny.x.funcName(arg);
            list.push([arg, null]);
        } else if (type == 'string') {
            if (arg.startsWith('//')) {
                //==> '//filter1(param),filter2' - build-in custom filter
                prop.filter += arg;
                arg = arg.substring(2);
                func = parse_custom_filter_tag(arg);
                list = list.concat(func);
            } else {
                // ==> selector
                prop.filter += '//' + arg;
                list.push([TinyQ.prototype.filters['matches'], arg]);
            }
        } else {
            tiny.error(TinyQ.TAG, 'Invalid filter String or Function. > Got "' + type + '": ', arg);
            throw new TypeError(G.SEE_ABOVE);
        }

        return list;

    }

    /**
     * Parse custom filter tag into function list
     */
    function parse_custom_filter_tag(filter) {

        var filters = filter.split(',');
        var arr = [];
        for (var i = 0, len = filters.length; i < len; ++i) {

            var item = filters[i].trim();
            var pos = item.indexOf('(');
            var name, param;
            var func = null;

            if (pos < 0) {
                func = TinyQ.prototype.filters[item];
                param = null;
            } else {
                name = item.substring(0, pos);
                func = TinyQ.prototype.filters[name];
                param = item.substring(pos + 1);
                if (!param.endsWith(')')) {
                    tiny.error(TinyQ.TAG, 'Unexpected end of filter. ', item);
                    throw new SyntaxError(G.SEE_ABOVE);
                }
                param = param.substring(0, param.length - 1).trim();
                if (param.search(/^\d$/) == 0) param = parseInt(param);
            }

            if (func) {
                arr.push([func, param]);
            }

        }

        return arr;

    }

    /**
     * build-in custom filters
     */
    tiny.extend(TinyQ.prototype, {
        filters: {
            first: function (node) { return [node] },
            last: function (a, b, nodes, len) { return [nodes[len - 1]] },
            even: function (a, index) { return index % 2 == 1 },
            odd: function (a, index) { return index % 2 == 0 },
            eq: function (a, index) { return index != this.p || [node] },
            lt: function (a, index) { return index < this.p },
            gt: function (a, index) { return index > this.p },
            blank: function (node) { return node.innerHTML.trim() == '' },
            empty: function (node) { return node.childNodes.length == 0 },
            matches: function (node) { return node.matches(this.p) },
            not: function (node) { return !node.matches(this.p) },
            has: function (node) { return node.querySelector(this.p) != null },
            contains: function (node) { return node.innerText.includes(this.p) },
            enabled: function (node) { return !node.disabled },
            disabled: function (node) { return node.disabled },
            checked: function (node) { return !!(node.checked) },
            hidden: function (node) { return !TinyQ.filters.visible(node) },
            visible: function (node) {
                return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length)
            },
            'only-child': function (node) {
                return !(node.parentElement && !node.previousElementSibling && !node.nextElementSibling) || [node]
            },
            'first-child': function (node) {
                return !(node.parentElement && !node.previousElementSibling) || [node]
            },
            'last-child': function (node) {
                return !(node.parentElement && !node.nextElementSibling) || [node]
            },
            'nth-child': function (node) {
                parse_nth_parameter(this);
                return check_nth(get_nth_index(node), this.a, this.b, node);
            },
            nth: function (node, index) {
                parse_nth_parameter(this);
                return check_nth(index, this.a, this.b, node);
            }
        },
    })

    // helper function for nth & nth-child
    function get_nth_index(node) {
        if (!node.parentElement) return -1;
        var children = node.parentElement.children;
        for (var i = 0, len = children.length; i < len; ++i) {
            if (children[i] == node) return i;
        }
        return -1;
    }

    function parse_nth_parameter(obj) {

        if (obj.parsed) return;

        if (!obj.p) throw new TypeError('nth(an+b) requires a parameter.');

        var a, b, p = obj.p;
        if (typeof p == 'number') {
            a = 0, b = p;
        } else {
            p = p.split('n');
            if (p.length != 2) throw new SyntaxError('Invalid nth(an+b) filter parameter: ' + this.p);
            a = p[0] == '' ? 1 : parseInt(p[0]), b = p[1] == '' ? 0 : parseInt(p[1]);
            if (isNaN(a + b)) throw new SyntaxError('a and b in nth(an+b) must be integer. ' + this.p);
        }

        obj.a = a, obj.b = b;
        obj.parsed = true;

    }

    // helper function for nth & nth-child
    function check_nth(index, a, b, node) {

        if (index < 0) return false;

        var i = index - b + 1;
        if (a == 0 && i == 0) return [node];
        if (i % a != 0) return false;
        if (i / a < 0) return false;

        _log(index + 1, a, b)
        return true;

    }

    //////////////////////////////////////////////////////////
    // CORE METHODS
    //////////////////////////////////////////////////////////

    /**
     * .is() - selector check
     */
    function is_node_of_type(selector) {
        var nodes = this.nodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            if (!nodes[i].matches(selector)) return false;
        }
        return true;
    }



    // check for invalid parameter for .q() .q1() .filter()
    function check_filter_parameters(args) {
        tiny.each(args, function (item) {
            var type = typeof item;
            if (type !== 'string' && type !== 'function') {
                _error(TinyQ.TAG, '.q(selector [,filters ...]) Invalid parameter.', item);
                throw new SyntaxError(G.SEE_ABOVE);
            }
        });
    }

    /**
     * .q() - query all
     */
    function sub_query_all(selector) {
        var args = tiny.x.toArray(arguments, 1);
        var mode = 0;

        // if mode is set to 1
        if (args[args.length - 1] == 1) {
            mode = 1;
            args.pop();
        }

        // check for invalid filter parameters
        check_filter_parameters(args);

        // put (selector, this, ...)  ahead
        args.unshift(selector, this);

        return init_q(args, mode);
    }

    /**
     * .q1() - query one
     */
    function sub_query_one(selector) {
        var args = tiny.x.toArray(arguments);
        args.push(1);
        return sub_query_all.apply(this, args);
    }

    /**
     * .filter() - filter items in result set
     */
    function filter_nodes() {
        var args = tiny.x.toArray(arguments);
        check_filter_parameters(args);
        args.unshift(this);
        return init_q(args);
    }

    /**
     * .add() - add items to current tinyQ object
     */
    function add_nodes() {
        var r = init_q(arguments, null, this.nodes);
        r.chain = this.chain + r.chain;
        return r;
    }

    /**
     * Helper function for first(), last()
     */
    function get_one_helper(tinyq, type) {
        var nodes = tinyq.nodes;
        var arr = [];
        if (nodes.length > 0) arr.push(type == 1 ? nodes[0] : nodes[nodes.length - 1]);
        var r = init_q([arr]);
        r.chain = tinyq.chain + (type == 1 ? '.first()' : '.last()');
        return r;
    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        return get_one_helper(this, 1);
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        return get_one_helper(this, 0);
    }


    /**
     * Helper function for batch traversing
     */
    function do_traversal_helper(tinyq, args, type) {

        // 1: parent(), 2: prev(), 3: next()
        var prefix = '.parent(';
        var selector = '';
        var get_func = get_parent_func;
        if (type == 2) {
            get_func = get_closest_func;
            args = tiny.x.toArray(args);
            selector = args[0];
            args.shift();
            prefix = '.closest(' + selector;
        } else if (type == 3) {
            get_func = get_prev_func;
            prefix = '.prev(';
        } else if (type == 4) {
            get_func = get_next_func;
            prefix = '.next(';
        }

        // generate a unique operation id for duplicate-check
        var op_id = tiny.guid();

        // do the work
        var arr = [];
        var nodes = tinyq.nodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = get_func(nodes[i], selector);
            if (!node) continue;
            if (type < 3) {
                // check for duplicate for parent() & closest()
                if (node[TinyQ.OPID] == op_id) continue;
                node[TinyQ.OPID] = op_id;
            }
            arr.push(node);
        }

        // do filter after all done
        if (args.length > 0) {
            var tag = { filter: '' };
            args = create_filter_list.call(tag, args);
            prefix += tag.filter;
            arr = to_array(arr, args);
        }

        // create new tinyQ object
        var r = init_q([arr]);
        r.chain = tinyq.chain + prefix + ')';

        return r;

    }

    function get_prev_func(node) { return node.previousElementSibling; }
    function get_next_func(node) { return node.nextElementSibling; }
    function get_parent_func(node) { return node.parentElement; }
    function get_closest_func(node, selector) {
        while (node) {
            if (node.matches(selector)) return node;
            node = node.parentElement;
        }
        return null;
    }


    /**
     * .parent() - get parentElement
     */
    function get_parent() {
        return do_traversal_helper(this, arguments, 1);
    }

    /**
     * .closest() - get closest element matches selector
     */
    function get_closest() {
        return do_traversal_helper(this, arguments, 2);
    }

    /**
     * .prev() - get previousElementSibling
     */
    function get_prev() {
        return do_traversal_helper(this, arguments, 3);
    }

    /**
     * .next() - get nextElementSibling
     */
    function get_next() {
        return do_traversal_helper(this, arguments, 4);
    }


    return TinyQ;

});