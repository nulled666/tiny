define([
    'tinyq_test'
], function (do_test) {

    _warn('query', '--------------------------------')

    do_test('q(#id)', 1000,
        function () {
            return _q('#content-table');
        },
        function () {
            return $('#content-table');
        });

    do_test('q(tag)', 100,
        function () {
            return _q('span');
        },
        function () {
            return $('span');
        });

    do_test('q(.class)', 100,
        function () {
            return _q('.token');
        },
        function () {
            return $('.token');
        });

    do_test('q(.class.class)', 100,
        function () {
            return _q('.function.token');
        },
        function () {
            return $('.function.token');
        });

    do_test('q(.class .class)', 100,
        function () {
            return _q('.run-code .function');
        },
        function () {
            return $('.run-code .function');
        });

    var html = '<a href="#" class="test"><img alt="null">Test</a><b>test</b>';
    do_test('q(html, attr)', 300,
        function () {
            return _q(html, { x: 'test.htm', title: 'test' });
        },
        function () {
            return $(html, { x: 'test.htm', title: 'test' });
        });

    var node = document.querySelector('.run-code');
    do_test('q(node)', 10000,
        function () {
            return _q(node);
        },
        function () {
            return $(node);
        });

    do_test('node.q()', 1000,
        function () {
            return _q(node).q('.function');
        },
        function () {
            return $(node).find('.function');
        });

    do_test('node.q1()', 1000,
        function () {
            return _q(node).q1('.function');
        },
        function () {
            return $(node).find('.function').first();
        });

    var nodelist = document.querySelectorAll('.token');
    do_test('q(nodelist)', 100,
        function () {
            return _q(nodelist);
        },
        function () {
            return $(nodelist);
        });

    var nodelist = document.querySelectorAll('.run-code');
    do_test('nodelist.q()', 100,
        function () {
            return _q(nodelist).q('.function');
        },
        function () {
            return $(nodelist).find('.function');
        });
    do_test('nodelist.q1()', 100,
        function () {
            return _q(nodelist).q1('.function');
        },
        function () {
            return $(nodelist).find('.function').first();
        });

    var nodes = _q('.function').toArray();
    do_test('.add(.selector)', 10,
        function () {
            return _q(nodes).add('.token');
        },
        function () {
            return $(nodes).add('.token');
        });

    var add_nodes = _q('.token').toArray();
    do_test('.add(nodes)', 10,
        function () {
            return _q(nodes).add(add_nodes);
        },
        function () {
            return $(nodes).add(add_nodes);
        });

    _warn('filter', '--------------------------------')

    var nodelist = document.querySelectorAll('.token');

    do_test('.is()', 50,
        function () {
            return _q(nodelist).is('.function');
        },
        function () {
            return !$(nodelist).is('.function');
        });

    do_test('.filter()', 50,
        function () {
            return _q(nodelist).filter('.function');
        },
        function () {
            return $(nodelist).filter('.function');
        });

    var nodelist = document.querySelectorAll('code');
    do_test('.filter(@has)', 50,
        function () {
            return _q(nodelist).filter('@has(.comment)');
        },
        function () {
            return $(nodelist).has('.comment');
        });

    do_test('.filter(@contains)', 50,
        function () {
            return _q(nodelist).filter('@contains(ASSERT)');
        },
        function () {
            return $(nodelist).filter(':contains(ASSERT)');
        });

    do_test('.filter(@visible)', 500,
        function () {
            return _q(nodelist).filter('@visible');
        },
        function () {
            return $(nodelist).filter(':visible');
        });


    _warn('collection', '--------------------------------')

    do_test('.get()', 1000,
        function () {
            return _q(nodelist).get(10);
        },
        function () {
            return $(nodelist).eq(10);
        });

    do_test('.first()', 1000,
        function () {
            return _q(nodelist).first();
        },
        function () {
            return $(nodelist).first();
        });

    do_test('.last()', 1000,
        function () {
            return _q(nodelist).last();
        },
        function () {
            return $(nodelist).last();
        });

    do_test('.slice()', 1000,
        function () {
            return _q(nodelist).slice(10, -5);
        },
        function () {
            return $(nodelist).slice(10, -5);
        });

    do_test('.toArray()', 100,
        function () {
            return _q('.run-code').toArray();
        },
        function () {
            return $('.run-code').toArray();
        });

    do_test('.eachNode()', 100,
        function () {
            return _q('.run-code').each(function (node) { });
        },
        function () {
            return $('.run-code').each(function (i, elem) { });
        });

    do_test('.each()', 100,
        function () {
            return _q('.run-code').each(function (obj) { });
        },
        function () {
            return $('.run-code').each(function (i, elem) { elem = $(elem) });
        });

    _warn('traverse', '--------------------------------')
    var nodelist = document.querySelectorAll('.token');
    do_test('.parent()', 50,
        function () {
            return _q(nodelist).parent('code');
        },
        function () {
            return $(nodelist).parent('code');
        });

    do_test('.closest()', 10,
        function () {
            return _q(nodelist).closest('.run-code');
        },
        function () {
            return $(nodelist).closest('.run-code');
        });

    var node = _q('code').toArray();
    do_test('.children()', 100,
        function () {
            return _q(node).children('.function');
        },
        function () {
            return $(node).children('.function');
        });

    do_test('.prev()', 100,
        function () {
            return _q(nodelist).prev('.function');
        },
        function () {
            return $(nodelist).prev('.function');
        });

    do_test('.next()', 100,
        function () {
            return _q(nodelist).next('.function');
        },
        function () {
            return $(nodelist).next('.function');
        });


    _warn('manipulate', '--------------------------------')

    var html = '<a href="#" class="test"><img alt="null">Test</a>';

    var node = _q('#content-table').nodes[0];
    var nodes = _q('h3').toArray();
    var child1 = _q1(html, { _text: 'tinyq' }).toArray();
    var child2 = _q1(html, { _text: 'jq' }).toArray();
    do_test('node.append(node)', 500,
        function () {
            return _q(node).append(child1);
        },
        function () {
            return $(node).append(child2);
        });

    var html21 = '<a href="#" class="test21"><img alt="21">q21</a> <b>q21</b>';
    var html22 = '<a href="#" class="test22"><img alt="22">jquery22</a> <b>jquery22</b>';
    do_test('nodes.append(html)', 100,
        function () {
            return _q(nodes).append(html21);
        },
        function () {
            return $(nodes).append(html22);
        });

    var nodes1 = _q('h3 > a.test21, h3 > b').toArray();
    var nodes2 = _q('h3 > a.test22, h3 > b').toArray();

    do_test('.remove(.class)', 1,
        function () {
            return _q(nodes1).remove('.test21');
        },
        function () {
            return $(nodes2).remove('.test22');
        });

    do_test('.empty()', 1,
        function () {
            return _q(nodes1).filter('b').empty();
        },
        function () {
            return $(nodes2).filter('b').empty();
        });

    do_test('.remove()', 1,
        function () {
            return _q(nodes1).remove();
        },
        function () {
            return $(nodes2).remove();
        });

    var html31 = '<a href="#" class="test31"><img alt="31">q31</a> <b class="b31">q31</b>';
    var html32 = '<a href="#" class="test32"><img alt="32">jquery32</a> <b class="b32">jquery32</b>';
    do_test('nodes.prepend(html)', 100,
        function () {
            return _q(nodes).prepend(html31);
        },
        function () {
            return $(nodes).prepend(html32);
        });

    _q('h3 > .test31, h3 > .b31').remove();
    $('h3 > .test32, h3 > .b32').remove();

    var html41 = '<a href="#" class="test41"><img alt="41">q41</a> <b class="b41">q41</b>';
    var html42 = '<a href="#" class="test42"><img alt="42">jquery42</a> <b class="b42">jquery42</b>';
    do_test('.before()', 100,
        function () {
            return _q(nodes).before(html41);
        },
        function () {
            return $(nodes).before(html42);
        });

    _q('.test41, .b41').remove();
    $('.test42,.b42').remove();

    var html51 = '<a href="#" class="test51"><img alt="51">q51</a> <b class="b51">q51</b>';
    var html52 = '<a href="#" class="test52"><img alt="52">jquery52</a> <b class="b52">jquery52</b>';
    do_test('.after()', 100,
        function () {
            return _q(nodes).after(html51);
        },
        function () {
            return $(nodes).after(html52);
        });

    _q('.test51, .b51').remove();
    $('.test52, .b52').remove();

})