define(function () {

    function do_test(tag, loop, func1, func2, show) {

        var x, y;

        _time('time001');
        _each(loop, function () { x = func1(); })
        var t1 = _time('time001', false);
        _time('time002');

        _each(loop, function () { y = func2(); })
        var t2 = _time('time002', false);
        var color = t1 < t2 ? '[+]' : ':-:';

        var xl = x;
        var yl = y;
        if (x && x.length != undefined) xl = x.length;
        if (x && x.count != undefined) xl = x.count;
        if (y && y.length != undefined) yl = y.length;

        _log(color, xl === yl, tag, parse_time(t1), ':', parse_time(t2), '[' + xl + '/' + yl + ']');

        if (show) {
            _log(x);
            _log(y);
        }

    }

    function parse_time(t){
        return parseFloat(t.toFixed(3));
    }

    return do_test;

})