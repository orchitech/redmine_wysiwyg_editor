'use strict';

var RedmineFormatting = function () {
  function RedmineFormatting(options) {
    if (options === void 0) {
      options = {};
    }

    this.options = options;
  }

  var _proto = RedmineFormatting.prototype;

  _proto.preprocessTextForWysiwygRendering = function preprocessTextForWysiwygRendering(redmineText) {
    var data = redmineText;

    if (['markdown', 'common_mark'].indexOf(this.options.format) >= 0) {
      data = data.replace(/^~~~ *(\w+)([\S\s]+?)~~~$/mg, '```\n$1+-*/!?$2```').replace(/^``` *(\w+)([\S\s]+?)```$/mg, '```\n$1+-*/!?$2```');
    }

    return data;
  };

  _proto.postprocessHtmlForWysiwyg = function postprocessHtmlForWysiwyg(redmineHtml) {
    var data = redmineHtml;

    if (['markdown', 'common_mark'].indexOf(this.options.format) >= 0) {
      data = data.replace(/<pre>(?:<code>)*?(\w+)\+-\*\/!\?([\S\s]+?)(?:<\/code>)*?<\/pre>/g, '<pre class="language-$1">$2</pre>');
    }

    return data;
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

module.exports = RedmineFormatting_1;
