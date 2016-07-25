require([
    'tinyq_test'
], function (do_test) {

        var nodes = document.querySelectorAll('pre');

        do_test('add/remove class', 99,
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
            

});
