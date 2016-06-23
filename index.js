_tiny.showLog(true);

function start() {

	run_all_code();

}

$(start)

function run_all_code() {

	$('code.run').each(function (index, elem) {
		run_code(elem)
	})

}

function run_code(elem) {

	var code = elem.innerText;

	var expected_result = $(elem).parent().next().text()

	var result = eval(code)

	if (expected_result.indexOf('!'))
		result = '=' + typeof result

	console.log(expected_result, result)

}