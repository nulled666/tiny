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

        text: access_text,
        html: access_html,

        attr: access_attribute,
        prop: access_property,

        style: access_style,
        class: process_class,

        // following size methods are extended in extend_size_methods():
        // - computed css sizes & position :
        //	  width(), height(), left(), top()
        // - visible sizes with border & position relate to closest positioned parent:
        //	  offsetWidth(), offsetHeight(), offsetLeft(), offsetTop()
        // - full content area sizes & scroll position :
        //	  scrollWidth(), scrollHeight(), scrollLeft(), scrollTop()
        // - visible content area sizes :
        //	  clientWidth(), clientHeight()

        position: access_position,
        offset: access_offset,

    });

    tiny.extend(TinyQ.x, {
        setAttributes: set_node_attributes
    });


    /**
     * get/set method helper function
     */
    function access_helper(tinyq, key, value, func, read_one) {

        var nodes = tinyq.nodes;
        var is_read = false;

        if (value === undefined) is_read = true;

        var node_len = nodes.length;
        if (is_read && read_one && nodes.length > 1) node_len = 1;

        var result = '';
        for (var i = 0, len = node_len; i < len; ++i) {
            var node = nodes[i];
            if (!node) continue;
            if (node.nodeType != 1) continue;
            if (is_read) {
                result = func(node, key, result, is_read);
            } else {
                func(node, key, value);
            }
        }

        return is_read ? result : tinyq;

    }

    /**
     * process {} batch parameter for supported methods
     */
    function process_batch_parameter(key, value, is_style) {
        if (typeof key == 'object') {
            value = key;
            key = 0;
            if (is_style) {
                var obj = {};
                for (var key in value) {
                    key = check_style_key(key);
                    obj[key] = value[key];
                }
                value = obj;
            }
        } else if (value !== undefined) {
            var obj = {};
            if (is_style) key = check_style_key(key);
            obj[key] = value;
            value = obj;
        }
        return value;
    }

    //////////////////////////////////////////////////////////
    // TEXT CONTENT & HTML
    //////////////////////////////////////////////////////////
    /**
     * .text()
     */
    function access_text(value) {
        return access_helper(this, 0, value, access_text_func);
    }

    function access_text_func(node, key, val, is_get) {
        if (is_get) {
            val += node.textContent;
            return val;
        } else {
            node.textContent = val;
        }
    }


    //////////////////////////////////////////////////////////
    // HTML
    //////////////////////////////////////////////////////////
    /**
     * .html()
     */
    function access_html(value) {
        return access_helper(this, 0, value, access_html_func, 1);
    }

    function access_html_func(node, key, val, is_get) {
        if (node.nodeType != 1) return '';
        if (is_get) {
            return node.innerHTML;
        } else {
            node.innerHTML = val;
        }
    }

    //////////////////////////////////////////////////////////
    // ATTRIBUTES
    //////////////////////////////////////////////////////////
    /**
     * .attr()
     */
    function access_attribute(key, value) {
        value = process_batch_parameter(key, value);
        return access_helper(this, key, value, access_attr_func, 1);
    }

    function access_attr_func(node, key, val, is_get) {
        if (node.nodeType != 1) return '';
        if (is_get) {
            return node.getAttribute(key);
        } else {
            set_node_attributes(node, val);
        }
    }

    function set_node_attributes(node, attrs) {
        for (var key in attrs) {
            var val = attrs[key];
            if (key == '_text') {
                node.textContent = val;
            } else if (key == '_html') {
                node.innerHTML = val;
            } else if (val == null) {
                node.removeAttribute(key);
            } else {
                node.setAttribute(key, val);
            }
        }
    }


    //////////////////////////////////////////////////////////
    // PROPERTIES
    //////////////////////////////////////////////////////////
    /**
     * .prop()
     */
    function access_property(key, value) {
        value = process_batch_parameter(key, value);
        return access_helper(this, key, value, access_prop_func, 1);
    }

    function access_prop_func(node, key, value, is_get) {
        if (node.nodeType != 1) return '';
        if (is_get) {
            return node[key];
        } else {
            for (var key in value) {
                var val = value[key];
                node[key] = val;
                if (val == null) delete node[key];
            }
        }
    }


    //////////////////////////////////////////////////////////
    // CSS STYLE
    //////////////////////////////////////////////////////////
    function access_style(key, value) {
        value = process_batch_parameter(key, value);
        return access_helper(this, key, value, access_style_func, 1);
    }

    function access_style_func(node, key, value, is_get) {
        if (node.nodeType != 1) return '';
        var style = node.style;
        if (is_get) {
            return style[key];
        } else {
            for (var key in value) {
                var val = value[key];
                key = check_style_key(key);
                if (val == null) val = '';
                style[key] = val;
            }
        }
    }

    var BASE_STYLE_LIST = document.createElement('div').style;
    var STYLE_VENDOR_PREFIX = ['Webkit', 'Moz', 'ms'];
    var _style_prefix;

    function check_style_key(key) {

        key = to_camel_case(key);

        if (key in BASE_STYLE_LIST) return key;

        key = capital_first(key);

        if (_style_prefix) return _style_prefix + key;

        for (var i = 0, len = STYLE_VENDOR_PREFIX.length; i < len; ++i) {
            var prefix = STYLE_VENDOR_PREFIX[i];
            var new_key = prefix + key;
            if (new_key in BASE_STYLE_LIST) {
                _style_prefix = prefix;
                return new_key;
            }
        }

    }

    function capital_first(key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    function to_camel_case(key) {
        key = key.split('-');
        for (var i = 1, len = key.length; i < len; ++i) {
            key[i] = capital_first(key[i]);
        }
        return key.join('');
    }


    //////////////////////////////////////////////////////////
    // CSS CLASS
    //////////////////////////////////////////////////////////
    /**
     * .class() method
     */
    function process_class(action_str) {

        if (typeof action_str != 'string') {
            tiny.error(TinyQ.x.TAG, 'Expect an action string. > Got "' + typeof action_str + '": ', action_str);
            throw new TypeError(G.SEE_ABOVE);
        }

        // a little startup overhead (for the flexible syntax)
        var action_func = prepare_class_actions(action_str);

        var has_check = action_str.indexOf('?') > -1;
        var result = false;

        for (var nodes = this.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!node) continue;
            if (node.nodeType != 1) continue;
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
    // SIZE
    //////////////////////////////////////////////////////////

    var SIZE_PREFIX = ['', 'offset', 'scroll', 'client'];
    var SIZE_TYPE = ['Width', 'Height', 'Left', 'Top'];

    extend_size_methods(TinyQ.prototype);

    // generate methods for width, height, left, top
    function extend_size_methods(def) {
        var i = SIZE_PREFIX.length;
        while (--i > -1) {
            var prefix = SIZE_PREFIX[i];
            var j = SIZE_TYPE.length;
            while (--j > -1) {
                if (i == 3 && j > 1) continue; // skip clientTop & clientLeft
                var type = SIZE_TYPE[j];
                if (prefix == '') type = type.toLowerCase();
                def[prefix + type] = generate_size_method(i, j);
            }
        }
    }

    // generate size method handlers
    function generate_size_method(prefix, type) {
        return function (val) {
            return access_size.call({
                n: this.nodes,
                p: SIZE_PREFIX[prefix],
                t: SIZE_TYPE[type]
            }, val)
        }
    }

    /**
     * access function for size methods
     */
    function access_size(value, prefix, type) {
        return get_size(this.n, this.p, this.t);
    }

    function get_size(nodes, prefix, type) {

        if (nodes.length == 0) {
            // window - always return innerWidth/innerHeight
            var r = window['inner' + type];
            if (r == undefined) r = 0;
            return r;
        }

        var node = nodes[0];
        var node_type = node.nodeType;
        var tag = prefix + type;

        if (node_type == 9) {
            // document - use body instead
            node_type = 1, node = node.body;
        }

        if (node_type != 1) return 0;

        // node
        if (prefix == '') {
            var style = window.getComputedStyle(node);
            return parseFloat(style[type.toLowerCase()]);
        }

        return node[tag];

    }


    //////////////////////////////////////////////////////////
    // POSITIONS
    //////////////////////////////////////////////////////////
    function access_position() { }

    function access_offset() { }

});