define([
    './global',
    './base'
], function (G, tiny) {

    'use strict';

    //////////////////////////////////////////////////////////
    // DOM FUNCTIONS
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
     *  tinyQ(tinyQ|Node|NodeList|Array<Node> [,selector] [,filter])
     * 
     *  tinyQ('<a href="#here">Test</a>')           // create html fragment
     *  _tinyQq('a', {href: '#here', text: 'Test'}) // create element
     * 
     *  tinyQ(Array, selector, mode)                // internal .q() .q1()
     *  tinyQ(Array, filter)                        // internal .filter()
     * ```
     */
    var tinyQ = function (obj, param, extra, mode) {

        tiny.time('tinyQ');

        var type = tiny.type(obj);
        var param_type = tiny.type(param);
        var filter = param_type == 'function' ? param : false;

        // single node -> array
        if (is_node(obj)) {
            type = 'array';
            obj = [selecotor];
        }
        // NodeList -> Array
        if (type == 'nodelist') obj = to_array(obj, filter);

        /// mode select
        if (type == 'string') {
            if (obj.startsWith('<')) {
                // ==> Create HTML fragment - '<html>';

            } else if (param_type == 'object') {
                // ==> Create HTML Element - 'tagname', {attr}

            } else {
                // ==> first query - (selector, filter, null, mode)
                this.selector = obj;
                this.nodes = do_query([document], obj, filter, mode);
                if (filter) this.selector += ' <filter:' + tiny.fn.getFuncName(filter) + '()>';
            }
        } else if (type == 'array') {
            // ==> array of nodes
            if (param_type == 'string') {
                // ==> (nodes, selector [,filter] [,mode]) - .q() and .q1() method
                this.selector = param;
                this.nodes = do_query(obj, selector, filter, mode);
            } else {
                // ==> (nodes, [,filter]) - .filter() method
                this.selector = '[nodes]';
                this.nodes = to_array(obj, filter);
            }
            if (filter) this.selector += ' <filter:' + tiny.fn.getFuncName(filter) + '()>';
        } else if (type == 'tinyq') {
            // ==> clone tinyQ object
            this.selector = obj.selector;
            this.nodes = copy_array(obj.nodes);
        } else {
            tiny.error(TAG_Q, 'Expect an selector string. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        this.length = this.nodes.length;

        tiny.log('tinyQ operation:', tiny.time('tinyQ').toFixed(4), 'ms');

        return this;

    };

    tinyQ.prototype = {

        tinyQ: true,

        // properties
        selector: '',
        nodes: [],
        length: 0,

        q: query_all,
        q1: query_one,
        add: add_to_query,
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

        cls: process_class,
        css: false,
        attr: false,

        offset: false,

        on: false

    };

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
        var result = node.querySelector(selector);
        if (result && (!filter || filter(result, 0)))
            out.push(result);
        return out;
    }

    /**
     * querySelectorAll() helper for do_query()
     */
    function action_query_all(node, selector, filter, out) {
        var result = node.querySelectorAll(selector);
        if (!result) return;
        result = to_array(result, filter);
        out = out.concat(result);
        return out;
    }

    /**
     * check if an object is a html element or document node
     */
    function is_node(obj) {
        return obj && (obj.nodeType == 1 || obj.nodeType == 9);
    }

    /**
     * clone an Array object
     */
    function copy_array(arr) {
        return arr.slice(0);
    }

    /**
     * Convert NodeList to Arrays, also do the filtering
     */
    function to_array(nodes, filter) {

        if (tiny.type(nodes) == 'array' && !filter)
            return nodes;

        var arr = [];
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!filter || filter(node, i)) arr.push(node);
        }
        return arr;

    }

    ///////////////////////////// CORE QUERY METHODS ////////////////////////////

    /**
     * .q() - query all
     */
    function query_all(selector) {
        return new tinyQ(this.nodes, selector);
    }

    /**
     * .q1() - query one
     */
    function query_one(selector) {
        return new tinyQ(this.nodes, selector, false, 1);
    }

    /**
     * .filter() - filter items in result set
     */
    function filter_nodes(filter) {
        return new tinyQ(this.nodes, filter);
    }

    /**
     * .add() - add items to current tinyQ object
     */
    function add_to_query(selector) {

        check_selector(selector);

        var result = document.querySelectorAll(selector);
        if (result == null) return this;

        result = to_array(result);

        this.nodes = this.nodes.concat(result);
        this.length = this.nodes.length;
        this.selector += ', ' + selector;

        return this;

    }

    /**
     * .first() - get first element as a tinyQ object
     */
    function get_first() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[0]);
        return new tinyQ(arr, 'first()');
    }

    /**
     * .last() - get last element as a tinyQ object
     */
    function get_last() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[this.nodes.length - 1]);
        return new tinyQ(arr, 'last()');
    }


    ///////////////////////////// ATTRIBUTES MANIPULATION METHODS ////////////////////////////

    /**
     * tinyQ.cls() method
     */
    function process_class(actions) {

        if (typeof actions != 'string') {
            tiny.error(TAG_Q, 'Expect an action string. > Got "' + typeof actions + '": ', actions);
            throw new TypeError(G.SEE_ABOVE);
        }

        actions = prepare_class_actions(actions);

        var result, test;
        this.each(function (elem) {
            test = do_class_actions(elem, actions);
            result = test !== undefined ? test : true;
        }, actions);

        return actions.hasTest ? result : this;

    }

    /**
     * Prepare the action list for className change
     */
    function prepare_class_actions(list) {
        list = list.split(' ');
        var plus = '';
        var arr = [];
        var test = [];
        tiny.each(list, function (item, index, list) {
            var chr = item.charAt(0);
            var seg = item.substring(1);
            if (chr == '-' || chr == '^') {
                arr.push([chr, ' ' + seg + ' ']);
            } else if (chr == '?' || chr == '!') {
                test.push([chr, ' ' + seg + ' ']); // put test actions at end
            } else {
                if (chr == '+') item = seg;
                plus += ' ' + item;
            }
        });
        return {
            hasTest: test.length > 0,
            plus: plus,
            list: arr.concat(test)
        };
    }

    /**
     * Do className change and check
     */
    function do_class_actions(elem, actions) {

        var cls = ' ' + elem.className + actions.plus + ' ';

        var result = tiny.each(actions.list, function (item) {

            var action = item[0];
            var val = item[1];

            if (action == '-') {
                cls = cls.replace(val, ' ');
            } else if (action == '^') {
                cls = cls.indexOf(val) > -1 ? cls.replace(val, ' ') : cls + val.substring(1);
            } else if (action == '?') {
                if (cls.indexOf(val) < 0) return false;
            } else if (action == '!') {
                if (cls.indexOf(val) > -1) return false;
            }

        });

        elem.className = cls.trim();

        return result === undefined;

    }

});