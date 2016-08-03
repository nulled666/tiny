requirejs([
    "src/tiny",
    "lib/prism"
], start);

function start() {

    tiny.import();
    tiny.verbose('all');

    build_content_table();

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

function test_code() {

    require([
        'tinyq.test',
        //'tinyq.test.base',
        //'tinyq.test.prop',
    ], function (do_test) {

        _warn('---------')

    _warn('positions ------------------')

    var x = _q('.run-code');
    var y = $('.run-code');
 
    do_test('.width(160)', 1,
        function () {
            return x.width(160);
        },
        function () {
            return y.outerWidth(160);
        });

    do_test('.height(100)', 1,
        function () {
            return x.height(100);
        },
        function () {
            return y.outerHeight(100);
        });

    do_test('.width()', 1,
        function () {
            return x.width();
        },
        function () {
            return y.outerWidth();
        });

    do_test('.height()', 1,
        function () {
            return x.height();
        },
        function () {
            return y.outerHeight();
        });

    do_test('.box(margin).width', 1,
        function () {
            return x.box('margin').width;
        },
        function () {
            return y.outerWidth(true);
        });

    do_test('.box(margin).height', 1,
        function () {
            return x.box('margin').height;
        },
        function () {
            return y.outerHeight(true);
        });

    do_test('.box(120, 90)', 1,
        function () {
            return x.box(120, 90);
        },
        function () {
            return y.outerHeight(120).outerWidth(90);
        });

    do_test('.box(border).width', 1,
        function () {
            return x.box().width;
        },
        function () {
            return y.outerWidth();
        });

    do_test('.box(border).height', 1,
        function () {
            return x.box().height;
        },
        function () {
            return y.outerHeight();
        });

    do_test('.box("inner", {1, 80})', 1,
        function () {
            return x.box("inner", { width: 1, height: 80 });
        },
        function () {
            return y.innerHeight(100).innerWidth(80);
        });

    do_test('.box(inner).width', 1,
        function () {
            return x.box('inner').width;
        },
        function () {
            return y.innerWidth();
        });

    do_test('.box(inner).height', 1,
        function () {
            return x.box('inner').height;
        },
        function () {
            return y.innerHeight();
        });

    do_test('.box(client).width', 1,
        function () {
            return x.box('client').width;
        },
        function () {
            return y.get(0).clientWidth;
        });

    do_test('.box(client).height', 1,
        function () {
            return x.box('client').height;
        },
        function () {
            return y.get(0).clientHeight;
        });

    do_test('.box(scroll).width', 1,
        function () {
            return x.box('scroll').width;
        },
        function () {
            return y.get(0).scrollWidth;
        });

    do_test('.box(scroll).height', 1,
        function () {
            return x.box('scroll').height;
        },
        function () {
            return y.get(0).scrollHeight;
        });

    do_test('.width(auto)', 1,
        function () {
            return x.width('');
        },
        function () {
            return y.width('');
        });

    do_test('.height(auto)', 1,
        function () {
            return x.height('');
        },
        function () {
            return y.height('');
        });   
        _warn('---------')

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

    $(document.body).animate(
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
        _text: title
    });

}

// ====== code runner for unit tests
var _error_count = 0;

function run_all_code() {

    _time('run code');

    _q('#test-info')
        .text('RUNNING CODE TEST...')
        .class('-pass -fail show');

    var codes = _q('.run-code');

    codes.each(function (elem) {
        run_code(elem);
        if (elem.class('?stop')) return false;
    });

    setTimeout(show_run_code_result, 500);

    _time('run code');

}

function run_code(elem) {

    var code = elem.text();

    if (elem.class('?html')) {
        var html_fragment = _q(code);
        _q(document.body).after(html_fragment);
        return;
    }

    code = '\
        var code_block = arguments[0];\
        var assert_index = 0;\
        var assert_list = code_block.q(".function").filter("@contains(ASSERT)");\
        var test_result = true;\
        var get_assert = function(){\
            var elem = assert_list.get(assert_index);\
            assert_index++;\
            return elem;\
        };\
        var FLAT = function(obj){ return JSON.stringify(obj) };\
        var ASSERT = function(txt, value){\
            _info(value, " <<<< ASSERT " + txt);\
            var elem = get_assert();\
            if(value){\
                elem.class("passed");\
            }else{\
                elem.class("failed");\
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
        elem.class('failed');
    }

    tiny.verbose('all');
}

function show_run_code_result() {

    var error_counter = 0;
    var code_block = _q(".run-code");

    code_block.each(function (elem) {

        var count = elem.q('.failed').count;

        if (count > 0) {
            elem.class("failed");
        } else {
            elem.class("passed");
        }

    });

    if (_error_count == 0) {

        _q('#test-info')
            .class('pass')
            .text('ALL CODE TEST PASSED');

        setTimeout(function () {
            _q('#test-info').class('-show');
        }, 2000);

    } else {

        _q('#test-info')
            .class('fail')
            .text(_error_count + ' CODE TEST FAILED');

    }

}

