(function(root, factory) {
  if (typeof exports === 'object') {
    var eu = require('../assets/javascripts/EditorUtils.js');
    var assert = require('chai').assert;

    factory(eu, assert);
  } else {
    factory(EditorUtils, chai.assert);
  }
}(this, function(EditorUtils, assert) {

suite('Editor utils', function() {
  var x = new EditorUtils();

  test('isImageFile', function() {
    var content = 'foo.jpg';

    assert.equal(x.isImageFile(content), true);
  });

  test('setLanguage', function() {
    var content = 'en-GB';
    var expected = 'en_GB';

    assert.equal(x.setLanguage(content), expected);
  });
});

}));
