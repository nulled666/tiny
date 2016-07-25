define([
    './global',
    './base',
    './q.base'
], function (G, tiny, TinyQ) {

    'use strict';

    //////////////////////////////////////////////////////////
    // ATTRIBUTES MANIPULATION METHODS FOR TINYQ
    //////////////////////////////////////////////////////////
    tiny.extend(TinyQ.prototype, {
        class: process_class,
        css: false,
        attr: access_attribute,
        prop: access_property,
        text: access_text,
        position: access_position,
        offset: access_offset
    });

    tiny.extend(TinyQ.x, {
        setAttributes: set_node_attribute
    });


    /**
     * .class() method
     */
    function process_class(actions) {

        if (typeof actions != 'string') {
            tiny.error(TinyQ.x.TAG, 'Expect an action string. > Got "' + typeof actions + '": ', actions);
            throw new TypeError(G.SEE_ABOVE);
        }

        var has_check = actions.indexOf('?') > -1;
        var action_func = prepare_class_actions(actions);
        var result = false;

        for (var nodes = this.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!TinyQ.x.isElement(node)) continue;
            var r = action_func(node);
            if (r == true) result = true;
        }

        return has_check ? result : this;

    }

    /**
     * Prepare the action list for className change
     */
    function prepare_class_actions(str) {

        str = str.split(' ');
        var list = {};

        for (var i = 0, len = str.length; i < len; ++i) {
            var item = str[i];
            var sign = item.charAt(0);
            if (!'-^?'.includes(sign)) {
                sign = '+';
            } else {
                item = item.substring(1);
            }
            if (!list[sign]) list[sign] = [];
            list[sign].push(item);
        }

        var actions = [];

        // extract check last
        var check_list = list['?'];
        delete list['?'];

        for (var sign in list) {
            var item = list[sign];
            if (item) actions.push(CLASS_ACTIONS[sign].bind(item));
        }

        // create the executor
        actions = do_class_actions.bind({
            do: actions,
            check: check_list
        });

        return actions;

    }

    /**
     * class actions executor
     */
    function do_class_actions(node) {

        var cl = ' ' + node.className + ' ';
        var new_cl = cl;

        // do the actions
        var list = this.do, i = -1, item;
        while (item = list[++i])
            new_cl = item(new_cl);

        // if we need to check class
        var result, check_list = this.check;
        if (check_list) result = class_has_func(new_cl, check_list);

        // update only on change
        new_cl = new_cl.trim();
        if (cl != new_cl) node.className = new_cl;

        return result;

    }

    // class manipulation helper functions
    var CLASS_ACTIONS = {
        '+': class_add_func,
        '-': class_remove_func,
        '^': class_toggle_func
    };

    function class_add_func(cl) {
        var arr = this, i = -1, item;
        while (item = arr[++i]) {
            if (!cl.includes(' ' + item + ' '))
                cl += item + ' ';
        }
        return cl;
    }
    function class_remove_func(cl) {
        var arr = this, i = -1, item;
        while (item = arr[++i]) {
            while (cl.includes(' ' + item + ' '))
                cl = cl.replace(item + ' ', '');
        }
        return cl;
    }
    function class_toggle_func(cl) {
        var arr = this, i = -1, item;
        while (item = arr[++i]) {
            var tag = ' ' + item + ' ';
            if (!cl.includes(tag)) {
                cl += item + ' ';
            } else {
                while (cl.includes(tag)) cl = cl.replace(item + ' ', '');
            }
            return cl;
        }
    }
    function class_has_func(cl, check_list) {
        var arr = check_list, i = -1, item;
        while (item = arr[++i]) {
            if (cl.includes(' ' + item + ' ')) return true;
        }
        return false;
    }


    //////////////////////////////////////////////////////////
    // ATTRIBUTES
    //////////////////////////////////////////////////////////
    /**
     * TinyQ.attr()
     */
    function access_attribute(attr, value) {

        if (this.nodes.length < 1) return;

        if (value == undefined) {
            return this.nodes[0].getAttribute(attr);
        } else {

        }

    }

    function set_node_attribute(node, attrs) {
        for (var key in attrs) {
            var val = attrs[key];
            if (key == '_text') {
                node.innerText = val;
            } else if (key == '_html') {
                node.innerHTML = val;
            } else {
                node.setAttribute(key, val);
            }
        }
    }


    //////////////////////////////////////////////////////////
    // PROPERTY
    //////////////////////////////////////////////////////////
    /**
     * TinyQ.prop()
     */
    function access_property(prop, value) {

        if (this.nodes.length < 1) return;

        if (value == undefined) {
            return this.nodes[0][prop];
        } else {

        }


    }


    //////////////////////////////////////////////////////////
    // TEXT CONTENT
    //////////////////////////////////////////////////////////
    /**
     * TinyQ.text()
     */
    function access_text(value) {
        var nodes = this.nodes;

        if (nodes.length < 1) return '';

        if (value == undefined) {

            var text = '';
            for (var i = 0, len = nodes.length; i < len; ++i) {
                text += nodes[i].innerText;
            }

            return text;

        } else {

        }


    }


    function access_position() { }

    function access_offset() { }

});