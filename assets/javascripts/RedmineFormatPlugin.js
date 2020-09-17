(function() {
  var CODE_CLASS_PATTERNS = [
    /^(?:language|code)-(\S+)$/, // CommonMark
    /^(\S+)\s+syntaxhl$/ // Redmine
  ];

  tinymce.PluginManager.add('redmineformat', function (editor) {
    var $ = editor.$;

    var innerText = function(node) {
      $(node).find('br').each(function (index, node) {
        node.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), node);
      });
    };

    editor.on('PreProcess', function (e) {
      $('pre', e.node).each(function (index, node) {
        innerText(node);
      });
    });

    editor.on('SetContent', function () {
      $('pre').filter(function (index, node) {
        return isCodeBlock(node);
      }).each(function (index, node) {
        var firstChild = node.firstChild;
        var codeNode = firstChild.nodeName == 'CODE' && firstChild.className ? firstChild : node;
        innerText(node);
        node.innerHTML = editor.dom.encode(node.textContent);
        node.className = "language-" + codeLanguageFromClassName(codeNode.className);
      });
    });
  });

  function isCodeBlock(node) {
    var firstChild = node.firstChild;
    var hasSingleChild = firstChild && node.childNodes.length === 1;
    if (!hasSingleChild) {
      return false;
    }
    var codeNode = firstChild.nodeName == 'CODE' && firstChild.className ? firstChild : node;
    return !!codeLanguageFromClassName(codeNode.className);
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
