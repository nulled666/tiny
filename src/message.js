
define([
    './global',
    "./base",
], function (G, tiny) {
    "use strict";

    //////////////////////////////////////////////////////////
    // SIMPLE MESSAGE SYSTEM
    //////////////////////////////////////////////////////////

    var _message = {
        listen: listen_message,
        post: post_message,
        postDelayed: post_delayed_message
    };

    tiny.fn.add({
        message: _message
    });

    // internal registry of message handlers
    var _message_handlers = {};
    var _delayed_messages = {};

    var TAG_MSG_LISTEN = '_message.listen()' + G.TAG_SUFFIX;
    /**
     * Add a custom message listener
     * ```
     *   _message.listen('my_message', message_handler)
     *   _message.post('my_message', param1, param2, ...)
     *     -> message_handler('my_message', param1, param2, ...)
     * ```
     */
    function listen_message(msg, handler) {

        if (typeof msg !== 'string') {
            tiny.error(TAG_MSG_LISTEN, 'Expect a message string. > Got "' + typeof msg + '": ', msg);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (typeof handler !== 'function') {
            tiny.error(TAG_MSG_LISTEN, 'Expect a function. > Got "' + typeof handler + '": ', handler);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (!_message_handlers[msg])
            _message_handlers[msg] = [];

        tiny.log(TAG_MSG_LISTEN, 'Listen to message: "' + msg + '" + ', tiny.fn.getFuncName(handler) + '()');

        _message_handlers[msg].push(handler);

        return _message;

    }

    var TAG_MSG_POST = '_message.post()' + G.TAG_SUFFIX;
    /**
     * Trigger a custom message with any number of arguments
     * ```
     *    _message.post('my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_message(msg) {

        if (typeof msg !== 'string') {
            tiny.error(TAG_MSG_POST, 'Expect a message string. > Got "' + typeof msg + '": ', msg);
            throw new TypeError(G.SEE_ABOVE);
        }

        var sliced_args = tiny.fn.toArray(arguments, 1);
        tiny.info(TAG_MSG_POST, 'Post message "' + msg + '" + ', sliced_args);

        var handles = _message_handlers[msg];

        if (!handles || handles.length < 1) {
            tiny.warn(TAG_MSG_POST, 'Nobody is listen to this message');
            return _message;
        }

        // call handles
        tiny.each(handles, function (callback) {
            callback.apply(this, sliced_args);
        });

        tiny.log(TAG_MSG_POST, handles.length + ' message handlers triggered');

        return _message;

    }

    var TAG_MSG_POST_DELAYED = '_message.postDelayed()' + G.TAG_SUFFIX;
    /**
     * Post a delayed message
     * ```
     *    _message.post(1000, 'my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_delayed_message(delay, msg) {

        if (typeof delay !== 'number') {
            tiny.error(TAG_MSG_POST_DELAYED, 'Expect a delay time in milliseconds. > Got "' + typeof delay + '": ', delay);
            throw new TypeError(G.SEE_ABOVE);
        }

        if (typeof msg !== 'string') {
            tiny.error(TAG_MSG_POST_DELAYED, 'Expect a message string. > Got "' + typeof msg + '": ', msg);
            throw new TypeError(G.SEE_ABOVE);
        }

        var sliced_args = tiny.fn.toArray(arguments, 1);
        if (_delayed_messages[msg] !== undefined)
            clearTimeout(_delayed_messages[msg]);

        _delayed_messages[msg] = setTimeout(function () {
            post_message.apply(this, sliced_args);
        }, delay);

        return _message;

    }

});