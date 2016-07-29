define([
    'tinyq.test'
], function (do_test) {

    _warn('query', '--------------------------------')

    do_test('q(window)', 1000,
        function () {
            return _q(window);
        },
        function () {
            return $(window);
        });

    do_test('q(document)', 1000,
        function () {
            return _q(document);
        },
        function () {
            return $(document);
        });

    do_test('q("#id")', 1000,
        function () {
            return _q('#content-table');
        },
        function () {
            return $('#content-table');
        });

    do_test('q("tag")', 100,
        function () {
            return _q('span');
        },
        function () {
            return $('span');
        });

    do_test('q(".class")', 100,
        function () {
            return _q('.token');
        },
        function () {
            return $('.token');
        });

    do_test('q(".class1.class2")', 100,
        function () {
            return _q('.function.token');
        },
        function () {
            return $('.function.token');
        });

    do_test('q(".class1 .class2")', 100,
        function () {
            return _q('.run-code .function');
        },
        function () {
            return $('.run-code .function');
        });

    var html = '<a href="#" class="test"><img alt="null">Test</a><b>test</b>';
    do_test('q("html", attr)', 300,
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

    var x = _q1('.run-code');
    var y = $('.run-code').eq(0);

    do_test('node.q(".class")', 1000,
        function () {
            return x.q('.function');
        },
        function () {
            return y.find('.function');
        });

    do_test('node.q1(".class")', 1000,
        function () {
            return x.q1('.function');
        },
        function () {
            return y.find('.function:first');
        });

    var nodelist = document.querySelectorAll('.token');

    do_test('q(nodelist)', 100,
        function () {
            return _q(nodelist);
        },
        function () {
            return $(nodelist);
        });

    var x = _q('.run-code');
    var y = $('.run-code');

    do_test('nodelist.q(".class")', 100,
        function () {
            return x.q('.function');
        },
        function () {
            return y.find('.function');
        });
    do_test('nodelist.q1(".class")', 100,
        function () {
            return x.q1('.function');
        },
        function () {
            return y.find('.function').first();
        });

    var x = _q('.function');
    var y = $('.function');

    do_test('.add(.selector)', 10,
        function () {
            return x.add('.token');
        },
        function () {
            return y.add('.token');
        });

    var add_nodes = _q('.token').toArray();
    do_test('.add(nodes)', 10,
        function () {
            return x.add(add_nodes);
        },
        function () {
            return y.add(add_nodes);
        });

    _warn('filter', '--------------------------------')


    var x = _q('.token');
    var y = $('.token');

    do_test('.filter(".class")', 50,
        function () {
            return x.filter('.function');
        },
        function () {
            return y.filter('.function');
        });

    var x = _q('code');
    var y = $('code');

    do_test('.filter(@has)', 50,
        function () {
            return x.filter('@has(.comment)');
        },
        function () {
            return y.has('.comment');
        });

    do_test('.filter(@contains)', 50,
        function () {
            return x.filter('@contains(ASSERT)');
        },
        function () {
            return y.filter(':contains(ASSERT)');
        });

    do_test('.filter(@visible)', 500,
        function () {
            return x.filter('@visible');
        },
        function () {
            return y.filter(':visible');
        });


    _warn('collection', '--------------------------------')

    do_test('.get(2)', 1000,
        function () {
            return x.get(2);
        },
        function () {
            return y.get(2);
        });

    do_test('.q(index)', 1000,
        function () {
            return x.q(10);
        },
        function () {
            return y.eq(10);
        });

    do_test('.first()', 1000,
        function () {
            return x.first();
        },
        function () {
            return y.first();
        });

    do_test('.last()', 1000,
        function () {
            return x.last();
        },
        function () {
            return y.last();
        });
    var x = _q('.token');
    var y = $('.token');
    var z = $('.token.keyword:first');

    do_test('.indexOf(".class")', 50,
        function () {
            return x.indexOf('.keyword');
        },
        function () {
            return z.index('.token');
        });

    do_test('.includes(".class")', 50,
        function () {
            return x.includes('.function');
        },
        function () {
            return y.is('.function');
        });

    do_test('.is(".class")', 50,
        function () {
            return x.is('.function');
        },
        function () {
            return y.length == y.filter('.function');
        });

    var node = document.querySelector('.token.function');

    do_test('.indexOf(node)', 50,
        function () {
            return x.indexOf(node);
        },
        function () {
            return y.index(node);
        });

    do_test('.includes(node)', 50,
        function () {
            return x.includes(node);
        },
        function () {
            return y.is(node);
        });

    do_test('.is(node)', 50,
        function () {
            return x.is(node);
        },
        function () {
            return y.length == y.filter(node).length;
        });

    do_test('.slice(0, -5)', 1000,
        function () {
            return x.slice(10, -5);
        },
        function () {
            return y.slice(10, -5);
        });

    do_test('.toArray()', 100,
        function () {
            return x.toArray();
        },
        function () {
            return y.toArray();
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

    var x = _q('.token');
    var y = $('.token');

    do_test('.parent()', 50,
        function () {
            return x.parent('code');
        },
        function () {
            return y.parent('code');
        });

    do_test('.offsetParent()', 20,
        function () {
            return x.offsetParent();
        },
        function () {
            return y.offsetParent();
        });

    do_test('.closest()', 10,
        function () {
            return x.closest('.run-code');
        },
        function () {
            return y.closest('.run-code');
        });

    var x = _q('code');
    var y = $('code');

    do_test('.children()', 100,
        function () {
            return x.children('.comment');
        },
        function () {
            return y.children('.comment');
        });

    var x = _q('.token');
    var y = $('.token');

    do_test('.prev()', 100,
        function () {
            return x.prev('.function');
        },
        function () {
            return y.prev('.function');
        });

    do_test('.next()', 100,
        function () {
            return x.next('.function');
        },
        function () {
            return y.next('.function');
        });


    _warn('manipulate', '--------------------------------')


    var x = _q1('h3');
    var y = $('h3:first');

    var html = '<a href="#" class="test"><img alt="null">Test</a>';
    var child1 = _q1(html, { _text: 'tinyq' }).toArray();
    var child2 = _q1(html, { _text: 'jq' }).toArray();

    do_test('.append(node)', 500,
        function () {
            return x.append(child1);
        },
        function () {
            return y.append(child2);
        });

    _q1('h3').q('.test').remove();

    var x = _q('h3');
    var y = $('h3');

    var html21 = '<a href="#" class="test21"><img alt="21">q21</a> <b>q21</b>';
    var html22 = '<a href="#" class="test22"><img alt="22">jquery22</a> <b>jquery22</b>';
    do_test('.append(html)', 100,
        function () {
            return x.append(html21);
        },
        function () {
            return y.append(html22);
        });

    var x = _q('h3 > a.test21, h3 > b');
    var y = $('h3 > a.test22, h3 > b');

    do_test('.remove(.class)', 1,
        function () {
            return x.remove('.test21');
        },
        function () {
            return y.remove('.test22');
        });

    do_test('.empty()', 1,
        function () {
            return x.filter('b').empty();
        },
        function () {
            return y.filter('b').empty();
        });

    do_test('.remove()', 1,
        function () {
            return x.remove();
        },
        function () {
            return y.remove();
        });

    var x = _q('h3');
    var y = $('h3');

    var html31 = '<a href="#" class="test31"><img alt="31">q31</a> <b class="b31">q31</b>';
    var html32 = '<a href="#" class="test32"><img alt="32">jquery32</a> <b class="b32">jquery32</b>';
    do_test('.prepend(html)', 100,
        function () {
            return x.prepend(html31);
        },
        function () {
            return y.prepend(html32);
        });

    _q('h3 > .test31, h3 > .b31').remove();
    $('h3 > .test32, h3 > .b32').remove();

    var html41 = '<a href="#" class="test41"><img alt="41">q41</a> <b class="b41">q41</b>';
    var html42 = '<a href="#" class="test42"><img alt="42">jquery42</a> <b class="b42">jquery42</b>';
    do_test('.before()', 100,
        function () {
            return x.before(html41);
        },
        function () {
            return y.before(html42);
        });

    _q('.test41, .b41').remove();
    $('.test42,.b42').remove();

    var html51 = '<a href="#" class="test51"><img alt="51">q51</a> <b class="b51">q51</b>';
    var html52 = '<a href="#" class="test52"><img alt="52">jquery52</a> <b class="b52">jquery52</b>';
    do_test('.after()', 100,
        function () {
            return x.after(html51);
        },
        function () {
            return y.after(html52);
        });

    _q('.test51, .b51').remove();
    $('.test52, .b52').remove();

})