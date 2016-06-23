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

    var code = $(elem).text();

    code = 'var result = [];\n' + code + ';\nresult;';
    code = code.replace(/\/\/\s+ASSERT/g, 'result.push');

    var result = eval(code);

    var text = [];
    _each(result, function (value, index) {
        if (value !== true) text.push('ASSERT #' + (index + 1) + ' FAILED');
    });
    var tag = $('<div class="result"></div>');
    if (text.length == 0) {
        // -> All OK
        text = 'ASSERT PASSED';
    } else {
        text = text.join('<br/>');
        tag.addClass('failed');
    }
    tag.text(text);

    $(elem).parent().append(tag);

}