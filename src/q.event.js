define([
    './global',
    './tiny.base',
    './q.base'
], function (G, tiny, TinyQ) {

    'use strict';

    //////////////////////////////////////////////////////////
    // EVENT METHOD FOR TINYQ
    //////////////////////////////////////////////////////////
    tiny.extend(TinyQ.prototype, {
        on: listen_to_event,
        off: false
    });


    var TAG_Q = TinyQ.x.TAG;
    var SEE_ABOVE = G.SEE_ABOVE;

    var _error = tiny.error;



    /**
     * TinyQ.on() method
     * .on(event, handle)
     * .on(event, class, handle, extra)
     * .on(event, filter, handle, extra)
     */
    function listen_to_event(event, watch, func) {

        if (typeof event != 'string') {
            _error(TAG_Q, 'Expect an event string. > Got "' + typeof event + '": ', event);
            throw new TypeError(SEE_ABOVE);
        }

        var type = typeof watch;
        if(type == 'function'){
            // ==> (event, func)
            func = watch, watch = null;
        }else

    }

});