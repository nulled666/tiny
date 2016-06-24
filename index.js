function start() {

    run_all_code();

}

$(start)

function run_all_code() {

    $('.run-code').each(function (index, elem) {
        run_code(elem);
    });

}

var _code_result = [];

function ASSERT(val) {
    _code_result.push(val);
}

function run_code(elem) {

    elem = $(elem);

    var code = elem.text();

    _code_result = [];
    eval(code);

    var result_index = 0;
    var comments = elem.find(".function");
    comments.each(function (index, item) {
        item = $(item);
        var tag_text = item.text();
        if (tag_text == 'ASSERT') {
            if (_code_result[result_index] === true) {
                item.addClass("passed");
            } else {
                item.addClass("failed");
            }
            result_index++;
        }
    });

}