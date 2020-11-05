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

suite('Converters', function() {
  var format = 'markdown';
  var x = new Converters({ format });

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
