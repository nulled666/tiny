function start() {

    run_all_code();

}

$(start)

function run_all_code() {

    $('.run-code').each(function (index, elem) {
        run_code(elem);
    });

}


function run_code(elem) {

    var code = $(elem).text();
    code = 'var elem = arguments[0]; var result=[];\
        var ASSERT = function(item){ result.push(item);};\
        var FAIL_TEST = function(){ result.push(false); };\n' + code;
    if (code.indexOf('setTimeout(') > -1) {
        code += ';setTimeout(function(){\
            show_run_code_result(elem, result);\
            }, 1500);';
    } else {
        code += ';show_run_code_result(elem, result);';
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