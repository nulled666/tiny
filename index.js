function start() {

    tiny.import();
    tiny.verbose(true);

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

$(start);

function test_code() {
    // var str = '                                                                            {';
    // var char = '';

    // console.time('find');
    // _each(1000000, function () {
    //     find_it(str);
    // })
    // console.timeEnd('find');

    // console.time('find2');
    // _each(1000000, function () {
    //     find_it2(str);
    // })
    // console.timeEnd('find2');

    // console.time('indexOf');
    // _each(1000000, function () {
    //     str.indexOf(/[^ \t]/);
    // })
    // console.timeEnd('indexOf');

    //     var x = '...' +
    //     'li.item[id={id}]\n'+
    //     '  .title :{title}\n' +
    //     '  .tags :{tasks} TASKS <i>/</i> {people} PEOPLE'
    //     x._format();
    // var result =
    //     '...\n' +
    //     'li.test:{(\n'+
    //     '  Output {token} text\n' +
    //     '  with new line.)}\n'+
    //     '  b :This Might mess up';
    // result = result._format({ token: 123 });
    // _log(result);

    // return true;
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

    var code = $(elem).text();

    if ($(elem).hasClass('html')) {
        var html_fragment = $(code);
        $(document.body).after(html_fragment);
        return;
    }

    code = '\
        var code_block = $(arguments[0]);\
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

    try {
        var func = new Function(code);
        func(elem, 'this', 'is', 'a', 'test');
    } catch (e) {
        _error_count++;
        _error('=== RUN CODE ERROR ===> ', e);
    }

}

function show_run_code_result() {

    var error_counter = 0;
    var collapsed_elems = $('.content').find(".collapse.run-code");

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

