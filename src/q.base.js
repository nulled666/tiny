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
        q: function (obj, param, extra) { return init_q(obj, param, extra) },
        q1: function (obj, param, extra) { return init_q(obj, param, extra, 1) }
    });


    /**
     * tinyQ constructor
     */
    var TinyQ = function (nodes, chain) {
        this.chain = chain;
        this.nodes = nodes;
        this.count = nodes.length;
        return this;
    };

    var OPID_MARK = 'tinyq-OPID';
    var TAG_Q = '_q()' + G.TAG_SUFFIX;

    // shared function store
    TinyQ.x = {
        TAG: TAG_Q,
        isArrayLike: is_array_like
    };

    TinyQ.prototype = {

        // signature
        tinyQ: true,

        // properties
        nodes: [],
        count: 0,
        chain: '',

        // query
        q: sub_query_all,
        q1: sub_query_one,
        add: add_nodes,

        // filter
        is: is_node_of_type,
        filter: filter_nodes,
        not: exclude_nodes,
        has: node_contains,

        // traverse
        parent: get_parent,
        children: get_children,
        closest: get_closest,
        prev: get_prev,
        next: get_next,

        // dom manipulate
        append: append_child,
        prepend: prepend_child,
        after: false,
        before: false,
        remove: remove_nodes,
        empty: empty_nodes,

        // collection access
        first: get_first,
        last: get_last,
        get: get_one,
        slice: slice_nodes,

        // node access
        each: each_tinyq,
        eachNode: each_operation,
        toArray: function () { return to_array(this.nodes) },

        // properties -> q.prop.js

        // event -> q.event.js

    };

    //////////////////////////////////////////////////////////
    // INITIALIZATION FUNCTIONS
    //////////////////////////////////////////////////////////
    function init_q(obj, param, extra, query_mode, base_nodes) {

        if (!obj) obj = document;

        var result = [];
        var tag_start = 'q(', tag_obj = '', tag_end = ')';
        var opid = false;
        var is_add = false;

        if (query_mode == 1) tag_start = 'q1(';

        if (base_nodes && Array.isArray(base_nodes)) {
            // ==> add() operation
            is_add = true;
            // plant an opid on original array for duplicate check
            opid = tiny.guid();
            for (var nodes = base_nodes, i = 0, len = nodes.length; i < len; ++i) {
                var node = nodes[i];
                node[OPID_MARK] = opid;
                result.push(node);
            }
        }

        obj = nomalize_nodes(obj);

        if (typeof obj == 'string') {

            // ==> (selector, ...
            if (obj.startsWith('<')) {
                // ==> (html_fragment [,attributes])
                result = create_html_fragment(obj, param);
                tag_obj = '[html]';
            } else {
                // ==> (selector [,nodes])
                var parents = [document];
                if (param) {
                    param = nomalize_nodes(param);
                    if (is_array_like(param)) {
                        // ==> [,nodes]
                        parents = param;
                        tag.start = tag_obj + '.' + tag_start;
                    }
                }
                // do query
                result = do_query(parents, obj, query_mode, opid, result);
                tag_obj = obj;
            }

        } else if (is_array_like(obj)) {

            // ==> (nodes [,filter...])
            result = to_array(obj, result, opid);
            tag_obj = '[nodes]';
            tag_start = tag_end = '';


        } else if (is_window(obj)) {

            // ==> (window) for events - use empty nodes
            return create_tinyq([], '[window]');

        } else {

            tiny.error(TAG_Q, 'Invalid parameter. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);

        }

        // ready to create the object
        var chain = !is_add ? '.add(' + tag_obj + ')' : tag_start + tag_obj + tag_end;

        return create_tinyq(result, chain);

    }

    /**
     * nomalize single node & tinyq parameter
     */
    function nomalize_nodes(obj) {
        if (is_element(obj)) {
            obj = [obj];
        } else if (obj.tinyQ) {
            obj = obj.nodes;
        }
        return obj;
    }

    /**
     * check if an object is array-like
     */
    function is_array_like(obj) {
        return Array.isArray(obj) || typeof obj == 'object' && "length" in obj
    }

    /**
     * check if an object is a html element or document node
     */
    function is_element(obj) {
        if (!obj) return false;
        var type = obj.nodeType;
        return (type == 1 || type == 9);
    }

    function is_window(obj) {
        return !!obj && obj == obj.window
    }

    /**
     * create a new tinyq instance
     */
    function create_tinyq(nodes, chain) {
        return new TinyQ(nodes, chain);
    }

    /**
     * html fragement creator
     */
    function create_html_fragment(html, attrs) {

        if (is_element(attrs)) parent = attrs, attrs = false;
        if (typeof attrs != 'object') attrs = false;

        var div = document.createElement('div');
        div.innerHTML = html;

        var arr = [];
        for (var nodes = div.childNodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (attrs) TinyQ.x.setAttributes(node, attrs);
            arr.push(node);
        }

        return arr;

    }


    //////////////////////////////////////////////////////////
    // QUERY FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * .q() - query all
     */
    function sub_query_all(selector, mode) {

        var tinyq = this;

        var nodes = tinyq.nodes;
        if (nodes.length == 0) nodes = [document];

        var arr = do_query(nodes, selector, mode);

        var chain = tinyq.chain + (mode == 1 ? '.q1(' : '.q(') + selector + ')';
        return create_tinyq(arr, chain);

    }

    /**
     * .q1() - query one
     */
    function sub_query_one(selector) {
        return sub_query_all.call(this, selector, 1);
    }

    /**
     * Execute query on all given nodes and concate the results
     */
    function do_query(nodes, selector, query_mode, opid, base) {

        if (!nodes) throw new TypeError('Expect an Array-like node list');
        if (!opid && nodes.length > 1) opid = tiny.guid();

        var result = base || [];
        var action = do_query_all;

        // check for shortcuts
        selector = selector.trim();
        if (/^\#([\w-]+)$/.test(selector)) {
            selector = selector.replace('#', '');
            action = do_get_by_id;
            query_mode = 1;
        } else if (/^\.([\w-.]+)\w$/.test(selector)) {
            selector = selector.replace(/\./g, ' ');
            action = do_get_by_class;
        } else if (/^([\w]+)$/.test(selector)) {
            action = do_get_by_tag;
        }

        // do the query
        for (var list = nodes, i = 0, len = list.length; i < len; ++i) {
            var node = list[i];
            if (!is_element(node)) continue;
            var r = action(node, selector);
            if (!r || r.length == 0) continue;
            if (query_mode == 1) return [r[0]];
            result = to_array(r, result, opid);
        }

        return result;

    }

    function do_query_all(node, selector) {
        return node.querySelectorAll(selector);
    }
    function do_get_by_id(node, selector) {
        var r = node.getElementById(selector);
        if (r) r = [r];
        return r;
    }
    function do_get_by_tag(node, selector) {
        return node.getElementsByTagName(selector);
    }
    function do_get_by_class(node, selector) {
        return node.getElementsByClassName(selector);
    }


    /**
     * Convert NodeList to Arrays, also do copy, filter & merge
     */
    function to_array(nodes, base, opid, filter) {

        base = base || [];
        if (!nodes) return base;

        for (var list = nodes, this_arg = {}, i = 0, len = list.length; i < len; ++i) {
            var node = list[i];
            if (!is_element(node)) continue;
            if (opid) {
                if (node[OPID_MARK] == opid) continue;
                node[OPID_MARK] = opid;
            }
            if (filter) {
                var r = filter(node, i, list, this_arg);
                if (r == false) continue;
            }
            base.push(node);
        }

        return base;

    }


    /**
     * .add() - add items to current tinyQ object
     */
    function add_nodes(selector, param) {
        var tinyq = this;
        var r = init_q(selector, param, null, 0, tinyq.nodes);
        r.nodes.sort(compare_node_position);
        r.chain = tinyq.chain + r.chain;
        return r;
    }

    /**
     * a helper for determine node order
     */
    function compare_node_position(a, b) {
        var a_check = is_element(a);
        var b_check = is_element(b);
        if (!a_check) return b_check ? -1 : 0;
        if (!b_check) return 1;
        var r = a.compareDocumentPosition(b);
        if (r == 2 || r == 8) return 1;
        if (r == 4 || r == 16) return -1;
        return 0;
    }


    //////////////////////////////////////////////////////////
    // FILTER FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * .is() - selector check
     */
    function is_node_of_type(selector) {
        for (var nodes = this.nodes, i = 0, len = nodes.length; i < len; ++i) {
            if (!nodes[i].matches(selector)) return false;
        }
        return true;
    }

    /**
     * .not() - remove not match nodes
     */
    function exclude_nodes(selector) {
        return do_filter(this, ['@not(' + selector + ')'], 'not');
    }

    /**
     * .has() - remove not match nodes
     */
    function node_contains(selector) {
        return do_filter(this, ['@has(' + selector + ')'], 'has');
    }

    /**
     * .filter() - filter items in result set
     */
    function filter_nodes() {
        return do_filter(this, arguments, 'filter');
    }

    function do_filter(tinyq, args, method_tag) {

        var tag = { filter: '' };
        var filters = create_filter_list.call(tag, args);
        var filter_func = create_filter_executor(filters);

        var arr = to_array(tinyq.nodes, [], false, filter_func);

        tag = '.' + method_tag + '(' + tag.filter + ')';

        return create_tinyq(arr, tinyq.chain + tag);

    }

    /**
     * create a function wrapper for all filters
     */
    function create_filter_executor(filters) {
        if (!filters) return false;
        return function (node, index, list, this_arg) {
            return filter_list_executor.call(filters, node, index, list, this_arg);
        }
    }

    /**
     * proxy for executing filter function list
     */
    function filter_list_executor(node, index, list, this_arg) {
        for (var filter_list = this, i = 0, len = filter_list.length; i < len; ++i) {
            var filter = filter_list[i];
            var r = filter[0].call(this_arg, node, index, list, filter[1]);
            if (r == false) return false;
            if (r != true) return r;
        }
        return true;
    }

    /**
     * build a wrapper function for all filters
     */
    function create_filter_list(args) {
        var tag = this;
        var arr = [];
        for (var i = 0, len = args.length; i < len; ++i) {
            var item = args[i];
            if (!item) return;
            arr = parse_arg_to_filter.call(tag, item, arr);
        }
        return arr;
    }

    /**
     * Returns a filter function of given filter type
     */
    function parse_arg_to_filter(arg, list) {

        if (!arg) return false; // no filter is set

        var tag = this;
        var type = typeof arg;
        var func;

        if (type == 'function') {
            // ==> filter() - custom function
            tag.filter += '*' + arg.name + '()';
            list.push([arg, null]);
        } else if (type == 'string') {
            if (arg.startsWith('@')) {
                //==> '@custom' - build-in custom filter
                tag.filter += arg;
                arg = arg.substring(1);
                func = parse_custom_filter_tag(arg);
                if (func) list.push(func);
            } else {
                // ==> '@matches()'
                tag.filter += arg;
                list.push([TinyQ.filters['matches'], arg]);
            }
        } else {
            tiny.error(TAG_Q, 'Invalid filter String or Function. > Got "' + type + '": ', arg);
            throw new TypeError(G.SEE_ABOVE);
        }

        return list;

    }

    // for parsed custom filter tags
    var _CUSTOM_FILTER_CACHE = {};

    /**
     * Parse custom filter tag into function list
     */
    function parse_custom_filter_tag(filter) {

        var arr = _CUSTOM_FILTER_CACHE[filter];
        if (arr) return arr;

        var item = filter.trim();
        var pos = item.indexOf('(');
        var name, param;
        var func = null;

        if (pos < 0) {
            name = item;
            param = null;
        } else {
            name = item.substring(0, pos);
            param = item.substring(pos + 1);
            if (!param.endsWith(')')) {
                tiny.error(TAG_Q, 'Unexpected end of filter. ', item);
                throw new SyntaxError(G.SEE_ABOVE);
            }
            param = param.substring(0, param.length - 1).trim();
            if (param.search(/^\d$/) == 0) param = parseInt(param);
        }

        if (name) func = TinyQ.filters[name];
        if (func) {
            arr = [func, param];
            _CUSTOM_FILTER_CACHE[filter] = arr;
        } else {
            tiny.error(TAG_Q, 'No such custom filter: ', name);
            throw new SyntaxError(G.SEE_ABOVE);
        }

        return arr;

    }

    /**
     * build-in custom filters
     */
    tiny.extend(TinyQ, {
        filters: {

            // internal used
            matches: function (node, i, l, param) { return node.matches(param) }, // css4
            not: function (node, i, l, param) { return !node.matches(param) }, // css3
            has: function (node, i, l, param) { return node.querySelector(param) != null }, // css4
            blank: function (node) { return node.textContent.trim() == '' }, // css4

            // custom filters
            contains: function (node, i, l, param) { return node.textContent.includes(param) },
            visible: function (node) { return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length) },
            hidden: function (node) { return !TinyQ.filters.visible(node) }

        }
    });


    //////////////////////////////////////////////////////////
    // TRAVERSAL FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * Helper function for batch traversing
     */
    function do_traversal_helper(tinyq, selector, type) {

        selector = selector || false;

        var prefix = '.parent(';  // type == 0
        var get_func = get_parent_func;
        if (type == 1) {
            get_func = get_children_func;
            prefix = '.children(' + selector;
        } else if (type == 2) {
            if (!selector) {
                tiny.error(TAG_Q, 'Expect a selector for closest()');
                throw new SyntaxError(G.SEE_ABOVE);
            }
            get_func = get_closest_func;
            prefix = '.closest(' + selector;
        } else if (type == 3) {
            get_func = get_prev_func;
            prefix = '.prev(';
        } else if (type == 4) {
            get_func = get_next_func;
            prefix = '.next(';
        }

        // generate a unique operation id for duplicate-check
        var opid = tiny.guid();
        var filter = selector ? create_traversal_match_filter(selector) : false;

        // do the work
        var arr = [];
        for (var nodes = tinyq.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = get_func(nodes[i], selector);
            if (!node) continue;
            if (type < 3) {
                arr = to_array(node, arr, opid, filter);
            } else {
                if (filter && !filter(node)) continue;
                arr.push(node);
            }
        }

        return create_tinyq(arr, tinyq.chain + prefix + ')');

    }

    function get_parent_func(node) {
        var r = node.parentElement;
        if (r) r = [r];
        return r;
    }
    function get_children_func(node) {
        // NOTE: this loop is faster than node.children
        var arr = [];
        var child = node.firstElementChild;
        while (child) {
            arr.push(child);
            child = child.nextElementSibling
        }
        return arr;
    }
    function get_closest_func(node, selector) {
        while (node) {
            if (node.matches(selector)) return [node];
            node = node.parentElement;
        }
        return null;
    }
    function get_prev_func(node) { return node.previousElementSibling; }
    function get_next_func(node) { return node.nextElementSibling; }

    function create_traversal_match_filter(selector) {
        return function (node) {
            return traversal_match_filter.call(selector, node);
        }
    }

    function traversal_match_filter(node) {
        return node.matches(this);
    }

    /**
     * .parent() - get parentElement
     */
    function get_parent(selector) {
        var r = do_traversal_helper(this, selector, 0);
        r.nodes.sort(compare_node_position);
        return r;
    }

    /**
     * .get_children() - get children
     */
    function get_children(selector) {
        return do_traversal_helper(this, selector, 1);
    }

    /**
     * .closest() - get closest element matches selector
     */
    function get_closest(selector) {
        var r = do_traversal_helper(this, selector, 2);
        r.nodes.sort(compare_node_position);
        return r;
    }

    /**
     * .prev() - get previousElementSibling
     */
    function get_prev(selector) {
        return do_traversal_helper(this, selector, 3);
    }

    /**
     * .next() - get nextElementSibling
     */
    function get_next(selector) {
        return do_traversal_helper(this, selector, 4);
    }



    //////////////////////////////////////////////////////////
    // DOM MANIPULATE FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * Add children to nodes
     */
    function add_children_helper(obj, attrs, type) {

        var tinyq = this;

        // check parameter
        if (obj && obj.tinyQ) {
            obj = obj.nodes;
        } else if (typeof obj == 'string') {
            obj = create_html_fragment(obj, attrs);
        } else if (is_element(obj)) {
            obj = [obj];
        } else if (is_array_like(obj)) {
            // just ok
        } else {
            _error(TAG_Q, 'Expect a HTML string, TinyQ object, NodeList or Element. > Got: ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        // determine action type
        var action = node_append_func; // type == 0
        var loop = forward_loop_func;
        if (type == 1) {
            action = node_prepend_func;
            loop = backward_loop_func;
        }

        // append child
        for (var parent_nodes = tinyq.nodes, i = 0, len = parent_nodes.length, end = len - 1, require_clone = len > 1; i < len; ++i) {
            var parent = parent_nodes[i];
            if (!is_element(parent)) continue;
            loop(obj, i, end, require_clone && i != end, parent, action);
        }

        return tinyq;

    }

    function forward_loop_func(obj, i, end, need_clone, parent, action) {
        for (var j = 0, j_len = obj.length; j < j_len; ++j) {
            var node = obj[j];
            if (need_clone) node = node.cloneNode(true);
            action(parent, node);
        }
    }

    function backward_loop_func(obj, i, end, need_clone, parent, action) {
        for (var j = obj.length - 1; j > -1; --j) {
            var node = obj[j];
            if (need_clone) node = node.cloneNode(true);
            action(parent, node);
        }
    }

    function node_append_func(parent, node) { parent.appendChild(node); }
    function node_prepend_func(parent, node) { parent.insertBefore(node, parent.lastChild); }

    /**
     * TinyQ.append()
     */
    function append_child(obj, attrs) {
        return add_children_helper.call(this, obj, attrs, 0);
    }

    /**
     * TinyQ.prepend()
     */
    function prepend_child(obj, attrs) {
        return add_children_helper.call(this, obj, attrs, 1);
    }

    /**
     * remove given node
     */
    function remove_nodes(selector) {

        selector = typeof selector == 'string' ? selector : false;

        var tinyq = this;
        var nodes = tinyq.nodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            var parent = node.parentNode;
            if (!parent || selector && !node.matches(selector)) continue;
            nodes[i] = parent.removeChild(node);
        }

        tinyq.nodes = nodes;
        tinyq.length = nodes.length;
        tinyq.chain += '.remove(' + (selector ? selector : '') + ')';
        return tinyq;

    }

    /**
     * Empty all node content
     */
    function empty_nodes() {
        var tinyq = this;
        for (var nodes = tinyq.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            node.textContent = ''; // the short way
        }
        tinyq.chain += '.empty()';
        return tinyq;
    }


    //////////////////////////////////////////////////////////
    // NDOE COLLECTION ACCESS FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * Helper function for first(), last()
     */
    function get_one(index) {

        if (typeof index != 'number') {
            throw new TypeError('Expect a number');
        }

        var tinyq = this;
        var nodes = tinyq.nodes;

        index = index < 0 ? nodes.length + index : index;
        
        var node = nodes[index];
        node = node ? [node] : [];

        var chain = tinyq.chain + (index == 0 ? '.first()' : index == nodes.length - 1 ? '.last()' : '');
        return create_tinyq(node, chain);
    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        return get_one.call(this, 0);
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        return get_one.call(this, -1);
    }

    /**
     * .slice() - get a range of nodes
     */
    function slice_nodes(start, end) {
        var tinyq = this;
        var arr = tinyq.nodes.slice(start, end);
        return create_tinyq(arr, tinyq.chain + '.slice(' + start + (end != undefined ? ',' + end : '') + ')');
    }

    /**
     * .eachNode() - loop through nodes as TinyQ object
     */
    function each_operation(func, this_arg, wrap_object) {
        var tinyq = this;
        for (var nodes = tinyq.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i]
            if (wrap_object) node = create_tinyq([node], tinyq.chain + '.get(' + i + ')');
            func.call(this_arg, node, i, nodes);
        }
        return tinyq;
    }

    /**
     * .each() - loop through nodes
     */
    function each_tinyq(func, this_arg) {
        return each_operation.call(this, func, this_arg, true);
    }


    return TinyQ;

});