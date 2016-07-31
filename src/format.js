
define([
    './global',
    "./base",
], function (G, tiny) {
    "use strict";

    //////////////////////////////////////////////////////////
    // FORMAT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _format = format_template;

    // defaults for _formatNumber() & _formatDate()
    _format.currencyFormat = '$[,.00]';
    _format.decimalDelimiter = '.';
    _format.thousandsDelimiter = ',';
    _format.dateFormat = 'datetime';

    // localizable date names for date formatting
    _format.dateNames = {
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayAbbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ap: ['AM', 'PM']
    }

    // a cache for shorthand template results
    var _expanded_shorthand_template_cache = {};

    // add to tiny definition
    tiny.x.add({
        format: _format,
        formatNumber: format_number,
        formatDate: format_date,
        htmlSafe: html_safe
    });

    tiny.x.add([
        [Number, { _format: format_number_extension }],
        [Date, { _format: format_date_extension }],
        [String, {
            _htmlSafe: html_safe_extension,
            _format: format_extension
        }]
    ]);

    function format_number_extension(format) { return format_number(this.valueOf(), format) }
    function format_date_extension(format, names) { return format_date(this.valueOf(), format, names) }
    function html_safe_extension(keep_spaces) { return html_safe(this.valueOf(), keep_spaces) }
    function format_extension(obj) { return format_template(this.valueOf(), obj) }

    
    var _error = tiny.error;


    var TAG_HTML_SAFE = '_htmlSafe()' + G.TAG_SUFFIX;
    /**
     * Make string HTML-safe
     * ```
     *   var str = 'task:\n   >> done';
     *   // escape special chars
     *   _htmlSafe(str);
     *   str._htmlSafe() == 'task:<br/>   &gt;&gt; done'
     *   // set true to escape white spaces
     *   str._htmlSafe(true) == 'task:<br/>&nbsp;&nbsp;&nbsp;&gt;&gt;&nbsp;done'
      * ```
     */
    function html_safe(str, keep_spaces) {

        if (typeof str !== 'string') {
            _error(TAG_HTML_SAFE, 'Expect a string. > Got "' + typeof str + '": ', str);
            throw new TypeError(G.SEE_ABOVE);
        }

        str = str.replace(/\&/g, '&amp;')
            .replace(/\>/g, '&gt;')
            .replace(/\</g, '&lt;')
            .replace(/\"/g, '&quot;')
            .replace(/\'/g, '&#39;')
            .replace(/\n/g, '<br/>');

        if (keep_spaces)
            str = str.replace(/\s/g, '&nbsp;');

        return str;

    }


    var TAG_FORMAT_NUMBER = '_formatNumber()' + G.TAG_SUFFIX;
    /**
     * Number format function
     * ```
     *   var num = 123456.789;
     *   num._format() == '123456.789'
     *   num._format('.') == '123457' // round to point
     *   num._format('.00') == '123456.79'
     *   num._format(',') == '123,456.789'
     *   num._format(',.00') == '123,456.79'
     *   num._format('[,.00%] * 100') == '12,345,678.90% * 100'
     *   num._format('Pad: [,00000000.00]') == 'Pad: 00,012,345.68'
     *   num._format('$') == '$123,456.79'  // currency format
     *   num._format('x') == '1e240.c9fbe76c9'
     *   num._format('X.') == '1E241' // uppercase & rounded
     *   num._format('X.00') == '1E240.C9'
     *   num._format('X0000000000,.') == '00 0001 E240'
     * ```
     */
    function format_number(num, format) {

        format = format || '';

        if (format == '$') format = _format.currencyFormat;

        if (typeof num !== 'number') {
            _error(TAG_FORMAT_NUMBER, 'Expect a number. > Got "' + typeof num + '": ', num);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (typeof format !== 'string') {
            _error(TAG_FORMAT_NUMBER, 'Expect a format string. > Got "' + typeof format + '": ', format);
            throw new TypeError(G.SEE_ABOVE);
        }


        var result = '';
        var in_txt = format.includes('['); // check if mixed content

        var token = '';
        var chr = '';

        for (var i = 0, len = format.length + 1; i < len; ++i) {

            chr = format.charAt(i);

            // preserve text
            if (in_txt) {
                if (chr == '[') {
                    in_txt = false;
                } else {
                    result += chr;
                }
                continue;
            }

            // end of token
            if (chr === ']' || chr == '') {

                // parse token
                if (token.includes('x') || token.includes('X')) {
                    result += format_hex_number(num, token);
                } else {
                    result += format_decimal_number(num, token);
                }

                in_txt = true;
                token = '';
                continue;

            }

            // build token
            token += chr;

        }

        return result;
    }

    /**
     * Format Decimal Number
     */
    function format_decimal_number(num, format) {

        // Add commas
        var add_comma = format.includes(',');

        // Percent number
        var is_percent = false;
        if (format.includes('%')) {
            num = num * 100;
            is_percent = true;
        }

        // leave only number and dot chars
        var parts = format.replace(/[^0\.]/g, '').split('.');
        var target_width = 0;

        // set precision
        if (parts.length > 1) {
            num = num.toFixed(parts[1].length);
            target_width = parts[0].length;
        } else {
            num = num.toString();
            target_width = format.length;
        }

        parts = num.split('.');
        var integer_part = parts[0];
        var decimal_part = parts.length > 1 ? _format.decimalDelimiter + parts[1] : '';

        // pad zero
        integer_part = pad_start_with_zero(target_width, integer_part);

        // add commas
        if (add_comma)
            integer_part = insert_char_every(3, _format.thousandsDelimiter, integer_part);

        num = integer_part + decimal_part;

        if (is_percent) num += '%';

        return num;

    }

    /**
     * Format number to hex string
     */
    function format_hex_number(num, format) {

        // Add commas
        var add_comma = format.includes(',');
        var to_uppercase = format.includes('X');

        var parts = num.toString(16).split('.');
        var integer_part = parts[0];
        var decimal_part = parts.length > 1 ? parts[1] : '';

        parts = format.replace(/[^0\.]/g, '').split('.');
        var target_width = 0;

        if (parts.length > 1) {
            target_width = parts[1].length;
            if (target_width > decimal_part.length) {
                decimal_part += '0'.repeat(target_width - decimal_part.length);
            } else if (target_width < decimal_part.length) {
                decimal_part = decimal_part.substring(0, target_width);
            }
            target_width = parts[0].length;
        }

        // pad 0
        integer_part = pad_start_with_zero(target_width, integer_part);

        // add commas
        if (add_comma)
            integer_part = insert_char_every(4, ' ', integer_part);

        if (decimal_part != '') decimal_part = '.' + decimal_part;

        num = integer_part + decimal_part;

        if (to_uppercase) num = num.toUpperCase();

        return num;

    }

    // helper function
    function insert_char_every(width, chr, str) {
        var index = str.length;
        while (index > width) {
            index -= width;
            str = str.substring(0, index) + chr + str.substring(index);
        }
        return str;
    }

    // helper function
    function pad_start_with_zero(width, str) {
        width -= str.length;
        if (width < 1) return str;
        return '0'.repeat(width) + str;
    }


    var TAG_FORMAT_DATE = '_formatDate()' + G.TAG_SUFFIX;
    /**
     * Format Date
     * ```
     *   // set custom localized date name strings
     *   _tiny.format.dateNames = custom_names
     *   // set default format string
     *   _tiny.format.dateFormat = 'datetime'
     *   var d = new Date(1118102950753)
     *   d._format() == d._format('datetime') == '2005-06-07 08:09:10'
     *   d._format('date') == '2005-06-07' // yyyy-MM-dd
     *   d._format('time') == '08:09:10'   // HH:mm:ss
     *   d._format('iso') == '2005-06-07T00:09:10.753Z' // ISO 8601
     *   // FROMAT STRING CODES:
     *    '[]'   = indicates format token, 'yyyy[-M-d]' => 'yyyy-6-7'
     *    'yyyy' = 2009, 'yy' = 09,   'y' = 9        // Year
     *    'M'    = 6,    'MM' = 06                   // Numeric month
     *    'MMM'  = Jun,  'MMMM' = June               // Month name
     *    'd'    = 7,    'dd' = 07                   // Day of the month
     *    'D'    = Tue,  'DD' = Tuesday              // Day of the week
     *    'h'    = 8,    'hh' = 08                   // 12 Hour clock
     *    'H'    = 8,    'HH' = 08                   // 24 Hour clock 
     *    'm'    = 9,    'mm' = 09                   // Minutes
     *    's'    = 10,   'ss' = 10,    'sss' = 753   // Seconds & Milliseconds
     *    'z'    = +08,  'zz' = +0800, 'ZZ' = +08:00 // Timezone
     *    't'    = AM,   // AM / PM
     * ```
     */
    function format_date(date_in, format, names) {

        var date = new Date(); // make a copy to manipulate
        format = format || _format.dateFormat;
        names = names || _format.dateNames;

        if (typeof date_in === 'number') {
            date.setTime(date_in);
        } else if (Object.prototype.toString.call(date_in) === "[object Date]") {
            date.setTime(date_in.getTime());
        } else {
            _error(TAG_FORMAT_DATE, 'Expect a Date.getTime() number or Date object. > Got "' + typeof date + '": ', date);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (typeof format != 'string') {
            _error(TAG_FORMAT_NUMBER, 'Expect a format string. > Got "' + typeof format + '": ', format);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (format == 'iso') {
            format = 'yyyy-MM-ddTHH:mm:ss.sssZ';
            // convert to UTC time
            date.setMinutes((date.getMinutes() + date.getTimezoneOffset()));
        } else if (format == 'datetime') {
            format = 'yyyy-MM-dd HH:mm:ss';
        } else if (format == 'date') {
            format = 'yyyy-MM-dd';
        } else if (format == 'time') {
            format = 'HH:mm:ss';
        }

        // build tokens
        var d = {
            y: date.getYear() % 100,
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours() % 12,
            H: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
            sss: (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5),
            z: Math.abs(Math.round(date.getTimezoneOffset() / 60))
        }

        var dd = {};
        for (var i in d) {
            dd[i + i] = d[i] < 10 ? '0' + d[i] : d[i];
        }

        var tokens = {
            yyyy: date.getFullYear(),
            MMMM: names.month[d.M - 1],
            MMM: names.monthAbbr[d.M - 1],
            DD: names.day[date.getDay()],
            D: names.dayAbbr[date.getDay()],
            t: d.H > 12 ? names.ap[1] : names.ap[0]
        }

        tiny.extend(tokens, dd);
        tiny.extend(tokens, d);

        tokens.z = (date.getTimezoneOffset() < 0 ? '+' : '-') + dd.zz;
        tokens.zz = tokens.z + '00';
        tokens.ZZ = tokens.z + ':00';

        var result = '';
        var in_txt = format.includes('['); // check if mixed content

        var token = '';
        var chr = '';
        var last_chr = '';

        for (var i = 0, len = format.length + 1; i < len; ++i) {

            last_chr = chr;
            chr = format.charAt(i);

            // preserve text
            if (in_txt) {
                if (chr == '[') {
                    in_txt = false;
                } else {
                    result += chr;
                }
                continue;
            }

            // read token
            if (chr === last_chr) {
                token += chr;
                continue;
            }

            // resolve token
            if (tokens[token]) {
                result += tokens[token];
            } else {
                result += token;
            }

            token = chr;

            // enter text mode
            if (chr === ']') {
                in_txt = true;
                last_chr = '';
                token = '';
                continue;
            }

        }

        // done
        return result;

    }


    var TAG_FORMAT = '_format()' + G.TAG_SUFFIX;
    /**
     * Template Format function
     * ```
     *   // expand shorthand template inline
     *   _format('>> ul#my-list.active > li.item > .title :{}', 'text content');
     * 
     *   // expand a template inside <script> tag in a HTML file
     *   _format('#my-template-id', data_object);
     *   // in html file - shorthand template starts with >>
     *   <script type="x-template" id="my-template-id">
     *   ...
     *   ul #my-list .active
     *     li.item
     *       .title :{object_key}
     *   </script>
     * ```
     */
    function format_template(template_str, obj) {

        if (typeof template_str != 'string') {
            _error(TAG_FORMAT, 'Expect a template string. > Got "' + typeof template_str + '": ', template_str);
            throw new TypeError(G.SEE_ABOVE);
        }

        var template_container;
        var template = template_str.valueOf();

        if (template.startsWith('#')) {
            // getting template text from document element
            var id = template.replace('#', '');
            template_container = document.getElementById(id);
            if (!template_container) {
                _error(TAG_FORMAT, 'Template container not found: #' + id);
                throw new ReferenceError(G.SEE_ABOVE);
            }
            template = template_container.innerHTML;
            if (template.includes('{#' + id + '}')) {
                _error(TAG_FORMAT, 'Circular reference to self detected : #' + id);
                throw new ReferenceError(G.SEE_ABOVE);
            }
        }

        // check if it is a shorthand template
        if (template.trim().startsWith('...')) {
            // process shorthand template
            template = template.replace('...', '');
            template = expand_shorthand_template(template);

            // cache expanded template
            if (template_container)
                template_container.innerHTML = template;
        }

        // return template string if no data object is given
        if (obj === undefined) {
            return template;
        }

        // fill template with data content and return
        return render_template(template, obj);

    }


    ////////////////////////////////////////////////////
    // Shorthand Template Processor
    ////////////////////////////////////////////////////

    /**
    * Expand Shorthand Template to HTML Template 2
    */
    function expand_shorthand_template(template) {

        var hash = tiny.hash(template);

        if (_expanded_shorthand_template_cache[hash]) {
            return _expanded_shorthand_template_cache[hash];
        }

        template = template.replace(/[\s\uFEFF\xA0]+$/ig, '');
        template = template.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        var tag_stack = [];

        var result = '';
        var chr = '';

        var last_line_indent = 0;
        var line_indent = -1;
        var indent_base = -1;

        var tag = { class: [], attr: [] };

        // 1-pass loop over the string, no RegExp is used
        // This is a read-ahead action-behind loop
        // So we set len = template.length + 1 to loop over the end of string
        // Ths=us we can get chr == '' as the ending sign
        for (var pos = 0, len = template.length + 1; pos < len; ++pos) {

            // get line indent
            if (line_indent == -1) {
                var indent_counter = 0;
                for (; pos < len; ++pos) {
                    chr = template.charAt(pos);
                    if (chr == '\t' || chr == ' ') {
                        ++indent_counter;
                    } else {
                        // use first line's indent as base
                        if (indent_base == -1) indent_base = indent_counter;
                        line_indent = indent_counter - indent_base;
                        break;
                    }
                }
            }

            // start a line
            chr = template.charAt(pos);

            if (chr == '' || chr == '\n' || chr == '>') {
                // ==> build tag
                // build nested result if jump out
                if (line_indent < last_line_indent)
                    result = build_result_to_level(line_indent, tag_stack);
                // build current tag
                tag = build_shorthand_tag(tag);
                if (tag) tag_stack.push([line_indent, tag]);
                // reset and start a new line
                tag = { class: [], attr: [] };
                last_line_indent = line_indent;
                line_indent = chr == '>' ? line_indent + 2 : -1;
            } else if (chr == ':') {
                // ==> content section
                var end_pos = template.indexOf('\n', pos); // use new line as end
                var start_pos = template.indexOf('{[', pos); // try to find {( start
                if (start_pos > -1 && start_pos < end_pos) {
                    end_pos = template.indexOf(']}', start_pos); // try to find )} end
                    if (end_pos < 0) {
                        _error(TAG_FORMAT, 'Missing close "]}" from ' + start_pos + '.');
                        throw new SyntaxError(G.SEE_ABOVE);
                    }
                    end_pos = template.indexOf('\n', end_pos); // use new line after )}
                }
                if (end_pos < 0) end_pos = len - 1;
                tag.content = template.substring(pos + 1, end_pos);
                pos = end_pos - 1;  // -1 to trigger end of line char
            } else if ('.#['.includes(chr)) {
                // ==> tag attributes
                pos = read_shorthand_segment(chr, pos, len, template, tag);

            } else {
                // ==> tag name
                pos = read_shorthand_segment('', pos, len, template, tag);
            }

        }

        // clear the stack
        result = build_result_to_level(0, tag_stack);

        // cache the result
        _expanded_shorthand_template_cache[hash] = result;

        return result;

    }

    function read_shorthand_segment(type, pos, len, template, tag_cache) {

        var token = '';
        var chr = '';
        var in_mustache = 0;
        var in_attribute = false;

        if (type != '')++pos; // skip the type char

        for (; pos < len; ++pos) {

            chr = template.charAt(pos);

            // keep {} tokens as they are
            if (chr == '}')--in_mustache;
            if (chr == '{')++in_mustache;
            if (in_mustache) {
                token += chr;
                continue;
            }

            // attributes
            if (type == '[' && chr == '=') {
                token += '="';
                in_attribute = true;
                continue;
            }
            if (in_attribute) {
                if (chr == "]") {
                    token += '"';
                    in_attribute = false;
                } else {
                    token += chr;
                    continue;
                }
            }

            if (chr == ' ' || chr == '\t') continue;

            if (chr == '' || '.#[]:>\n'.includes(chr)) {
                if (type == '.') {
                    tag_cache.class.push(token);
                } else if (type == '#') {
                    tag_cache.id = token;
                } else if (type == '[') {
                    tag_cache.attr.push(token);
                    ++pos;
                } else {
                    tag_cache.name = token;
                }
                --pos;  // -1 to trigger control char
                return pos;
            }

            // read in token
            token += chr;

        }

    }

    function build_shorthand_tag(tag) {

        var SINGLETON_TAGS = ',br,img,hr,link,meta,input,';
        var tag_start = '';
        var tag_end = '';

        // build attirbutes first
        if (tag.id) tag_start += ' id="' + tag.id + '"';
        if (tag.class.length > 0) tag_start += ' class="' + tag.class.join(' ') + '"';
        if (tag.attr.length > 0) tag_start += ' ' + tag.attr.join(' ');

        if (!tag.name) {
            // empty tag
            if (tag_start == '') {
                if (tag.content) {
                    return { start: tag.content, end: '' };
                } else {
                    return false;
                }
            }
            // add default tag name
            tag.name = 'div';
        }

        tag_start = '<' + tag.name + tag_start;

        if (SINGLETON_TAGS.indexOf(',' + tag.name + ',') > -1) {
            tag_start += '/>';
        } else {
            tag_start += '>';
            tag_end = '</' + tag.name + '>';
        }

        if (tag.content) tag_start += tag.content;

        return { start: tag_start, end: tag_end };

    }


    /**
     * Expand nested template up to given level
     */
    function build_result_to_level(limit_level, lines) {

        var result = '';
        var item;
        var last_level = -1;
        var level, tag;

        while (item = lines.pop()) {

            level = item[0];

            // if encountered lower level - push back and break out
            if (level < limit_level) {
                lines.push(item);
                break;
            }

            tag = item[1];

            // tag == true, this is a built html fragment - add and continue
            if (tag == true) {
                result = item[2] + result;
                continue;
            }

            // generate tag structure
            var indent = ' '.repeat(level);

            if (tag.end == '') {
                // singleton tags or text content
                result = indent + tag.start + '\n' + result;
            } else if (level < last_level) {
                // tags which have children
                result = indent + tag.start + '\n' + result + indent + tag.end + '\n';
            } else {
                // tags without children
                result = indent + tag.start + tag.end + '\n' + result;
            }

            // next in the same level or go up a level
            last_level = level;

        }

        // put the result back into the stack
        lines.push([last_level, true, result]);

        return result;

    }


    /**
     * Parse & render {} tokens in HTML template string
     */
    function render_template(template, data_obj, parsed_token) {

        var parsed_token = parsed_token || {}; // Processed token cache

        // no need to process
        if (template.indexOf('{') < 0) return template;

        var result = '';
        var last_pos = 0;
        var pos = 0;

        // 1-pass loop over the string, no RegExp is used
        while (true) {

            // seek for {
            pos = template.indexOf('{', last_pos);

            // ==> end - append rest of the template
            if (pos < 0) {
                result += template.substring(last_pos);
                break;
            }

            // add common string
            result += template.substring(last_pos, pos);

            // ==> {[ ]} block
            if (template.charAt(pos + 1) == '[') {
                var start_pos = pos + 2;
                var end_pos = template.indexOf(']}', start_pos);
                if (end_pos < 0) {
                    _error(TAG_FORMAT, 'Missing close "]}" from ' + start_pos + '.');
                    throw new SyntaxError(G.SEE_ABOVE);
                }
                result += template.substring(start_pos, end_pos);
                last_pos = end_pos + 2;
                continue;
            }

            // ==> tokens - seek close
            last_pos = pos;
            pos = template.indexOf('}', last_pos);

            // close } not found
            if (pos < 0) {
                _error(TAG_FORMAT, 'Missing close "}" from ' + last_pos + '.');
                throw new SyntaxError(G.SEE_ABOVE);
            }

            // get token
            var token = template.substring(last_pos + 1, pos);

            // parse token
            if (token.startsWith('?') || token.startsWith('!')) {
                // ==> {?key}{/?key} & {!key}{/!key}
                var r = parse_conditional_block(token, pos + 1, template, data_obj); // pos+1 to skip the }
                result = result + '\n' + r.output + '\n';
                pos = r.end;   // move to block ending
            } else if (token.startsWith('#')) {
                // ==> {#template-id}
                result += format_template(token, data_obj, parsed_token);
            } else {
                // ==> render tokens - ignore block close token
                if (!token.startsWith('/'))
                    result += render_token(token, data_obj, parsed_token);
            }

            // move forward
            last_pos = pos + 1;

        }


        // remove space-only lines
        result = result.replace(/\n[\t ]+\n/g, '\n\n');

        return result;

    }

    /**
     * Parse condition block {?token}{/?token} {!token}{/!token}
     */
    function parse_conditional_block(token, pos, template, data_obj) {

        var result = {
            end: pos,
            output: ''
        };

        // seek for close token
        var open_tag = '{' + token + '}';
        var close_tag = '{/' + token + '}';
        var duplicate_start = pos;
        var end = pos + 1;

        // seek for outmost close tag
        while (end > duplicate_start && end > -1 && duplicate_start > -1) {
            duplicate_start = template.indexOf(open_tag, duplicate_start + 1);
            end = template.indexOf(close_tag, end + 1);
        }

        if (end < 0) {
            _error(TAG_FORMAT, 'Missing close token: ' + close_tag);
            throw new SyntaxError(G.SEE_ABOVE);
        }

        result.end = end + close_tag.length;

        // prepare for child template rendering
        var mark = token.slice(0, 1);
        var real_token = token.substr(1);
        var child_data = fetch_value_by_key(data_obj, real_token);
        var child_template = template.substring(pos, end).trim();

        if (mark == '?' && child_data) {
            // ==> {?token}
            if (!(child_data instanceof Array)) child_data = [child_data];
            for (var i = 0, len = child_data.length; i < len; ++i) {
                result.output += render_template(child_template, child_data[i]);
            }
        } else if (mark == '!' && !child_data) {
            // ==> {!token}
            result.output = render_template(child_template, data_obj);
        }

        result.ok = true;

        return result;

    }

    /**
     * {} Token Renderer
     */
    function render_token(token, obj, parsed_token) {

        if (token.indexOf('\n') > -1) {
            _error(TAG_FORMAT, 'Unexpected "\\n" in token: "' + token + '"');
            throw new SyntaxError(G.SEE_ABOVE);
        }

        // check cache
        var value = parsed_token[token];
        if (value !== undefined)
            return value;

        // prepare key & format string
        var split_pos = token.indexOf('|');
        if (split_pos < 0)
            split_pos = token.length;

        var key = token.substring(0, split_pos);
        var format = token.substring(split_pos + 1);
        var keep_empty_token = true;
        if (key.startsWith('*')) {
            keep_empty_token = false;
            key = key.replace('*', '');
        }

        if (key.indexOf('{') > -1) {
            _error(TAG_FORMAT, 'Missing close "}" : "' + token + '"');
            throw new SyntaxError(G.SEE_ABOVE);
        }

        // get value by key
        if (key == '') {
            // use full object for value
            value = obj;
        } else if (key.startsWith('$')) {
            // language string
            value = _lang(key.replace('$'), '');
        } else {
            // multi-level key
            value = fetch_value_by_key(obj, key);
        }

        // render value by format
        switch (typeof value) {

            case 'string':
                if (format != '' && format != '!html') {
                    // cut string
                    var add_dot = format.indexOf('.') > -1;
                    var len = parseInt(format);
                    if (!isNaN(len)) {
                        var str_len = value.length;
                        if (Math.abs(len) < str_len) {
                            value = len > 0 ? value.substr(0, len) : value.substr(len);
                            if (add_dot)
                                value = len > 0 ? value + '...' : '...' + value;
                        }
                    }
                }
                break;

            case 'number':
                value = format_number(value, format);
                break;

            case 'object':
                if (value instanceof Date) {
                    value = format_date(value, format);
                } else {
                    value = JSON.stringify(obj);
                }
                break;

            case 'undefined':
                value = keep_empty_token ? '{' + token + '}' : '';
                break;

            default:
                value = '';
                break;
        }

        if (!(format == '!html')) {
            value = html_safe(value);
        }

        parsed_token[token] = value;

        return value;

    }

    /**
     * Fetch value from data object
     */
    function fetch_value_by_key(obj, key) {

        if (typeof obj !== 'object') {
            _error(TAG_FORMAT, 'Expect a data Object. > Got "' + typeof obj + '": ', obj);
            throw new TypeError(G.SEE_ABOVE);
        }

        // ==> single level key
        if (!key.includes('.')) return obj[key];

        // ==> multi-level key
        var keys = key.split('.');
        var sub_obj = obj;
        var child_obj;

        for (var i = 0, len = keys.length; i < len; ++i) {

            child_obj = sub_obj[keys[i]];

            if (child_obj !== undefined) {
                sub_obj = child_obj;
            } else {
                tiny.log(TAG_FORMAT, 'Template token value is undefined: {' + key + '}');
                sub_obj = undefined;
                return false;
            }

        };

        return sub_obj;

    }

});
