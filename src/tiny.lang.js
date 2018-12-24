define([
    './global',
    './tiny.base'
], function (G, tiny) {

    'use strict';

    //////////////////////////////////////////////////////////
    // MULTILINGUE SUPPORT FUNCTIONS
    //////////////////////////////////////////////////////////
    var _lang = get_lang_string;

    _lang.get = get_language;
    _lang.set = set_language;

    tiny.x.add({
        lang: _lang
    });

    _lang.strings = {
        'en': {
            '_name': 'English'
        }
    };
    var _lang_code = 'en';

    /**
     * Get string of current language
     */
    function get_lang_string(label) {

        var lang_str = _lang.strings[_lang_code][label];

        if (typeof lang_str != 'string') {
            tiny.warn('Language string not found: ', lang_str);
            lang_str = label;
        }

        if (lang_str.startsWith('=> ')) {
            label = lang_str.substring(3);
            return get_lang_string(label);
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

        if (_lang_code in _lang.strings)
            _lang_code = lang;

    }

});