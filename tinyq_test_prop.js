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

    var nodes = document.querySelectorAll('h3');

    _warn('style ------------------');

    do_test('.style({obj})', 100,
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

    do_test('.style()', 100,
        function () {
            return _q(nodes).style('text-shadow');
        },
        function () {
            return $(nodes).css('text-shadow');
        });

    do_test('.style(null)', 100,
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
    var nodes = document.querySelectorAll('pre');
    var q = _q(nodes);
    var jq = $(nodes);
    do_test('add class', 99,
        function () {
            return q.class('passed failed test ok collapse');
        },
        function () {
            return jq.addClass('passed failed test ok collapse');
        });

    do_test('remove class', 99,
        function () {
            return q.class('-:passed failed test ok collapse');
        },
        function () {
            return jq.removeClass('passed failed test ok collapse');
        });

    do_test('add & remove', 99,
        function () {
            return q.class('passed failed test ok collapse')
                .class('-:passed failed test ok collapse');
        },
        function () {
            return jq.addClass('passed failed test ok collapse')
                .removeClass('passed failed test ok collapse');
        });

    do_test('check class', 99,
        function () {
            return q.class('?run-code');
        },
        function () {
            return jq.hasClass('run-code');
        });

    do_test('mixed action', 99,
        function () {
            return q.class('passed -run-code ^collapse')
                .class('-passed -collapse ^run-code ?run-code');
        },
        function () {
            return jq.addClass('passed').removeClass('run-code').toggleClass('collapse')
                .removeClass('passed collapse').toggleClass('run-code').hasClass('run-code');
        });


        _warn('sizes ------------------')
        var x = _q('.run-code');
        var y = $('.run-code');

        do_test('set width', 99,
            function () {
                return x.width(98);
            },
            function () {
                return y.width(98);
            });

        do_test('get width', 99,
            function () {
                return x.width();
            },
            function () {
                return y.width();
            });

        do_test('set width auto', 99,
            function () {
                return x.width('');
            },
            function () {
                return y.width('');
            });

        do_test('set height', 99,
            function () {
                return x.height(60);
            },
            function () {
                return y.height(60);
            });

        do_test('get height', 99,
            function () {
                return x.height();
            },
            function () {
                return y.height();
            });

        do_test('set height auto', 99,
            function () {
                return x.height('');
            },
            function () {
                return y.height('');
            });

        do_test('offsetWidth/outerWidth', 99,
            function () {
                return x.outerWidth();
            },
            function () {
                return y.outerWidth();
            });


        do_test('offsetHeight/outerHeight', 99,
            function () {
                return x.outerHeight();
            },
            function () {
                return y.outerHeight();
            });

        do_test('scrollWidth/innerWidth', 99,
            function () {
                return _q(document).innerWidth();
            },
            function () {
                return $(document).innerWidth();
            });


        do_test('scrollHeight/innerHeight', 99,
            function () {
                return _q(document).innerHeight();
            },
            function () {
                return $(document).innerHeight();
            });


        do_test('clientWidth', 99,
            function () {
                return _q(document).clientWidth();
            },
            function () {
                return $(document).get(0).body.clientWidth;
            });

        do_test('clientHeight', 99,
            function () {
                return _q(document).clientHeight();
            },
            function () {
                return $(document).get(0).body.clientHeight;
            });


        _warn('position ------------------')

        do_test('set left', 99,
            function () {
                return x.left(60);
            },
            function () {
                return y.css('left', 60);
            });

        do_test('get left', 99,
            function () {
                return x.left();
            },
            function () {
                return y.position().left;
            });

        do_test('set left auto', 99,
            function () {
                return x.left('');
            },
            function () {
                return y.css('left', '');
            });
            
        do_test('set top', 99,
            function () {
                return x.top(60);
            },
            function () {
                return y.css('top', 60);
            });

        do_test('get top', 99,
            function () {
                return x.top();
            },
            function () {
                return y.position().top;
            });

        do_test('set top auto', 99,
            function () {
                return x.top('');
            },
            function () {
                return y.css('top', '');
            });

        do_test('offsetLeft', 99,
            function () {
                return x.offsetLeft();
            },
            function () {
                return y.get(0).offsetLeft;
            });


        do_test('offsetTop', 99,
            function () {
                return x.offsetTop();
            },
            function () {
                return y.get(0).offsetTop;
            });

        do_test('scrollLeft', 99,
            function () {
                return _q(document).scrollLeft();
            },
            function () {
                return $(document).scrollLeft();
            });

        do_test('scrollTop', 99,
            function () {
                return _q(document).scrollTop();
            },
            function () {
                return $(document).scrollTop();
            });


        var x = _q('.function');
        var y = $('.function');

        do_test('pos().left', 1,
            function () {
                return x.pos().left;
            },
            function () {
                return y.position().left;
            });

        do_test('pos().top', 1,
            function () {
                return x.pos().top;
            },
            function () {
                return y.position().top;
            });

});
