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
        innerText: access_inner_text,
        html: access_html,
        outerHTML: access_outer_html,
        val: access_value,

        attr: access_attribute,
        prop: access_property,

        style: access_style,
        class: process_class,

        pos: get_position,
        offset: get_offset,
        rect: get_rect

        /**
         * following dimension methods are extended in extend_size_methods():
         * 
         *   width()    - get: box().width	    set: style('width', val)
         *   height()   - get: box().height	    set: style('height', val)
         *   top()      - get: box().top	    set: style('top', val)
         *   left()     - get: box().left	    set: style('left', val)
         * 
         *   innerBox() - get: padding box rectangle of element
         *                     position relative to offset parent
         * 
         *   marginBox() - get: margin box rectangle of element
         *                     position relative to offset parent
         * 
         *   clientBox() - get: padding box rectangle of element excluding scrollbars
         *                      position relative to offset parent
         * 
         *   scrollBox() - get: padding box rectangle of element excluding scrollbars
         *                      position relative to offset parent
         * 
         * - visible client area without scrollbars:
         * 	    clientWidth()
         *      clientHeight()
         * - visible client area includes scrollbars:
         *      innerWidth()
         *      innerHeight()
         * - visible sizes with border:
         * 	    offsetWidth() == outerWidth()
         *      offsetHeight() == outerHeight()
         * - full content area sizes:
         * 	    scrollWidth()
         *      scrollHeight()
         * - position relate to closest positioned parent:
         *      offsetLeft()
         *      offsetTop()
         * - scroll position :
         * 	    scrollLeft()
         *      scrollTop()
         */

    });

    tiny.extend(TinyQ.x, {
        setAttributes: set_node_attributes
    });

    var _parseFloat = parseFloat;
    var _getComputedStyle = window.getComputedStyle;

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
        return access_helper(this, 0, value, func_access_text);
    }

    /**
     * .innerText()
     */
    function access_inner_text(value) {
        return access_helper(this, 1, value, func_access_text);
    }

    function func_access_text(node, key, val, is_get) {
        if (is_get) {
            val += key ? node.innerText : node.textContent;
            return val;
        } else {
            if (key) {
                node.innerText = val;
            } else {
                node.textContent = val;
            }
        }
    }


    //////////////////////////////////////////////////////////
    // HTML
    //////////////////////////////////////////////////////////
    /**
     * .html()
     */
    function access_html(value) {
        return access_helper(this, 0, value, func_access_html, 1);
    }

    /**
     * .outerHTML()
     */
    function access_outer_html(value) {
        return access_helper(this, 1, value, func_access_html, 1);
    }

    function func_access_html(node, key, val, is_get) {
        if (node.nodeType != 1) return '';
        if (is_get) {
            return key ? node.outerHTML : node.innerHTML;
        } else {
            if (key && node.parentNode) {
                // set outerHTML only for nodes with a parent
                node.outerHTML = val;
            } else {
                node.innerHTML = val;
            }
        }
    }

    //////////////////////////////////////////////////////////
    // VALUES
    //////////////////////////////////////////////////////////
    /**
     * .val()
     */
    function access_value(value) {
        return access_helper(this, 0, value, func_access_value, 1);
    }

    function func_access_value(node, key, val, is_get) {
        if (node.nodeType != 1) return '';
        if (is_get) {
            // TODO
        } else {
            // TODO
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
        return access_helper(this, key, value, func_access_attribute, 1);
    }

    function func_access_attribute(node, key, val, is_get) {
        if (node.nodeType != 1) return '';
        if (is_get) {
            return key === undefined ? node.attributes : node.getAttribute(key);
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
        return access_helper(this, key, value, func_access_prop, 1);
    }

    function func_access_prop(node, key, value, is_get) {
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
        return access_helper(this, key, value, func_access_style, 1);
    }

    function func_access_style(node, key, value, is_get) {

        if (node.nodeType != 1) return '';

        if (is_get) {
            if (key === undefined) return node.style;
            if (key === true) return _getComputedStyle(node);
            // always return computed style
            key = check_style_key(key);
            return _getComputedStyle(node)[key];
        } else {
            for (var key in value) {
                key = check_style_key(key);
                var val = value[key];
                if (val == null) val = '';
                node.style[key] = val;
            }
        }

    }

    // helper for convert vendor-prefixed style name
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

        // simple return the class attribute
        if (action_str === undefined) return this.attr('class');

        if (typeof action_str != 'string') {
            tiny.error(TinyQ.x.TAG, 'Expect a class string. > Got "' + typeof action_str + '": ', action_str);
            throw new TypeError(G.SEE_ABOVE);
        }

        // a little startup overhead (for the flexible syntax)
        var actions = prepare_class_actions(action_str);
        var has_do = actions.do.length > 0;
        var has_check = !!(actions.check);
        var result = false;

        for (var nodes = this.nodes, i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            if (!node) continue;
            if (node.nodeType != 1) continue;
            var r = do_class_actions(node, actions.do, actions.check);
            if (r == true) {
                result = true;
                if (!has_do) break;      // check only - jump out
                actions.check = false;  // suppress further check
            }
        }

        return has_check ? result : this;

    }

    /**
     * Prepare the action list for className change
     */
    function prepare_class_actions(str) {

        var def_sign;
        if (str.charAt(1) == ':') {
            // batch operation
            def_sign = str.charAt(0);
            str = str.slice(2);
        }

        str = str.replace(/\s+/g, ' ').split(' ');
        var list = {};

        if (def_sign) {
            // ==> batch op
            list[def_sign] = str;
        } else {
            // ==> mixed
            for (var i = 0, len = str.length; i < len; ++i) {
                var item = str[i], sign;
                sign = item.charAt(0);
                if (!'-^?'.includes(sign)) {
                    sign = '+';
                } else {
                    item = item.substring(1);
                }
                // put into action list
                if (!list[sign]) list[sign] = [];
                list[sign].push(item);
            }
        }

        var actions = [];

        // extract check last
        var check_list = list['?'];
        delete list['?'];

        for (var sign in list) {
            var item = list[sign];
            if (item) actions.push(CLASS_ACTIONS[sign].bind(item));
        }

        return { do: actions, check: check_list };

    }

    /**
     * class actions executor
     */
    function do_class_actions(node, actions, check_list) {

        var cl = ' ' + node.className + ' ';
        var new_cl = cl;

        // do the actions
        var i = -1, item;
        while (item = actions[++i])
            new_cl = item(new_cl);

        // if we need to check class
        var result;
        if (check_list)
            result = func_has_class(new_cl, check_list);

        // update only on changed
        new_cl = new_cl.trim();
        if (cl != new_cl) node.className = new_cl;

        return result;

    }

    // class manipulation helper functions
    var CLASS_ACTIONS = {
        '+': func_add_class,
        '-': func_remove_class,
        '^': func_toggle_class
    };

    function func_add_class(cl) {
        var arr = this, i = -1, item;
        while (item = arr[++i]) {
            if (!cl.includes(' ' + item + ' '))
                cl += item + ' ';
        }
        return cl;
    }
    function func_remove_class(cl) {
        var arr = this, i = -1, item;
        while (item = arr[++i]) {
            while (cl.includes(' ' + item + ' '))
                cl = cl.replace(item + ' ', '');
        }
        return cl;
    }
    function func_toggle_class(cl) {
        var arr = this, i = -1, item;
        while (item = arr[++i]) {
            var tag = ' ' + item + ' ';
            if (!cl.includes(tag)) {
                cl += item + ' ';
            } else {
                while (cl.includes(tag)) cl = cl.replace(item + ' ', '');
            }
        }
        return cl;
    }
    function func_has_class(cl, check_list) {
        var arr = check_list, i = -1, item;
        while (item = arr[++i]) {
            if (!cl.includes(' ' + item + ' '))
                return false; // must fullfill all classes
        }
        return true;
    }

    //////////////////////////////////////////////////////////
    // POSITIONS
    //////////////////////////////////////////////////////////
    /***
     * .position() get position relate to offsetParent (excludes margin)
     */
    function get_position() {

        var nodes = this.nodes;
        var pos = { top: 0, left: 0 };

        // window
        if (nodes.length == 0) return pos;

        var node = nodes[0];
        var node_type = node.nodeType;

        // document or not an element
        if (node_type == 9 || node_type != 1) return pos;

        // remove margin to match the top & left value in css style
        var style = _getComputedStyle(node);
        pos = {
            top: calc_border_delta(style, node.offsetTop, 'Top'),
            left: calc_border_delta(style, node.offsetLeft, 'Left')
        };

        return pos;

    }

    /**
     * get offset relate to the document
     */
    function get_offset() {
        var rect = get_bounding_rect(this.nodes[0]);
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        }
    }

    /**
     * .rect()  get bouding rect
     */
    function get_rect(type) {
        return get_bounding_rect(this.nodes[0], type);
    }

    var RECT_TYPE = { margin: 1, border: 1, inner: 1, client: 2, scroll: 2 };

    // get element bounding rect
    function get_bounding_rect(node, type, is_absolute_pos) {

        type = RECT_TYPE[type] ? type : 'border';
        var op_type = RECT_TYPE[type];

        var rect_obj = { top: 0, right: 0, left: 0, bottom: 0, width: 0, height: 0 };

        if (!node) return rect_obj;

        var node_type = node.nodeType;

        // document - use body instead
        if (node_type == 9)
            node_type = 1, node = node.body;

        // require getBoundingClientBox()
        if (op_type == 1 || is_absolute_pos) {
            // check if node was detached (method from jquery)
            if (!node.getClientRects().length) return rect_obj;
            var rect = node.getBoundingClientRect();

            // convert to normal object
            for (var key in rect) {
                rect_obj[key] = rect[key]
            }
        }

        // calculate postion
        if (is_absolute_pos) {
            // ==> absolute postion - adjust against window scroll offset
            rect_obj.top += window.pageYOffset;
            rect_obj.left += window.pageXOffset;
        } else {
            // ==> position relate to offset parent
            rect_obj.top = node.offsetTop;
            rect_obj.left = node.offsetLeft;
        }

        // process width & height
        if (type != 'border') {
            // ==> calculate border delta for inner/margin, border box == bounding box
            var delta = get_box_delta(node, type);
            if (type == 'margin') {
                rect_obj.top -= delta.top;
                rect_obj.left -= delta.left;
                rect_obj.bottom += delta.bottom;
                rect_obj.right += delta.right;
                rect_obj.width += delta.left + delta.right;
                rect_obj.height += delta.top + delta.bottom;
            } else if (type == 'inner') {
                rect_obj.top += delta.top;
                rect_obj.left += delta.left;
                rect_obj.bottom -= delta.bottom;
                rect_obj.right -= delta.right;
                rect_obj.width -= delta.left + delta.right;
                rect_obj.height -= delta.top + delta.bottom;
            } else {
                // ==> client & scroll
                rect_obj.top += delta.top;
                rect_obj.left += delta.left;
                rect_obj.width = node[type + 'Width'];
                rect_obj.height = node[type + 'Height'];
                rect_obj.bottom = rect_obj.top + rect_obj.height;
                rect_obj.right = rect_obj.left + rect_obj.width;
            }
        }

        return rect_obj;

    }

    function get_box_delta(node, type) {

        var list = ['Top', 'Right', 'Bottom', 'Left'];

        var is_inner = type != 'margin';
        var prefix = is_inner ? 'border' : 'margin';
        var suffix = is_inner ? 'Width' : '';
        var style = _getComputedStyle(node);

        var delta = {}, i = 0, side;
        while (side = list[i++]) {
            var tag = prefix + side + suffix;
            delta[side.toLowerCase()] = _parseFloat(style[tag]);
        }

        return delta;

    }

    //////////////////////////////////////////////////////////
    // DIMENSIONS
    //////////////////////////////////////////////////////////

    // method map list, order matters
    var DEM_PREFIX = ['client', 'margin', 'outer', 'offset', 'inner', 'scroll', ''];
    var DEM_TYPE = ['Width', 'Height', 'Left', 'Top'];

    extend_dimension_methods(TinyQ.prototype);

    // generate methods for width, height, left, top
    function extend_dimension_methods(def) {
        var i = DEM_PREFIX.length;
        while (--i > -1) {
            var prefix = DEM_PREFIX[i];
            var j = DEM_TYPE.length;
            while (--j > -1) {
                if (i == 0 && j > 1) continue; // no clientTop/clientLeft
                var type = DEM_TYPE[j];
                if (prefix == '') type = type.toLowerCase();
                def[prefix + type] = generate_dimension_method(i, j);
            }
        }
    }

    // generate dimension method handlers
    function generate_dimension_method(prefix, type) {
        if (prefix == 2) prefix = 3; // outer == offset
        return function (val) {
            return access_dimension.call({
                q: this,
                p: prefix,
                t: type
            }, val)
        }
    }

    /**
     * access function for dimension methods
     */
    function access_dimension(value) {
        var tinyq = this.q, prefix = DEM_PREFIX[this.p], type = DEM_TYPE[this.t];
        if (value == undefined) {
            // => get sizes
            return get_dimension(tinyq, prefix, type);
        } else {
            // => set sizes - css sizes only
            if (prefix !== '') {
                tiny.error(TinyQ.x.TAG, 'This property is read-only: ', prefix + type);
                throw new TypeError(G.SEE_ABOVE);
            }
            set_dimension(tinyq, type, value);
            return tinyq;
        }
    }

    // fast check list
    var IS_TOP_LEFT = { Top: 1, Left: 1 };
    var IS_INNER_MARGIN = { inner: 1, margin: 1 };

    // get size value
    function get_dimension(tinyq, prefix, type) {

        var nodes = tinyq.nodes;

        if (nodes.length == 0) {
            // window - always return innerWidth/innerHeight
            var r = window['inner' + type];
            if (r == undefined) r = 0;
            return r;
        }

        // only return first element sizes
        var node = nodes[0];
        var node_type = node.nodeType;
        var tag = prefix + type;
        var is_top_left = IS_TOP_LEFT[type];

        // document - use body instead
        if (node_type == 9) {
            node_type = 1, node = node.body;
        }

        // element node only
        if (node_type != 1) return 0;

        // top()/left() => marginTop()/marginLeft()
        if (is_top_left && prefix == '') prefix = 'margin';

        if (prefix == '') {
            // ==> css dimensions width()/height()
            type = type.toLowerCase();
            var val = _getComputedStyle(node)[type];
            return _parseFloat(val);
        } else if (IS_INNER_MARGIN[prefix]) {
            // ==> border box dimensions inner***()/margin***()
            var val = node['offset' + type];
            var style = _getComputedStyle(node);
            return calc_border_delta(style, val, type, prefix == 'inner');
        }

        return node[tag];

    }

    // helpers for border add/remove calculation
    var DEM_POS_NAMES = ['Top', 'Right', 'Bottom', 'Left'];
    var DEM_POS_DELTA_LIST = { Top: [0], Left: [3], Width: [1, 3], Height: [0, 2] };

    function calc_border_delta(computed_style, val, type, is_inner_or_margin) {

        var list = DEM_POS_DELTA_LIST[type];
        var is_top_left = IS_TOP_LEFT[type];
        var prefix = is_inner_or_margin ? 'border' : 'margin';
        var suffix = is_inner_or_margin && is_top_left ? 'Width' : '';

        var delta = 0, i = 0, side;
        while (side = DEM_POS_NAMES[list[i++]]) {
            var tag = prefix + side + suffix;
            delta += _parseFloat(computed_style[tag]);
        }

        // invert if calculate Top/Left
        var minus_or_plus = is_inner_or_margin ^ is_top_left;

        return minus_or_plus ? val - delta : val + delta;

    }

    // set css sizes
    function set_dimension(tinyq, type, val) {
        type = type.toLowerCase();
        if (typeof val == 'number') val = val + 'px';
        access_style.call(tinyq, type, val);
    }

});