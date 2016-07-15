define([
    './global',
    './base',
    './q._polyfills'
], function (G, tiny) {

    'use strict';
    // Element.matches support for tinyQ
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) { }
                return i > -1;
            };
    }

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
    function _q() { return init_q(null, arguments); }
    function _q1() { return init_q(null, arguments, 1); }

    /**
     * tinyQ constructor
     */
    var tinyQ = function () {
        return this;
    };

    tinyQ.TAG = '_q()' + G.TAG_SUFFIX;

    tinyQ.prototype = {

        tinyQ: true,

        // properties
        nodes: [],
        length: 0,
        chain: '',

        is: is_node_of_type,
        q: sub_query_nodes,
        q1: sub_query_one_node,
        add: add_nodes,
        filter: filter_nodes,

        first: get_first,
        last: get_last,

        parent: false,
        next: false,
        prev: false,

        after: false,
        before: false,

        get: function (index) {
            return index < this.nodes.length ? this.nodes[index] : null;
        },

        each: function (start, func, this_arg) {
            return tiny.each(this.nodes, start, func, this_arg)
        },

        toArray: function () { return to_array(this.nodes) },

        offset: false,

        on: false

    };


    //////////////////////////////////////////////////////////
    // INITIALIZATION FUNCTIONS
    //////////////////////////////////////////////////////////
    function init_q(tinyq, args, set_mode, set_nodes) {

        tinyq = tinyq || new tinyQ();

        args = tiny.x.toArray(args);

        var mode = 0;
        var add = false;
        var filter_list = false;
        var result = [];
        var tag = { start: 'q(', obj: '', end: ')', filter: '' };

        if (set_mode == 1) mode == 1, tag.start = 'q1(';
        if (Array.isArray(set_nodes)) add = true;

        var obj = args[0];
        var obj_type = tiny.type(obj);

        obj = normalize_nodelist.call(tag, obj);
        obj_type = get_type(obj);

        if (obj_type == 'Array') {
            // ==> (nodes [,filter...])
            if (args.length > 1)
                filter_list = create_filter_list.call(tag, args.slice(1));
            result = to_array(obj, filter_list);
            tag.start = tag.end = '';
            if (tag.filter) tag.obj += '.filter(' + tag.filter + ')';
        } else if (obj_type == 'string') {
            // ==> (selector, ...
            var param = normalize_nodelist.call(tag, args[1]);
            var param_type = get_type(param);
            if (obj.startsWith('<')) {
                // ==> (html_fragment [,parent])
            } else if (param_type == 'object') {
                // ==> (tag, attribute_object)
            } else {
                if (param_type == 'Array') {
                    // ==> (selector, nodes [,filter...])
                    filter_list = create_filter_list.call(tag, args.slice(2));
                    result = do_query(param, obj, filter_list, mode);
                    tag.start = tag.obj + '.' + tag.start;
                } else {
                    // ==> (selector [,filter...])
                    filter_list = create_filter_list.call(tag, args.slice(1));
                    result = do_query([document], obj, filter_list, mode);
                }
                if (tag.filter != '') obj += tag.filter;
                tag.obj = obj;
            }
        } else {
            tiny.error(tinyQ.TAG, 'Invalid parameter. > Got "' + type + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (!add) {
            tinyq.nodes = result;
            tinyq.chain = tag.start + tag.obj + tag.end;
        } else {
            tinyq.nodes = set_nodes.concat(result);
            tinyq.chain = '.add(' + tag.obj + ')';
        }
        tinyq.length = tinyq.nodes.length;

        return tinyq;

    }

    /**
     * prepare Array-like Node list objects
     */
    function normalize_nodelist(obj) {
        var type = tiny.type(obj);
        if (is_element(obj)) {
            // single node -> array
            this.obj = '[node]';
            obj = [obj];
        } else if (type == 'q') {
            this.obj = obj.chain;
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
    function do_query(nodes, selector, filter, mode) {

        var action = mode == 1 ? action_query_one : action_query_all;

        var out = [];
        tiny.each(nodes, function (node) {
            if (is_element(node)) out = action(node, selector, filter, out);
        });

        return out;

    }

    /**
     * querySelector() helper for do_query()
     */
    function action_query_one(node, selector, filter, out) {
        var node = node.querySelector(selector);
        if (node) {
            node = to_array([node], filter);
            out = out.concat(node);
        }
        return out;
    }

    /**
     * querySelectorAll() helper for do_query()
     */
    function action_query_all(node, selector, filter, out) {
        var nodes = node.querySelectorAll(selector);
        if (nodes) {
            nodes = to_array(nodes, filter);
            out = out.concat(nodes);
        }
        return out;
    }

    /**
     * Convert NodeList to Arrays, also do copy and filtering
     */
    function to_array(nodes, filters) {

        if (Array.isArray(nodes) && !filters)
            return nodes;

        filters = create_filter_executor(filters);

        // do the loop
        var arr = [];
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!is_element(node)) continue;
            if (filters) {
                var r = filters(node, i, nodes);
                if (r == false) continue;
                if (r !== true && Array.isArray(r)) {
                    // a node array returned, end with this node
                    return r;
                };
            }
            arr.push(node);
        }

        return arr;

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
        return function (node, index, list) {
            return filter_list_executor.call(filters, node, index, list);
        }
    }

    /**
     * proxy for executing filter function list
     */
    function filter_list_executor(node, index, list) {
        var filter_list = this;
        // a 'this' context shared by all filters
        var this_arg = {};
        return tiny.each(filter_list, function (filter) {
            this_arg.p = filter[1];
            var r = filter[0].call(this_arg, node, index, list);
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
            prop.filter += '->' + tiny.x.funcName(arg) + '()';
            list.push([arg, null]);
        } else if (type == 'string') {
            if (arg.startsWith('->')) {
                //==> '/filter(param)' - build-in custom filter
                prop.filter += arg;
                arg = arg.substring(2);
                func = parse_custom_filter_tag(arg);
                list = list.concat(func);
            } else {
                // ==> selector
                prop.filter += ':matches(' + arg + ')';
                list.push([tinyQ.prototype.filters['matches'], arg]);
            }
        } else {
            tiny.error(tinyQ.TAG, 'Invalid filter String or Function. > Got "' + type + '": ', arg);
            throw new TypeError(G.SEE_ABOVE);
        }

        return list;

    }

    /**
     * Parse custom filter tag into function list
     */
    function parse_custom_filter_tag(filter) {

        var filters = filter.split('->');
        var arr = [];
        for (var i = 1, len = filters.length; i < len; ++i) {

            var item = filters[i].trim();
            var pos = item.indexOf('(');
            var name, param;
            var func = null;

            if (pos < 0) {
                func = tinyQ.prototype.filters[item];
                param = null;
            } else {
                name = item.substring(0, pos);
                func = tinyQ.prototype.filters[name];
                param = item.substring(pos + 1);
                if (!param.endsWith(')')) {
                    tiny.error(tinyQ.TAG, 'Unexpected end of filter. ', item);
                    throw new SyntaxError(G.SEE_ABOVE);
                }
                param = param.substring(0, param.length - 1).trim();
                if (param.search(/^\d$/) > -1) param = parseInt(param);
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
    tiny.extend(tinyQ.prototype, {
        filters: {
            first: function (node) { return [node] },
            last: function (a, b, nodes) { return [nodes[nodes.length - 1]] },
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
            hidden: function (node) { return !tinyQ.filters.visible(node) },
            visible: function (node) {
                return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length)
            },
            'only-child': function (node) {
                return !(node.parentElement && !node.previousElementSibling && !node.nextElementSibling) || [node]
            },
            'first-child': function (node) { return !(node.parentElement && !node.previousElementSibling) || [node] },
            'last-child': function (node) { return !(node.parentElement && !node.nextElementSibling) || [node] }
        },
    })

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

    /**
     * .q() - query all
     */
    function sub_query_nodes(selector) {
        var args = tiny.x.toArray(arguments, 1);
        var mode = 0;

        // if mode is set to 1
        if (args[args.length - 1] == 1) {
            mode = 1;
            args.pop();
        }

        // check for invalid parameters
        chain_method_parameter_check(args);

        // put (selector, this, ...)  ahead
        args.unshift(selector, this);

        return init_q(null, args, mode);
    }

    // check for invalid parameter for .q() .q1() .filter()
    function chain_method_parameter_check(args) {
        tiny.each(args, function (item) {
            var type = typeof item;
            if (type !== 'string' && type !== 'function') {
                _error(tinyQ.TAG, '.q(selector [,filters ...]) Invalid parameter.', item);
                throw new SyntaxError(G.SEE_ABOVE);
            }
        });
    }


    /**
     * .q1() - query one
     */
    function sub_query_one_node(selector) {
        var args = tiny.x.toArray(arguments);
        args.push(1);
        return sub_query_nodes.apply(this, args);
    }


    /**
     * .filter() - filter items in result set
     */
    function filter_nodes(filter) {
        var args = tiny.x.toArray(arguments);
        chain_method_parameter_check(args);
        args.unshift(this);
        return init_q(null, args);
    }

    /**
     * .add() - add items to current tinyQ object
     */
    function add_nodes(selector) {
        var r = init_q(null, arguments, null, this.nodes);
        r.chain = this.chain + r.chain;
        return r;
    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[0]);
        var r = construct(tinyQ, [arr]);
        r.chain = this.chain + '.first()';
        return r;
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[this.nodes.length - 1]);
        var r = construct(tinyQ, [arr]);
        r.chain = this.chain + '.last()';
        return r;
    }


    return tinyQ;

});