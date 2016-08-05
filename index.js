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

        var x = _q1('h1');

        x.before('<div id="test-form"></div>');
        x = x.q('#test-form');
        x.html('\
        <form id="f-form">\
            <input id="f-file" type="file">\
            <fieldset>\
            <input id="f-text" type="text" value="Type here">\
            <input id="f-pwd" type="password" value="password">\
            <input id="f-num" type="number" value="99.99">\
            <input id="f-range" type="range" min ="-2.5" max="3.0" step ="0.1" value="1.7"/>\
            </fieldset>\
            <br>\
            <input id="f-date" type="date" value="2016-05-06">\
            <input id="f-month" type="month" value="2010-05">\
            <input id="f-datetime" type="datetime-local" value="2011-08-09T11:58">\
            <input id="f-time" type="time" value="11:58">\
            <br>\
            <input id="f-chk" type="checkbox" value="check me" >\
            	<input id="f-chk2" type="checkbox" value="check me" checked>\
            <br>\
            <input id="f-r1" type="radio" value="radio off">\
            <input id="f-r2" type="radio" name="fffti" value="radio on">\
            	<input type="radio" name="fffti" value="radio x" checked>\
            <br>\
            <meter id="f-m1" min="200" max="500" value="350"></meter>\
            <progress id="f-p" value="70" max="100">70 %</progress>\
            <br>\
            <select id="f-s" name="select">\
                <option value="select1">Value 1</option> \
                <option value="value 3" selected>Value 2</option>\
                <option>Value 3</option>\
            </select>\
            <select id="f-sm" name="toppings" multiple size=5>\
                <option value="mushrooms">mushrooms\
                <option selected>green peppers\
                <option value="oni" selected>onions\
                <option value="tomatoes">tomatoes\
                <option value="olives">olives\
            </select>\
            <br>\
            <textarea id="f-t" name="textarea" rows="10" cols="50">Write something here</textarea>\
            <button id="f-btn" value="button value">Click me</button>\
            <output id="f-o" name="result">60</output>\
        </form>\
        ');

        var x = _q('#f-text');
        var y = $('#f-text');

        x.value('Test on input[type=text]');

        do_test('text.value()', 99,
            function () {
                return x.value();
            },
            function () {
                return y.val();
            });

        var x = _q('#f-num');
        var y = $('#f-num');

        x.value(19.99);

        do_test('num.value()', 99,
            function () {
                return x.value();
            },
            function () {
                return parseFloat(y.val());
            });

        var x = _q('#f-datetime');
        var y = $('#f-datetime');

        x.value(new Date());

        do_test('datetime.value()', 99,
            function () {
                return x.value().getTime();
            },
            function () {
                return (new Date(y.val())).getTime();
            });

        var x = _q('#f-chk');
        var y = $('#f-chk');

        x.value(true);

        do_test('checkbox.value()', 99,
            function () {
                return x.value();
            },
            function () {
                return y.prop('checked');
            });

        var x = _q('#f-r2');
        var y = $('#f-r2');

        x.value('radio on');

        do_test('radiogroup.value()', 99,
            function () {
                return x.value();
            },
            function () {
                return $('[name=fffti]:checked').val();
            });

        var x = _q('#f-s');
        var y = $('#f-s');

        x.value('Value 3');

        do_test('select.value()', 99,
            function () {
                return x.value();
            },
            function () {
                return y.val();
            });

        var x = _q('#f-sm');
        var y = $('#f-sm');

        x.value(['tomatoes', 'mushrooms']);

        do_test('select[multiple].value()', 99,
            function () {
                return x.value();
            },
            function () {
                return y.val();
            });

        var x = _q('#f-t');
        var y = $('#f-t');

        x.value(['i', 'like', '\ntomatoes', 'and', 'mushrooms']);

        do_test('textarea.value()', 99,
            function () {
                return x.value();
            },
            function () {
                return y.val();
            });

        var x = _q('#f-form');
        var y = $('#f-form');

        do_test('form.value()', 99,
            function () {
                return x.value().length = 1;
            },
            function () {
                var obj = {};
                y.children().each(function (i, node) {
                    var name = node.name;
                    if (!name) name = node.id;
                    obj[name] = $(node).val();
                });
                return obj.length = 1;
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
            var elem = assert_list.q(assert_index);\
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

