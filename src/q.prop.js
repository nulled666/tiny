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

        /**
         * following dimension methods are extended in extend_size_methods():
         * 
         *   text()       - get/set node.textContent (get result includes all nodes)
         *   innerText()  - get/set node.innerText (get result includes all nodes)
         *   html()       - get/set node.innerHTML
         *   outerHTML()  - get/set node.outerHTML
         *   value()      - get/set input control values
         * 
         *   attr()       - get/set node.attributes[key]
         *   prop()       - get/set node's properties
         *   style()      - get/set node.style[key], set key=true to get computed style
         *   class()      - get/set node.className
         * 
         */

        class: process_class,

        show: show_node,
        hide: hide_node,
        toggle: toggle_node,

        boundWidth: get_bound_width, // get style border/padding/margin width

        pos: access_position,  // pos(to_absolute_position)

        box: access_box_size,
        /**
         * box(type, width, height)
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

    var _error = tiny.error;

    var TAG_Q = TinyQ.x.TAG;
    var DISPLAY_MARK = 'tinyq-DISPLAY';
    var _get_valid_element = TinyQ.x.getElement;


    //////////////////////////////////////////////////////////
    // BASIC PROPERTY ACCESS METHODS
    //////////////////////////////////////////////////////////

    var ACCESS_METHOD_LIST = {

        // f: access function handlers
        // k: pre-defined key for single parameter methods. If not set, generate a two parameter (key, value) method.
        // a: read action loop throught all nodes. defualt is read from first one only.
        // p: value prepare function for write action

        'text': { f: access_text, k: 0, a: true },
        'innerText': { f: access_text, k: 1, a: true },
        'html': { f: access_html, k: 0 },
        'outerHTML': { f: access_html, k: 1 },

        'value': { f: access_value },
        'attr': { f: access_attribute },
        'prop': { f: access_property },
        'style': { f: access_style, p: prepare_style_value }

    }

    // append to definition
    extend_access_methods(TinyQ.prototype);

    function extend_access_methods(def) {
        for (var method in ACCESS_METHOD_LIST) {
            def[method] = generate_access_method(ACCESS_METHOD_LIST[method]);
        }
    }

    // generate access method handlers
    function generate_access_method(def) {

        if (def.k != undefined) {
            // ==> .method(value)
            return function (value) {
                return access_helper(this, def.f, def.k, value, def.p, def.a);
            }
        } else {
            // ==> .method(key, value)
            return function (key, value) {
                value = prepare_2_parameters(key, value);
                return access_helper(this, def.f, key, value, def.p);
            }
        }

    }

    //////////////////////////////////////////////////////////
    /**
     * get/set method helper function
     */
    function access_helper(tinyq, func_action, key, value, func_prepare_value, read_all) {

        var nodes = tinyq.nodes;
        var is_read = false;

        if (value === undefined) is_read = true;

        var node_len = nodes.length;

        // read first node only if read_all== false
        if (is_read && !read_all && nodes.length > 1)
            node_len = 1;

        // prepare value if func_prepare is given
        if (!is_read && func_prepare_value)
            value = func_prepare_value(value);

        var result = '';
        for (var i = 0, len = node_len; i < len; ++i) {
            var node = _get_valid_element(nodes[i]);
            if (!node) continue;
            if (is_read) {
                result = func_action(node, key, result, is_read);
            } else {
                func_action(node, key, value);
            }
        }

        return is_read ? result : tinyq;

    }

    /**
     * prepare parameters for two-parameter methods
     */
    function prepare_2_parameters(key, value, is_style) {
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
    /**
     * .text() .innerText()
     */
    function access_text(node, key, val, is_get) {
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
    /**
     * .html() .outerHTML()
     */
    function access_html(node, key, val, is_get) {
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
    /**
     * .value()
     */
    function access_value(node, key, val, is_get) {
        if (is_get) {
            // TODO
        } else {
            // TODO
        }
    }

    //////////////////////////////////////////////////////////
    /**
     * .attr()
     */
    function access_attribute(node, key, val, is_get) {
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
    /**
     * .prop()
     */
    function access_property(node, key, value, is_get) {
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
    /**
     * .style()
     */
    function access_style(node, key, value, is_get) {
        if (is_get) {
            // get style list
            if (key === undefined) return node.style;
            // get all computed style
            if (key === true) return get_computed_style(node);
            // always return computed style
            key = check_style_key(key);
            return key ? get_computed_style(node)[key] : undefined;
        } else {
            var i = value.length, item;
            while (item = value[--i]) {
                set_style(node, item[0], item[1], item[2]);
            }
        }
    }

    /**
     * set node style
     */
    function set_style(node, key, val, important) {
        node.style[key] = val;
        // we need this to set '!important' style
        // NOTE: some properties cannot be set with setProperty()
        // e.g. textShadow, userSelect
        if (important) node.style.setProperty(key, val, 'important');
    }

    /**
     * get node's parent view
     */
    function get_parent_view(node) {
        var view = node.ownerDocument.defaultView;
        // NOTE: safety check code from jquery
        if (!view || !view.opener) view = window;
        return view;
    }

    /**
     * get computed style for element
     */
    function get_computed_style(node) {
        return get_parent_view(node).getComputedStyle(node);
    }

    /**
     * prepare style value input before the write loop
     */
    function prepare_style_value(value) {

        var list = [];

        for (var key in value) {

            var val = value[key], important;

            key = check_style_key(key);
            if (!key) continue;

            if (val == null) {
                val = '';
            } else if (val.endsWith('!')) {
                val = val.substring(0, val.length - 1);
                important = true;
            }

            list.push([key, val, important]);

        }

        return list;

    }


    // helper for convert vendor-prefixed style name
    var BASE_STYLE_LIST = document.createElement('div').style;
    var STYLE_VENDOR_PREFIX = ['Webkit', 'Moz', 'ms'];
    var _style_key_cache = {};

    function check_style_key(key) {

        var real_key = _style_key_cache[key];
        if (real_key != undefined) return real_key;

        // seach in default style list
        real_key = dash_to_camel_case(key);
        if (key in BASE_STYLE_LIST) {
            _style_key_cache[key] = real_key;
            return real_key;
        }

        // search with vendor prefixes
        real_key = capital_first(real_key);
        for (var i = 0, len = STYLE_VENDOR_PREFIX.length; i < len; ++i) {
            var prefix = STYLE_VENDOR_PREFIX[i];
            var prefix_key = prefix + real_key;
            if (prefix_key in BASE_STYLE_LIST) {
                _style_key_cache[key] = prefix_key;
                return prefix_key;
            }
        }

        // not found
        _style_key_cache[key] = null;
        return null;

    }

    function capital_first(key) {
        if (key.length < 1) return ley;
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    // convert dash style key to camel-case
    function dash_to_camel_case(key) {

        // no need to translate
        if (!key.includes('-')) return key;

        // translate the key
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
            _error(TAG_Q, 'Expect a class string. > Got "' + typeof action_str + '": ', action_str);
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
    // SHOW/HIDE/TOGGLE
    //////////////////////////////////////////////////////////
    /**
     * .show()
     */
    function show_node() {
        return set_nodes_display(this, 1);
    }

    /**
     * .hide()
     */
    function hide_node() {
        return set_nodes_display(this, 0);
    }

    /**
     * .toggle()
     */
    function toggle_node() {
        return set_nodes_display(this, -1);
    }

    // helper function
    function set_nodes_display(tinyq, type) {
        var nodes = tinyq.nodes;
        for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = _get_valid_element(nodes[i]);
            if (!node) continue;
            set_display(node, type);
        }
        return tinyq;
    }

    /**
     * set node visibility by style.display
     * TODO: use 'box-supress: hide' when all essential browsers supports it
     */
    function set_display(node, type) {

        var key = 'display';
        var computed_display = get_computed_style(node)[key];
        var style_display = node.style[key];

        // translate toggle to actual show/hide
        if (type == -1) type = computed_display == 'none' ? 1 : 0;

        // skip no-action situations
        if (type == 1 && computed_display != 'none') return;
        if (type == 0 && computed_display == 'none') return;

        if (type == 1) {
            //==> show
            var mark = node[DISPLAY_MARK]; // read original display style value
            type = mark != undefined ? mark : get_default_display_style(node, key);
        } else if (type == 0) {
            //==> hide
            node[DISPLAY_MARK] = style_display; // save display style value
            type = 'none';
        }

        node.style[key] = type;

    }

    var INLINE_ELEMENTS = ',SPAN,B,I,CODE,EM,STRONG,A,BR,IMG,LABEL,OBJECT,SUB,SUP,';
    var INLINE_BLOCK_ELEMENTS = ',BUTTON,INPUT,SELECT,TEXTAREA,';
    var _default_display_style = {};

    /**
     * get default style of given type of element
     */
    function get_default_display_style(node, key) {

        var key = 'display';
        var tag = node.tagName;
        var val = _default_display_style[tag];

        if (val) return val;

        // use a temporary element t oget default style
        var doc = node.ownerDocument;
        var elem = doc.body.appendChild(doc.createElement(tag));
        var display = get_computed_style(elem)[key];
        doc.body.removeChild(elem);

        if (display == 'none') {
            // somebody have 'tagname { display: none }' definition in css file
            // use our short lists to determine default value
            var tag = ',' + tag + ',';
            if (INLINE_ELEMENTS.includes(tag)) {
                display = 'inline';
            } else if (INLINE_BLOCK_ELEMENTS.includes(tag)) {
                display = 'inline-block';
            } else {
                display = 'block';
            }
        }

        // save to cache
        _default_display_style[tag] = display;

        return display;

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
        var style = get_computed_style(node);

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
    function access_position() {

        // check parameters
        var val = process_tri_parameter(arguments, { 'abs': 1 }, ['left', 'top']);
        var type = val[0] ? true : false;
        val = val[1];

        var tinyq = this;
        var nodes = tinyq.nodes;
        if (val) {
            // ==> set
            for (var i = 0, len = nodes.length; i < len; ++i) {
                var node = _get_valid_element(nodes[i]);
                if (!node) return;
                set_position(node, val, type);
            }
            return tinyq;
        } else {
            // ==> get
            return get_position(nodes[0], type);
        }

    }

    function process_tri_parameter(args, types, names) {

        var type, val;
        var index = 0;

        // get type and shift index
        var first = args[index];
        if (types[first]) type = first, ++index;

        var a = args[index], b = args[index + 1];
        if (a != null && typeof a == 'object') {
            val = a;
        } else if (a != undefined || b != undefined) {
            val = {};
            val[names[0]] = a, val[names[1]] = b;
        }

        return [type, val];

    }


    /**
     * get node position
     */
    function get_position(node, is_absolute) {

        var pos = { left: 0, top: 0 };

        node = _get_valid_element(node);
        if (!node) return rect_obj;

        var style = get_computed_style(node);

        // get absolute position for fixed element
        if (style['position'] == 'fixed')
            is_absolute = true;

        if (!is_absolute) {
            pos.left = check_offset_pos(node.offsetLeft);
            pos.top = check_offset_pos(node.offsetTop);
        } else {
            var rect = get_bounding_rect(node);
            var view = get_parent_view(node);
            pos.left = rect.left + view.pageXOffset;
            pos.top = rect.top + view.pageYOffset;
        }

        return pos;

    }

    // return valid number for offset values of hidden element
    function check_offset_pos(val) {
        return val == null ? 0 : val;
    }

    // generate a default rect
    function DEFAULT_RECT() { return { top: 0, right: 0, left: 0, bottom: 0, width: 0, height: 0 } }

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


    /**
     * set node offset position
     */
    function set_position(node, pos_val, is_absolute) {

        var IS_ABSOLUTE_POS_MODE = { absolute: 1, fixed: 1 };

        var style = get_computed_style(node);
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

        // set values
        for (var key in pos_val) {

            var type = capital_first(key);
            if (!type) continue;

            var value = pos_val[key];
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

            node.style[key] = value;

        }

    }


    //////////////////////////////////////////////////////////
    // BOX SIZE
    //////////////////////////////////////////////////////////

    // box types
    var BOX_TYPE = { margin: 1, border: 1, padding: 1, client: 2, scroll: 2, /* need translate: */ outer: -1, inner: -1 };
    var BOX_TYPE_TRANSLATE = { outer: 'border', inner: 'padding' };

    /**
     * .box() get/set box size
     */
    function access_box_size() {

        // check parameters
        var val = process_tri_parameter(arguments, BOX_TYPE, ['width', 'height']);
        var type = val[0];
        val = val[1];

        // tranlate type name
        type = BOX_TYPE_TRANSLATE[type] || type;

        // use default type if not set
        if (!type) type = 'border';


        var tinyq = this;
        var nodes = tinyq.nodes;
        if (val) {
            // ==> set
            for (var i = 0, len = nodes.length; i < len; ++i) {
                var node = _get_valid_element(nodes[i]);
                if (!node) return;
                set_box_size(node, val, type);
            }
            return tinyq;
        } else {
            // ==> get
            return get_box_size(nodes[0], type);
        }

    }


    /**
     * get element bounding rect
     */
    function get_box_size(node, type) {

        var box = { width: 0, height: 0 };

        // window
        if (TinyQ.x.isWindow(node)) {
            // always innerWidth/innerHeight
            return { width: node.innerWidth, height: node.innerHeight };
        }

        node = _get_valid_element(node);
        if (!node) return box;

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


    /**
     * set box size
     */
    function set_box_size(node, size_val, type) {

        if (BOX_TYPE[type] == 2) {
            _error(TAG_Q, 'The client & scroll boxes are read-only.');
            throw new TypeError(G.SEE_ABOVE);
        }

        var IS_SIZE_KEY = { width: 1, height: 1 };
        // calculate bound size for different box type
        var BORDER_BOX_BOUND_DELTA = { padding: 'border', margin: 'margin' };
        var CONTENT_BOX_BOUND_DELTA = { padding: 'padding', border: 'border,padding', margin: 'all' };

        var style = get_computed_style(node);
        var is_border_box = style['boxSizing'] == 'border-box';
        var delta;
        var sign = 1;

        if (is_border_box) {
            if (type == 'padding') sign = -1;
            delta = BORDER_BOX_BOUND_DELTA[type];
        } else {
            delta = CONTENT_BOX_BOUND_DELTA[type];
        }

        if (delta) delta = get_bound_area_size(node, delta);

        // set values
        for (var key in size_val) {

            if (!IS_SIZE_KEY[key]) continue;

            var value = size_val[key];
            var value_type = typeof value;

            if (value_type == 'number') {
                if (delta) {
                    var diff = key == 'width' ? delta.left + delta.right : delta.top + delta.bottom;
                    value -= sign * diff;
                }
                if (value < 0) value = 0;
                value += 'px';
            } else if (value_type != 'string') {
                continue;
            }

            node.style[key] = value;

        }

    }


    //////////////////////////////////////////////////////////
    // DIMENSION SHORTHANDS
    //////////////////////////////////////////////////////////

    // method map list, order matters
    var DIM_PREFIX = ['scroll', ''];
    var DIM_TYPE = ['Width', 'Height', 'Left', 'Top'];

    extend_dimension_methods(TinyQ.prototype);

    // generate methods for width, height, left, top
    function extend_dimension_methods(def) {
        var i = DIM_PREFIX.length;
        while (--i > -1) {
            var prefix = DIM_PREFIX[i];
            var j = DIM_TYPE.length;
            while (--j > -1) {
                var type = DIM_TYPE[j];
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
        var tinyq = this.q, prefix = DIM_PREFIX[this.p], type = DIM_TYPE[this.t];
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
    var IS_POS_NAME = { top: 1, left: 1 };

    // get size value
    function get_dimension(node, prefix, type) {

        node = _get_valid_element(node);
        if (!node) return 0;

        if (prefix == '') {
            type = type.toLowerCase();
            if (IS_POS_NAME[type]) {
                // ==> left/top
                return get_position(node)[type];
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
            type = type.toLowerCase();
            var obj = {};
            obj[type] = val;
            if (IS_POS_NAME[type]) {
                // ==> left, top
                set_position(node, obj);
            } else {
                // ==> width, height 
                set_box_size(node, obj);
            }
        } else {
            // ==> scrollTop, scrollLeft
            // scrollWidth & scrollHeight is readonly
            if (!IS_POS_NAME[type]) return;
            set_property(node, prefix + type, val);
        }
    }

});