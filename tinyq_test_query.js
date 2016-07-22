define([
    'tinyq_test'
], function (do_test) {

    do_test('tag', 100,
        function () {
            return _q('span');
        },
        function () {
            return $('span');
        });

    do_test('.class', 100,
        function () {
            return _q('.token');
        },
        function () {
            return $('.token');
        });

    do_test('.class.class', 100,
        function () {
            return _q('.function.token');
        },
        function () {
            return $('.function.token');
        });

    do_test('.class .class', 100,
        function () {
            return _q('.run-code .function');
        },
        function () {
            return $('.run-code .function');
        });

    do_test('#id', 100,
        function () {
            return _q('#content-table');
        },
        function () {
            return $('#content-table');
        });

    var node = document.querySelector('.run-code');
    do_test('node', 100,
        function () {
            return _q(node);
        },
        function () {
            return $(node);
        });

    do_test('node.q', 100,
        function () {
            return _q(node).q('.function');
        },
        function () {
            return $(node).find('.function');
        });

    do_test('node.q1', 100,
        function () {
            return _q(node).q1('.function');
        },
        function () {
            return $(node).find('.function').first();
        });

    var nodelist = document.querySelectorAll('.run-code');
    do_test('nodelist.q', 100,
        function () {
            return _q(nodelist).q('.function');
        },
        function () {
            return $(nodelist).find('.function');
        });
    do_test('nodelist.q1', 100,
        function () {
            return _q(nodelist).q1('.function');
        },
        function () {
            return $(nodelist).find('.function').first();
        });

    var nodelist = document.querySelectorAll('.token');
    do_test('nodelist', 100,
        function () {
            return _q(nodelist);
        },
        function () {
            return $(nodelist);
        });

    do_test('filter.function', 50,
        function () {
            return _q(nodelist).filter('.function');
        },
        function () {
            return $(nodelist).filter('.function');
        });

    do_test('filter:contains', 50,
        function () {
            return _q(nodelist).filter('!contains(ASSERT)');
        },
        function () {
            return $(nodelist).filter(':contains(ASSERT)');
        });

    do_test('filter:even', 50,
        function () {
            return _q(nodelist).filter('!even');
        },
        function () {
            return $(nodelist).filter(':odd');
        });

    do_test('eq', 100,
        function () {
            return _q(nodelist).eq(10);
        },
        function () {
            return $(nodelist).eq(10);
        });

    do_test('first', 100,
        function () {
            return _q(nodelist).first();
        },
        function () {
            return $(nodelist).first();
        });

    do_test('last', 100,
        function () {
            return _q(nodelist).last();
        },
        function () {
            return $(nodelist).last();
        });

    do_test('slice', 100,
        function () {
            return _q(nodelist).slice(10, -5);
        },
        function () {
            return $(nodelist).slice(10, -5);
        });

    do_test('parent', 50,
        function () {
            return _q(nodelist).parent('code');
        },
        function () {
            return $(nodelist).parent('code');
        });

    do_test('closest', 10,
        function () {
            return _q(nodelist).closest('.run-code');
        },
        function () {
            return $(nodelist).closest('.run-code');
        });

    var node = _q('code').toArray();
    do_test('children', 100,
        function () {
            return _q(node).children('.function');
        },
        function () {
            return $(node).children('.function');
        });

    do_test('prev', 100,
        function () {
            return _q(nodelist).prev('.function');
        },
        function () {
            return $(nodelist).prev('.function');
        });

    do_test('next', 100,
        function () {
            return _q(nodelist).next('.function');
        },
        function () {
            return $(nodelist).next('.function');
        });

    do_test('toArray', 100,
        function () {
            return _q('.run-code').toArray();
        },
        function () {
            return $('.run-code').toArray();
        });
})