function start() {

    build_content_table();

    $('.content').on('click', 'pre.collapse', expand_pre);

    setTimeout(run_all_code, 100);

}

$(start)

function expand_pre() {
    var elem = $(this);
    elem.removeClass('collapse');
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

function run_all_code() {

    $('#test-info')
        .text('RUNNING CODE TEST...')
        .removeClass('pass fail')
        .addClass('show');

    _error_counter = 0;

    var codes = $('.run-code');
    codes.last().addClass('last');

    codes.each(function (index, elem) {
        run_code(elem);
    });

}


function run_code(elem) {

    var code = $(elem).text();
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
        show_run_code_result(elem, {}, true);
    }

}

function show_run_code_result(elem, result, is_error) {

    elem = $(elem);

    var result_index = 0;
    var assert_elems = elem.find(".function:contains(ASSERT)");
    var error = is_error === true;

    _each(result, function (item, label) {

        if (item === false) {
            error = true;
            _error_counter++;
        }

        var text = label + (item ? ": PASSED" : ": FAILED");
        var elem = $(assert_elems.get(result_index));
        elem.attr("title", text);
        elem.addClass(item ? "passed" : "failed");

        result_index++;

    });

    var parent = $(elem).parent();
    parent.addClass(error ? 'failed' : 'passed');

    if (elem.hasClass('last')) {

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