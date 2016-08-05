require([
    'tinyq.test'
], function (do_test) {

    _warn('text & html ------------------')

    var x = _q('pre');
    var y = $('pre:first');

    do_test('.text()', 99,
        function () {
            return x.text();
        },
        function () {
            return y.text();
        });
    do_test('.innerText()', 99,
        function () {
            return x.innerText();
        },
        function () {
            var t = '';
            y.each(function (i, elem) { t += elem.innerText });
            return t;
        });

    var nodes = document.querySelectorAll('.run-code');
    do_test('.html()', 99,
        function () {
            return x.html();
        },
        function () {
            return y.html();
        });
    do_test('.outerHTML()', 99,
        function () {
            return x.outerHTML();
        },
        function () {
            return y.get(0).outerHTML;
        });

    _q('h1').prepend('<div id="test-me1"></div><div id="test-me2"></div>');
    var x = _q('#test-me1');
    var y = $('#test-me2');
    var html21 = '<a href="#" class="test21"><img alt="21">q21</a> <b>q21</b>';
    var count = 0;

    do_test('.text(val)', 99,
        function () {
            return x.text(html21 + count++);
        },
        function () {
            return y.text(html21 + count++);
        });

    do_test('.innerText(val)', 99,
        function () {
            return x.innerText(html21 + count++);
        },
        function () {
            return y.each(function (i, elem) { elem.innerText = html21 + count++ });
        });

    do_test('.html(val)', 99,
        function () {
            return x.html(html21 + count++);
        },
        function () {
            return y.html(html21 + count++);
        });

    do_test('.outerHTML(val)', 99,
        function () {
            return x.q('a').outerHTML(html21 + count++);
        },
        function () {
            var n = y.find('a').get(0);
            if (n.parentNode) n.outerHTML = html21 + count++;
            return y;
        });

    x.remove(), y.remove();

    _warn('values ------------------')

    var x = _q1('h1');

    x.before('<div id="test-form"></div>');
    x = x.q('#test-form');
    x.html('\
        <form id="f-form">\
            <input id="f-file" type="file">\
            <fieldset>\
            <input id="f-text" type="text" value="Type here">\
            <input id="f-pwd" type="password" value="password">\
            <input id="f-num" type="number" value="99.99">\
            <input id="f-range" type="range" min ="-2.5" max="3.0" step ="0.1" value="1.7"/>\
            </fieldset>\
            <br>\
            <input id="f-date" type="date" value="2016-05-06">\
            <input id="f-month" type="month" value="2010-05">\
            <input id="f-datetime" type="datetime-local" value="2011-08-09T11:58">\
            <input id="f-time" type="time" value="11:58">\
            <br>\
            <input id="f-chk" type="checkbox" value="check me" >\
            	<input id="f-chk2" type="checkbox" value="check me" checked>\
            <br>\
            <input id="f-r1" type="radio" value="radio off">\
            <input id="f-r2" type="radio" name="fffti" value="radio on">\
            	<input type="radio" name="fffti" value="radio x" checked>\
            <br>\
            <meter id="f-m1" min="200" max="500" value="350"></meter>\
            <progress id="f-p" value="70" max="100">70 %</progress>\
            <br>\
            <select id="f-s" name="select">\
                <option value="select1">Value 1</option> \
                <option value="value 3" selected>Value 2</option>\
                <option>Value 3</option>\
            </select>\
            <select id="f-sm" name="toppings" multiple size=5>\
                <option value="mushrooms">mushrooms\
                <option selected>green peppers\
                <option value="oni" selected>onions\
                <option value="tomatoes">tomatoes\
                <option value="olives">olives\
            </select>\
            <br>\
            <textarea id="f-t" name="textarea" rows="10" cols="50">Write something here</textarea>\
            <button id="f-btn" value="button value">Click me</button>\
            <output id="f-o" name="result">60</output>\
        </form>\
        ');

    var x = _q('#f-text');
    var y = $('#f-text');

    do_test('text.value(text)', 99,
        function () {
            return x.value('Test on input[type=text]');
        },
        function () {
            return y.val('Test on input[type=text]');
        });

    do_test('text.value()', 99,
        function () {
            return x.value();
        },
        function () {
            return y.val();
        });

    var x = _q('#f-num');
    var y = $('#f-num');

    do_test('num.value(num)', 99,
        function () {
            return x.value(19.99);
        },
        function () {
            return y.val(19.99);
        });

    do_test('num.value()', 99,
        function () {
            return x.value();
        },
        function () {
            return parseFloat(y.val());
        });

    var x = _q('#f-datetime');
    var y = $('#f-datetime');

    x.value(new Date());

    do_test('datetime.value()', 99,
        function () {
            return x.value().getTime();
        },
        function () {
            return (new Date(y.val())).getTime();
        });
return;
    var x = _q('#f-chk');
    var y = $('#f-chk');

    x.value(true);

    do_test('checkbox.value()', 99,
        function () {
            return x.value();
        },
        function () {
            return y.prop('checked');
        });

    var x = _q('#f-r2');
    var y = $('#f-r2');

    x.value('radio on');

    do_test('radiogroup.value()', 99,
        function () {
            return x.value();
        },
        function () {
            return $('[name=fffti]:checked').val();
        });

    var x = _q('#f-s');
    var y = $('#f-s');

    x.value('Value 3');

    do_test('select.value()', 99,
        function () {
            return x.value();
        },
        function () {
            return y.val();
        });

    var x = _q('#f-sm');
    var y = $('#f-sm');

    x.value(['tomatoes', 'mushrooms']);

    do_test('select[multiple].value()', 99,
        function () {
            return x.value();
        },
        function () {
            return y.val();
        });

    var x = _q('#f-t');
    var y = $('#f-t');

    x.value(['i', 'like', '\ntomatoes', 'and', 'mushrooms']);

    do_test('textarea.value()', 99,
        function () {
            return x.value();
        },
        function () {
            return y.val();
        });

    var x = _q('#f-form');
    var y = $('#f-form');

    var data = {
        "result": "no result",
        "f-btn": "click me",
        "textarea": "i,like,\nnothing",
        "toppings": [
            "oni",
            "olives"
        ],
        "select": "select1",
        "fffti": "radio x",
        "f-chk2": false,
        "f-chk": false,
        "f-time": "11:11",
        "f-datetime": new Date("2011-01-01T01:01:00.000Z"),
        "f-month": new Date("2011-01-01T01:01:00.000Z"),
        "f-date": new Date("2011-01-01T01:01:00.000Z"),
        "f-range": 0.7,
        "f-num": 10.00,
        "f-pwd": "xxx",
        "f-text": "Test form.value()",
        "f-file": 'test.avi'
    };

    x.value(data);

    do_test('form.value()', 99,
        function () {
            return x.value().length = 1;
        },
        function () {
            var obj = {};
            y.children().each(function (i, node) {
                var name = node.name;
                if (!name) name = node.id;
                obj[name] = $(node).val();
            });
            return obj.length = 1;
        });

    _q('#test-form').remove();

    _warn('attribute ------------------')

    var x = _q('h3');
    var y = $('h3');

    do_test('.attr()', 100,
        function () {
            return x.attr();
        },
        function () {
            return y.get(0).attributes;
        });

    do_test('.attr(key, val)', 100,
        function () {
            return x.attr('class1', 'header test-my-code');
        },
        function () {
            return y.attr('class2', 'header test-my-code');
        });

    do_test('.attr(key)', 100,
        function () {
            return x.attr('class1');
        },
        function () {
            return y.attr('class2');
        });

    do_test('.attr({key: value})', 100,
        function () {
            return x.attr({ class1: null, mark1: 1999 });
        },
        function () {
            return y.attr({ class2: null, mark2: 2000 });
        });

    do_test('.attr(key, null)', 1,
        function () {
            return x.attr('mark1', null);
        },
        function () {
            return y.attr('mark2', null);
        });

    _warn('property ------------------')

    do_test('.prop()', 1000,
        function () {
            return x.prop('innerHTML');
        },
        function () {
            return y.prop('innerHTML');
        });

    var guid1 = tiny.guid();
    var guid2 = tiny.guid();
    do_test('.prop(key, value)', 1000,
        function () {
            return x.prop('guid', guid1);
        },
        function () {
            return y.prop('guid', guid2);
        });

    do_test('.prop(key)', 1000,
        function () {
            return x.prop('guid', guid1);
        },
        function () {
            return y.prop('guid', guid2);
        });

    do_test('.prop(key, null)', 1000,
        function () {
            return x.prop('guid', null);
        },
        function () {
            return y.prop('guid', null);
        });

    var nodes = document.querySelectorAll('h3');

    _warn('style ------------------');

    do_test('.style()', 100,
        function () {
            return x.style();
        },
        function () {
            return y.get(0).style;
        });

    do_test('.style(true)', 100,
        function () {
            return x.style(true);
        },
        function () {
            return window.getComputedStyle(y.get(0));
        });

    do_test('.style({key: value})', 100,
        function () {
            return x.style({
                'text-shadow': '0 3px 5px rgba(0,0,0,0.3)',
                'user-select': 'none!',
                color: 'red!'
            });
        },
        function () {
            return y.css({
                'text-shadow': '0 3px 5px rgba(0,0,0,0.3)',
                'user-select': 'none',
                color: 'red'
            });
        });

    do_test('.style(key)', 100,
        function () {
            return x.style('text-shadow');
        },
        function () {
            return y.css('text-shadow');
        });

    do_test('.style({key: null})', 100,
        function () {
            return x.style({
                'text-shadow': null,
                'user-select': null,
                color: null
            });
        },
        function () {
            return y.css({
                'text-shadow': null,
                'user-select': null,
                color: null
            });
        });

    _warn('show/hide ------------------')

    do_test('.show/hide()', 100,
        function () {
            x.hide();
            return x.show();
        },
        function () {
            y.hide();
            return y.show();
        });

    _warn('class ------------------')

    var x = _q('.run-code');
    var y = $('.run-code');

    do_test('.class()', 99,
        function () {
            return x.class();
        },
        function () {
            return y.attr('class');
        });

    do_test('.class(+)', 99,
        function () {
            return x.class('passed failed test ok collapse');
        },
        function () {
            return y.addClass('passed failed test ok collapse');
        });

    do_test('.class(?!)', 99,
        function () {
            return x.class('?run-code ?passed !fly !pig');
        },
        function () {
            return y.hasClass('run-code') && y.hasClass('passed') && !y.hasClass('fly') && !y.hasClass('pig');
        });

    do_test('.class(-)', 99,
        function () {
            return x.class('-:passed failed test ok collapse');
        },
        function () {
            return y.removeClass('passed failed test ok collapse');
        });

    do_test('.class(+-)', 99,
        function () {
            return x.class('passed failed test ok collapse')
                .class('-:passed failed test ok collapse');
        },
        function () {
            return y.addClass('passed failed test ok collapse')
                .removeClass('passed failed test ok collapse');
        });

    do_test('.class(^)', 99,
        function () {
            return x.class('^test');
        },
        function () {
            return y.toggleClass('test');
        });

    do_test('.class(?)', 99,
        function () {
            return x.class('?run-code');
        },
        function () {
            return y.hasClass('run-code');
        });

    do_test('.class(+-^?)', 99,
        function () {
            return x.class('passed -run-code ^collapse')
                .class('-passed -collapse ^run-code ?run-code');
        },
        function () {
            return y.addClass('passed').removeClass('run-code').toggleClass('collapse')
                .removeClass('passed collapse').toggleClass('run-code').hasClass('run-code');
        });

    _warn('bound sizes ------------------')

    do_test('.boundWidth("margin").top', 100,
        function () {
            return x.boundWidth('margin').top;
        },
        function () {
            return parseFloat(y.css('margin-top'));
        });

    do_test('.boundWidth("margin").left', 100,
        function () {
            return x.boundWidth('margin').left;
        },
        function () {
            return parseFloat(y.css('margin-left'));
        });

    do_test('.boundWidth("border").bottom', 100,
        function () {
            return x.boundWidth('border').bottom;
        },
        function () {
            return parseFloat(y.css('border-bottom-width'));
        });

    do_test('.boundWidth("border").right', 100,
        function () {
            return x.boundWidth('border').right;
        },
        function () {
            return parseFloat(y.css('border-right-width'));
        });

    do_test('.boundWidth("padding").bottom', 100,
        function () {
            return x.boundWidth('padding').bottom;
        },
        function () {
            return parseFloat(y.css('padding-bottom'));
        });

    do_test('.boundWidth("padding").right', 100,
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

    do_test('.boundWidth("margin,border").top', 100,
        function () {
            return x.boundWidth("margin,border").top;
        },
        function () {
            return parseFloat(y.css('border-top-width')) + parseFloat(y.css('margin-top'));
        });

    do_test('.boundWidth("margin,border").right', 100,
        function () {
            return x.boundWidth("margin,border").right;
        },
        function () {
            return parseFloat(y.css('border-right-width')) + parseFloat(y.css('margin-right'));
        });

    _warn('positions ------------------')

    do_test('.pos().left', 100,
        function () {
            return x.pos().left;
        },
        function () {
            return y.position().left + parseFloat(y.css('margin-left'));
        });

    do_test('.pos().top', 100,
        function () {
            return x.pos().top;
        },
        function () {
            return parseInt(y.position().top) + parseFloat(y.css('margin-top'));
        });

    do_test('.pos(40, 60)', 99,
        function () {
            return x.pos(40, 60);
        },
        function () {
            return y.css('left', 40).css('top', 60);
        });

    do_test('.pos().left', 100,
        function () {
            return x.pos().left;
        },
        function () {
            return y.position().left + parseFloat(y.css('margin-left'));
        });

    do_test('.pos().top', 100,
        function () {
            return x.pos().top;
        },
        function () {
            return parseInt(y.position().top) + parseFloat(y.css('margin-top'));
        });

    do_test('.top(24)', 99,
        function () {
            return x.top(24);
        },
        function () {
            return y.css('top', 24);
        });

    do_test('.left(36)', 99,
        function () {
            return x.left(36);
        },
        function () {
            return y.css('left', 36);
        });

    do_test('.top()', 99,
        function () {
            return x.top();
        },
        function () {
            return parseInt(y.position().top) + parseFloat(y.css('margin-top'));
        });

    do_test('.left()', 99,
        function () {
            return x.left();
        },
        function () {
            return y.position().left + parseFloat(y.css('margin-left'));
        });

    do_test('.top(0)', 99,
        function () {
            return x.top(0);
        },
        function () {
            return y.css('top', 0);
        });

    do_test('.left(0)', 99,
        function () {
            return x.left(0);
        },
        function () {
            return y.css('left', 0);
        });

    _warn('dimensions ------------------')

    do_test('.width(160)', 99,
        function () {
            return x.width(160);
        },
        function () {
            return y.outerWidth(160);
        });

    do_test('.height(100)', 99,
        function () {
            return x.height(100);
        },
        function () {
            return y.outerHeight(100);
        });

    do_test('.width()', 99,
        function () {
            return x.width();
        },
        function () {
            return y.outerWidth();
        });

    do_test('.height()', 99,
        function () {
            return x.height();
        },
        function () {
            return y.outerHeight();
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

    _warn('box ------------------')

    do_test('.box(margin).width', 100,
        function () {
            return x.box('margin').width;
        },
        function () {
            return y.outerWidth(true);
        });

    do_test('.box(margin).height', 100,
        function () {
            return x.box('margin').height;
        },
        function () {
            return y.outerHeight(true);
        });

    do_test('.box(120, 90)', 100,
        function () {
            return x.box(120, 90);
        },
        function () {
            return y.outerHeight(120).outerWidth(90);
        });

    do_test('.box(border).width', 100,
        function () {
            return x.box().width;
        },
        function () {
            return y.outerWidth();
        });

    do_test('.box(border).height', 100,
        function () {
            return x.box().height;
        },
        function () {
            return y.outerHeight();
        });

    do_test('.box("inner", {100, 80})', 100,
        function () {
            return x.box("inner", { width: 100, height: 80 });
        },
        function () {
            return y.innerHeight(100).innerWidth(80);
        });

    do_test('.box(inner).width', 100,
        function () {
            return x.box('inner').width;
        },
        function () {
            return y.innerWidth();
        });

    do_test('.box(inner).height', 100,
        function () {
            return x.box('inner').height;
        },
        function () {
            return y.innerHeight();
        });

    do_test('.box(client).width', 100,
        function () {
            return x.box('client').width;
        },
        function () {
            return y.get(0).clientWidth;
        });

    do_test('.box(client).height', 100,
        function () {
            return x.box('client').height;
        },
        function () {
            return y.get(0).clientHeight;
        });

    do_test('.box(scroll).width', 100,
        function () {
            return x.box('scroll').width;
        },
        function () {
            return y.get(0).scrollWidth;
        });

    do_test('.box(scroll).height', 100,
        function () {
            return x.box('scroll').height;
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
