(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('./languages'));
  } else {
    var languages = (typeof Languages !== 'undefined') ? Languages : null;
    root.ConverterUtils = factory(languages);
  }
}(this, function(Languages) {
  function ConverterUtils() {
    this.languages = new Languages();
  }

  ConverterUtils.prototype.codeLanguages = function(oldPreviewAccess) {
    return this.languages.codeLanguages(oldPreviewAccess);
  };
    
  ConverterUtils.prototype.languageClassName = function(lang) {
    var code = this.codeLanguages();

    for (var i = 0; i < code.length; i++) {
      if (code[i].value === lang) return code[i].klass;
    }

    return null;
  };

  ConverterUtils.prototype.imageUrl = function(url, attachment) {
    var encodedName = function(name) {
      return name
        .replace(/["%'*:<>?]/g, '_')
        .replace(/[ !&()+[\]]/g, function(c) {
          return '%' + c.charCodeAt(0).toString(16);
        });
    };

    var base = decodeURIComponent(url.replace(/^.+\//, ''));
    var dir = url.replace(/\/[^/]*$/, '');

    var m = dir.match(/\/attachments\/download\/(\d+)$/);
    var id = m ? parseInt(m[1]) : null;

    return (id && (attachment[base] === id)) ? encodedName(base) : url;
  };

  ConverterUtils.prototype.gluableContent = function(content, node, glue) {
    var ELEMENT_NODE = 1;
    var TEXT_NODE = 3;

    var c = [];

    var p = node.previousSibling;
    var n = node.nextSibling;

    if (p && (((p.nodeType === TEXT_NODE) && /[\S\u00a0]$/.test(p.nodeValue)) ||
              ((p.nodeType === ELEMENT_NODE) && (p.nodeName !== 'BR'))))
      c.push(glue);

    c.push(content);

    if (n && (((n.nodeType === TEXT_NODE) && /^[\S\u00a0]/.test(n.nodeValue)) ||
              ((n.nodeType === ELEMENT_NODE) && (n.nodeName !== 'BR'))))
        c.push(glue);

    return c.join('');
  };

  // FIXME find suitable name
  ConverterUtils.prototype.qq = function(str) {
    return /[\s!&(),;[\]{}]/.test(str) ? '"' + str + '"' : str;
  };

  ConverterUtils.prototype.colorRgbToHex = function(str) {
    // RedCloth does not allow CSS function.
    return str
      .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, function(s, r, g, b) {
        return '#' + [r, g, b].map(function(x) {
          return ('0' + parseInt(x).toString(16)).slice(-2);
        }).join('');
    });
  };

  ConverterUtils.prototype.styles = function(node) {
    var attr = {};

    // Defined in redcloth3.rb
    var STYLES_RE = /^(color|width|height|border|background|padding|margin|font|float)(-[a-z]+)*:\s*((\d+%?|\d+px|\d+(\.\d+)?em|#[0-9a-f]+|[a-z]+)\s*)+$/i;

    // FIXME: Property cssText depends on the browser.
    this.colorRgbToHex(node.style.cssText)
      .split(/\s*;\s*/)
      .filter(function(value) {
        return STYLES_RE.test(value);
      }).forEach(function(str) {
        var val = str.split(/\s*:\s*/);

        attr[val[0]] = val[1];
      });

    return attr;
  };

  ConverterUtils.prototype.styleAttr = function(node) {
    var attr = this.styles(node);

    // For image resizing
    ['width', 'height'].forEach(function(name) {
      var val = node.getAttribute(name);

      if (val) attr[name] = val + 'px';
    });

    var style = Object.keys(attr).map(function(key) {
      return key + ': ' + attr[key] + ';';
    }).sort().join(' ');

    return (style.length > 0) ? '{' + style + '}' : '';
  };

  ConverterUtils.prototype.img = function(node, attachment) {
    var alt = node.alt ? '(' + node.alt + ')' : '';
    return '!' + this.styleAttr(node) + this.imageUrl(node.src, attachment) + alt + '!';
  };

  ConverterUtils.prototype.tableCellOption = function(node) {
    var attr = [];

    if ((node.nodeName === 'TH') ||
        (node.parentNode.parentNode.nodeName === 'THEAD')) attr.push('_');

    if (node.colSpan > 1) attr.push('\\' + node.colSpan);
    if (node.rowSpan > 1) attr.push('/' + node.rowSpan);

    if (node.style.textAlign === 'center') attr.push('=');
    else if (node.style.textAlign === 'right') attr.push('>');
    else if (node.style.textAlign === 'left') attr.push('<');

    if (node.style.verticalAlign === 'top') attr.push('^');
    else if (node.style.verticalAlign === 'bottom') attr.push('~');

    var style = this.styleAttr(node);

    if (style.length > 0) attr.push(style);

    return (attr.length > 0) ? attr.join('') + '.' : '';
  };

  return ConverterUtils;
}));
