require([
    'tinyq_test'
], function (do_test) {

    var nodes = document.querySelectorAll('pre');

    do_test('add class', 99,
        function () {
            return _q(nodes).class('passed failed test ok collapse');
        },
        function () {
            return $(nodes).addClass('passed failed test ok collapse');
        });

    do_test('remove class', 99,
        function () {
            return _q(nodes).class('-passed -failed -test -ok -collapse');
        },
        function () {
            return $(nodes).removeClass('passed failed test ok collapse');
        });

    do_test('add & remove', 99,
        function () {
            return _q(nodes).class('passed failed test ok collapse')
                .class('-passed -failed -test -ok -collapse');
        },
        function () {
            return $(nodes).addClass('passed failed test ok collapse')
                .removeClass('passed failed test ok collapse');
        });

    do_test('mixed action', 99,
        function () {
            return _q(nodes)
                .class('passed -run-code ^collapse')
                .class('-passed -collapse ^run-code ?run-code');
        },
        function () {
            return $(nodes).addClass('passed').removeClass('run-code').toggleClass('collapse')
                .removeClass('passed collapse').toggleClass('run-code').hasClass('run-code');
        });

    do_test('.text()', 99,
        function () {
            return _q(nodes).text();
        },
        function () {
            return $(nodes).text();
        });

    _q('h1').prepend('<div id="test-me"></div>');
    var node = _q('#test-me').nodes[0];
    var html21 = '<a href="#" class="test21"><img alt="21">q21</a> <b>q21</b>';
    var count = 0;
    do_test('.text(val)', 99,
        function () {
            return _q(node).text(html21 + count++);
        },
        function () {
            return $(node).text(html21 + count++);
        });
    _q(node).remove();

});
