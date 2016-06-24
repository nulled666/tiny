_tiny.showLog(true);



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

    elem = $(elem);

    var code = elem.text();

    code = 'var result = [];\n' + code + ';\nresult;';
    code = code.replace(/\/\/\s+ASSERT/g, 'result.push');

    var result = eval(code);
    
    var comments = elem.find(".comment");
    var result_index = 0;
    comments.each(function (index, item) {
        item = $(item);
        var line = item.text();
        if (line.search(/\/\/\s+ASSERT\(/) > -1) {
        _log(line)
            if (result[result_index] === true) {
                item.addClass("passed");
            } else {
                item.addClass("failed");
            }
            result_index++;
        }
    });

}