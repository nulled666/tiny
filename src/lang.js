define([
    './global',
    './base'
], function (G, tiny) {

    'use strict';

    //////////////////////////////////////////////////////////
    // MULTILINGUE SUPPORT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _lang = get_lang_string;

    _lang.get = get_language;
    _lang.set = set_language;

    tiny.fn.add({
        lang: _lang
    });

    var _lang_code = 'en';
    var _lang_strings = {
        'en': {
            '_name': 'English'
        }
    };

    /**
     * Get string of current language
     */
    function get_lang_string(str) {

        var lang_str = _lang.strings[str];

        if (typeof lang_str != 'string') {
            tiny.warn('Language string not found: ', lang_str);
            lang_str = str;
        }

        return lang_str;

    }

    /**
     * Get current language code
     */
    function get_language() {
        return _lang_code;
    }

    /**
     * Set current language code
     */
    function set_language(lang) {

        if (_lang_code in _lang_strings)
            _lang_code = lang;
            
    }

});