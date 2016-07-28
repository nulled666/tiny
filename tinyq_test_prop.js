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


    var x = _q('.run-code');
    var y = $('.run-code');

    _warn('bound sizes ------------------')

    do_test('.boundWidth(margin).top', 100,
        function () {
            return x.boundWidth('margin').top;
        },
        function () {
            return parseFloat(y.css('margin-top'));
        });

    do_test('.boundWidth(margin).left', 100,
        function () {
            return x.boundWidth('margin').left;
        },
        function () {
            return parseFloat(y.css('margin-left'));
        });

    do_test('.boundWidth(border).bottom', 100,
        function () {
            return x.boundWidth('border').bottom;
        },
        function () {
            return parseFloat(y.css('border-bottom-width'));
        });

    do_test('.boundWidth(border).right', 100,
        function () {
            return x.boundWidth('border').right;
        },
        function () {
            return parseFloat(y.css('border-right-width'));
        });

    do_test('.boundWidth(padding).bottom', 100,
        function () {
            return x.boundWidth('padding').bottom;
        },
        function () {
            return parseFloat(y.css('padding-bottom'));
        });

    do_test('.boundWidth(padding).right', 100,
        function () {
            return x.boundWidth('padding').right;
        },
        function () {
            return parseFloat(y.css('padding-right'));
        });

    do_test('.boundWidth().top', 100,
        function () {
            return x.boundWidth().top;
        },
        function () {
            return parseFloat(y.css('border-top-width')) + parseFloat(y.css('padding-top')) + parseFloat(y.css('margin-top'));
        });

    do_test('.boundWidth().right', 100,
        function () {
            return x.boundWidth().right;
        },
        function () {
            return parseFloat(y.css('border-right-width')) + parseFloat(y.css('padding-right')) + parseFloat(y.css('margin-right'));
        });

    _warn('positions ------------------')

    do_test('.pos().top', 100,
        function () {
            return x.pos().top;
        },
        function () {
            return y.position().top;
        });

    do_test('.pos().left', 100,
        function () {
            return x.pos().left;
        },
        function () {
            return y.position().left;
        });

    do_test('.pos(true).top', 100,
        function () {
            return x.pos(true).top;
        },
        function () {
            return y.offset().top;
        });

    do_test('.pos(true).left', 100,
        function () {
            return x.pos(true).left;
        },
        function () {
            return y.offset().left;
        });

    _warn('dimensions ------------------')

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

    do_test('.top()', 99,
        function () {
            return x.top();
        },
        function () {
            return y.css('top');
        });

    do_test('.left()', 99,
        function () {
            return x.left();
        },
        function () {
            return y.css('left');
        });


    do_test('.width()', 99,
        function () {
            return x.width();
        },
        function () {
            return y.width();
        });

    do_test('.height()', 99,
        function () {
            return x.height();
        },
        function () {
            return y.height();
        });

    do_test('.scrollTop(88)', 99,
        function () {
            return x.scrollTop(88);
        },
        function () {
            return y.scrollTop(88);
        });

    do_test('.scrollLeft(66)', 99,
        function () {
            return x.scrollLeft(66);
        },
        function () {
            return y.scrollLeft(66);
        });

    do_test('.scrollTop()', 99,
        function () {
            return x.scrollTop();
        },
        function () {
            return y.scrollTop();
        });

    do_test('.scrollLeft()', 99,
        function () {
            return x.scrollLeft();
        },
        function () {
            return y.scrollLeft();
        });

    _warn('rects ------------------')

    do_test('.rect(margin).top', 100,
        function () {
            return x.rect('margin').top;
        },
        function () {
            return y.position().top;
        });

    do_test('.rect(margin).left', 100,
        function () {
            return x.rect('margin').left;
        },
        function () {
            return y.position().left;
        });

    do_test('.rect(margin).width', 100,
        function () {
            return x.rect('margin').width;
        },
        function () {
            return y.outerWidth(true);
        });

    do_test('.rect(margin).height', 100,
        function () {
            return x.rect('margin').height;
        },
        function () {
            return y.outerHeight(true);
        });

    do_test('.rect(border).width', 100,
        function () {
            return x.rect().width;
        },
        function () {
            return y.outerWidth();
        });

    do_test('.rect(border).height', 100,
        function () {
            return x.rect().height;
        },
        function () {
            return y.outerHeight();
        });

    do_test('.rect(inner).width', 100,
        function () {
            return x.rect('inner').width;
        },
        function () {
            return y.innerWidth();
        });

    do_test('.rect(inner).height', 100,
        function () {
            return x.rect('inner').height;
        },
        function () {
            return y.innerHeight();
        });

    do_test('.rect(client).top', 100,
        function () {
            return x.rect('client').top;
        },
        function () {
            return y.get(0).offsetTop + parseFloat(y.css('border-top-width'));
        });

    do_test('.rect(client).left', 100,
        function () {
            return x.rect('client').left;
        },
        function () {
            return y.get(0).offsetLeft + parseFloat(y.css('border-left-width'));
        });

    do_test('.rect(client).width', 100,
        function () {
            return x.rect('client').width;
        },
        function () {
            return y.get(0).clientWidth;
        });

    do_test('.rect(client).height', 100,
        function () {
            return x.rect('client').height;
        },
        function () {
            return y.get(0).clientHeight;
        });

    do_test('.rect(scroll).top', 100,
        function () {
            return x.rect('scroll').top;
        },
        function () {
            return y.get(0).offsetTop + parseFloat(y.css('border-top-width'));
        });

    do_test('.rect(scroll).left', 100,
        function () {
            return x.rect('scroll').left;
        },
        function () {
            return y.get(0).offsetLeft + parseFloat(y.css('border-left-width'));
        });

    do_test('.rect(scroll).width', 100,
        function () {
            return x.rect('scroll').width;
        },
        function () {
            return y.get(0).scrollWidth;
        });

    do_test('.rect(scroll).height', 100,
        function () {
            return x.rect('scroll').height;
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
