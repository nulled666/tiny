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

        boundWidth: get_bound_width, // get style border/padding/margin width

        pos: access_position,  // pos(to_absolute_position)

        box: get_box,
        /**
         * box(type, to_absolute_position)
         * 
         *      box() == box('border')
         *      box('margin')   - box('outer'), get margin box rect
         *      box('border')   - get border box rect == offset box
         *      box('padding')  - box('inner'), get inner box rect (includes scrollbar area)
         *      box('client')   - get inner box rect (without scrollbar area)
         *      box('scroll')   - get full scroll content box rect (without scrollbar area)
         */

        /**
         * following dimension methods are extended in extend_size_methods():
         * 
         *   top()       - get/set border box top (margin box for position: relative)
         *   left()      - get/set border box left (margin box for position: relative)
         *   width()     - get/set boder box width
         *   height()    - get/set boder box height
         * 
         *   scrollTop()     - get/set node.scrollTop
         *   scrollLeft()    - get/set node.scrollLeft
         *   scrollHeight()  - get node.scrollHeight
         *   scrollWidth()   - get node.scrollWidth
         * 
         */

    });

    tiny.extend(TinyQ.x, {
        setAttributes: set_node_attributes
    });

    var _parseFloat = parseFloat;
    var _getComputedStyle = window.getComputedStyle;
    var _get_valid_element = TinyQ.x.getElement;

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
            var node = _get_valid_element(nodes[i]);
            if (!node) continue;
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
        if (is_get) {
            return node[key];
        } else {
            for (var key in value) {
                set_property(node, key, value[key]);
            }
        }
    }

    function set_property(node, key, val) {
        node[key] = val;
        if (val == null) delete node[key];
    }


    //////////////////////////////////////////////////////////
    // CSS STYLE
    //////////////////////////////////////////////////////////
    function access_style(key, value) {
        value = process_batch_parameter(key, value);
        return access_helper(this, key, value, func_access_style, 1);
    }

    function func_access_style(node, key, value, is_get) {
        if (is_get) {
            // get style list
            if (key === undefined) return node.style;
            // get all computed style
            if (key === true) return _getComputedStyle(node);
            // always return computed style
            key = check_style_key(key);
            return _getComputedStyle(node)[key];
        } else {
            for (var key in value) {
                set_style(node, key, value[key]);
            }
        }
    }

    function set_style(node, key, val) {
        key = check_style_key(key);
        if (val == null) val = '';
        node.style[key] = val;
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
            var node = _get_valid_element(nodes[i]);
            if (!node) continue;
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
    //  BOUND BOX SIZES
    //////////////////////////////////////////////////////////

    /**
     * .boundWidth()
     */
    function get_bound_width(type) {

        type = type || 'all';

        var node = _get_valid_element(this.nodes[0]);
        if (!node) return DEFAULT_BOUND();

        return get_bound_area_size(node, type);

    }

    function DEFAULT_BOUND() { return { top: 0, left: 0, right: 0, bottom: 0 } }

    /**
     * get bound box of given style prefix
     */
    function get_bound_area_size(node, type) {

        if (type == 'all') type = 'padding,border,margin';

        var delta = DEFAULT_BOUND();
        var side_list = ['Top', 'Right', 'Bottom', 'Left'];
        var style = _getComputedStyle(node);

        var types = type.split(',');
        var len = types.length;

        while (type = types[--len]) {
            type = type.trim();
            var suffix = type == 'border' ? 'Width' : '';
            var i = 0, side;
            while (side = side_list[i++]) {
                var tag = type + side + suffix;
                delta[side.toLowerCase()] += _parseFloat(style[tag]);
            }
        }

        return delta;

    }


    //////////////////////////////////////////////////////////
    // POSITIONS
    //////////////////////////////////////////////////////////
    /***
     * .pos() get/set position based on border box
     */
    function access_position(x, y, is_absolute) {

        // check parameters
        var val;
        var type_x = typeof x;
        if (x == true) {
            // => (is_absolute)
            is_absolute = true, x = null;
        } else if (x && type_x == 'object') {
            // => ({top,left}, is_absolute)
            val = x;
            is_absolute = y;
        } else if (type_x == 'number' || typeof y == 'number') {
            // => (top, left, is_absolute)
            val = { x: x, y: y };
        }

        var nodes = this.nodes;
        if (val) {
            // ==> set
            for (var i = 0, len = nodes.length; i < len; ++i) {
                set_position(nodes[i], val, is_absolute);
            }
            return this;
        } else {
            // ==> get
            return get_position(nodes[0], is_absolute);
        }

    }

    /**
     * get node position
     */
    function get_position(node, is_absolute) {

        var pos = { x: 0, y: 0 };

        node = _get_valid_element(node);
        if (!node) return rect_obj;

        var style = _getComputedStyle(node);

        // get absolute position for fixed element
        if (style['position'] == 'fixed')
            is_absolute = true;

        if (!is_absolute) {
            pos.x = check_offset_pos(node.offsetLeft);
            pos.y = check_offset_pos(node.offsetTop);
        } else {
            var rect = get_bounding_rect(node);
            pos.x = rect.left + window.pageXOffset;
            pos.y = rect.top + window.pageYOffset;
        }

        return pos;

    }

    // return valid number for offset values of hidden element
    function check_offset_pos(val) {
        return val == null ? 0 : val;
    }


    // generate a default rect
    function DEFAULT_RECT() {
        return { top: 0, right: 0, left: 0, bottom: 0, width: 0, height: 0 };
    }

    /**
     * get client rect of element
     */
    function get_bounding_rect(node, convert) {

        // check if node was detached (method from jquery)
        if (!node.getClientRects().length)
            return DEFAULT_RECT();

        var rect = node.getBoundingClientRect();

        // convert to normal object
        if (convert) {
            var rect_obj = {};
            for (var key in rect) {
                rect_obj[key] = rect[key]
            }
            rect = rect_obj;
        }

        return rect;

    }


    // quick check list
    var POS_KEY = { x: 'Left', y: 'Top' };
    var IS_ABSOLUTE_POS_MODE = { absolute: 1, fixed: 1 };

    /**
     * set node offset position
     */
    function set_position(node, pos, is_absolute) {

        var style = _getComputedStyle(node);
        var is_absolute_pos_mode = IS_ABSOLUTE_POS_MODE[style['position']];
        var pos_style = style['position'];

        // fixed element's postion is already absolute
        if (pos_style == 'fixed') is_absolute = false;

        // determine position diff for document based absolute position
        var base;
        if (is_absolute) {
            base = get_position(node, true);
            var diff = get_position(node);
            base.x -= diff.x;
            // relative positioned element don't need minus this
            if (pos_style == 'absolute') base.y -= diff.y;
        }

        for (var key in pos) {

            var type = POS_KEY[key];
            if (!type) continue;

            var value = pos[key];
            var value_type = typeof value;
            if (value_type == 'number') {
                // only minus margin for absolute positioned elements
                if (is_absolute_pos_mode) value -= _parseFloat(style['margin' + type]);
                // and minus diff for document based absolute position
                if (is_absolute) value -= base[key];
                value += 'px';
            } else if (value_type != 'string') {
                continue;
            }

            set_style(node, type.toLowerCase(), value);

        }

    }


    //////////////////////////////////////////////////////////
    // BOX SIZE
    //////////////////////////////////////////////////////////
    /**
     * .box()  get box size
     */
    function get_box(type, is_absolute) {
        // .box(true) ==> .box('border', true)
        if (typeof type == 'boolean') is_absolute = type, type = 0;
        return get_box_size(this.nodes[0], type, is_absolute);
    }

    // generate a default box size
    function DEFAULT_BOX() { return { width: 0, height: 0 }; }

    // box types
    var BOX_TYPE_TRANSLATE = { outer: 'border', inner: 'padding' };
    var BOX_TYPE = { margin: 1, border: 1, padding: 1, client: 2, scroll: 2 };

    /**
     * get element bounding rect
     */
    function get_box_size(node, type, is_absolute_pos) {

        var box = DEFAULT_BOX();

        // window
        if (TinyQ.x.isWindow(node)) {
            // always innerWidth/innerHeight
            return { width: node.innerWidth, height: node.innerHeight };
        }

        node = _get_valid_element(node);
        if (!node) return box;

        type = BOX_TYPE_TRANSLATE[type] || type;
        type = BOX_TYPE[type] ? type : 'border';
        var op_type = BOX_TYPE[type];

        // get size for 'client' & 'scroll' box
        if (op_type == 2) {
            return { width: node[type + 'Width'], height: node[type + 'Height'] };
        }

        // get 'border' box size, 'inner' & 'margin' also based on this
        box = get_bounding_rect(node, true);

        // adjust size by style values, 'border' box don't need this adjustment
        if (type != 'border') {

            // 'margin' requires adding style margin, other types require minus border width
            var delta = get_bound_area_size(node, type == 'margin' ? 'margin' : 'border');

            var sign = type == 'margin' ? 1 : -1;
            box.width += sign * (delta.left + delta.right);
            box.height += sign * (delta.top + delta.bottom);

        }

        return { width: box.width, height: box.height };

    }


    //////////////////////////////////////////////////////////
    // DIMENSION SHORTHANDS
    //////////////////////////////////////////////////////////

    // method map list, order matters
    var DEM_PREFIX = ['scroll', ''];
    var DEM_TYPE = ['Width', 'Height', 'Left', 'Top'];

    extend_dimension_methods(TinyQ.prototype);

    // generate methods for width, height, left, top
    function extend_dimension_methods(def) {
        var i = DEM_PREFIX.length;
        while (--i > -1) {
            var prefix = DEM_PREFIX[i];
            var j = DEM_TYPE.length;
            while (--j > -1) {
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
            // => get 
            return get_dimension(tinyq.nodes[0], prefix, type);
        } else {
            // ==> set
            set_dimension(tinyq.nodes[0], prefix, type, value);
            return tinyq;
        }
    }

    // quick check list
    var NAME_TO_POS = { Top: 'y', Left: 'x' };

    // get size value
    function get_dimension(node, prefix, type) {

        node = _get_valid_element(node);
        if (!node) return 0;

        if (prefix == '') {
            var pos_name = NAME_TO_POS[type];
            type = type.toLowerCase();
            if (pos_name) {
                // ==> left/top
                return get_position(node)[pos_name];
            } else {
                // ==> width/height
                return get_box_size(node)[type];
            }
        }

        // scrollLeft/scrollTop/scrollWidth/scrollHeight
        return node[prefix + type];

    }

    // set css sizes
    function set_dimension(node, prefix, type, val) {

        node = _get_valid_element(node);
        if (!node) return;

        if (prefix == '') {
            // ==> width, height, left, top

            // direct css style
            if (typeof val != 'number') {
                set_style(node, type.toLowerCase(), val);
                return;
            }

            var style = _getComputedStyle(node);

            // numeric values
            var pos_name = NAME_TO_POS[type];
            if (pos_name) {
                // ==> left, top
                var obj = {};
                obj[pos_name] = val;
                set_position(node, obj);
            } else {
                // ==> width, height - minus padding & border
                if (style['boxSizing'] != 'border-box') {
                    // only minus border & padding for non-border-box
                    var delta = get_bound_area_size(node, 'border,padding');
                    delta = type == 'Width' ? delta.left + delta.right : delta.top + delta.bottom;
                    val = val - delta;
                }
            }

            set_style(node, type.toLowerCase(), val + 'px');

        } else {
            // ==> scrollTop, scrollLeft

            if (!NAME_TO_POS[type]) return;  // scrollWidth/scrollHeight is readonly

            set_property(node, prefix + type, val);

        }
    }

});