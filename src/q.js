define([
    './global',
    './base'
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

    tiny.fn.add({
        q: _q,
        q1: _q1
    });

    var TAG_Q = '_q()' + G.TAG_SUFFIX;

    function _q(selector, filter) {
        return new tinyQ(selector, filter);
    }
    function _q1(selector, filter) {
        return new tinyQ(selector, filter, null, 1);
    }

    /**
     * tinyQ constructor
     * ```
     *  tinyQ(html [,parent])              // _q('<a href="#here">Test</a>', document) 
     *  tinyQ(tag, attr [,parent])         // _q('a', {href: '#here', text: 'Test'}, document)
     *  tinyQ(selector [,filter])          // _q('a', '.test')
     *  tinyQ(selector, nodes [,filter])   // .q(selector, filter)
     * 
     *  tinyQ(nodes [,filter])             // _q(nodes, '.test')
     *  tinyQ(nodes, nodes [,filter])      // .add(nodes, '.test')
     * 
     *  tinyQ(obj, param, filter, mode, desc)
     * 
     * ```
     */
    var tinyQ = function (obj, param, filter, mode, selector_string) {

        tiny.time('tinyQ');

        /// *** Prepare Parameters ***
        obj = prepare_parameter(obj);
        param = prepare_parameter(param);

        var type = obj[0];
        var param_type = param[0];
        var extra_type = tiny.type(filter);
        obj = obj[1];
        param = param[1];

        /// *** Detect parameter pattern ***
        if (type == 'string') {
            if (obj.startsWith('<')) {
                // ==> Create HTML fragment - '<html>';
            } else {
                // _q(selector, filter)
                if (param_type == 'string' || param_type == 'function') filter = param;
                if (param_type == 'Array') {
                    // ==> tinyq.q(selector, nodes [, filter])
                    this.nodes = do_query(param, obj, filter, mode);
                    filter = false; // don't build filter tag in selector for this
                } else if (param_type == 'object') {
                    // ==> Create HTML Element - 'tagname', {attr}
                } else {
                    // ==> _q(selector [,filter])
                    this.nodes = do_query([document], obj, filter, mode);
                }
            }
        } else if (type == 'Array') {
            // _q(nodes, filter)
            if (param_type == 'string' || param_type == 'function') filter = param;
            if (param_type == 'Array') {
                // ==> .add(nodes, nodes [,filter])
                this.nodes = obj.concat(to_array(param, filter));
                filter = false; // don't build filter tag in selector for this
            } else {
                // ==> _q(nodes [,filter])
                this.nodes = to_array(obj, filter);
            }
            obj = '[nodes]'; // set for selector string
        } else {
            invalid_parameter(type, obj);
        }

        this.length = this.nodes.length;
        this.selector = (typeof selector_string == 'string') ? selector_string : obj;
        if (filter) this.selector += build_filter_tag(filter);

        tiny.log('tinyQ operation:', tiny.time('tinyQ').toFixed(4), 'ms');

        return this;

    };

    function invalid_parameter(type, obj) {
        tiny.error(TAG_Q, 'Invalid parameter. > Got "' + type + '": ', obj);
        throw new TypeError(G.SEE_ABOVE);
    }

    function prepare_parameter(obj) {

        var type = tiny.type(obj);

        if (is_node(obj)) {
            // single node -> array
            obj = [obj];
        } else if (type == 'q') {
            obj = obj.nodes;
        } else if (type == 'jquery') {
            obj = obj.toArray();
        }

        type = tiny.type(obj);
        if (type == 'NodeList' || type == 'HTMLCollection') type = 'Array';

        return [type, obj];

    }

    function build_filter_tag(filter) {
        var type = typeof filter;
        if (type != 'string' && type != 'function') return '';
        var name = type == 'string' ? filter : tiny.fn.getFuncName(filter) + '()';
        return '::filter="' + name + '"';
    }

    /**
     * The prototype
     */
    tinyQ.prototype = {

        tinyQ: true,

        // properties
        nodes: [],
        length: 0,
        selector: '',

        q: sub_query_all,
        q1: sub_query_one,
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

    tinyQ.TAG = TAG_Q;

    ///////////////////////////// INTERNAL FUNCTIONS ////////////////////////////

    /**
     * Real query function
     */
    function do_query(nodes, selector, filter, mode) {

        var action = mode == 1 ? action_query_one : action_query_all;

        var out = [];
        tiny.each(nodes, function (node) {
            if (node) out = action(node, selector, filter, out);
        });

        return out;

    }

    /**
     * querySelector() helper for do_query()
     */
    function action_query_one(node, selector, filter, out) {
        var node = node.querySelector(selector);
        if (node) {
            if (!filter || node_matches(filter, node))
                out.push(node);
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
     * check if an object is a html element or document node
     */
    function is_node(obj) {
        return obj && (obj.nodeType == 1 || obj.nodeType == 9);
    }

    /**
     * Convert NodeList to Arrays, also do copy and filtering
     */
    function to_array(nodes, filter) {

        if (tiny.type(nodes) == 'array' && !filter)
            return nodes;

        var arr = [];
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!filter || node_matches(filter, node, i)) arr.push(node);
        }
        return arr;

    }

    /**
     * test a node againt filter
     */
    function node_matches(filter, node, index) {
        var type = typeof filter;
        if (type == 'function')
            return filter(node, index);
        if (type == 'string')
            return node.matches(filter);
        return false;
    }

    ///////////////////////////// CORE METHODS ////////////////////////////

    /**
     * .q() - query all
     */
    function sub_query_all(selector, filter, mode) {
        var tag = '::q' + (mode == 1 ? '1' : '') + '(' + selector + build_filter_tag(filter) + ')';
        return new tinyQ(selector, this.nodes, filter, mode, this.selector + tag);
    }

    /**
     * .q1() - query one
     */
    function sub_query_one(selector, filter) {
        return sub_query_all.call(this, selector, filter, 1);
    }

    /**
     * .filter() - filter items in result set
     */
    function filter_nodes(filter) {
        return new tinyQ(this.nodes, filter, null, null, this.selector);
    }

    /**
     * .add() - add items to current tinyQ object
     */
    function add_nodes(obj, filter) {
        var tag = build_filter_tag(filter);
        if (typeof obj == 'string') {
            tag = obj + tag;
            obj = do_query([document], obj, filter);
            filter = false;
        } else {
            tag = '[nodes]' + tag;
        }
        return new tinyQ(this.nodes, obj, filter, null, this.selector + '::add(' + tag + ')');
    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[0]);
        return new tinyQ(arr, null, null, null, this.selector + '::first()');
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[this.nodes.length - 1]);
        return new tinyQ(arr, null, null, null, this.selector + '::last()');
    }


    return tinyQ;

});