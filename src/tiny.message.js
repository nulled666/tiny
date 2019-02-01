
define([
    './global',
    './tiny.base'
], function (G, tiny) {
    "use strict";

    //////////////////////////////////////////////////////////
    // SIMPLE MESSAGE SYSTEM
    //////////////////////////////////////////////////////////

    var _message = {
        register: register_messages,
        listen: listen_message,
        post: post_message,
        postDelayed: post_delayed_message
    };

    tiny.x.add({
        message: _message
    });


    var TAG_SUFFIX = G.TAG_SUFFIX;

    // internal registry of message handlers
    var _message_handlers = {};
    var _delayed_messages = {};

    var TAG_MSG_REGISTER = '_message.register()' + TAG_SUFFIX;
    /**
     * Register messages before using them
     */
    function register_messages(namespace, messages) {

        if (messages == undefined) {
            messages = namespace
            namespace = ''
        }

        if (typeof namespace !== 'string')
            throw new TypeError(TAG_MSG_REGISTER + 'Message namespace must be a string. > Got "' + typeof namespace + '"')

        if (namespace != '') namespace += '::'
        if (typeof messages === 'string') messages = [messages]

        if (tiny.type(messages) !== 'Array')
            throw new TypeError(TAG_MSG_REGISTER + 'Message names must be a string or array. > Got "' + typeof messages + '"')

        tiny.each(messages, function (msg) {
            let key = namespace + msg
            if (_message_handlers[key] !== undefined)
                throw new TypeError(TAG_MSG_REGISTER + 'Message has already been registered: "' + key + '"')
            _message_handlers[key] = []
        })

        return _message

    }


    var TAG_MSG_LISTEN = '_message.listen()' + TAG_SUFFIX;
    /**
     * Add a custom message listener
     * ```
     *   _message.listen('my_message', message_handler)
     *   _message.post('my_message', param1, param2, ...)
     *     -> message_handler('my_message', param1, param2, ...)
     * ```
     */
    function listen_message(msg, handler) {

        if (typeof msg !== 'string')
            throw new TypeError(TAG_MSG_LISTEN + 'Expect a message string. > Got "' + typeof msg + '"')

        if (typeof handler !== 'function')
            throw new TypeError(TAG_MSG_LISTEN + 'Expect a function. > Got "' + typeof handler + '"')

        if (!_message_handlers[msg])
            throw new Error(TAG_MSG_LISTEN + 'Message has not been registered: "' + msg + '"')

        tiny.log(TAG_MSG_LISTEN + '"' + msg + '" => ', handler.name + '()');

        _message_handlers[msg].push(handler);

        return _message;

    }


    var TAG_MSG_POST = '_message.post()' + TAG_SUFFIX;
    /**
     * Trigger a custom message with any number of arguments
     * ```
     *    _message.post('my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_message(msg) {

        if (typeof msg !== 'string')
            throw new TypeError(TAG_MSG_POST + 'Expect a message string. > Got "' + typeof msg + '"')

        var sliced_args = tiny.x.toArray(arguments, 1)

        tiny.group(TAG_MSG_POST + '"' + msg + '"')

        var handlers = _message_handlers[msg]

        if (!handlers || handlers.length < 1) {
            tiny.warn(TAG_MSG_POST, 'Nobody is listen to this message')
            return _message
        }

        // call handles
        tiny.each(handlers, function (callback) {
            callback.apply(this, sliced_args)
        })

        tiny.group()

        return _message

    }

    var TAG_MSG_POST_DELAYED = '_message.postDelayed()' + TAG_SUFFIX;
    /**
     * Post a delayed message
     * ```
     *    _message.post(1000, 'my_message', 123, true, {obj: 'me'})
     * ```
     */
    function post_delayed_message(delay, msg) {

        if (typeof delay !== 'number')
            throw new TypeError(TAG_MSG_POST_DELAYED + 'Expect a delay time in milliseconds. > Got "' + typeof delay + '"');

        if (typeof msg !== 'string')
            throw new TypeError(TAG_MSG_POST_DELAYED + 'Expect a message string. > Got "' + typeof msg + '"');

        var sliced_args = tiny.x.toArray(arguments, 1)

        if (_delayed_messages[msg] !== undefined)
            clearTimeout(_delayed_messages[msg])

        _delayed_messages[msg] = setTimeout(function () {
            post_message.apply(this, sliced_args)
        }, delay)

        return _message

    }

});