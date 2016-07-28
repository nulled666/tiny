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
    do_test('.innerText()', 99,
        function () {
            return _q(nodes).innerText();
        },
        function () {
            var t = '';
            $(nodes).each(function (i, elem) { t += elem.innerText });
            return t;
        });

    var nodes = document.querySelectorAll('.run-code');
    do_test('.html()', 99,
        function () {
            return _q(nodes).html();
        },
        function () {
            return $(nodes).html();
        });
    do_test('.outerHTML()', 99,
        function () {
            return _q(nodes).outerHTML();
        },
        function () {
            return $(nodes).get(0).outerHTML;
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

    do_test('.innerText(val)', 99,
        function () {
            return _q(node).innerText(html21 + count++);
        },
        function () {
            return $(node).each(function (i, elem) { elem.innerText = html21 + count++ });
        });

    do_test('.html(val)', 99,
        function () {
            return _q(node).html(html21 + count++);
        },
        function () {
            return $(node).html(html21 + count++);
        });

    do_test('.outerHTML(val)', 99,
        function () {
            return _q(node).outerHTML(html21 + count++);
        },
        function () {
            var y = $(node)
            var n = y.get(0);
            if (n.parentNode) y.outerHTML = html21 + count++;
            return y;
        });

    _q(node).remove();


    _warn('attribute ------------------')

    var nodes = document.querySelectorAll('h3');

    do_test('.attr()', 100,
        function () {
            return _q(nodes).attr();
        },
        function () {
            return $(nodes).get(0).attributes;
        });

    do_test('.attr(key, val)', 100,
        function () {
            return _q(nodes).attr('class1', 'header test-my-code');
        },
        function () {
            return $(nodes).attr('class2', 'header test-my-code');
        });

    do_test('.attr(key)', 100,
        function () {
            return _q(nodes).attr('class1');
        },
        function () {
            return $(nodes).attr('class2');
        });

    do_test('.attr({key: value})', 100,
        function () {
            return _q(nodes).attr({ class1: null, mark1: 1999 });
        },
        function () {
            return $(nodes).attr({ class2: null, mark2: 2000 });
        });

    do_test('.attr(key, null)', 1,
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

    var nodes = document.querySelectorAll('h3');

    _warn('style ------------------');

    do_test('.style()', 100,
        function () {
            return _q(nodes).style();
        },
        function () {
            return $(nodes).get(0).style;
        });

    do_test('.style(true)', 100,
        function () {
            return _q(nodes).style(true);
        },
        function () {
            return window.getComputedStyle($(nodes).get(0));
        });

    do_test('.style({key: value})', 100,
        function () {
            return _q(nodes).style({
                'text-shadow': '0 3px 5px rgba(0,0,0,0.3)',
                'user-select': 'none'
            });
        },
        function () {
            return $(nodes).css({
                'text-shadow': '0 3px 5px rgba(0,0,0,0.3)',
                'user-select': 'none'
            });
        });

    do_test('.style(key)', 100,
        function () {
            return _q(nodes).style('text-shadow');
        },
        function () {
            return $(nodes).css('text-shadow');
        });

    do_test('.style({key: null})', 100,
        function () {
            return _q(nodes).style({
                'text-shadow': null,
                'user-select': null
            });
        },
        function () {
            return $(nodes).css({
                'text-shadow': null,
                'user-select': null
            });
        });


    _warn('class ------------------')

    var nodes = document.querySelectorAll('.run-code');
    var q = _q(nodes);
    var jq = $(nodes);

    do_test('.class()', 99,
        function () {
            return q.class();
        },
        function () {
            return jq.attr('class');
        });

    do_test('.class(+)', 99,
        function () {
            return q.class('passed failed test ok collapse');
        },
        function () {
            return jq.addClass('passed failed test ok collapse');
        });

    do_test('.class(-)', 99,
        function () {
            return q.class('-:passed failed test ok collapse');
        },
        function () {
            return jq.removeClass('passed failed test ok collapse');
        });

    do_test('.class(+-)', 99,
        function () {
            return q.class('passed failed test ok collapse')
                .class('-:passed failed test ok collapse');
        },
        function () {
            return jq.addClass('passed failed test ok collapse')
                .removeClass('passed failed test ok collapse');
        });

    do_test('.class(^)', 99,
        function () {
            return q.class('^test');
        },
        function () {
            return jq.toggleClass('test');
        });

    do_test('.class(?)', 99,
        function () {
            return q.class('?run-code');
        },
        function () {
            return jq.hasClass('run-code');
        });

    do_test('.class(+-^?)', 99,
        function () {
            return q.class('passed -run-code ^collapse')
                .class('-passed -collapse ^run-code ?run-code');
        },
        function () {
            return jq.addClass('passed').removeClass('run-code').toggleClass('collapse')
                .removeClass('passed collapse').toggleClass('run-code').hasClass('run-code');
        });


    _warn('left ------------------')

    var x = _q('.run-code');
    var y = $('.run-code');

    do_test('.left(60)', 99,
        function () {
            return x.left(60);
        },
        function () {
            return y.css('left', 60);
        });

    do_test('.left()', 99,
        function () {
            return x.left();
        },
        function () {
            return y.position().left;
        });

    do_test('.innerLeft()', 99,
        function () {
            return x.outerLeft();
        },
        function () {
            return y.position().left;
        });

    do_test('.offsetLeft()', 99,
        function () {
            return x.offsetLeft();
        },
        function () {
            return y.position().left;
        });

    do_test('.outerLeft()', 99,
        function () {
            return x.outerLeft();
        },
        function () {
            return y.position().left;
        });

    do_test('.marginLeft()', 99,
        function () {
            return x.outerLeft();
        },
        function () {
            return y.position().left;
        });

    do_test('.pos().left', 99,
        function () {
            return x.pos().left;
        },
        function () {
            return y.position().left;
        });

    do_test('.offset().left', 100,
        function () {
            return x.offset().left;
        },
        function () {
            return y.offset().left;
        });

    do_test('.scrollLeft()', 99,
        function () {
            return _q(document).scrollLeft();
        },
        function () {
            return $(document).scrollLeft();
        });

    do_test('.left(auto)', 99,
        function () {
            return x.left('');
        },
        function () {
            return y.css('left', '');
        });

    _warn('top ------------------')

    do_test('.top(60)', 99,
        function () {
            return x.top(60);
        },
        function () {
            return y.css('top', 60);
        });

    do_test('.top()', 99,
        function () {
            return x.top();
        },
        function () {
            return y.position().top;
        });

    do_test('.innerTop()', 99,
        function () {
            return x.innerTop();
        },
        function () {
            return y.position().top;
        });

    do_test('.offsetTop()', 99,
        function () {
            return x.offsetTop();
        },
        function () {
            return y.get(0).offsetTop;
        });

    do_test('.outerTop()', 99,
        function () {
            return x.outerTop();
        },
        function () {
            return y.get(0).offsetTop;
        });

    do_test('.marginTop()', 99,
        function () {
            return x.marginTop();
        },
        function () {
            return y.position().top;
        });

    do_test('.pos().top', 1,
        function () {
            return x.pos().top;
        },
        function () {
            return y.position().top;
        });

    do_test('.offset().top', 100,
        function () {
            return x.offset().top;
        },
        function () {
            return y.offset().top;
        });

    do_test('.scrollTop()', 99,
        function () {
            return _q(document).scrollTop();
        },
        function () {
            return $(document).scrollTop();
        });

    do_test('.top(auto)', 99,
        function () {
            return x.top('');
        },
        function () {
            return y.css('top', '');
        });

    _warn('rect ------------------')

    do_test('.rect()', 100,
        function () {
            return x.rect();
        },
        function () {
            return $.extend({}, y.get(0).getBoundingClientRect());
        });

    _warn('dimensions ------------------')

    var x = _q('.run-code');
    var y = $('.run-code');

    do_test('.width(98)', 99,
        function () {
            return x.width(98);
        },
        function () {
            return y.width(98);
        });

    do_test('.height(60)', 99,
        function () {
            return x.height(60);
        },
        function () {
            return y.height(60);
        });

    do_test('.style(width)', 99,
        function () {
            return x.style('width');
        },
        function () {
            return y.css('width');
        });

    do_test('.width()', 99,
        function () {
            return x.width();
        },
        function () {
            return y.width();
        });

    do_test('.clientWidth()', 99,
        function () {
            return x.clientWidth();
        },
        function () {
            return y.get(0).clientWidth;
        });

    do_test('.innerWidth()', 99,
        function () {
            return x.innerWidth();
        },
        function () {
            return y.innerWidth();
        });

    do_test('.offsetWidth()', 99,
        function () {
            return x.offsetWidth();
        },
        function () {
            return y.outerWidth();
        });

    do_test('.outerWidth()', 99,
        function () {
            return x.outerWidth();
        },
        function () {
            return y.outerWidth();
        });

    do_test('.marginWidth()', 99,
        function () {
            return x.marginWidth();
        },
        function () {
            return y.outerWidth(true);
        });

    do_test('.scrollWidth()', 99,
        function () {
            return x.scrollWidth();
        },
        function () {
            return y.get(0).scrollWidth;
        });

    do_test('.height()', 99,
        function () {
            return x.height();
        },
        function () {
            return y.height();
        });

    do_test('.clientHeight()', 99,
        function () {
            return x.clientHeight();
        },
        function () {
            return y.get(0).clientHeight;
        });

    do_test('.innerHeight()', 99,
        function () {
            return x.innerHeight();
        },
        function () {
            return y.innerHeight();
        });

    do_test('.offsetHeight()', 99,
        function () {
            return x.offsetHeight();
        },
        function () {
            return y.outerHeight();
        });

    do_test('.outerHeight()', 99,
        function () {
            return x.outerHeight();
        },
        function () {
            return y.outerHeight();
        });

    do_test('.marginHeight()', 99,
        function () {
            return x.marginHeight();
        },
        function () {
            return y.outerHeight(true);
        });

    do_test('.scrollHeight()', 99,
        function () {
            return x.scrollHeight();
        },
        function () {
            return y.get(0).scrollHeight;
        });

    do_test('.width(auto)', 99,
        function () {
            return x.width('');
        },
        function () {
            return y.width('');
        });

    do_test('.height(auto)', 99,
        function () {
            return x.height('');
        },
        function () {
            return y.height('');
        });

});
