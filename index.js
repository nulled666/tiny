function start() {

    build_content_table();
    
    setTimeout(run_all_code, 100);

}

$(start)


// ====== content table builder
function build_content_table() {

    var sidebar = $('#sidebar');

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

    var a_class ='';
    if(tag == 'H2'){
        a_class = 'header';
        title = title.toUpperCase();
    }
    
    var a = $('<a>', { href: '#' + name, class: a_class });
    a.text(title);

    sidebar.append(a);

}



// ====== code runner for unit tests
function run_all_code() {

    $('.run-code').each(function (index, elem) {
        run_code(elem);
    });

}


function run_code(elem) {

    var code = $(elem).text();
    code = 'var test_elem = arguments[0]; var test_result = [];\
        var ASSERT = function(item){ test_result.push(item);};\
        var FAIL_TEST = function(){ test_result.push(false); };\n' + code;
    if (code.indexOf('setTimeout(') > -1) {
        code += ';setTimeout(function(){\
            show_run_code_result(test_elem, test_result);\
            }, 1500);';
    } else {
        code += ';show_run_code_result(test_elem, test_result);';
    }

    var func = new Function(code);

    func(elem);

}

function show_run_code_result(elem, result) {

    var result_index = 0;
    var comments = $(elem).find(".function");

    comments.each(function (index, item) {
        item = $(item);
        var tag_text = item.text();
        if (tag_text == 'ASSERT') {
            if (result[result_index] === true) {
                item.attr("title", "Code Test: PASSED");
                item.addClass("passed");
            } else {
                item.attr("title", "Code Test: FAILED");
                item.addClass("failed");
            }
            result_index++;
        }
    });

}