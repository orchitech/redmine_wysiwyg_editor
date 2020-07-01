(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('./languages'));
  } else {
    var languages = (typeof Languages !== 'undefined') ? Languages : null;
    root.EditorUtils = factory(languages);
  }
}(this, function(Languages) {
  function EditorUtils() {
    this.languages = new Languages();
  }

  EditorUtils.prototype.codeLanguages = function(oldPreviewAccess) {
    return this.languages.codeLanguages(oldPreviewAccess);
  };

  EditorUtils.prototype.setLanguage = function(lang) {
    var option = ['af_ZA', 'ar', 'be', 'bg_BG', 'bn_BD', 'ca', 'cs', 'cs_CZ', 'cy', 'da', 'de',
      'de_AT', 'dv', 'el', 'en_CA', 'en_GB', 'es', 'es_MX', 'et', 'eu', 'fa_IR', 'fi', 'fr_FR',
      'ga', 'gl', 'he_IL', 'hr', 'hu_HU', 'id', 'it', 'ja', 'ka_GE', 'kab', 'kk', 'km_KH', 'ko_KR',
      'lt', 'lv', 'nb_NO', 'nl', 'pl', 'pt_BR', 'pt_PT', 'ro', 'ru', 'sk', 'sl_SI', 'sr', 'sv_SE',
      'ta', 'ta_IN', 'th_TH', 'tr', 'tr_TR', 'ug', 'uk', 'uk_UA', 'uz', 'vi_VN', 'zh_CN', 'zh_TW'];

    var language = lang.replace(/-.+/, function(match)  {
      return match.toUpperCase().replace('-', '_');
    });

    return (option.indexOf(language) >= 0) ? language : 'en';
  };

  EditorUtils.prototype.isImageFile = function(name) {
    return /\.(jpeg|jpg|png|gif|bmp)$/i.test(name);
  };

  return EditorUtils;
}));
