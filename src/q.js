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
     * 
     *  tinyQ(obj, param, filter, mode, desc)
     * 
     * ```
     */
    var tinyQ = function (obj, param, filter, mode, selector_string) {

        tiny.time('tinyQ');

        /// *** Prepare Parameters ***
        obj = prepare_node_paramter(obj);

        var type = get_type(obj);
        var param_type = get_type(param);

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
                } else if (param_type == 'object') {
                    // ==> Create HTML Element - 'tagname', {attr}
                } else {
                    // ==> _q(selector [,filter])
                    this.nodes = do_query([document], obj, filter, mode);
                }
            }
        } else if (type == 'Array') {
            // ==> _q(nodes [,filter])
            if (param_type == 'string' || param_type == 'function') filter = param;
            this.nodes = to_array(obj, filter);
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

    /**
     * prepare Array-like Node list objects
     */
    function prepare_node_paramter(obj) {
        var type = tiny.type(obj);
        if (is_node(obj)) {
            // single node -> array
            obj = [obj];
        } else if (type == 'q') {
            obj = obj.nodes;
        } else if (type == 'jquery') {
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

    function build_filter_tag(filter) {
        var type = typeof filter;
        if (type != 'string' && type != 'function') return '';
        var name = type == 'string' ? filter : tiny.fn.getFuncName(filter) + '()';
        return ' >> filter="' + name + '"';
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

    tinyQ.TAG = TAG_Q;

    ///////////////////////////// INTERNAL FUNCTIONS ////////////////////////////

    /**
     * Real query function
     */
    function do_query(nodes, selector, filter, mode) {

        var action = mode == 1 ? action_query_one : action_query_all;

        var out = [];
        tiny.each(nodes, function (node) {
            if (is_node(node)) out = action(node, selector, filter, out);
        });

        return out;

    }

    /**
     * querySelector() helper for do_query()
     */
    function action_query_one(node, selector, filter, out) {
        var node = node.querySelector(selector);
        filter = get_filter_function(filter);
        if (node) {
            if (!filter || filter(node, 0))
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

        if (tiny.type(nodes) == 'Array' && !filter)
            return nodes;

        filter = get_filter_function(filter);

        var arr = [];
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (is_node(node) && (!filter || filter(node, i))) arr.push(node);
        }
        return arr;

    }

    /**
     * Returns a filter function for given filter type
     */
    function get_filter_function(filter) {

        if (!filter) return false; // no filter is set

        var type = typeof filter;
        if (type == 'function') {
            // simply return the given function
            return filter;
        } else if (type == 'string') {
            // create a proxy function for node_matches() with given selector
            return function () {
                var node = arguments[0];
                return node_matches.apply(filter, [node]);
            };
        } else {
            tiny.error(TAG_Q, 'Invalid filter String or Function. > Got "' + type + '": ', filter);
            throw new TypeError(G.SEE_ABOVE);
        }

    }

    /**
     * test a node againt selector
     */
    function node_matches(node) {
        return node.matches(this);
    }

    ///////////////////////////// CORE METHODS ////////////////////////////

    /**
     * .q() - query all
     */
    function sub_query_nodes(selector, filter, mode) {
        var tag = '::q' + (mode == 1 ? '1' : '') + '(' + selector + build_filter_tag(filter) + ')';
        return new tinyQ(selector, this.nodes, filter, mode, this.selector + tag);
    }

    /**
     * .q1() - query one
     */
    function sub_query_one_node(selector, filter) {
        return sub_query_nodes.call(this, selector, filter, 1);
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

        obj = prepare_node_paramter(obj);
        var type = get_type(obj);
        var tag = build_filter_tag(filter);

        if (type == 'string') {
            // ==> selector
            tag = obj + tag;
            obj = do_query([document], obj, filter);
            obj = this.nodes.concat(obj);
        } else if (type == 'Array') {
            // ==> nodes
            tag = '[nodes]' + tag;
            obj = this.nodes.concat(to_array(obj, filter));
        } else {
            invalid_parameter(type, obj);
        }

        return new tinyQ(obj, null, null, null, this.selector + '::add(' + tag + ')');
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