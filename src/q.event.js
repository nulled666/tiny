define([
    './global',
    './base',
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

    /**
     * TinyQ.on() method
     * .on(event, handle)
     * .on(event, class, handle)
     * .on(event, filter, handle)
     */
    function listen_to_event(event, param, extra) {

        if (typeof event != 'string') {
            tiny.error(TinyQ.x.TAG, 'Expect an event string. > Got "' + typeof event + '": ', event);
            throw new TypeError(G.SEE_ABOVE);
        }

    }

});