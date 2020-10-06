(function(root, factory) {
  if (typeof exports === 'object') {
    var assert = require('chai').assert;
    var { JSDOM } = require('jsdom');

    factory(tiny, assert, JSDOM); // FIXME
  } else {
    factory(tinyMCE, chai.assert, null);
  }
}(this, function (tinyMCE, assert, JSDOM) {
  var doc;

  function node(input) {
    var dom;
    if (typeof exports === 'object') {
      doc = new JSDOM(input).window.document;
      dom = doc;
    } else {
      doc = document;
      dom = doc.createElement('div');
      dom.innerHTML = input;
    }
    return dom.querySelector('#me') || dom.querySelector('#myChild').firstChild;
  }

  var _editor;

  function setup(editor) {
    _editor = editor;
  }

  tinyMCE.init({
    selector: '#test',
    plugins: 'redmineformat',
    setup: setup
  });

  suite('RedmineFormatPlugin', function() {
    test('', function() {
      var content = node('<pre id="me">a<br>b</pre>');

      _editor.setContent('<pre id="me">a<br>b</pre>');
      // _editor.off('SetContent')
      // _editor.fire('PreProcess', { node: content, format: 'html' })
      var output = _editor.getContent()
    });
  });
}));
