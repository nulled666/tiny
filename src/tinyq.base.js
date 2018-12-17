define([
    './global',
    './tiny.base',
    './tinyq._polyfills'
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
    function TinyQ(nodes, chain) {
        this.chain = chain;
        this.nodes = nodes;
        this.count = nodes.length;
        return this;
    };


    // shared function store
    TinyQ.x = {
        TAG: TAG_Q,
        OPID_MARK: 'tinyQ-OPID',
        isArrayLike: is_array_like,
        isWindow: is_window,
        getElement: get_valid_element,
        parseFilterList: parse_filter_list,
        createFilterFunction: create_filter_function
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
        filter: filter_method,

        // collection access
        get: get_elem_by_index,
        first: get_first,
        last: get_last,

        indexOf: index_of_node,
        lastIndexOf: last_index_of_node,
        includes: includes_node,
        is: all_node_is,
        slice: get_by_slice,
        each: each_q,
        eachNode: each_node,
        toArray: function () { return to_array(this.nodes) },

        /**
         * following methods are extended with extend_traverse_methods():
         * 
         *   parent()
         *   closest()
         *   offsetParent()
         *   children()
         *   prev()
         *   next()
         * 
         */

        /**
         * following methods are extended with extend_append_methods():
         * 
         *   append()
         *   prepend()
         *   before()
         *   after()
         * 
         */

        remove: remove_node,
        empty: empty_node,

        // -> q.dom.js : dom property access

        // -> q.event.js

    };


    var TAG_Q = '_q()' + G.TAG_SUFFIX;
    var SEE_ABOVE = G.SEE_ABOVE;

    var TINYQ_PROTOTYPE = TinyQ.prototype;
    var OPID_MARK = TinyQ.x.OPID_MARK;
    var _opid = 1;

    var _error = tiny.error;

    //////////////////////////////////////////////////////////
    // INITIALIZATION FUNCTIONS
    //////////////////////////////////////////////////////////
    function init_q(obj, param, extra, query_mode, base_nodes) {

        var doc = document;
        var result = [];
        var tag_start = 'q(', tag_obj = '', tag_end = ')';
        var opid = false;
        var is_add = false;

        if (!obj) obj = doc; // default node

        if (is_document(obj)) tag_obj = '[document]';
        if (query_mode == 1) tag_start = 'q1(';

        if (base_nodes && Array.isArray(base_nodes)) {
            // ==> add() operation
            is_add = true;
            // plant an opid on original array for duplicate check
            opid = ++_opid;
            for (var nodes = base_nodes, i = 0, len = nodes.length; i < len; ++i) {
                var node = nodes[i];
                if (!is_valid_node(node)) continue;
                if (typeof node == 'object') node[OPID_MARK] = opid;
                result.push(node);
            }
        }

        var r = nomalize_nodes(obj);
        obj = r.o, tag_obj = r.t;

        if (typeof obj == 'string') {

            // ==> (selector, ...
            if (obj.startsWith('<')) {
                // ==> (html_fragment [,attributes])
                result = create_html_fragment(obj, param, doc);
                tag_obj = '[html]';
            } else {
                // ==> (selector [,nodes])
                var parents = [doc];
                if (param) {
                    param = nomalize_nodes(param).o;
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
            if (tag_obj == '') tag_obj = '[nodes]';
            tag_start = tag_end = '';

        } else {

            _error(TAG_Q, 'Invalid parameter. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(SEE_ABOVE);

        }

        // ready to create the object
        var chain = is_add ? '.add(' + tag_obj + ')' : tag_start + tag_obj + tag_end;

        return create_tinyq(result, chain);

    }

    /**
     * create a new tinyq instance
     */
    function create_tinyq(nodes, chain) {
        return new TinyQ(nodes, chain);
    }

    /**
     * nomalize single node & tinyq parameter
     */
    function nomalize_nodes(obj) {
        var tag = '';
        var type = is_valid_node(obj);
        if (type) {
            tag = '[' + type + ']';
            obj = [obj];
        } else if (obj.tinyQ) {
            obj = obj.nodes;
        }
        return { o: obj, t: tag };
    }

    /**
     * check if an object is a html element, document or window object
     * returns object type or false
     */
    function is_valid_node(obj) {
        if (!obj) return false;
        if (obj == obj.window) return 'window';
        var type = obj.nodeType;
        if (type == 1) return 'node';
        if (type == 9) return 'document';
        return false;
    }

    /**
     * lossy check whether an object is array-like
     */
    function is_array_like(obj) {
        return Array.isArray(obj) ||
            typeof obj == 'object' && "length" in obj && typeof obj.length == 'number'
    }

    function is_element(obj) {
        if (!obj) return false;
        return obj.nodeType == 1;
    }

    function is_element_or_document(obj) {
        if (!obj) return false;
        var type = obj.nodeType;
        return (type == 1 || type == 9);
    }

    function is_window(obj) {
        return obj && obj == obj.window
    }

    function is_document(obj) {
        return obj && obj.nodeType == 9
    }

    function is_tinyq(obj) {
        return obj && obj.tinyQ
    }

    /**
     * get a valid element for methods
     */
    function get_valid_element(node) {
        if (!node) return false;
        var type = node.nodeType;
        if (type == 9) return node.documentElement;
        if (type != 1) return false;
        return node;
    }

    /**
     * html fragement creator
     */
    function create_html_fragment(html, attrs, doc) {

        if (typeof attrs != 'object') attrs = false;

        doc = doc || document;

        var div = doc.createElement('div');
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

        var type = typeof selector;

        // .q(index)
        if (type == 'number')
            return get_by_index.call(this, selector);

        if (type != 'string') {
            _error(TAG_Q, 'Expect a selector string. > Got "' + type + '": ', selector);
            throw new TypeError(SEE_ABOVE);
        }

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

        // check unique for multi-parent query
        if (!opid && nodes.length > 1) opid = ++_opid;

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
        } else if (/^([\w-]+)$/.test(selector)) {
            action = do_get_by_tag;
        }

        // do the query
        for (var list = nodes, i = 0, len = list.length; i < len; ++i) {
            var node = get_valid_element(list[i]);
            if (!node) continue;
            // query for elements
            var r = action(node, selector);
            if (!r || r.length == 0) continue;
            // return fast for q1()
            if (query_mode == 1) return [r[0]];
            // merge result
            result = to_array(r, result, opid, false);
        }

        return result;

    }

    function do_get_by_id(node, id) {
        var doc = node.ownerDocument;
        var r = doc.getElementById(id);
        return r ? [r] : r;
    }
    function do_query_all(node, selector) {
        return node.querySelectorAll(selector);
    }
    function do_get_by_tag(node, tagname) {
        return node.getElementsByTagName(tagname);
    }
    function do_get_by_class(node, classname) {
        return node.getElementsByClassName(classname);
    }


    /**
     * Convert NodeList to Arrays, also do copy, filter & merge
     */
    function to_array(nodes, base, opid, filter) {

        base = base || [];

        if (!nodes) return base;

        for (var list = nodes, i = 0, len = list.length; i < len; ++i) {

            var node = list[i];

            // fast check, nodeType is too slow
            if (typeof node != 'object') continue;

            // checks
            if (opid) {
                if (node[OPID_MARK] == opid) continue;
                node[OPID_MARK] = opid;
            }
            if (filter) {
                var r = filter(node, i, list);
                if (r == false) continue;
            }

            // accept
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

        // DOCUMENT_POSITION_DISCONNECTED	1
        // DOCUMENT_POSITION_PRECEDING	2
        // DOCUMENT_POSITION_FOLLOWING	4
        // DOCUMENT_POSITION_CONTAINS	8
        // DOCUMENT_POSITION_CONTAINED_BY	16
        // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC	32
        if (r & 2 || r & 8) return 1;
        if (r & 1 || r & 4 || r & 16) return -1;

        return 0;

    }


    //////////////////////////////////////////////////////////
    // FILTER FUNCTIONS
    //////////////////////////////////////////////////////////


    /**
     * .filter() - filter items in result set
     */
    function filter_method() {
        return filter_nodes(this, arguments, 'filter');
    }

    function filter_nodes(tinyq, args, method_tag) {

        var tag = { filter: '' };
        var filters = parse_filter_list.call(tag, args);

        if(!filters){
            tiny.warn(TAG_Q, 'No valid filter found. ', args);
            return tinyq;
        }

        var filter_func = create_filter_function(filters);

        var arr = to_array(tinyq.nodes, [], false, filter_func);

        tag = '.' + method_tag + '(' + tag.filter + ')';

        return create_tinyq(arr, tinyq.chain + tag);

    }

    /**
     * create a function wrapper for all filters
     */
    function create_filter_function(filters) {
        if (!filters) return false;
        return filter_list_executor.bind(filters);
    }

    /**
     * proxy for executing filter function list
     */
    function filter_list_executor(node, index, list) {
        for (var filter_list = this, i = 0, len = filter_list.length; i < len; ++i) {
            var filter = filter_list[i];
            var r = filter[0](node, index, list, filter[1]);
            if (r == false) return false;
        }
        return true;
    }

    /**
     * build a wrapper function for all filters
     */
    function parse_filter_list(args) {
        var tag = this || {};
        var arr = [];
        for (var i = 0, len = args.length; i < len; ++i) {
            var item = args[i];
            if (!item) return;
            arr = parse_filter_def.call(tag, item, arr);
        }
        return arr.length > 0 ? arr : false;
    }

    /**
     * Returns a filter function of given filter type
     */
    function parse_filter_def(arg, list) {

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
            _error(TAG_Q, 'Invalid filter String or Function. > Got "' + type + '": ', arg);
            throw new TypeError(SEE_ABOVE);
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
                _error(TAG_Q, 'Unexpected end of filter. ', item);
                throw new SyntaxError(SEE_ABOVE);
            }
            param = param.substring(0, param.length - 1).trim();
            if (param.search(/^\d$/) == 0) param = parseInt(param);
        }

        if (name) func = TinyQ.filters[name];
        if (func) {
            arr = [func, param];
            _CUSTOM_FILTER_CACHE[filter] = arr;
        } else {
            _error(TAG_Q, 'No such custom filter: ', name);
            throw new SyntaxError(SEE_ABOVE);
        }

        return arr;

    }

    /**
     * build-in custom filters
     */
    tiny.extend(TinyQ, {
        filters: {

            // css pseudo-class helper
            matches: function (node, i, l, param) { return node.matches(param) }, // css4
            has: function (node, i, l, param) { return node.querySelector(param) != null }, // css4
            blank: function (node) { return node.textContent.trim() == '' }, // css4
            contains: function (node, i, l, param) { return node.textContent.includes(param) }, // css3 (removed from spec by unknown reason)

            // custom filters
            visible: function (node) { return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length) },
            hidden: function (node) { return !TinyQ.filters.visible(node) }

        }
    });


    //////////////////////////////////////////////////////////
    // TRAVERSAL FUNCTIONS
    //////////////////////////////////////////////////////////

    var TRAVERSE_METHOD_LIST = [
        'parent',
        'offsetParent',
        'closest',
        'children',
        'prev',
        'next'
    ];

    // append to definition
    extend_traverse_methods(TINYQ_PROTOTYPE);

    function extend_traverse_methods(def) {
        var i = TRAVERSE_METHOD_LIST.length, method;
        while (method = TRAVERSE_METHOD_LIST[--i]) {
            def[method] = generate_traverse_method(i);
        }
    }
    function generate_traverse_method(type) {
        return function (selector) {
            return traverse_helper(this, selector, type);
        }
    }

    /**
     * Helper function for batch traversing
     */
    function traverse_helper(tinyq, selector, type) {

        selector = selector || false;

        if (type == 2 && !selector) {
            _error(TAG_Q, 'Expect a selector for closest()');
            throw new SyntaxError(SEE_ABOVE);
        }

        var get_func = TRAVERSE_FUNC[type];
        var filter = selector ? traversal_match_filter.bind(selector) : false;
        var opid = ++_opid;  // generate a unique operation id for duplicate-check

        // do the work
        var arr = [];
        for (var nodes = tinyq.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = get_valid_element(nodes[i]);
            if (!node) continue;
            // fetch node
            node = get_func(node, filter);
            if (!node) continue;
            if (type < 3) {
                // parent/offsetParent/closest requires unique check
                if (node[OPID_MARK] == opid) continue;
                node[OPID_MARK] = opid;
                arr.push(node);
            } else if (type == 3) {
                // children
                arr = arr.concat(node);
            } else {
                // prev/next
                arr.push(node);
            }
        }

        // sort nodes to document order
        if (type < 3) arr = arr.sort(compare_node_position);

        var tag = '.' + TRAVERSE_METHOD_LIST[type] + '(' + (selector ? selector : '') + ')';

        return create_tinyq(arr, tinyq.chain + tag);

    }

    // filter helper
    function traversal_match_filter(node) {
        if (!node) return false;
        return node.matches(this);
    }


    // action functions
    var TRAVERSE_FUNC = [func_get_parent, func_get_offset_parent, func_get_closest, func_get_children, func_get_prev, func_get_next];

    function func_get_parent(node, filter) {
        var r = node.parentElement;
        if (filter && !filter(r)) return false;
        return r;
    }
    function func_get_offset_parent(node, filter) {
        var r = node.offsetParent;
        if (!r) r = node.ownerDocument.documentElement;
        if (filter && !filter(r)) return false;
        return r;
    }
    function func_get_closest(node, filter) {
        while (node) {
            if (filter(node)) return node;
            node = node.parentElement;
        }
        return false;
    }
    function func_get_children(node, filter) {
        // NOTE: this loop is faster than node.children
        var arr = [];
        var r = node.firstElementChild;
        while (r) {
            if (!filter || filter(r)) arr.push(r);
            r = r.nextElementSibling;
        }
        return arr.length > 0 ? arr : false;
    }
    function func_get_prev(node, filter) {
        var r = node.previousElementSibling;
        if (filter && !filter(r)) return false;
        return r;
    }
    function func_get_next(node, filter) {
        var r = node.nextElementSibling;
        if (filter && !filter(r)) return false;
        return r;
    }


    //////////////////////////////////////////////////////////
    // APPEND CHILDREN
    //////////////////////////////////////////////////////////
    var APPEND_METHOD_LIST = [
        'append',
        'prepend',
        'after',
        'before'
    ];

    // append to definition
    extend_append_methods(TINYQ_PROTOTYPE);

    function extend_append_methods(def) {
        var i = APPEND_METHOD_LIST.length, method;
        while (method = APPEND_METHOD_LIST[--i]) {
            def[method] = generate_append_method(i);
        }
    }
    function generate_append_method(type) {
        return function (obj, attrs) {
            return append_helper(this, obj, attrs, type);
        }
    }


    var APPEND_FUNC = [node_append_func, node_prepend_func, node_insert_after_func, node_insert_before_func];
    var APPEND_LOOP_DIRECTION = [0, 1, 1, 0];
    var APPEND_LOOP_FUNC = [forward_loop_func, backward_loop_func];

    /**
     * Append children to nodes
     */
    function append_helper(tinyq, obj, attrs, type) {

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
            throw new TypeError(SEE_ABOVE);
        }

        // determine action type
        var action_func = APPEND_FUNC[type];
        var loop_func = APPEND_LOOP_FUNC[APPEND_LOOP_DIRECTION[type]];

        // append child
        for (var this_nodes = tinyq.nodes, i = 0, len = this_nodes.length, end = len - 1, require_clone = len > 1; i < len; ++i) {
            var this_node = get_valid_element(this_nodes[i]);
            if (!this_node) continue;
            loop_func(obj, end, require_clone && i != end, this_node, action_func);
        }

        return tinyq;

    }

    function forward_loop_func(list, end, need_clone, parent, action) {
        for (var j = 0, j_len = list.length; j < j_len; ++j) {
            func_loop_do(list[j], need_clone, parent, action);
        }
    }
    function backward_loop_func(list, end, need_clone, parent, action) {
        for (var j = list.length - 1; j > -1; --j) {
            func_loop_do(list[j], need_clone, parent, action);
        }
    }
    function func_loop_do(node, need_clone, parent, action) {
        if (!is_element(node)) return;
        if (need_clone) node = node.cloneNode(true);
        action(parent, node);
    }

    function node_append_func(parent, node) { parent.appendChild(node); }
    function node_prepend_func(parent, node) { parent.insertBefore(node, parent.lastChild); }
    function node_insert_before_func(this_node, node) {
        var parent = this_node.parentElement;
        if (parent) parent.insertBefore(node, this_node);
    }
    function node_insert_after_func(this_node, node) {
        var parent = this_node.parentElement;
        if (parent) parent.insertBefore(node, this_node.nextSibling);
    }


    //////////////////////////////////////////////////////////
    // REMOVE NODE & CHILDREN
    //////////////////////////////////////////////////////////

    /**
     * .remove() node /////////////////////////////////
     */
    function remove_node(selector) {

        selector = typeof selector == 'string' ? selector : false;

        var tinyq = this;
        var nodes = tinyq.nodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = get_valid_element(nodes[i]);
            if (!node) continue;
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
     * .empty() node content & children /////////////////////////////////
     */
    function empty_node() {
        var tinyq = this;
        for (var nodes = tinyq.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = get_valid_element(nodes[i]);
            if (!node) continue;
            node.textContent = ''; // the short way
        }
        tinyq.chain += '.empty()';
        return tinyq;
    }


    //////////////////////////////////////////////////////////
    // NDOE COLLECTION ACCESS FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * .get() element
     */
    function get_elem_by_index(index) {

        if (index == undefined) index = 0;

        if (typeof index != 'number') {
            _error(TAG_Q, 'Expect an index number. > Got "' + typeof index + '": ', index);
            throw new TypeError(SEE_ABOVE);
        }

        var nodes = this.nodes;
        index = index < 0 ? nodes.length + index : index;
        return nodes[index];

    }

    /**
     * Helper function for  q(index), first(), last()
     */
    function get_by_index(index) {

        var tinyq = this;
        var nodes = tinyq.nodes;
        var node = get_elem_by_index.call(tinyq, index);
        node = node ? [node] : [];

        var chain = tinyq.chain + (index == 0 ? '.first()' : index == nodes.length - 1 ? '.last()' : '.q(' + index + ')');
        return create_tinyq(node, chain);

    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        return get_by_index.call(this, 0);
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        return get_by_index.call(this, -1);
    }

    /**
     * .indexOf()
     */
    function index_of_node(selector, start, invert) {
        invert = invert || false;
        start = typeof start == 'number' ? start : 0;
        var check_func = get_match_func(selector);
        for (var nodes = this.nodes, i = start, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!is_element(node)) continue;
            var r = invert ^ check_func(node, selector);
            if (r) return i;
        }
        return -1;
    }

    function get_match_func(selector) {
        return typeof selector == 'string' ? func_match_selector : func_match_node;
    }
    function func_match_selector(node, selector) {
        return node.matches(selector);
    }
    function func_match_node(node1, node2) {
        return node1 === node2;
    }

    /**
     * .lastIndexOf()
     */
    function last_index_of_node(selector, start) {
        var nodes = this.nodes;
        start = typeof start == 'number' ? start : nodes.length - 1;
        var check_func = get_match_func(selector);
        for (var i = start; i > -1; --i) {
            var node = nodes[i];
            if (!is_element(node)) continue;
            if (check_func(node, selector)) return i;
        }
        return -1;
    }

    /**
     * .includes()
     */
    function includes_node(selector) {
        return index_of_node.call(this, selector) > -1;
    }

    /**
     * .is() - selector check
     */
    function all_node_is(selector) {
        return index_of_node.call(this, selector, 0, true) == -1;
    }


    /**
     * .slice() - get a range of nodes
     */
    function get_by_slice(start, end) {
        var tinyq = this;
        var arr = tinyq.nodes.slice(start, end);
        return create_tinyq(arr, tinyq.chain + '.slice(' + start + (end !== undefined ? ',' + end : '') + ')');
    }

    /**
     * .eachNode() - loop through nodes as TinyQ object
     */
    function each_node(func, this_arg, wrap_tinyq) {
        var tinyq = this;
        for (var nodes = tinyq.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!node) continue;
            if (wrap_tinyq)
                node = create_tinyq([node], tinyq.chain + '.each(' + i + ')');
            func.call(this_arg, node, i, nodes);
        }
        return tinyq;
    }

    /**
     * .each() - loop through nodes
     */
    function each_q(func, this_arg) {
        return each_node.call(this, func, this_arg, true);
    }


    return TinyQ;

});