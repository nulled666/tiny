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
     *  _q(html, [,attr])          
     *  _q(selector)        
     *  _q(selector, nodes)
     *  _q(nodes)   
     * 
     */
    function _q(obj, param, extra) { return init_q(obj, param, extra); }
    function _q1(obj, param, extra) { return init_q(obj, param, extra, 1); }

    /**
     * tinyQ constructor
     */
    var TinyQ = function () {
        return this;
    };

    TinyQ.TAG = '_q()' + G.TAG_SUFFIX;
    TinyQ.OPID = 'tinyq-OPID';
    TinyQ.fn = {};

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
        children: get_children,
        closest: get_closest,
        prev: get_prev,
        next: get_next,

        get: function (index) { return index < this.nodes.length ? this.nodes[index] : null; },
        each: each_operation,
        toArray: function () { return to_array(this.nodes) },

        append: append_child,
        after: false,
        before: false,

        offset: false

    };


    //////////////////////////////////////////////////////////
    // INITIALIZATION FUNCTIONS
    //////////////////////////////////////////////////////////
    function init_q(obj, param, extra, set_mode, base_nodes) {

        if (!obj) return new TinyQ();

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

        if (base_nodes && Array.isArray(base_nodes)) {
            // ==> add() operation
            is_add = true;
            // plant an opid on original array for duplicate check
            opid = tiny.guid();
            for (var i = 0, len = base_nodes.length; i < len; ++i) {
                base_nodes[i][TinyQ.OPID] = opid;
            }
            result = base_nodes;
        }

        obj = nomalize_nodes(obj);

        if (typeof obj == 'string') {
            // ==> (selector, ...
            if (obj.startsWith('<')) {
                // ==> (html_fragment [,attributes])
                result = create_html_fragment(obj, param);
                tag.obj = '[html]';
            } else {
                // ==> (selector [,nodes])
                var parents = [document];
                if (param) {
                    param = nomalize_nodes(param);
                    if (is_array_like(param)) {
                        // ==> [,nodes]
                        parents = param;
                        tag.start = tag.obj + '.' + tag.start;
                    }
                }
                // do query
                result = do_query(parents, obj, query_mode);
                tag.obj = obj;
            }
        } else if (is_array_like(obj)) {
            // ==> (nodes [,filter...])
            tag.obj = '[nodes]';
            for (var i = 0, len = obj.length; i < len; ++i) {
                var item = obj[i];
                if (!is_element(item)) continue;
                if (opid) {
                    if (item[TinyQ.OPID] == opid) continue;
                    item[TinyQ.OPID] = opid;
                }
                result.push(item);
            }
            tag.start = tag.end = '';
        } else {
            tiny.error(TinyQ.TAG, 'Invalid parameter. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        // set properties to finish
        var chain = '';
        if (is_add) {
            chain = '.add(' + tag.obj + ')';
        } else {
            chain = tag.start + tag.obj + tag.end;
        }

        return create_new_tinyq(result, chain);

    }

    /**
     * nomalize single node & tinyq parameter
     */
    function nomalize_nodes(obj) {
        if (is_element(obj) || obj == window) {
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
        return Array.isArray(obj) ||
            typeof obj == 'object' && obj.length > 0 && obj[0] != undefined && obj[obj.length - 1] != undefined
    }

    /**
     * check if an object is a html element or document node
     */
    function is_element(obj) {
        if (!obj) return false;
        var type = obj.nodeType;
        return (type == 1 || type == 9 || type == 11);
    }

    /**
     * create a new tinyq instance
     */
    function create_new_tinyq(nodes, chain) {
        var q = new TinyQ();
        q.chain = chain;
        q.nodes = nodes;
        q.length = nodes.length;
        return q;
    }

    //////////////////////////////////////////////////////////
    // HTML FUNCTIONS
    //////////////////////////////////////////////////////////
    function create_html_fragment(html, attrs, parent) {

        if (is_element(attrs)) parent = attrs, attrs = false;
        if (typeof attrs != 'object') attrs = false;

        var div = document.createElement('div');
        div.innerHTML = html;

        var arr = [];
        var nodes = div.childNodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (attrs) TinyQ.fn.setAttributes(node, attrs);
            arr.push(node);
        }

        return arr;

    }


    //////////////////////////////////////////////////////////
    // QUERY FUNCTIONS
    //////////////////////////////////////////////////////////

    /**
     * Execute query on all given nodes and concate the results
     */
    function do_query(nodes, selector, query_mode, opid) {

        if (!opid && nodes.length > 1) opid = tiny.guid();

        var result = [];
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
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!is_element(node)) continue;
            if (node == window) node = window.document; // window -> document
            var r = action(node, selector);
            if (!r) continue;
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
        var this_arg = {};

        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (opid) {
                if (node[TinyQ.OPID] == opid) continue;
                node[TinyQ.OPID] = opid;
            }
            if (filter) {
                var r = filter(node, i, nodes, len, this_arg);
                if (r == false) continue;
            }
            base.push(node);
        }

        return base;

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
        for (var i = 0, len = filter_list.length; i < len; ++i) {
            var filter = filter_list[i];
            this_arg.p = filter[1];
            var r = filter[0].call(this_arg, node, index, list, len);
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
            tag.filter += '//*' + tiny.x.funcName(arg);
            list.push([arg, null]);
        } else if (type == 'string') {
            if (arg.startsWith('//')) {
                //==> '//filter1(param),filter2' - build-in custom filter
                tag.filter += arg;
                arg = arg.substring(2);
                func = parse_custom_filter_tag(arg);
                list = list.concat(func);
            } else {
                // ==> selector
                tag.filter += '//' + arg;
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

    function each_operation(func, this_arg) {
        var obj = this.nodes;
        for (var i = 0, len = obj.length; i < len; ++i) {
            func.call(this_arg, obj[i], i, obj);
        }
    }

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
    function sub_query_all(selector, mode) {
        var arr = do_query(this.nodes, selector, mode);
        var chain = this.chain + (mode == 1) ? '.q1(' : '.q(';
        chain += ')';
        return create_new_tinyq(arr, chain);
    }

    /**
     * .q1() - query one
     */
    function sub_query_one(selector) {
        return sub_query_all.apply(this, selector, 1);
    }

    /**
     * .filter() - filter items in result set
     */
    function filter_nodes() {

        var tag = { filter: '' };

        var filters = create_filter_list.call(tag, arguments);
        tag = '.filter(' + tag.filter + ')';
        var filter_func = create_filter_executor(filters);
        var arr = to_array(this.nodes, [], false, filter_func);

        return create_new_tinyq(arr, this.chain + tag);

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
        if (nodes.length > 0)
            arr.push(type == 1 ? nodes[0] : nodes[nodes.length - 1]);
        var chain = tinyq.chain + (type == 1 ? '.first()' : '.last()');
        return create_new_tinyq(arr, chain);
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
    function do_traversal_helper(tinyq, selector, type) {

        selector = selector || false;

        var prefix = '.parent(';  // type == 0
        var get_func = get_parent_func;
        if (type == 1) {
            get_func = get_children_func;
            prefix = '.children(' + selector;
        } else if (type == 2) {
            if (!selector) {
                tiny.error(TinyQ.TAG, 'Expect a selector for closest()');
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
        var nodes = tinyq.nodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = get_func(nodes[i], selector);
            if (!node) continue;
            if (type < 3) {
                arr = to_array(node, arr, opid, filter);
            } else {
                if (filter && !filter(node)) continue;
                arr.push(node);
            }
        }

        return create_new_tinyq(arr, tinyq.chain + prefix + ')');

    }

    function get_parent_func(node) {
        var r = node.parentElement;
        if (r) r = [r];
        return r;
    }
    function get_children_func(node) {
        return node.children;
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
        return do_traversal_helper(this, selector, 0);
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
        return do_traversal_helper(this, selector, 2);
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


    /**
     * TinyQ.append(node|tinyq|html [,attr])
     */
    function append_child(obj, attrs) {

        // check parameter
        if (obj && obj.tinyQ) {
            obj = obj.nodes;
        } else if (typeof obj == 'string') {
            obj = create_html_fragment(obj, attrs);
        } else if (is_element(obj)) {
            obj = [obj];
        } else {
            _error(TinyQ.TAG, 'Expect a HTML string, TinyQ object or Element. > Got: ' + type, obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        // append child
        var parent_nodes = this.nodes;
        for (var i = 0, len = parent_nodes.length; i < len; ++i) {
            var parent_node = parent_nodes[i];
            if (!is_element(parent_node)) continue;
            for (var j = 0, jlen = obj.length; j < jlen; ++j) {
                var node = obj[j];
                if (i != (len - 1)) node = node.clone();
                if (is_element(node))
                    parent_node.appendChild(node);
            }
        }
    }

    return TinyQ;

});