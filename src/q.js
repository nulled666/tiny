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

        // query for all
        q: function (selector) {
            var query = prepare_selector(this.selector, selector);
            do_query.call(this, query);
            return this;
        },

        // query for first one
        q1: function (selector) {
            var query = prepare_selector(this.selector, selector);
            var node = document.querySelector(query);
            this.nodes = node == null ? [] : [node];
            this.length = this.nodes.length;
            this.selector = query;
            return this;
        },

        // add items to query set
        add: function (selector) {
            var query = this.selector + ', ' + selector;
            do_query.call(this, query);
            return this;
        },

        parent: false,
        next: false,
        prev: false,

        get: function (index) {
            return this.nodes[index];
        },

        each: function (start, func, this_arg) {
            return tiny.each(this.nodes, start, func, this_arg)
        },

        toArray: function () {
            // Array.prototype.slice.call() is not supported in IE8 and just a little faster
            var arr = [];
            var bodes = this.nodes;
            for (var i = nodes.length; i--; arr.unshift(nodes[i]));
            return arr;
        },

        cls: process_class,
        css: false,
        attr: false,

        offset: false,

        on: false

    };

    /**
     * prepare selector for query
     */
    function prepare_selector(this_selector, selector) {

        if (typeof selector != 'string') {
            tiny.error(TAG_Q, 'Expect an selector string. > Got "' + typeof selector + '": ', selector);
            throw new TypeError(G.SEE_ABOVE);
        }

        var this_selector = this_selector.split(',');
        tiny.each(this_selector, function (section, index, list) {
            list[index] = section + ' ' + selector;
        });

        return this_selector.join(',').trim();

    }

    /**
     * Execute query and set the properties
     */
    function do_query(query) {
        this.nodes = document.querySelectorAll(query);
        this.length = this.nodes.length;
        this.selector = query;
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