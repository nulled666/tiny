define([
    './global',
    './base'
], function (G, tiny) {

    'use strict';

    //////////////////////////////////////////////////////////
    // MULTILINGUE SUPPORT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _lang = get_lang_string;
    _lang.strings = {};
    _lang.set = set_language;

    tiny.fn.add({
        lang: _lang
    });

    // get language string if not empty
    function get_lang_string(str) {

        var lang_str = _lang.strings[str];

        if (typeof lang_str != 'string') {
            tiny.warn('Language string not found: ', lang_str);
            lang_str = str;
        }

        return lang_str;

    }

    function set_language(lang) {

    }

}