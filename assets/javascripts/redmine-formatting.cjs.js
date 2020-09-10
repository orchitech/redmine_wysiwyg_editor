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

  _proto.processHtmlCodeBlock = function processHtmlCodeBlock(wysiwygHtml, document) {
    var dom = wysiwygHtml;
    var nodeList = dom.getElementsByTagName('pre');

    for (var i = 0; i < nodeList.length; i++) {
      var node = nodeList[i];
      var firstChild = node.firstChild;
      var codeClassPattern = /^(\S+)\s+syntaxhl$/;
      var hasSingleChild = firstChild && node.childNodes.length === 1;
      var codeNode = hasSingleChild && firstChild.nodeName === 'CODE' && firstChild.className ? firstChild : node;
      var hasSiblings = firstChild.previousSibling || firstChild.nextSibling;
      var hasInfostring = codeClassPattern.test(codeNode.className);
      var isCodeBlock = node.childNodes && firstChild.nodeName === 'CODE' ? hasSingleChild && !hasSiblings && hasInfostring : hasInfostring;

      if (isCodeBlock) {
        var newElement = document.createElement('pre');
        newElement.innerHTML = node.textContent;
        newElement.className = "language-" + codeNode.className.match(codeClassPattern)[1];
        dom.replaceChild(newElement, node);
      }
    }

    return dom;
  };

  return RedmineFormatting;
}();

var RedmineFormatting_1 = RedmineFormatting;

module.exports = RedmineFormatting_1;
