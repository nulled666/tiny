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
        return new tinyQ(selector, filter, 1);
    }

    /**
     * tinyQ constructor
     */
    var tinyQ = function (obj, param, mode) {

        tiny.time('tinyQ');

        var type = tiny.type(obj);
        var param_type = tiny.type(param);

        // prepare
        if (obj && (obj.nodeType == 1 || obj.nodeType == 9)) {
            // wrap single html node
            type = 'array';
            obj = [selecotor];
        }

        // node filter
        var filter;
        if (param_type == 'function') filter = param;

        // NodeList to Array
        if (type == 'nodelist') obj = to_array(obj, filter);

        /// mode select
        if (type == 'string') {
            if (obj.startsWith('<')) {
                // ==> Create HTML fragment - '<html>';

            } else if (param_type == 'object') {
                // ==> Create HTML Element - 'tagname', {attr}

            } else if (param_type == 'tinyq') {
                // ==> sub query - 'selector', tinyQ, q|q1, filter
                init_with_selector.call(this, obj, param, mode, filter);
            } else {
                // ==> first query - 'selector', null, q|q1, filter
                init_with_selector.call(this, obj, null, mode, filter);
            }
        } else if (type == 'array') {
            // ==> array of nodes
            if (obj.length > 0 && obj[0].nodeType) {
                this.selector = param_type == 'string' ? param : '[nodes]';
                this.node = obj;
                this.length = selector.length;
            }
        }

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
     * Init the tinyQ object with a selector
     */
    function init_with_selector(selector, tinyq, mode, filter) {

        tinyq = tinyq || this;
        mode = mode || 0;

        this.selector = add_child_selector(tinyq.selector, selector);
        this.nodes = do_query(selector, tinyq.nodes, mode, filter);
        this.length = this.nodes.length;

    }

    /**
     * Real query function
     */
    function do_query(selector, nodes, mode, filter) {

        check_selector(selector);

        nodes = nodes || [document];

        var action = mode == 1 ? action_query_one : action_query_all;

        var out = [];
        tiny.each(nodes, function (node) {
            if (node) out = action(node, selector, out, filter);
        });

        return out;

    }

    /**
     * q1() helper for do_query()
     */
    function action_query_one(node, selector, out, filter) {
        var result = node.querySelector(selector);
        if (result && (!filter || filter(result, 0)))
            out.push(result);
        return out;
    }

    /**
     * q() helper for do_query()
     */
    function action_query_all(node, selector, out, filter) {
        var result = node.querySelectorAll(selector);
        if (!result) return;
        result = to_array(result, filter);
        out = out.concat(result);
        return out;
    }


    /**
     * check selector string
     */
    function check_selector(selector) {

        if (typeof selector != 'string') {
            tiny.error(TAG_Q, 'Expect an selector string. > Got "' + typeof selector + '": ', selector);
            throw new TypeError(G.SEE_ABOVE);
        }

    }

    /**
     * Add child selector for query
     */
    function add_child_selector(this_selector, selector) {

        check_selector(selector);

        var this_selector = this_selector.split(',');
        tiny.each(this_selector, function (section, index, list) {
            list[index] = section + ' ' + selector;
        });

        return this_selector.join(',').trim();

    }

    /**
     * Convert NodeList to Arrays, also do the filtering
     */
    function to_array(nodes, filter) {

        // choose the fast way if no filter is required
        if (typeof filter !== 'function') {
            if (tiny.type(nodes) == 'array') return nodes;
            return Array.prototype.slice.call(nodes);
        }

        // filter through
        var arr = [];
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (filter(node, i)) arr.push(node);
        }
        return arr;

    }

    ///////////////////////////// CORE QUERY METHODS ////////////////////////////

    /**
     * tinyQ.q() - query all
     */
    function query_all(selector) {
        return new tinyQ(selector, this);
    }

    /**
     * tinyQ.q1() - query one
     */
    function query_one(selector) {
        return new tinyQ(selector, this, 1);
    }

    /**
     * tinyQ.add() - add items to current tinyQ object
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
     * tinyQ.first() - get first element as a tinyQ object
     */
    function get_first() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[0]);
        return new tinyQ(arr, 'first()');
    }

    /**
     * tinyQ.last() - get last element as a tinyQ object
     */
    function get_last() {
        var arr = [];
        if (this.nodes.length > 0) arr.push(this.nodes[this.nodes.length - 1]);
        return new tinyQ(arr, 'last()');
    }

    /**
     * tinyQ.filter() - filter items in result set
     */
    function filter_nodes(func) {
        return this;
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