if (typeof exports === 'object') {
  exports.mochaHooks = {
    beforeAll() {
      global.chai = require('chai');
      var { JSDOM } = require('jsdom');
      var { window } = new JSDOM('<html><head></head><body></body></html>', {
        url: 'https://example.org/',
      });
      global.window = window;
      global.document = window.document;
      var tinymce = require('../../assets/javascripts/tinymce/tinymce.min');
      global.tinymce = window.tinymce = tinymce;

      require('../../assets/javascripts/RedmineFormatPlugin');
    },
  };
}
