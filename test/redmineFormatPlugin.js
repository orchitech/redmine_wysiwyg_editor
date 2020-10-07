suite('RedmineFormatPlugin', function () {
  setup(function () {
    var wysiwygNode = document.createElement('div');
    wysiwygNode.id = 'wysiwyg';
    document.body.appendChild(wysiwygNode);
  });
  teardown(function() {
    var editor = tinymce.get('wysiwyg');
    if (editor) {
      editor.off(null);
      tinymce.remove('#wysiwyg');
    }
    var wysiwygNode = document.getElementById('wysiwyg');
    if (wysiwygNode) {
      document.body.removeChild(wysiwygNode);
    }
  });
  function withEditor(allowedEvents, testCallback) {
    tinymce.init({
      selector: '#wysiwyg',
      theme: false,
      plugins: 'redmineformat',
      setup: function (editor) {
        editor.on('init', function(e) {
          var events = [].concat(allowedEvents).map(function (event) {
            return event.toLowerCase();
          });
          ['SetContent', 'PreProcess'].forEach(function (event) {
            if (events.indexOf(event.toLowerCase()) < 0) {
              editor.off(event);
            }
          });
          testCallback(editor);
        });
      }
    });
  }

  suite('SetContent handler', function () {
    test('should normalize code block', function (done) {
      withEditor('SetContent', function (editor) {
        var c = '<p><pre><code class="java syntaxhl">foo<br>bar</code></pre></p>';
        editor.setContent(c);
        chai.assert.equal(editor.getContent(), '<pre class="language-java">foo\nbar</pre>');
        done();
      });
    });
  });

  suite('PreProcess handler', function () {
    test('should convert br to nl and normalize text', function (done) {
      withEditor('PreProcess', function (editor) {
        var c = '<p><pre>foo<br>bar</pre></p>';
        editor.on('PreProcess', function (e) {
          var pre = editor.$('pre', e.node)[0];
          chai.assert.equal(pre.childNodes.length, 1, 'child node count');
          chai.assert.equal(pre.firstChild.nodeType, window.Node.TEXT_NODE, 'node type');
        });
        editor.setContent(c);
        chai.assert.equal(editor.getContent(), '<pre>foo\nbar</pre>');
        done();
      });
    });
  });
});
