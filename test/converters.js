(function(root, factory) {
  if (typeof exports === 'object') {
    var converters = require('../assets/javascripts/Converters.js');
    var assert = require('chai').assert;
    var { JSDOM } = require('jsdom');

    factory(converters, assert, JSDOM);
  } else {
    factory(Converters, chai.assert, null);
  }
}(this, function(Converters, assert, JSDOM) {
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

suite('Converters', function() {
  var format = 'markdown';
  var x = new Converters({ format });

  test('processHtmlCodeBlock', function() {
    var content = node('<div id="me"><pre><code class="c syntaxhl"><span class="token keyword">int main()</span></code></pre></div>');
    var expected = '<pre class="language-c">int main()</pre>';

    assert.equal(x.processHtmlCodeBlock(content, doc).innerHTML, expected);
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
