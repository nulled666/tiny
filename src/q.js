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
        return new tinyQ(selector, true);
    }

    var tinyQ = function (selector, q1) {
        return q1 ? this.q1(selector) : this.q(selector);
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

        toArray: nodelist_to_array,

        cls: process_class,
        css: false,
        attr: false,

        offset: false,

        on: false

    };

    /**
     * tinyQ.q() - query all
     */
    function query_all(selector) {
        this.selector = add_child_selector(this.selector, selector);
        var arr = [];
        tiny.each(this.nodes, function (node) {
            if (!node) return;
            var result = node.querySelectorAll(selector);
            result = nodelist_to_array(result);
            if (result) arr = arr.concat(result);
        });
        this.nodes = arr;
        this.length = arr.length;
        return this;
    }

    /**
     * tinyQ.q1() - query first one
     */
    function query_one(selector) {
        this.selector = add_child_selector(this.selector, selector);
        var arr = [];
        tiny.each(this.nodes, function (node) {
            if (node) {
                if (!node) return;
                var result = node.querySelector(selector);
                if (result) arr.push(result);
            };
        });
        this.nodes = arr;
        this.length = arr.length;
        return this;
    }

    /**
     * check selector string
     */
    function check_selector(selector){

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
        if(result == null) return this;

        result = nodelist_to_array(result);

        var arr = nodelist_to_array(this.nodes);
        this.nodes = arr.concat(result);
        this.length = this.nodes.length;
        this.selector += ', ' + selector;

        return this;

    }

    /**
     * tinyQ.filter() - filter items in result set
     */
    function filter_nodes(func) {
        return this;
    }

    /**
     * Convert NodeList to Arrays
     * Array.prototype.slice.call() is not supported in IE8 and just a little faster
     */
    function nodelist_to_array(nodes) {
        if (tiny.type(nodes) == 'array') return nodes;
        var arr = [];
        for (var i = nodes.length; i--; arr.unshift(nodes[i]));
        return arr;
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