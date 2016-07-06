function start() {

    tiny.import();

    build_content_table();

    setTimeout(run_all_code, 100);

    // the smooth scroll effect
    $(".content-table a").click(function () {
        var hash = $.attr(this, 'href').substr(1);
        smooth_scroll_to(hash);
        return false;
    });

    $('#test-info').on('click', jump_to_error);

    $('.content').on('click', 'pre.collapse', function () {
        expand_pre(this);
    });

}

$(start);


// ====== ui functions
function jump_to_error() {

    var objs = $('.failed');

    if (objs.length < 1) return;

    if (objs.length == 1) {
        smooth_scroll_to(objs, -100);
        return;
    }

    var target;

    objs.each(function (index, elem) {

        elem = $(elem);

        if (elem.prop("tagName") == 'PRE' && elem.find('.failed').length > 0) {
            elem.removeClass('collapse');
        } else if (elem.hasClass('current')) {
            elem.removeClass('current');
            index = (index + 1) < objs.length ? index + 1 : 0;
            target = $(objs.get(index));
            return false;
        }

    });


    if (!target) {
        target = $('.failed:first');
    }

    target.addClass('current');
    smooth_scroll_to(target, -100);

}

function expand_pre(elem) {
    var elem = $(elem);
    elem.removeClass('collapse');
}

function smooth_scroll_to(obj, offset) {

    var is_hash = false;
    var hash = '';
    if (typeof obj == 'string') {
        is_hash = true;
        hash = obj;
        obj = $('a[name="' + hash + '"]');
        if (obj.length < 1) return;
    }

    if (typeof offset !== 'number') {
        offset = 0;
    }

    obj = $(obj);

    $('html, body').animate(
        { scrollTop: obj.offset().top + offset },
        500,
        "swing",
        function () {
            if (is_hash)
                window.location.hash = hash;
        }
    );

}

// ====== content table builder
function build_content_table() {

    var sidebar = $('#content-table');

    var a_list = $('.mark');
    a_list.each(function (index, elem) {
        check_and_append_link(sidebar, elem);
    });

}

function check_and_append_link(sidebar, elem) {

    elem = $(elem);
    var name = elem.attr('name');

    if (typeof name !== 'string') return;

    var parent_elem = elem.parent();
    if (parent_elem.length < 1) return;

    var tag = parent_elem.prop("tagName");

    var title = parent_elem.text();

    var a_class = '';
    if (tag == 'H2') {
        a_class = 'header';
        title = title.toUpperCase();
    } else {
        a_class = 'sub';
    }

    var a = $('<a>', { href: '#' + name, class: a_class });
    a.text(title);

    sidebar.append(a);

}



// ====== code runner for unit tests
var _error_counter = 0;
var _run_code_counter = 0;

function run_all_code() {

    $('#test-info')
        .text('RUNNING CODE TEST...')
        .removeClass('pass fail')
        .addClass('show');

    _error_counter = 0;

    var codes = $('.run-code');

    _run_code_counter = 100;

    codes.each(function (index, elem) {
        run_code(elem);
    });

    _run_code_counter -= 100;

}


function run_code(elem) {

    _run_code_counter++;

    var code = $(elem).text();

    if ($(elem).hasClass('html')) {
        var html_fragment = $(code);
        $(document.body).after(html_fragment);
        _run_code_counter--;
        return;
    }

    code = 'var test_elem = arguments[0]; var test_result = {};\
        var FLAT = function(obj){ return JSON.stringify(obj)};\
        var ASSERT = function(txt, value){ test_result[txt] = value };\
        var FAIL = function(txt){ test_result[txt] = false };\n' + code;
    if (code.indexOf('setTimeout(') > -1) {
        code += ';setTimeout(function(){\
            show_run_code_result(test_elem, test_result);\
            }, 1500);';
    } else {
        code += ';show_run_code_result(test_elem, test_result);';
    }

    try {
        var func = new Function(code);
        func(elem);
    } catch (e) {
        _error_counter++;
        _error('RUN CODE ERROR ===> ', e);
        show_run_code_result(elem, {}, true);
    }

}

function show_run_code_result(elem, result, is_error) {

    elem = $(elem);

    _run_code_counter--;

    var result_index = 0;
    var assert_elems = elem.find(".function:contains(ASSERT)");
    var error = is_error === true;

    _each(result, function (item, label) {

        if (!item) {
            error = true;
            _error_counter++;
        }

        var text = label + (item ? ": PASSED" : ": FAILED");
        var elem = $(assert_elems.get(result_index));
        elem.attr("title", text);
        elem.addClass(item ? "passed" : "failed");

        result_index++;

    });

    elem.addClass(error ? 'failed' : 'passed');


    // last code block returned
    if (_run_code_counter == 0) {

        if (_error_counter == 0) {

            $('#test-info')
                .addClass('pass')
                .text('ALL CODE TEST PASSED');

            setTimeout(function () {
                $('#test-info').removeClass('show');
            }, 2000);

        } else {

            $('#test-info')
                .addClass('fail')
                .text(_error_counter + ' CODE TEST FAILED');

        }


    }

}

