requirejs(["src/tiny"], start);

function start() {

    tiny.import();
    tiny.verbose('all');

    build_content_table();
    build_content_table2();

    if (test_code() != true)
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

function do_test(tag, loop, func1, func2) {
    var x, y;
    _time('time001');
    _each(loop, function () { x = func1(); })
    var t1 = _time('time001', false);
    _time('time002');
    _each(loop, function () { y = func2(); })
    var t2 = _time('time002', false);
    _log(tag, '-', t1.toFixed(3), ':', t2.toFixed(3), '(' + x.length + '/' + y.length + ')');
}

function test_code() {

    do_test('tag', 100,
        function () {
            return _q('span');
        },
        function () {
            return $('span');
        });

    do_test('.class', 100,
        function () {
            return _q('.token');
        },
        function () {
            return $('.token');
        });

    do_test('.class.class', 100,
        function () {
            return _q('.function.token');
        },
        function () {
            return $('.function.token');
        });

    do_test('.class .class', 100,
        function () {
            return _q('.run-code .function');
        },
        function () {
            return $('.run-code .function');
        });

    do_test('#id', 100,
        function () {
            return _q('#content-table');
        },
        function () {
            return $('#content-table');
        });

    var node = document.querySelectorAll('.language-javascript');
    do_test('node', 100,
        function () {
            return _q(node);
        },
        function () {
            return $(node);
        });

    var nodelist = document.querySelectorAll('.token');
    do_test('nodelist', 100,
        function () {
            return _q(nodelist);
        },
        function () {
            return $(nodelist);
        });
  
    do_test('filter', 100,
        function () {
            return _q(nodelist).filter('//even');
        },
        function () {
            return $(nodelist).filter(':even');
        });

    do_test('first', 100,
        function () {
            return _q(nodelist).first();
        },
        function () {
            return $(nodelist).first();
        });

    do_test('last', 100,
        function () {
            return _q(nodelist).last();
        },
        function () {
            return $(nodelist).last();
        });

    do_test('children', 100,
        function () {
            return _q(node).children('.function');
        },
        function () {
            return $(node).children('.function');
        });

    do_test('parent', 50,
        function () {
            return _q(nodelist).parent('code');
        },
        function () {
            return $(nodelist).parent('code');
        });

    do_test('closest', 50,
        function () {
            return _q(nodelist).closest('.run-code');
        },
        function () {
            return $(nodelist).closest('.run-code');
        });

    do_test('prev', 100,
        function () {
            return _q(nodelist).prev('.function');
        },
        function () {
            return $(nodelist).prev('.function');
        });
  
    do_test('next', 100,
        function () {
            return _q(nodelist).next('.function');
        },
        function () {
            return $(nodelist).next('.function');
        });

    return true;

}

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
            if (elem.find('.failed').length > 0) {
                elem.removeClass('failed');
                jump_to_error();
                return false;
            }
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

    _time('tinyq');
    var sidebar = _q('#content-table');

    var a_list = _q('.mark');
    a_list.each(function (elem) {
        check_and_append_link(sidebar, elem);
    });
    _time('tinyq');
}

function check_and_append_link(sidebar, elem) {

    elem = _q(elem);
    var name = elem.attr('name');

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


    sidebar.append('<a>', {
        href: '#' + name,
        class: a_class,
        _text: 'xx' + title
    });

}

// ====== content table builder
function build_content_table2() {

    _time('jq');
    var sidebar = $('#content-table');

    var a_list = $('.mark');
    a_list.each(function (i, elem) {
        check_and_append_link2(sidebar, elem);
    });
    _time('jq');
}

function check_and_append_link2(sidebar, elem) {

    elem = $(elem);
    var name = elem.attr('name');

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

    var a = $('<a>', {
        href: '#' + name,
        class: a_class
    }).text(title);

    sidebar.append(a);

}


// ====== code runner for unit tests
var _error_count = 0;

function run_all_code() {

    $('#test-info')
        .text('RUNNING CODE TEST...')
        .removeClass('pass fail')
        .addClass('show');

    var codes = $('.run-code');

    codes.each(function (index, elem) {
        run_code(elem);
        if ($(elem).hasClass('stop')) return false;
    });

    setTimeout(show_run_code_result, 500);

}


function run_code(elem) {

    elem = $(elem);

    var code = elem.text();

    if ($(elem).hasClass('html')) {
        var html_fragment = $(code);
        $(document.body).after(html_fragment);
        return;
    }

    code = '\
        var code_block = arguments[0];\
        var assert_index = 0;\
        var assert_list = code_block.find(".function:contains(ASSERT)");\
        var test_result = true;\
        var get_assert = function(){\
            var elem = $(assert_list.get(assert_index));\
            assert_index++;\
            return elem;\
        };\
        var FLAT = function(obj){ return JSON.stringify(obj) };\
        var ASSERT = function(txt, value){\
            _info(value, " <<<< ASSERT " + txt);\
            var elem = get_assert();\
            if(value){\
                elem.addClass("passed");\
            }else{\
                elem.addClass("failed");\
                _error_count++;\
            }\
        };\
        var FAIL = function(txt){ ASSERT(txt, false); };\
        ' + code;

    tiny.verbose('info');

    try {
        var func = new Function(code);
        func(elem, 'this', 'is', 'a', 'test');
    } catch (e) {
        _error_count++;
        setTimeout(function () {
            _error('=== RUN CODE ERROR ===> ', e);
        }, 500);
        $(elem).addClass('failed');
    }

    tiny.verbose('all');
}

function show_run_code_result() {

    var error_counter = 0;
    var collapsed_elems = $('.content').find(".run-code");

    _each(collapsed_elems, function (elem, label) {

        elem = $(elem);
        var count = elem.find('.failed').length;

        if (count > 0) {
            elem.addClass("failed");
        } else {
            elem.addClass("passed");
        }

    });

    if (_error_count == 0) {

        $('#test-info')
            .addClass('pass')
            .text('ALL CODE TEST PASSED');

        setTimeout(function () {
            $('#test-info').removeClass('show');
        }, 2000);

    } else {

        $('#test-info')
            .addClass('fail')
            .text(_error_count + ' CODE TEST FAILED');

    }

}

