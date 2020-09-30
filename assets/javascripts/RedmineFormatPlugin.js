(function() {
  var CODE_CLASS_PATTERNS = [
    /^(?:language|code)-(\S+)$/, // CommonMark
    /^(\S+)\s+syntaxhl$/ // Redmine
  ];

  tinymce.PluginManager.add('redmineformat', function (editor) {
    var $ = editor.$;

    editor.on('PreProcess', function (e) {
      $('pre', e.node).each(function (index, node) {
        replaceContentWithInnerText(node);
      });
    });

    editor.on('SetContent', function () {
      $('pre').filter(function (index, node) {
        return !!codeLanguageFromClassName(codeBlockCodeNode(node).className);
      }).each(function (index, node) {
        var codeNode = codeBlockCodeNode(node);
        replaceContentWithInnerText(node);
        node.innerHTML = editor.dom.encode(node.textContent);
        node.className = "language-" + codeLanguageFromClassName(codeNode.className);
      });
    });
  });

  function replaceContentWithInnerText(node) {
    $(node).find('br').each(function (index, node) {
      node.parentNode.replaceChild(document.createTextNode('\n'), node);
    });
  }

  function codeBlockCodeNode(preNode) {
    var singleChild = preNode.childNodes.length === 1 && preNode.firstChild;
    return singleChild && singleChild.nodeName === 'CODE' && singleChild.className ? singleChild : preNode;
  }

  function codeLanguageFromClassName(className) {
    if (!className) {
      return null;
    }
    return CODE_CLASS_PATTERNS.reduce(function (match, regexp) {
      return match || (className.match(regexp) || [null, null])[1];
    }, null);
  }
})();
