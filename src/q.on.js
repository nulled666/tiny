define([
    './global',
    './base',
    './q'
], function (G, tiny, tinyQ) {

    'use strict';

    //////////////////////////////////////////////////////////
    // EVENT METHOD FOR TINYQ
    //////////////////////////////////////////////////////////
    tiny.extend(tinyQ.prototype, {
        on: listen_to_event
    });

    /**
     * tinyQ.on() method
     * .on(event, handle)
     * .on(event, class, handle)
     * .on(event, filter, handle)
     */
    function listen_to_event(event, param, extra) {

        if (typeof event != 'string') {
            tiny.error(tinyQ.TAG, 'Expect an event string. > Got "' + typeof event + '": ', event);
            throw new TypeError(G.SEE_ABOVE);
        }

    }

});