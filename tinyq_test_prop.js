require([
    'tinyq_test'
], function (do_test) {

    _warn('text & html ------------------')
    
    var nodes = document.querySelectorAll('pre');

    do_test('.text()', 99,
        function () {
            return _q(nodes).text();
        },
        function () {
            return $(nodes).text();
        });

    var nodes = document.querySelectorAll('.run-code');
    do_test('.html()', 99,
        function () {
            return _q(nodes).html();
        },
        function () {
            return $(nodes).html();
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

    do_test('.html(val)', 99,
        function () {
            return _q(node).html(html21 + count++);
        },
        function () {
            return $(node).html(html21 + count++);
        });

    _q(node).remove();


    _warn('attribute ------------------')

    var nodes = document.querySelectorAll('h3');

    do_test('.attr(val)', 100,
        function () {
            return _q(nodes).attr('class1', 'header test-my-code');
        },
        function () {
            return $(nodes).attr('class2', 'header test-my-code');
        });

    do_test('.attr()', 100,
        function () {
            return _q(nodes).attr('class1');
        },
        function () {
            return $(nodes).attr('class2');
        });

    do_test('.attr({obj})', 100,
        function () {
            return _q(nodes).attr({ class1: null, mark1: 1999 });
        },
        function () {
            return $(nodes).attr({ class2: null, mark2: 2000 });
        });

    do_test('.attr(null)', 1,
        function () {
            return _q(nodes).attr('mark1', null);
        },
        function () {
            return $(nodes).attr('mark2', null);
        });

    _warn('property ------------------')

    var nodes = document.querySelectorAll('h3');

    do_test('.prop()', 1000,
        function () {
            return _q(nodes).prop('innerHTML');
        },
        function () {
            return $(nodes).prop('innerHTML');
        });

    var guid1 = tiny.guid();
    var guid2 = tiny.guid();
    do_test('.prop(value)', 1000,
        function () {
            return _q(nodes).prop('guid', guid1);
        },
        function () {
            return $(nodes).prop('guid', guid2);
        });

    do_test('.prop(null)', 1000,
        function () {
            return _q(nodes).prop('guid', null);
        },
        function () {
            return $(nodes).prop('guid', null);
        });


    _warn('class ------------------')
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

});
