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
     *  tinyQ(selector [,filter]);
     *  tinyQ(nodes [,selector] [,filter] [,mode] [,desc])
     * 
     *  tinyQ('<a href="#here">Test</a>')           // create html fragment
     *  tinyQ('a', {href: '#here', text: 'Test'})   // create element
     * ```
     */
    var tinyQ = function (obj, param, extra, mode, desc) {

        tiny.time('tinyQ');

        var type = tiny.type(obj);
        var param_type = tiny.type(param);

        /// *** Prepare Parameters ***
        var filter = param_type == 'function' ? param : false;

        if (is_node(obj)) {
            // single node -> array
            type = 'Array';
            obj = [obj];
        }
        if (type == 'NodeList' || type == 'HTMLCollection') {
            // NodeList -> Array
            type = 'Array';
        } else if (type == 'q') {
            // tinyQ -> Array
            type = 'Array';
            obj = obj.nodes;
        } else if (type == 'jquery') {
            // JQuery -> Array
            type = 'Array';
            obj = obj.toArray();
        }

        /// *** Detect parameter pattern ***
        if (type == 'string') {
            if (obj.startsWith('<')) {
                // ==> Create HTML fragment - '<html>';

            } else if (param_type == 'object') {
                // ==> Create HTML Element - 'tagname', {attr}

            } else {
                // ==> first query - (selector, filter, null, mode)
                this.nodes = do_query([document], obj, filter, mode);
                this.length = this.nodes.length;
                this.selector = obj;
                if (filter) this.selector += ' :filter=' + tiny.fn.getFuncName(filter) + '()';
            }
        } else if (type == 'Array') {
            // ==> array of nodes
            if (param_type == 'string') {
                // ==> (nodes, selector [,filter] [,mode]) - .q() and .q1() method
                this.nodes = do_query(obj, param, filter, mode);
            } else {
                // ==> (nodes, [,filter]) - .filter() method
                this.nodes = to_array(obj, filter);
            }
            this.length = this.nodes.length;
            this.selector = (typeof desc == 'string') ? desc : '[nodes]';
            if (filter) this.selector += ' :filter=' + tiny.fn.getFuncName(filter) + '()';
        } else {
            tiny.error(TAG_Q, 'Invalid parameter. > Got "' + type + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        tiny.log('tinyQ operation:', tiny.time('tinyQ').toFixed(4), 'ms');

        return this;

    };

    /**
     * The prototype
     */
    tinyQ.prototype = {

        tinyQ: true,

        // properties
        nodes: [],
        length: 0,
        selector: '',

        q: query_all,
        q1: query_one,
        add: add_to_nodes,
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
        return filter(node, index);
    }

    ///////////////////////////// CORE METHODS ////////////////////////////

    /**
     * .q() - query all
     */
    function query_all(selector, filter) {
        return new tinyQ(this.nodes, selector, filter, null, this.selector + '; q()');
    }

    /**
     * .q1() - query one
     */
    function query_one(selector, filter) {
        return new tinyQ(this.nodes, selector, filter, 1, this.selector + '; q1()');
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
    function add_to_nodes(obj, filter) {

        filter = typeof filter == 'function' ? filter : false;

        var type = tiny.type(obj);
        var out = [];
        var selector = '';

        if (type == 'string') {
            selector = obj;
            out = action_query_all(document, obj, filter, []);
        } else if (type == 'NodeList' || type == 'HTMLCollection') {
            selector = '[nodes]';
            out = to_array(obj, filter);
        } else if (type == 'q') {
            selector = obj.selector;
            out = to_array(obj.nodes, filter);
        } else if (type == 'jquery') {
            selector = type;
            out = to_array(obj.toArray(), filter);
        } else if (is_node(obj)) {
            selector = 'node';
            out = to_array([obj], filter);
        }

        return new tinyQ(this.nodes.concat(out), null, null, null, this.selector + ' :add(' + selector + ')');
    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[0]);
        return new tinyQ(arr, null, null, null, this.selector + ' :first()');
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[this.nodes.length - 1]);
        return new tinyQ(arr, null, null, null, this.selector + ' :last()');
    }


    return tinyQ;

});