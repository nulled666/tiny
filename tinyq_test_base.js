define(function () {

    function do_test(tag, loop, func1, func2, show) {
        var x, y;
        _time('time001');
        _each(loop, function () { x = func1(); })
        var t1 = _time('time001', false);
        _time('time002');
        _each(loop, function () { y = func2(); })
        var t2 = _time('time002', false);
        var color = t1 < t2 ? 'color: #090' : 'color: #900';
        _log('%c' + tag + ' >', color, t1.toFixed(3), ':', t2.toFixed(3), '(' + x.length + '/' + y.length + ')', x.length == y.length);
        if (show) {
            _log(x);
            _log(y);
        }
    }

    return do_test;

})