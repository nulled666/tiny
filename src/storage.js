define([
    './global',
    './base',
], function (G, tiny) {

    'use strict';

    //////////////////////////////////////////////////////////
    // LOCAL STORAGE ACCESS
    //////////////////////////////////////////////////////////

    var _storage = local_storage;

    // Custom key prefix for data entry filtering
    _storage.keyPrefix = '';

    tiny.x.add({
        storage: _storage
    });


    var TAG_STORAGE = '_storage()' + G.TAG_SUFFIX;
    /**
     * Simple window.localStorage wrapper
     * Integer, Boolean, Array, Date & Object types will be converted automatically
     * ```
     *   // filter keys by prefix, default is ''
     *   tiny.storage.keyPrefix = 'your_prefix'
     *   _storage()            // return all values as an Object
     *   _storage(key)         // get value
     *   _storage(key, value)  // set value
     *   _storage(key, null)   // delete value of given key
     *   _storage(null, null)  // delete all contents
     *   _storage({key1: value1, key2: null, ...})  // batch process
     * ```
     */
    function local_storage(key, value) {

        var storage = window.localStorage;

        if (typeof key === 'string') {

            key = _storage.keyPrefix == '' ? key : _storage.keyPrefix + '_' + key;

            if (value === undefined) {

                // ==> READ
                var result = storage[key];
                result = storage_output_type_conversion(result);
                return result;

            } else if (value === null) {

                // ==> DELETE
                tiny.log(TAG_STORAGE, 'Deleted window.localStorage item: "' + key + '"');
                return storage.removeItem(key);

            } else {

                // ==> WRITE
                value = storage_input_type_conversion(value);
                storage.setItem(key, value);
                tiny.log(TAG_STORAGE, 'Set window.localStorage item: "' + key + '" = ', value);

            }

        } else if (key === undefined) {

            // ==> READ ALL
            var check_prefix = _storage.keyPrefix !== '';
            var result = {};

            for (var label in storage) {
                var item = storage[label];
                if (check_prefix) {
                    if (label.startsWith(_storage.keyPrefix + '_') == false) continue;
                    label = label.replace(_storage.keyPrefix + '_', '');
                }
                result[label] = storage_output_type_conversion(item);
            }

            return result;

        } else if (key === null && value === null) {

            // ==> DELETE ALL
            if (_storage.keyPrefix == '') {

                // the quick way
                tiny.warn(TAG_STORAGE, 'All items in window.localStorage are cleared');
                storage.clear();

            } else {

                // have to check every key for prefix
                for (var label in storage) {
                    var item = storage[label];
                    if (label.startsWith(_storage.keyPrefix + '_'))
                        storage.removeItem(label);
                }

                tiny.warn(TAG_STORAGE, 'All items in window.localStorage with prefix "' + _storage.keyPrefix + '" are cleared');

            }

        } else if (typeof key === 'object') {

            // ==> BATCH OPERATION
            for (var label in key) {
                local_storage(label, key[label]);
            }

        } else {

            tiny.error(TAG_STORAGE, 'Expect a string, object or null. > Got "' + typeof key + '": ', key);
            throw new TypeError(G.SEE_ABOVE);

        }

    }

    /**
     * Automatic convert types to special type strings
     */
    function storage_input_type_conversion(value) {

        if (value === true)
            return 'TRUE';

        if (value === false)
            return 'FALSE';

        if (typeof value == 'object') {

            if (value instanceof Date) {
                return '[Date]' + JSON.stringify(value);
            }

            return JSON.stringify(value);

        }

        return value;

    }

    /**
     * Automatic convert strings to matching types
     */
    function storage_output_type_conversion(value) {

        // boolean
        if (value == 'TRUE')
            return true;

        if (value == 'FALSE')
            return false;

        if (typeof value == 'string') {

            // integer
            if (/^[0-9]+$/.test(value)) {
                return parseInt(value, 10);
            }

            // Date
            if (value.indexOf('[Date]') == 0) {
                value = JSON.parse(value.replace('[Date]', ''));
                return new Date(value);
            }

            // Array & Object
            if (value.length > 5) {

                var start = value[0], end = value[value.length - 1];

                if ((start == '{' && end == '}') || (start == '[' && end == ']')) {
                    return JSON.parse(value);
                }

            }

        }

        return value;

    }

});