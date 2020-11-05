(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.RedmineFormatting = factory());
}(this, (function () { 'use strict';

  var RedmineFormatting = function () {
    function RedmineFormatting(options) {
      if (options === void 0) {
        options = {};
      }

      this.options = options;
    }

    var _proto = RedmineFormatting.prototype;

    _proto.preprocessTextForWysiwygRendering = function preprocessTextForWysiwygRendering(redmineText) {
      return redmineText;
    };

    _proto.postprocessHtmlForWysiwyg = function postprocessHtmlForWysiwyg(redmineHtml) {
      return redmineHtml;
    };

    _proto.preprocessWysiwygHtmlForConversion = function preprocessWysiwygHtmlForConversion(wysiwygHtml) {
      return wysiwygHtml;
    };

    _proto.postprocessConvertedText = function postprocessConvertedText(convertedText) {
      return convertedText;
    };

    return RedmineFormatting;
  }();

  var RedmineFormatting_1 = RedmineFormatting;

  return RedmineFormatting_1;

})));
