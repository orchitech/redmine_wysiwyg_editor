(function(root, factory) {
  if (typeof exports === 'object') {
    var converterUtils = require('../assets/javascripts/ConverterUtils.js');
    var assert = require('chai').assert;
    var { JSDOM } = require('jsdom');

    factory(converterUtils, assert, JSDOM);
  } else {
    factory(ConverterUtils, chai.assert, null);
  }
}(this, function(ConverterUtils, assert, JSDOM) {

function node(input) {
  var doc;
  if (typeof exports === 'object') {
    doc = new JSDOM(input).window.document;
  } else {
    var doc = document.createElement('div');
    doc.innerHTML = input;
  }
  return doc.querySelector('#me')
    || doc.querySelector('#myChild').firstChild;
}

suite('Converter utils', function() {
  var x = new ConverterUtils();

  test('languageClassName', function() {
    var content = 'markup';
    var expected = 'html';

    assert.equal(x.languageClassName(content), expected);
  });

  test('imageUrl', function() {
    var url = '/attachments/download/1/foo.jpg';
    var attachment = { 'foo.jpg': 1 };
    var expected = 'foo.jpg';

    assert.equal(x.imageUrl(url, attachment), expected);
  });

  test('classAttr', function() {
    var content = node('<span id="me" class="wiki-class-test another-class-test">Hello, world</span>');
    var expected = '(test another-class-test)';

    assert.equal(x.classAttr(content), expected);
  });

  test('styleAttr', function() {
    var content = node('<span id="me" style="width: 100%">Hello, world</span>');
    var expected = '{width: 100%;}';
    assert.equal(x.styleAttr(content), expected);
  });

  test('img', function() {
    var content = node('<img id="me" src="/attachments/download/1/foo.jpg">');
    var attachment = { 'foo.jpg': 1 };
    var expected = '!foo.jpg!';

    assert.equal(x.img(content, attachment), expected);
  });

  test('tableCellOption', function() {
    var content = node('<table><tbody><tr id="myChild"><th style="text-align: center">IT</th></tr></tbody></table>');
    var expected = '_=.';

    assert.equal(x.tableCellOption(content), expected);
  });
});

}));
