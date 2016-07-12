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

    function _q(selector) {
        return new tinyQ(selector);
    }
    function _q1(selector) {
        return new tinyQ(selector, null, 1);
    }

    /**
     * tinyQ constructor
     */
    var tinyQ = function (selector, param, mode) {

        var type = tiny.type(selector);
        var type_param = tiny.type(param);

        if (type == 'string') {
            if (selector.startsWith('<')) {
                // ==> Create HTML fragment = '<html>';

            } else if (type_param == 'object') {
                // ==> Create HTML Element - 'tagname', {attr}

            } else if (type_param == 'tinyq') {
                // ==> sub query
                return init_with_selector.call(this, selector, param, mode);
            } else {
                // ==> first query
                return init_with_selector.call(this, selector, null, mode);
            }
        }


    };

    tinyQ.prototype = {

        tinyQ: true,

        // properties
        selector: '',
        nodes: [document],
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
            return this.nodes[index];
        },

        each: function (start, func, this_arg) {
            return tiny.each(this.nodes, start, func, this_arg)
        },

        toArray: to_array,

        cls: process_class,
        css: false,
        attr: false,

        offset: false,

        on: false

    };

    /**
     * Init the tinyQ object with selector
     */
    function init_with_selector(selector, tinyq, mode) {

        tinyq = tinyq || this;
        mode = mode || 0;

        this.selector = add_child_selector(tinyq.selector, selector);
        this.nodes = do_query(selector, tinyq.nodes, mode);
        this.length = this.nodes.length;

        return this;
    }

    /**
     * real query function
     */
    function do_query(selector, nodes, mode) {

        check_selector(selector);

        nodes = nodes || this.nodes;

        var out = [];
        var action = mode == 1 ? node_query_one : node_query_all;

        var out = [];

        tiny.each(nodes, function (node) {
            if (node) out = action(node, selector, out);
        });

        return out;

    }

    function node_query_one(node, selector, out) {
        var result = node.querySelector(selector);
        if (result) out.push(result);
        return out;
    }

    function node_query_all(node, selector, out) {
        var result = node.querySelectorAll(selector);
        if (!result) return;
        result = to_array(result);
        out = out.concat(result);
        return out;
    }


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
     * tinyQ.add() - add items to query
     */
    function add_to_query(selector) {

        check_selector(selector);

        var result = document.querySelectorAll(selector)
        if (result == null) return this;

        result = to_array(result);

        this.nodes = this.nodes.concat(result);
        this.length = this.nodes.length;
        this.selector += ', ' + selector;

        return this;

    }

    function get_first() {
        return this.nodes.length > 0 ? this.nodes[0] : null;
    }

    function get_last() {
        return this.nodes.length > 0 ? this.nodes[this.nodes.length - 1] : null;
    }

    /**
     * tinyQ.filter() - filter items in result set
     */
    function filter_nodes(func) {
        return this;
    }

    /**
     * Convert NodeList to Arrays
     */
    function to_array(nodes) {
        if (tiny.type(nodes) == 'array') return nodes;
        return Array.prototype.slice.call(nodes);
    }

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