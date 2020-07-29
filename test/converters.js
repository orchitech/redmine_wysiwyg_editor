(function(root, factory) {
  if (typeof exports === 'object') {
    var converters = require('../assets/javascripts/Converters.js');
    var assert = require('chai').assert;

    factory(converters, assert);
  } else {
    factory(Converters, chai.assert);
  }
}(this, function(Converters, assert) {

suite('Converters', function() {
  var format = 'markdown';
  var x = new Converters({ format });

  test('preprocessTextForRendering', function() {
    var content = '``` c\nfoo\n```';
    var expected = '```\nc+-*/!?\nfoo\n```\n\n&nbsp;'
    assert.equal(x.preprocessTextForRendering(content, format), expected);
  });

  test('postprocessHtml', function() {
    var content = '<pre>c+-*/!?\nfoo</pre>';
    var expected = '<pre class="language-c">\nfoo</pre>';
    assert.equal(x.postprocessHtml(content), expected);
  });

  test('preprocessHtmlForConversion', function() {
    var content = '<h1>heading</h1>';
    var expected = '<h1>heading</h1>';
    // currently not replacing anything
    assert.equal(x.preprocessHtmlForConversion(content), expected);
  });

  test('postprocessConvertedText', function() {
    var content = '# heading';
    var expected = '# heading';
    // currently not replacing anything
    assert.equal(x.postprocessConvertedText(content), expected);
  });
});

}));
