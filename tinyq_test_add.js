require([
    'tinyq_test'
], function (do_test) {

    var node = _q1('.content-table').get(0);
    var html = '<a href="#" class="test"><img alt="null">Test</a>';
    do_test('create', 100,
        function () {
            return _q(html, { x: 'test.htm', title: 'test' });
        },
        function () {
            return $(html, { x: 'test.htm', title: 'test' });
        });

    var nodes = _q('h3').toArray();
    var child1 = _q1(html, { _text: 'tinyq' }).toArray();
    var child2 = _q1(html, { _text: 'jq' }).toArray();
    do_test('node.append', 100,
        function () {
            return _q(node).append(child1);
        },
        function () {
            return $(node).append(child2);
        });

    var html21 = '<a href="#" class="test21"><img alt="null">Test21</a> <b>good21</b>';
    var html22 = '<a href="#" class="test22"><img alt="null">Test22</a> <b>good22</b>';
    do_test('nodes.append:html', 100,
        function () {
            return _q(nodes).append(html21);
        },
        function () {
            return $(nodes).append(html22);
        });

    var nodes1 = _q('h3 > a.test21, h3 > b').toArray();
    var nodes2 = _q('h3 > a.test22, h3 > b').toArray();

    do_test('remove.class', 1,
        function () {
            return _q(nodes1).remove('.test21');
        },
        function () {
            return $(nodes2).remove('.test22');
        });

    do_test('empty', 1,
        function () {
            return _q(nodes1).filter('b').empty();
        },
        function () {
            return $(nodes2).filter('b').empty();
        });

    do_test('remove', 1,
        function () {
            return _q(nodes1).remove();
        },
        function () {
            return $(nodes2).remove();
        });

    var html31 = '<a href="#" class="test3-1"><img alt="null">Test3-1</a><b class="b1">good1</b>';
    var html32 = '<a href="#" class="test3-2"><img alt="null">Test3-2</a><b class="b2">good2</b>';
    do_test('nodes.prepend:html', 100,
        function () {
            return _q(nodes).prepend(html31);
        },
        function () {
            return $(nodes).prepend(html32);
        });

    do_test('remove', 1,
        function () {
            return _q('h3 > .test3-1, h3 > .b1').remove();
        },
        function () {
            return $('h3 > .test3-2, h3 > .b2').remove();
        });


});
