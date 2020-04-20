function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (_isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;

function highlightedCodeBlock (turndownService) {
  turndownService.addRule('highlightedCodeBlock', {
    filter: function (node) {
      var firstChild = node.firstChild;
      return (
        node.nodeName === 'DIV' &&
        highlightRegExp.test(node.className) &&
        firstChild &&
        firstChild.nodeName === 'PRE'
      )
    },
    replacement: function (content, node, options) {
      var className = node.className || '';
      var language = (className.match(highlightRegExp) || [null, ''])[1];

      return (
        '\n\n' + options.fence + language + '\n' +
        node.firstChild.textContent +
        '\n' + options.fence + '\n\n'
      )
    }
  });
}

function strikethrough (turndownService) {
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~' + content + '~'
    }
  });
}

var indexOf = Array.prototype.indexOf;
var every = Array.prototype.every;
var rules = {};

rules.tableCell = {
  filter: ['th', 'td'],
  replacement: function (content, node) {
    return cell(content, node)
  }
};

rules.tableRow = {
  filter: 'tr',
  replacement: function (content, node) {
    var borderCells = '';
    var alignMap = { left: ':--', right: '--:', center: ':-:' };

    if (isHeadingRow(node)) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var border = '---';
        var align = (
          node.childNodes[i].getAttribute('align') || ''
        ).toLowerCase();

        if (align) border = alignMap[align] || border;

        borderCells += cell(border, node.childNodes[i]);
      }
    }
    return '\n' + content + (borderCells ? '\n' + borderCells : '')
  }
};

rules.table = {
  // Only convert tables with a heading row.
  // Tables with no heading row are kept using `keep` (see below).
  filter: function (node) {
    return node.nodeName === 'TABLE' && isHeadingRow(node.rows[0])
  },

  replacement: function (content) {
    // Ensure there are no blank lines
    content = content.replace('\n\n', '\n');
    return '\n\n' + content + '\n\n'
  }
};

rules.tableSection = {
  filter: ['thead', 'tbody', 'tfoot'],
  replacement: function (content) {
    return content
  }
};

// A tr is a heading row if:
// - the parent is a THEAD
// - or if its the first child of the TABLE or the first TBODY (possibly
//   following a blank THEAD)
// - and every cell is a TH
function isHeadingRow (tr) {
  var parentNode = tr.parentNode;
  return (
    parentNode.nodeName === 'THEAD' ||
    (
      parentNode.firstChild === tr &&
      (parentNode.nodeName === 'TABLE' || isFirstTbody(parentNode)) &&
      every.call(tr.childNodes, function (n) { return n.nodeName === 'TH' })
    )
  )
}

function isFirstTbody (element) {
  var previousSibling = element.previousSibling;
  return (
    element.nodeName === 'TBODY' && (
      !previousSibling ||
      (
        previousSibling.nodeName === 'THEAD' &&
        /^\s*$/i.test(previousSibling.textContent)
      )
    )
  )
}

function cell (content, node) {
  var index = indexOf.call(node.parentNode.childNodes, node);
  var prefix = ' ';
  if (index === 0) prefix = '| ';
  return prefix + content + ' |'
}

function tables (turndownService) {
  turndownService.keep(function (node) {
    return node.nodeName === 'TABLE' && !isHeadingRow(node.rows[0])
  });
  for (var key in rules) turndownService.addRule(key, rules[key]);
}

function taskListItems (turndownService) {
  turndownService.addRule('taskListItems', {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
    },
    replacement: function (content, node) {
      return (node.checked ? '[x]' : '[ ]') + ' '
    }
  });
}

function gfm (turndownService) {
  turndownService.use([
    highlightedCodeBlock,
    strikethrough,
    tables,
    taskListItems
  ]);
}

var turndownPluginGfm_es = /*#__PURE__*/Object.freeze({
  __proto__: null,
  gfm: gfm,
  highlightedCodeBlock: highlightedCodeBlock,
  strikethrough: strikethrough,
  tables: tables,
  taskListItems: taskListItems
});

function extend (destination) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (source.hasOwnProperty(key)) destination[key] = source[key];
    }
  }
  return destination
}

function repeat (character, count) {
  return Array(count + 1).join(character)
}

var blockElements = [
  'address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas',
  'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
];

function isBlock (node) {
  return blockElements.indexOf(node.nodeName.toLowerCase()) !== -1
}

var voidElements = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

function isVoid (node) {
  return voidElements.indexOf(node.nodeName.toLowerCase()) !== -1
}

var voidSelector = voidElements.join();
function hasVoid (node) {
  return node.querySelector && node.querySelector(voidSelector)
}

var rules$1 = {};

rules$1.text = {
  filter: '#text',

  replacement: function (content, node, options) {
    if (node.isCode) return node.nodeValue
    return options.escapes.reduce(function (accumulator, escape) {
      return accumulator.replace(escape[0], escape[1])
    }, node.nodeValue).trim()
  }
};

rules$1.paragraph = {
  filter: 'p',

  replacement: function (content) {
    return '\n\n' + content + '\n\n'
  }
};

rules$1.lineBreak = {
  filter: 'br',

  replacement: function (content, node, options) {
    return options.br + '\n'
  }
};

rules$1.heading = {
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

  replacement: function (content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));

    if (options.headingStyle === 'setext' && hLevel < 3) {
      var underline = repeat((hLevel === 1 ? '=' : '-'), content.length);
      return (
        '\n\n' + content + '\n' + underline + '\n\n'
      )
    } else {
      return '\n\n' + repeat('#', hLevel) + ' ' + content + '\n\n'
    }
  }
};

rules$1.blockquote = {
  filter: 'blockquote',

  replacement: function (content) {
    content = content.replace(/^\n+|\n+$/g, '');
    content = content.replace(/^/gm, '> ');
    return '\n\n' + content + '\n\n'
  }
};

rules$1.list = {
  filter: ['ul', 'ol'],

  replacement: function (content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === 'LI' && parent.lastElementChild === node) {
      return '\n' + content
    } else {
      return '\n\n' + content + '\n\n'
    }
  }
};

rules$1.listItem = {
  filter: 'li',

  replacement: function (content, node, options) {
    content = content
      .replace(/^\n+/, '') // remove leading newlines
      .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
      .replace(/\n/gm, '\n    '); // indent
    var prefix = options.bulletListMarker + '   ';
    var parent = node.parentNode;
    if (parent.nodeName === 'OL') {
      var start = parent.getAttribute('start');
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + '.  ';
    }
    return (
      prefix + content + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
    )
  }
};

rules$1.indentedCodeBlock = {
  filter: function (node, options) {
    return (
      options.codeBlockStyle === 'indented' &&
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },

  replacement: function (content, node, options) {
    return (
      '\n\n    ' +
      node.firstChild.textContent.replace(/\n/g, '\n    ') +
      '\n\n'
    )
  }
};

rules$1.fencedCodeBlock = {
  filter: function (node, options) {
    return (
      options.codeBlockStyle === 'fenced' &&
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },

  replacement: function (content, node, options) {
    var className = node.firstChild.className || '';
    var language = (className.match(/language-(\S+)/) || [null, ''])[1];
    var code = node.firstChild.textContent;

    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp('^' + fenceChar + '{3,}', 'gm');

    var match;
    while ((match = fenceInCodeRegex.exec(code))) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }

    var fence = repeat(fenceChar, fenceSize);

    return (
      '\n\n' + fence + language + '\n' +
      code.replace(/\n$/, '') +
      '\n' + fence + '\n\n'
    )
  }
};

rules$1.horizontalRule = {
  filter: 'hr',

  replacement: function (content, node, options) {
    return '\n\n' + options.hr + '\n\n'
  }
};

rules$1.inlineLink = {
  filter: function (node, options) {
    return (
      options.linkStyle === 'inlined' &&
      node.nodeName === 'A' &&
      node.getAttribute('href')
    )
  },

  replacement: function (content, node) {
    var href = node.getAttribute('href');
    var title = node.title ? ' "' + node.title + '"' : '';
    return '[' + content + '](' + href + title + ')'
  }
};

rules$1.referenceLink = {
  filter: function (node, options) {
    return (
      options.linkStyle === 'referenced' &&
      node.nodeName === 'A' &&
      node.getAttribute('href')
    )
  },

  replacement: function (content, node, options) {
    var href = node.getAttribute('href');
    var title = node.title ? ' "' + node.title + '"' : '';
    var replacement;
    var reference;

    switch (options.linkReferenceStyle) {
      case 'collapsed':
        replacement = '[' + content + '][]';
        reference = '[' + content + ']: ' + href + title;
        break
      case 'shortcut':
        replacement = '[' + content + ']';
        reference = '[' + content + ']: ' + href + title;
        break
      default:
        var id = this.references.length + 1;
        replacement = '[' + content + '][' + id + ']';
        reference = '[' + id + ']: ' + href + title;
    }

    this.references.push(reference);
    return replacement
  },

  references: [],

  append: function (options) {
    var references = '';
    if (this.references.length) {
      references = '\n\n' + this.references.join('\n') + '\n\n';
      this.references = []; // Reset references
    }
    return references
  }
};

rules$1.emphasis = {
  filter: ['em', 'i'],

  replacement: function (content, node, options) {
    if (!content.trim()) return ''
    return options.emDelimiter + content + options.emDelimiter
  }
};

rules$1.strong = {
  filter: ['strong', 'b'],

  replacement: function (content, node, options) {
    if (!content.trim()) return ''
    return options.strongDelimiter + content + options.strongDelimiter
  }
};

rules$1.code = {
  filter: function (node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

    return node.nodeName === 'CODE' && !isCodeBlock
  },

  replacement: function (content, node, options) {
    if (options.preformattedCode) {
      content = content.replace(/^\n+|\n+$/g, '').replace(/\n/, ' ');
    }
    if (options.preformattedCode ? !content : !content.trim()) return ''

    var delimiter = '`';
    var leadingSpace = '';
    var trailingSpace = '';
    var matches = content.match(/`+/gm);
    if (matches) {
      if (/^`/.test(content)) leadingSpace = ' ';
      if (/`$/.test(content)) trailingSpace = ' ';
      while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + '`';
    }

    return delimiter + leadingSpace + content + trailingSpace + delimiter
  }
};

rules$1.image = {
  filter: 'img',

  replacement: function (content, node) {
    var alt = node.alt || '';
    var src = node.getAttribute('src') || '';
    var title = node.title || '';
    var titlePart = title ? ' "' + title + '"' : '';
    return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
  }
};

/**
 * Manages a collection of rules used to convert HTML to Markdown
 */

function Rules (options) {
  this.options = options;
  this._keep = [];
  this._remove = [];

  this.blankRule = {
    replacement: options.blankReplacement
  };

  this.keepReplacement = options.keepReplacement;

  this.defaultRule = {
    replacement: options.defaultReplacement
  };

  this.array = [];
  for (var key in options.rules) this.array.push(options.rules[key]);
}

Rules.prototype = {
  add: function (key, rule) {
    this.array.unshift(rule);
  },

  keep: function (filter) {
    this._keep.unshift({
      filter: filter,
      replacement: this.keepReplacement
    });
  },

  remove: function (filter) {
    this._remove.unshift({
      filter: filter,
      replacement: function () {
        return ''
      }
    });
  },

  forNode: function (node) {
    if (node.isBlank) return this.blankRule
    var rule;

    if ((rule = findRule(this.array, node, this.options))) return rule
    if ((rule = findRule(this._keep, node, this.options))) return rule
    if ((rule = findRule(this._remove, node, this.options))) return rule

    return this.defaultRule
  },

  forEach: function (fn) {
    for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
  }
};

function findRule (rules, node, options) {
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (filterValue(rule, node, options)) return rule
  }
  return void 0
}

function filterValue (rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === 'string') {
    if (filter === node.nodeName.toLowerCase()) return true
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true
  } else if (typeof filter === 'function') {
    if (filter.call(rule, node, options)) return true
  } else {
    throw new TypeError('`filter` needs to be a string, array, or function')
  }
}

/**
 * The collapseWhitespace function is adapted from collapse-whitespace
 * by Luc Thevenard.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Luc Thevenard <lucthevenard@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * collapseWhitespace(options) removes extraneous whitespace from an the given element.
 *
 * @param {Object} options
 */
function collapseWhitespace (options) {
  var element = options.element;
  var isBlock = options.isBlock;
  var isVoid = options.isVoid;
  var isPre = options.isPre || function (node) {
    return node.nodeName === 'PRE'
  };

  if (!element.firstChild || isPre(element)) return

  var prevText = null;
  var keepLeadingWs = false;

  var prev = null;
  var node = next(prev, element, isPre);

  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) { // Node.TEXT_NODE or Node.CDATA_SECTION_NODE
      var text = node.data.replace(/[ \r\n\t]+/g, ' ');

      if ((!prevText || / $/.test(prevText.data)) &&
          !keepLeadingWs && text[0] === ' ') {
        text = text.substr(1);
      }

      // `text` might be empty at this point.
      if (!text) {
        node = remove(node);
        continue
      }

      node.data = text;

      prevText = node;
    } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
      if (isBlock(node) || node.nodeName === 'BR') {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, '');
        }

        prevText = null;
        keepLeadingWs = false;
      } else if (isVoid(node) || isPre(node)) {
        // Avoid trimming space around non-block, non-BR void elements and inline PRE.
        prevText = null;
        keepLeadingWs = true;
      } else if (prevText) {
        // Drop protection if set previously.
        keepLeadingWs = false;
      }
    } else {
      node = remove(node);
      continue
    }

    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }

  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, '');
    if (!prevText.data) {
      remove(prevText);
    }
  }
}

/**
 * remove(node) removes the given node from the DOM and returns the
 * next node in the sequence.
 *
 * @param {Node} node
 * @return {Node} node
 */
function remove (node) {
  var next = node.nextSibling || node.parentNode;

  node.parentNode.removeChild(node);

  return next
}

/**
 * next(prev, current, isPre) returns the next node in the sequence, given the
 * current and previous nodes.
 *
 * @param {Node} prev
 * @param {Node} current
 * @param {Function} isPre
 * @return {Node}
 */
function next (prev, current, isPre) {
  if ((prev && prev.parentNode === current) || isPre(current)) {
    return current.nextSibling || current.parentNode
  }

  return current.firstChild || current.nextSibling || current.parentNode
}

/*
 * Set up window for Node.js
 */

var root = (typeof window !== 'undefined' ? window : {});

/*
 * Parsing HTML strings
 */

function canParseHTMLNatively () {
  var Parser = root.DOMParser;
  var canParse = false;

  // Adapted from https://gist.github.com/1129031
  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if (new Parser().parseFromString('', 'text/html')) {
      canParse = true;
    }
  } catch (e) {}

  return canParse
}

function createHTMLParser () {
  var Parser = function () {};

  {
    var JSDOM = require('jsdom').JSDOM;
    Parser.prototype.parseFromString = function (string) {
      return new JSDOM(string).window.document
    };
  }
  return Parser
}

var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();

function RootNode (input, options) {
  var root;
  if (typeof input === 'string') {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + '</x-turndown>',
      'text/html'
    );
    root = doc.getElementById('turndown-root');
  } else {
    root = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root,
    isBlock: isBlock,
    isVoid: isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  });

  return root
}

var _htmlParser;
function htmlParser () {
  _htmlParser = _htmlParser || new HTMLParser();
  return _htmlParser
}

function isPreOrCode (node) {
  return node.nodeName === 'PRE' || node.nodeName === 'CODE'
}

function Node (node, options) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName.toLowerCase() === 'code' || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node, options);
  return node
}

function isBlank (node) {
  return (
    ['A', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IFRAME', 'SCRIPT', 'AUDIO', 'VIDEO'].indexOf(node.nodeName) === -1 &&
    /^\s*$/i.test(node.textContent) &&
    !isVoid(node) &&
    !hasVoid(node)
  )
}

function flankingWhitespace (node, options) {
  if (node.isBlock || (node.isCode && options.preformattedCode)) {
    return { leading: '', trailing: '' }
  }

  var edges = edgeWhitespace(node.textContent);

  // abandon leading ASCII WS if left-flanked by ASCII WS
  if (edges.leadingAscii && isFlankedByWhitespace('left', node, options)) {
    edges.leading = edges.leadingNonAscii;
  }

  // abandon trailing ASCII WS if right-flanked by ASCII WS
  if (edges.trailingAscii && isFlankedByWhitespace('right', node, options)) {
    edges.leading = edges.trailingNonAscii;
  }

  return { leading: edges.leading, trailing: edges.trailing }
}

function edgeWhitespace (string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))[\s\S]*?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: m[1], // whole string for whitespace-only strings
    leadingAscii: m[2],
    leadingNonAscii: m[3],
    trailing: m[4], // empty for whitespace-only strings
    trailingNonAscii: m[5],
    trailingAscii: m[6]
  }
}

function isFlankedByWhitespace (side, node, options) {
  var sibling;
  var regExp;
  var isFlanked;

  if (side === 'left') {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (sibling.nodeName === 'CODE' && options.preformattedCode) {
      isFlanked = false;
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked
}

var reduce = Array.prototype.reduce;
var leadingNewLinesRegExp = /^\n*/;
var trailingNewLinesRegExp = /\n*$/;
var DEFAULT_ESCAPES = [
  [/\\/g, '\\\\'],
  [/\*/g, '\\*'],
  [/^-/g, '\\-'],
  [/^\+ /g, '\\+ '],
  [/^(=+)/g, '\\$1'],
  [/^(#{1,6}) /g, '\\$1 '],
  [/`/g, '\\`'],
  [/^~~~/g, '\\~~~'],
  [/\[/g, '\\['],
  [/\]/g, '\\]'],
  [/^>/g, '\\>'],
  [/_/g, '\\_'],
  [/^(\d+)\. /g, '$1\\. ']
];

function TurndownService (options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options)

  var defaults = {
    rules: rules$1,
    escapes: DEFAULT_ESCAPES,
    headingStyle: 'setext',
    hr: '* * *',
    bulletListMarker: '*',
    codeBlockStyle: 'indented',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    br: '  ',
    blankReplacement: function (content, node) {
      return node.isBlock ? '\n\n' : ''
    },
    keepReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
    },
    defaultReplacement: function (content, node) {
      return node.isBlock ? '\n\n' + content + '\n\n' : content
    },
    preformattedCode: false
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}

TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */

  turndown: function (input) {
    if (!canConvert(input)) {
      throw new TypeError(
        input + ' is not a string, or an element/document/fragment node.'
      )
    }

    if (input === '') return ''

    var output = process.call(this, new RootNode(input, this.options));
    return postProcess.call(this, output)
  },

  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */

  use: function (plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
    } else if (typeof plugin === 'function') {
      plugin(this);
    } else {
      throw new TypeError('plugin must be a Function or an Array of Functions')
    }
    return this
  },

  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  addRule: function (key, rule) {
    this.rules.add(key, rule);
    return this
  },

  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  keep: function (filter) {
    this.rules.keep(filter);
    return this
  },

  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */

  remove: function (filter) {
    this.rules.remove(filter);
    return this
  }
};

/**
 * Reduces a DOM node down to its Markdown string equivalent
 * @private
 * @param {HTMLElement} parentNode The node to convert
 * @returns A Markdown representation of the node
 * @type String
 */

function process (parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function (output, node) {
    node = new Node(node, self.options);
    var replacement = replacementForNode.call(self, node);
    return join(output, replacement)
  }, '')
}

/**
 * Appends strings as each rule requires and trims the output
 * @private
 * @param {String} output The conversion output
 * @returns A trimmed version of the ouput
 * @type String
 */

function postProcess (output) {
  var self = this;
  this.rules.forEach(function (rule) {
    if (typeof rule.append === 'function') {
      output = join(output, rule.append(self.options));
    }
  });

  return output.replace(/^[\t\r\n]+/, '').replace(/[\t\r\n\s]+$/, '')
}

/**
 * Converts an element node to its Markdown equivalent
 * @private
 * @param {HTMLElement} node The node to convert
 * @returns A Markdown representation of the node
 * @type String
 */

function replacementForNode (node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing) content = content.trim();
  return (
    whitespace.leading +
    rule.replacement(content, node, this.options) +
    whitespace.trailing
  )
}

/**
 * Determines the new lines between the current output and the replacement
 * @private
 * @param {String} output The current conversion output
 * @param {String} replacement The string to append to the output
 * @returns The whitespace to separate the current output and the replacement
 * @type String
 */

function separatingNewlines (output, replacement) {
  var newlines = [
    output.match(trailingNewLinesRegExp)[0],
    replacement.match(leadingNewLinesRegExp)[0]
  ].sort();
  var maxNewlines = newlines[newlines.length - 1];
  return maxNewlines.length < 2 ? maxNewlines : '\n\n'
}

function join (string1, string2) {
  var separator = separatingNewlines(string1, string2);

  // Remove trailing/leading newlines and replace with separator
  string1 = string1.replace(trailingNewLinesRegExp, '');
  string2 = string2.replace(leadingNewLinesRegExp, '');

  return string1 + separator + string2
}

/**
 * Determines whether an input can be converted
 * @private
 * @param {String|HTMLElement} input Describe this parameter
 * @returns Describe what it returns
 * @type String|Object|Array|Boolean|Number
 */

function canConvert (input) {
  return (
    input != null && (
      typeof input === 'string' ||
      (input.nodeType && (
        input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11
      ))
    )
  )
}

/**
 * Patched Turndown service.
 * - Injects rule key in all rules.
 * @todo Modifying the submitted rules is not ideal for generic library use.
 * Rework this in an acceptable way and submit PR (low priority).
 */

var PatchedTurndownService = /*#__PURE__*/function (_TurndownService) {
  _inherits(PatchedTurndownService, _TurndownService);

  var _super = _createSuper(PatchedTurndownService);

  function PatchedTurndownService(options) {
    var _this;

    _classCallCheck(this, PatchedTurndownService);

    _this = _super.call(this, options); // inject keys in the rules and recreate rule array

    _this.rules.array = [];
    Object.keys(_this.options.rules).forEach(function (key) {
      var rule = _this.options.rules[key];
      rule.key = key;

      _this.rules.array.push(rule);
    });
    return _this;
  }

  _createClass(PatchedTurndownService, [{
    key: "addRule",
    value: function addRule(key, rule) {
      var extRule = rule;
      extRule.key = key;
      return _get(_getPrototypeOf(PatchedTurndownService.prototype), "addRule", this).call(this, key, extRule);
    }
  }]);

  return PatchedTurndownService;
}(TurndownService);

var PatchedTurndownService_1 = PatchedTurndownService;

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties$1(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$1(Constructor, staticProps);
  return Constructor;
}

function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys$1(Object(source), true).forEach(function (key) {
        _defineProperty$1(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys$1(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits$1(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf$1(subClass, superClass);
}

function _getPrototypeOf$1(o) {
  _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf$1(o);
}

function _setPrototypeOf$1(o, p) {
  _setPrototypeOf$1 = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf$1(o, p);
}

function _assertThisInitialized$1(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn$1(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized$1(self);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _classCallCheck$1$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties$1$1(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass$1$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1$1(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$1$1(Constructor, staticProps);
  return Constructor;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var createStringReplacer = function createStringReplacer(replacementStr) {
  return function stringReplacer(ctx) {
    var m = ctx.match;
    var groups = m.groups || {};
    return replacementStr.replace(/\$([1-9]\d*)|\$([&`'$])|\$<([^\d\s>][^\s>]*)>/g, function (s, capture, special, namedCapture) {
      if (capture && +capture < m.length) {
        return m[+capture];
      }

      if (special) {
        switch (special) {
          case '$':
            return '$';

          case '&':
            return m[0];

          case '`':
            return m.input.slice(0, m.index);

          case "'":
            return m.input.slice(m.index + m[0].length);

          default:
            throw new Error();
        }
      }

      if (namedCapture && namedCapture in groups) {
        return groups[namedCapture];
      }

      return s;
    });
  };
};

var wrapStringReplaceFn = function wrapStringReplaceFn(replacementFn) {
  return function callStringReplaceFn(ctx) {
    var m = ctx.match;
    var info = m.groups ? [m.index, m.input, m.groups] : [m.index, m.input];
    return replacementFn.apply(this, [].concat(_toConsumableArray(m), info));
  };
};
/**
 * Single pattern and replacement encapsulation.
 * @private
 */


var UnionReplacerElement =
/*#__PURE__*/
function () {
  function UnionReplacerElement(pattern, replacement, extended) {
    _classCallCheck$1$1(this, UnionReplacerElement);

    if (pattern.constructor !== RegExp) {
      throw new TypeError("Replacement pattern ".concat(pattern, " is not a RegExp."));
    }

    this.pattern = pattern;

    if (typeof replacement === 'function') {
      this.replacementFn = extended ? replacement : wrapStringReplaceFn(replacement);
    } else {
      var replacementStr = String(replacement);
      this.replacementFn = createStringReplacer(replacementStr);
    }
  }

  _createClass$1$1(UnionReplacerElement, [{
    key: "compile",
    value: function compile(captureNum) {
      var _this = this;

      var captureCount = 0; // regexp adapted from https://github.com/slevithan/xregexp

      var parts = /(\(\?<)(?=[^!=])|(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
      var patternStr = this.pattern.source.replace(parts, function (match, parenNamed, paren, backref) {
        if (paren || parenNamed) {
          captureCount++;
        } else if (backref) {
          if (+backref > captureCount) {
            throw new SyntaxError("Octal or backreference to undefined capture group ".concat(backref, " in ").concat(_this.pattern));
          } // renumber backreference


          return "\\".concat(+backref + captureNum);
        }

        return match;
      });
      this.captureNum = captureNum;
      this.capturePatternStr = "(".concat(patternStr, ")");
      this.captureCount = captureCount + 1;
    }
    /* eslint-disable no-unused-vars */

  }, {
    key: "narrowMatch",
    value: function narrowMatch(ctx, totalCaptures) {
      // eslint-disable-line no-unused-vars
      // Much faster than modifying the match whit `splice()` on V8
      var m0 = ctx.match;
      var m1 = m0.slice(this.captureNum, this.captureNum + this.captureCount);
      m1.index = m0.index;
      m1.input = m0.input;
      m1.groups = m0.groups;
      ctx.match = m1;
    }
  }]);

  return UnionReplacerElement;
}();

/**
 * String processing builder that builds a string output in the same way
 * how String.prototype.replace implementation does it.
 */
var ReplacementStringBuilder =
/*#__PURE__*/
function () {
  function ReplacementStringBuilder() {
    _classCallCheck$1$1(this, ReplacementStringBuilder);

    this.output = '';
  }

  _createClass$1$1(ReplacementStringBuilder, [{
    key: "addSubjectSlice",
    value: function addSubjectSlice(subject, start, end) {
      this.output += subject.slice(start, end);
    }
  }, {
    key: "addReplacedString",
    value: function addReplacedString(string) {
      this.output += string;
    }
  }, {
    key: "build",
    value: function build() {
      return this.output;
    }
  }]);

  return ReplacementStringBuilder;
}();

var emptyMatchAdvance = function emptyMatchAdvance(input, index, unicode) {
  if (!unicode || index < 0 || index + 1 >= input.length) {
    return 1;
  }

  var c1 = input.charCodeAt(index);

  if (c1 < 0xD800 || c1 > 0xDBFF) {
    return 1;
  }

  var c2 = input.charCodeAt(index + 1);
  return c2 < 0xDC00 || c2 > 0xDFFF ? 1 : 2;
};
/**
 * Encapsulation of matcher variables.
 */


var MatchingContext =
/*#__PURE__*/
function () {
  function MatchingContext(replacer) {
    _classCallCheck$1$1(this, MatchingContext);

    this.replacer = replacer;
    this.match = null;
    this.lastIndex = 0;
  }

  _createClass$1$1(MatchingContext, [{
    key: "skip",
    value: function skip(n) {
      this.lastIndex = this.match.index + this.match[0].length + n;
    }
  }, {
    key: "jump",
    value: function jump(n) {
      this.lastIndex = this.match.index + n;
    }
  }, {
    key: "reset",
    value: function reset() {
      var index = this.match.index;
      var mlen = this.match[0].length;
      this.lastIndex = index + (mlen > 0 ? mlen : emptyMatchAdvance(this.match.input, index, this.replacer.regexp.unicode));
    }
  }, {
    key: "atStart",
    value: function atStart() {
      return this.match.index === 0;
    }
  }, {
    key: "atEnd",
    value: function atEnd() {
      var match = this.match;
      return match.index + match[0].length >= match.input.length;
    }
  }]);

  return MatchingContext;
}();

var countCaptureGroups = function countCaptureGroups(elements) {
  return elements.reduce(function (num, element) {
    return num + element.captureCount;
  }, 0);
}; // Performance-critical


var findMatchingElementEs6 = function findMatchingElementEs6(elements, fullMatch) {
  return elements.find(function (element) {
    return fullMatch[element.captureNum] !== undefined;
  });
}; // ...but avoid polyfill


var findMatchingElementEs5 = function findMatchingElementEs5(elements, fullMatch) {
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];

    if (fullMatch[element.captureNum] !== undefined) {
      return element;
    }
  }

  return undefined;
};

var findMatchingElement = Array.prototype.find ? findMatchingElementEs6 : findMatchingElementEs5;
/**
 * Class encapsulating several {@link String#replace}-like replacements
 * combined into a single one-pass text processor.
 */

var UnionReplacer =
/*#__PURE__*/
function () {
  /**
   * Create a union replacer and optionally initialize it with set of replace elements.
   * @param {Array|string} [replacesOrFlags] Initial replaces, can be omitted
   *   in favor of `flagsArg`.
   * @param {string} [flagsArg] Flags for replacement, defaults to 'gm'.
   * @example new UnionReplacer([[/\$foo\b/, 'bar']], [/\\(.)/, '$1']], 'gi')
   * @example new UnionReplacer([[/\$foo\b/, 'bar']], [/\\(.)/, '$1']])
   * @example new UnionReplacer('gi')
   * @example new UnionReplacer()
   * @see #addReplacement
   * @see RegExp#flags
   */
  function UnionReplacer(replacesOrFlags, flagsArg) {
    var _this = this;

    _classCallCheck$1$1(this, UnionReplacer);

    var args = [replacesOrFlags, flagsArg];
    var fnArgc = this.constructor.length;
    arguments.length < fnArgc && !Array.isArray(replacesOrFlags) && args.unshift(undefined);

    var _ref = [].concat(args),
        _ref$ = _ref[0],
        replaces = _ref$ === void 0 ? [] : _ref$,
        _ref$2 = _ref[1],
        flags = _ref$2 === void 0 ? 'gm' : _ref$2;
    /** @readonly */


    this.flags = flags;
    /** @private */

    this.elements = [];
    /** @private */

    this.compiled = false;

    if (replaces) {
      replaces.forEach(function (replace) {
        return _this.addReplacement.apply(_this, _toConsumableArray(replace));
      });
    }
  }
  /**
   * Append a match and replace entry to this replacer. The order of `addReplacement`
   * calls is important: if any pattern is matched, the corresponding amount of input
   * is consumed and subsequent patterns will not match on such part of the input.
   *
   * @param {RegExp} pattern Regexp to match. The flags are ignored.
   * @param {(string|Function)} replacement Replacement string or function to be
   *   applied if the pattern matches.
   *   Replacement strings:
   *     - Syntax is the same as for {@link String#replace}:
   *       {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter|Specifying a string as a parameter}
   *     - ES2018 named capture groups follow the proposal syntax `$<name>`
   *   Replacement function is by default the {@link String#replace}-style function:
   *     - The same as for {@link String#replace}:
   *       {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter|Specifying a function as a parameter}
   *     - If ES2018 named capture groups are used, their values are passed
   *       as the last argument just like in the standard JavaScript replacements:
   *       `(match, p1, ..., pn, offset, string, namedCaptures) => { ... }`.
   *       Unlike numbered captures that are narrowed for the particular match,
   *       this extra `namedCaptures` parameter would contain keys for all the named
   *       capture groups within the replacer and the values of "foreign" named captures
   *       would be always `undefined`.
   *   Replacement function can also be specified as `extended`. Then only one parameter is
   *   passed, an instance of {@link MatchingContext}. This variant is more powerful.
   * @param {boolean} [extended] If truthy, the {@link MatchingContext} will be passed
   *   to the replacement function instead of {@link String#replace}-ish parameters.
   * @throws {SyntaxError} Octal escapes are not allowed in patterns.
   * @throws Will throw an error if the replacer is frozen, i.e. compiled.
   * @see {@link https://github.com/orchitech/union-replacer/blob/master/README.md#alternation-semantics|Alternation semantics}
   */


  _createClass$1$1(UnionReplacer, [{
    key: "addReplacement",
    value: function addReplacement(pattern, replacement, extended) {
      if (this.compiled) {
        throw new Error('Dynamic element changes not yet supported.');
      }

      var element = new UnionReplacerElement(pattern, replacement, extended);
      element.compile(countCaptureGroups(this.elements) + 1);
      this.elements.push(element);
    }
    /**
     * Process the configured replaces and prepare internal data structures.
     * It is not needed to call this method explicitly as it is done automatically
     * on first use on of the replacer.
     * Calling this method makes sense to validate the replacer's pattern set
     * and to fail early eventually.
     * Currently it causes the replacements to be frozen, i.e. a subsequent
     * {@link UnionReplacer#addReplacement} call would fail.
     * Forward compatibility:
     * - Freezing the replacements is not guaranteed behavior in the future.
     * - If string-supplied regular expression patterns were allowed in methods like
     *   {@link UnionReplacer#addReplacement}, it would also allow invalid patterns
     *   to be supplied. Some sort of regexp syntax errors would be detected when
     *   building the replacer and other would be detected at the #compile time.
     * @throws {SyntaxError} Invalid regular expression pattern encountered. This
     *   currently occurs when named capture groups of the same name are supplied
     *   in different replacement patterns.
     */

  }, {
    key: "compile",
    value: function compile() {
      this.totalCaptureGroups = countCaptureGroups(this.elements);
      var regexpStr = this.elements.length > 0 ? this.elements.map(function (element) {
        return element.capturePatternStr;
      }).join('|') : '^[^\\s\\S]';
      this.regexp = new RegExp(regexpStr, this.flags);
      this.compiled = true;
    }
    /**
     * Perform search and replace with the combined patterns and use corresponding
     * replacements for the particularly matched patterns.
     * @param {String} subject Input to search and process.
     * @param {Object} [userCtx={}] User-provided context to be passed as `this` when
     *   calling replacement functions and as a parameter of the builder calls.
     * @param {Object} [builder=new ReplacementStringBuilder()] Collects and builds
     *   the result from unmatched subject slices and replaced matches. A custom
     *   builder allows for creating arbitrary structures based on matching or e.g.
     *   streaming these chunks without building any output.
     * @returns {String|*} New string with the matches replaced. Or any type when a
     *   custom builder is provided.
     * @see #addReplacement
     */

  }, {
    key: "replace",
    value: function replace(subject) {
      var userCtx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var builder = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new ReplacementStringBuilder();
      this.compiled || this.compile();
      var ctx = new MatchingContext(this); // Allow for reentrancy

      var savedLastIndex = this.regexp.lastIndex;

      try {
        this.regexp.lastIndex = 0;
        var prevLastIndex = 0;

        while ((ctx.match = this.regexp.exec(subject)) !== null) {
          var element = findMatchingElement(this.elements, ctx.match);
          element.narrowMatch(ctx, this.totalCaptureGroups);
          ctx.reset();
          builder.addSubjectSlice(subject, prevLastIndex, ctx.match.index, ctx, userCtx);
          var replaced = element.replacementFn.call(userCtx, ctx);
          builder.addReplacedString(replaced, ctx, userCtx);
          prevLastIndex = Math.min(ctx.match.index + ctx.match[0].length, ctx.lastIndex); // Also would solve eventual reentrant calls, but needed anyway

          this.regexp.lastIndex = ctx.lastIndex;

          if (!this.regexp.global) {
            break;
          }
        }

        builder.addSubjectSlice(subject, prevLastIndex, subject.length, ctx, userCtx);
        return builder.build();
      } finally {
        this.regexp.lastIndex = savedLastIndex;
      }
    }
  }]);

  return UnionReplacer;
}();

var BaseSyntax = /*#__PURE__*/function () {
  function BaseSyntax(name) {
    _classCallCheck$1(this, BaseSyntax);

    this.name = name;
    this.inlinesInterpreted = true;
    this.blocksInterpreted = true;
    this.isLink = false;
  }

  _createClass$1(BaseSyntax, [{
    key: "isEncodable",
    value: function isEncodable(str) {
      return true;
    }
  }, {
    key: "wouldBeUnaltered",
    value: function wouldBeUnaltered(str) {
      return true;
    }
  }]);

  return BaseSyntax;
}();

var NAME = 'text';

var TextSyntax = /*#__PURE__*/function (_BaseSyntax) {
  _inherits$1(TextSyntax, _BaseSyntax);

  function TextSyntax() {
    _classCallCheck$1(this, TextSyntax);

    return _possibleConstructorReturn$1(this, _getPrototypeOf$1(TextSyntax).call(this, NAME));
  }

  _createClass$1(TextSyntax, null, [{
    key: "name",
    get: function get() {
      return NAME;
    }
  }]);

  return TextSyntax;
}(BaseSyntax);

var NAME$1 = 'linkDestination';

var LinkDestinationSyntax = /*#__PURE__*/function (_BaseSyntax) {
  _inherits$1(LinkDestinationSyntax, _BaseSyntax);

  function LinkDestinationSyntax() {
    var _this;

    _classCallCheck$1(this, LinkDestinationSyntax);

    _this = _possibleConstructorReturn$1(this, _getPrototypeOf$1(LinkDestinationSyntax).call(this, NAME$1));
    _this.isLink = true;
    _this.inlinesInterpreted = false;
    _this.blocksInterpreted = false;
    return _this;
  }

  _createClass$1(LinkDestinationSyntax, null, [{
    key: "name",
    get: function get() {
      return NAME$1;
    }
  }]);

  return LinkDestinationSyntax;
}(BaseSyntax);

var NAME$2 = 'linkTitle';

var LinkTitleSyntax = /*#__PURE__*/function (_BaseSyntax) {
  _inherits$1(LinkTitleSyntax, _BaseSyntax);

  function LinkTitleSyntax() {
    var _this;

    _classCallCheck$1(this, LinkTitleSyntax);

    _this = _possibleConstructorReturn$1(this, _getPrototypeOf$1(LinkTitleSyntax).call(this, NAME$2));
    _this.isLink = true;
    _this.inlinesInterpreted = false;
    return _this;
  }

  _createClass$1(LinkTitleSyntax, null, [{
    key: "name",
    get: function get() {
      return NAME$2;
    }
  }]);

  return LinkTitleSyntax;
}(BaseSyntax);

var autolinkedSchemeReStr = '[hH][tT][tT][pP][sS]?://|[fF][tT][pP]://';

var linkForbiddenRe = /[<>\s\f\v]/;

var entityAmpersandReStr = '&(?=[a-zA-Z][a-zA-Z\\d]*;|#\\d{1,7};|#[xX][\\da-fA-F]{1,6};)';
var entityAmpersandRe = new RegExp(entityAmpersandReStr);
var entityAmpersandsRe = new RegExp(entityAmpersandReStr, 'g');

var NAME$3 = 'cmAutolink';
var STARTS_WITH_AUTOLINKED_SCHEME_RE = new RegExp("^".concat(autolinkedSchemeReStr));

var CmAutolinkSyntax = /*#__PURE__*/function (_BaseSyntax) {
  _inherits$1(CmAutolinkSyntax, _BaseSyntax);

  function CmAutolinkSyntax() {
    var _this;

    _classCallCheck$1(this, CmAutolinkSyntax);

    _this = _possibleConstructorReturn$1(this, _getPrototypeOf$1(CmAutolinkSyntax).call(this, NAME$3));
    _this.isLink = true;
    _this.inlinesInterpreted = false;
    _this.blocksInterpreted = false;
    return _this;
  }

  _createClass$1(CmAutolinkSyntax, [{
    key: "isEncodable",
    value: function isEncodable(str) {
      return STARTS_WITH_AUTOLINKED_SCHEME_RE.test(str);
    }
  }, {
    key: "wouldBeUnaltered",
    value: function wouldBeUnaltered(str) {
      return !linkForbiddenRe.test(str) && !entityAmpersandRe.test(str);
    }
  }], [{
    key: "name",
    get: function get() {
      return NAME$3;
    }
  }]);

  return CmAutolinkSyntax;
}(BaseSyntax);

var NAME$4 = 'codeSpan';

var CodeSpanSyntax = /*#__PURE__*/function (_BaseSyntax) {
  _inherits$1(CodeSpanSyntax, _BaseSyntax);

  function CodeSpanSyntax() {
    var _this;

    _classCallCheck$1(this, CodeSpanSyntax);

    _this = _possibleConstructorReturn$1(this, _getPrototypeOf$1(CodeSpanSyntax).call(this, NAME$4));
    _this.inlinesInterpreted = false;
    _this.blocksInterpreted = false;
    return _this;
  }

  _createClass$1(CodeSpanSyntax, [{
    key: "isEncodable",
    value: function isEncodable(str) {
      return str.length > 0;
    }
  }], [{
    key: "name",
    get: function get() {
      return NAME$4;
    }
  }]);

  return CodeSpanSyntax;
}(BaseSyntax);

var Syntax = BaseSyntax;
/**
 * GFM syntaxes used within {@link gfmSetupDefault}.
 */

Syntax.text = new TextSyntax();
Syntax.linkDestination = new LinkDestinationSyntax();
Syntax.linkTitle = new LinkTitleSyntax();
Syntax.cmAutolink = new CmAutolinkSyntax();
Syntax.codeSpan = new CodeSpanSyntax();

var longestBacktickString = function longestBacktickString(str) {
  var m = str.match(/`+/g);
  return m ? m.reduce(function (longest, current) {
    return current.length > longest.length ? current : longest;
  }, '') : '';
};

var SHOULD_ADD_SPACE_RE = /^`|^[ \r\n].*?[^ \r\n].*[ \r\n]$|`$/;

function scanDelimiters(input) {
  var x = this.metadata;
  x.extraBacktickString = longestBacktickString(input);
  x.extraSpace = SHOULD_ADD_SPACE_RE.test(input) ? ' ' : '';
  return input;
}

function addDelimiterExtras(output) {
  var x = this.metadata;
  var before = x.extraBacktickString + x.extraSpace;
  var after = x.extraSpace + x.extraBacktickString;
  return "".concat(before).concat(output).concat(after);
}
/**
 * Adjust leading and trailing code span part according to contets and
 * set metadata.
 */


function codeSpanReplace() {
  this.preprocessors.push(scanDelimiters);
  this.postprocessors.unshift(addDelimiterExtras);
}

var BACKSLASH_BLOCK_RE = new RegExp([// thematic code block or `-` setext heading
'^([-*_])[ \\t]*(?:\\1[ \\t]*){2,}$', // `=` setext heading
'^=+[ \\t]*$', // list item or ATX heading
'^(?:[-+*]|#{1,6})(?=\\s|$)', // `~` fenced code block (the rest is left for inline tilde escaping)
'^~(?=~~)'].join('|')); // $1: number, $2: marker character

var ORDERED_LIST_RE = /^(\d+)([.)])(?=\s|$)/;
/**
 * Escape block syntax.
 */

function blockReplace() {
  this.replacer.addReplacement(BACKSLASH_BLOCK_RE, '\\$&');
  this.replacer.addReplacement(ORDERED_LIST_RE, '$1\\$2');
}

function mergeOpts(opts, key, defaults, defaultEnabled) {
  var myOpts = opts[key];

  if (!myOpts && (!defaultEnabled || myOpts !== undefined)) {
    return false;
  }
  /* eslint-disable-next-line no-param-reassign */


  opts[key] = _typeof(opts[key]) === 'object' ? _objectSpread2$1({}, defaults, {}, opts[key]) : defaults;
  return true;
}

// www is case sensitive
var autolinkedWwwReStr = 'www\\.';

var extWebAutolinkStartCandidateReStr = "(?:".concat(autolinkedSchemeReStr, "|").concat(autolinkedWwwReStr, ")") + '[^\\s\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]';

var defaultOpts = {
  maxIntrawordUnderscoreRun: undefined
};
var INTRAWORD_UNDERSORES_RE = new RegExp("([a-zA-Z0-9])(_+)(?=[a-zA-Z0-9])(?!".concat(extWebAutolinkStartCandidateReStr, ")"));
var FREE_DELIMITER_RE = /(?:^|[ \t\f])([_*])\1*(?=[ \t\r\n\f])/;

function processIntrawordUnderscores(_ref) {
  var _ref$match = _slicedToArray(_ref.match, 3),
      m = _ref$match[0],
      before = _ref$match[1],
      underscores = _ref$match[2];

  var max = this.escape.opts.emphasisNonDelimiters.maxIntrawordUnderscoreRun;

  if (max !== false && underscores.length > max) {
    var underscoresOut = underscores.replace(/_/g, '\\_');
    return "".concat(before).concat(underscoresOut);
  }

  return m;
}
/**
 * Keep `*` and `_` unescaped when we know they cannot form emphasis delimiters.
 */


function emphasisNonDelimitersReplace() {
  if (!mergeOpts(this.opts, 'emphasisNonDelimiters', defaultOpts, true)) {
    return;
  }

  var max = this.opts.emphasisNonDelimiters.maxIntrawordUnderscoreRun;

  if (typeof max !== 'number') {
    this.opts.emphasisNonDelimiters.maxIntrawordUnderscoreRun = max ? 1 : false;
  }

  this.replacer.addReplacement(INTRAWORD_UNDERSORES_RE, processIntrawordUnderscores, true);
  this.replacer.addReplacement(FREE_DELIMITER_RE, '$&');
}

/**
 * Backslash-escape entity ampersand'. To be used when backslash escape
 * is not an option, i.e. in CM autolinks.
 */

function entityBackslashReplace() {
  this.replacer.addReplacement(entityAmpersandRe, '\\&');
}

/**
 * Escape entity ampersand with '&amp;'. To be used when backslash escape
 * is not an option, i.e. in CM autolinks. But also for link destinations,
 * see cmark_gfm-005.
 */

function entityEntityReplace() {
  this.replacer.addReplacement(entityAmpersandRe, '&amp;');
}

var C = {
  // Equivalent to \t\n\f\r\p{Zs}
  space: ' \\t\\n\\f\\r\xA0\u1680\u2000-\u200A\u202F\u205F\u3000',
  // Equivalent to \p{Pc}\p{Pd}\p{Pe}\p{Pf}\p{Pi}\p{Po}\p{Ps}
  punct: '_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F\\-\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D\\)\\]\\}\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63\xBB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21\xAB\u2018\u201B\u201C\u201F\u2039\u2E02\u2E04\u2E09\u2E0C\u2E1C\u2E20!-#%-\'\\*,\\.\\/:;\\?@\\\xA1\xA7\xB6\xB7\xBF\u037E\u0387\u055A-\u055F\u0589\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u166D\u166E\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u1805\u1807-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203B-\u203E\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205E\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00\u2E01\u2E06-\u2E08\u2E0B\u2E0E-\u2E16\u2E18\u2E19\u2E1B\u2E1E\u2E1F\u2E2A-\u2E2E\u2E30-\u2E39\u2E3C-\u2E3F\u2E41\u2E43-\u2E4E\u3001-\u3003\u303D\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFE10-\uFE16\uFE19\uFE30\uFE45\uFE46\uFE49-\uFE4C\uFE50-\uFE52\uFE54-\uFE57\uFE5F-\uFE61\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF07\uFF0A\uFF0C\uFF0E\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3C\uFF61\uFF64\uFF65\\(\\[\\{\u0F3A\u0F3C\u169B\u201A\u201E\u2045\u207D\u208D\u2308\u230A\u2329\u2768\u276A\u276C\u276E\u2770\u2772\u2774\u27C5\u27E6\u27E8\u27EA\u27EC\u27EE\u2983\u2985\u2987\u2989\u298B\u298D\u298F\u2991\u2993\u2995\u2997\u29D8\u29DA\u29FC\u2E22\u2E24\u2E26\u2E28\u2E42\u3008\u300A\u300C\u300E\u3010\u3014\u3016\u3018\u301A\u301D\uFD3F\uFE17\uFE35\uFE37\uFE39\uFE3B\uFE3D\uFE3F\uFE41\uFE43\uFE47\uFE59\uFE5B\uFE5D\uFF08\uFF3B\uFF5B\uFF5F\uFF62',
};

var ALPHA_ENTITY_REFERENCES = {
'\xC6':'AElig','&':'amp','\xC1':'Aacute','\u0102':'Abreve','\xC2':'Acirc','\u0410':'Acy',
'\xC0':'Agrave','\u0391':'Alpha','\u0100':'Amacr','\u2A53':'And','\u0104':'Aogon','\u2061':'af',
'\xC5':'angst','\u2254':'colone','\xC3':'Atilde','\xC4':'Auml','\u2216':'setmn','\u2AE7':'Barv',
'\u2306':'Barwed','\u0411':'Bcy','\u2235':'becaus','\u212C':'Bscr','\u0392':'Beta','\u02D8':'breve',
'\u224E':'bump','\u0427':'CHcy','\xA9':'copy','\u0106':'Cacute','\u22D2':'Cap','\u2145':'DD',
'\u212D':'Cfr','\u010C':'Ccaron','\xC7':'Ccedil','\u0108':'Ccirc','\u2230':'Cconint','\u010A':'Cdot',
'\xB8':'cedil','\xB7':'middot','\u03A7':'Chi','\u2299':'odot','\u2296':'ominus','\u2295':'oplus',
'\u2297':'otimes','\u2232':'cwconint','\u201D':'rdquo','\u2019':'rsquo','\u2237':'Colon',
'\u2A74':'Colone','\u2261':'equiv','\u222F':'Conint','\u222E':'oint','\u2102':'Copf',
'\u2210':'coprod','\u2233':'awconint','\u2A2F':'Cross','\u22D3':'Cup','\u224D':'CupCap',
'\u2911':'DDotrahd','\u0402':'DJcy','\u0405':'DScy','\u040F':'DZcy','\u2021':'Dagger',
'\u21A1':'Darr','\u2AE4':'Dashv','\u010E':'Dcaron','\u0414':'Dcy','\u2207':'Del','\u0394':'Delta',
'\xB4':'acute','\u02D9':'dot','\u02DD':'dblac','`':'grave','\u02DC':'tilde','\u22C4':'diam',
'\u2146':'dd','\xA8':'die','\u20DC':'DotDot','\u2250':'doteq','\u21D3':'dArr','\u21D0':'lArr',
'\u21D4':'iff','\u27F8':'xlArr','\u27FA':'xhArr','\u27F9':'xrArr','\u21D2':'rArr','\u22A8':'vDash',
'\u21D1':'uArr','\u21D5':'vArr','\u2225':'par','\u2193':'darr','\u2913':'DownArrowBar',
'\u21F5':'duarr','\u0311':'DownBreve','\u2950':'DownLeftRightVector','\u295E':'DownLeftTeeVector',
'\u21BD':'lhard','\u2956':'DownLeftVectorBar','\u295F':'DownRightTeeVector','\u21C1':'rhard',
'\u2957':'DownRightVectorBar','\u22A4':'top','\u21A7':'mapstodown','\u0110':'Dstrok','\u014A':'ENG',
'\xD0':'ETH','\xC9':'Eacute','\u011A':'Ecaron','\xCA':'Ecirc','\u042D':'Ecy','\u0116':'Edot',
'\xC8':'Egrave','\u2208':'in','\u0112':'Emacr','\u25FB':'EmptySmallSquare',
'\u25AB':'EmptyVerySmallSquare','\u0118':'Eogon','\u0395':'Epsilon','\u2A75':'Equal','\u2242':'esim',
'\u21CC':'rlhar','\u2130':'Escr','\u2A73':'Esim','\u0397':'Eta','\xCB':'Euml','\u2203':'exist',
'\u2147':'ee','\u0424':'Fcy','\u25FC':'FilledSmallSquare','\u25AA':'squf','\u2200':'forall',
'\u2131':'Fscr','\u0403':'GJcy','>':'gt','\u0393':'Gamma','\u03DC':'Gammad','\u011E':'Gbreve',
'\u0122':'Gcedil','\u011C':'Gcirc','\u0413':'Gcy','\u0120':'Gdot','\u22D9':'Gg','\u2265':'ge',
'\u22DB':'gel','\u2267':'gE','\u2AA2':'GreaterGreater','\u2277':'gl','\u2A7E':'ges','\u2273':'gsim',
'\u226B':'gg','\u042A':'HARDcy','\u02C7':'caron','^':'Hat','\u0124':'Hcirc','\u210C':'Hfr',
'\u210B':'Hscr','\u210D':'Hopf','\u2500':'boxh','\u0126':'Hstrok','\u224F':'bumpe','\u0415':'IEcy',
'\u0132':'IJlig','\u0401':'IOcy','\xCD':'Iacute','\xCE':'Icirc','\u0418':'Icy','\u0130':'Idot',
'\u2111':'Im','\xCC':'Igrave','\u012A':'Imacr','\u2148':'ii','\u222C':'Int','\u222B':'int',
'\u22C2':'xcap','\u2063':'ic','\u2062':'it','\u012E':'Iogon','\u0399':'Iota','\u2110':'Iscr',
'\u0128':'Itilde','\u0406':'Iukcy','\xCF':'Iuml','\u0134':'Jcirc','\u0419':'Jcy','\u0408':'Jsercy',
'\u0404':'Jukcy','\u0425':'KHcy','\u040C':'KJcy','\u039A':'Kappa','\u0136':'Kcedil','\u041A':'Kcy',
'\u0409':'LJcy','<':'lt','\u0139':'Lacute','\u039B':'Lambda','\u27EA':'Lang','\u2112':'Lscr',
'\u219E':'Larr','\u013D':'Lcaron','\u013B':'Lcedil','\u041B':'Lcy','\u27E8':'lang','\u2190':'larr',
'\u21E4':'larrb','\u21C6':'lrarr','\u2308':'lceil','\u27E6':'lobrk','\u2961':'LeftDownTeeVector',
'\u21C3':'dharl','\u2959':'LeftDownVectorBar','\u230A':'lfloor','\u2194':'harr',
'\u294E':'LeftRightVector','\u22A3':'dashv','\u21A4':'mapstoleft','\u295A':'LeftTeeVector',
'\u22B2':'vltri','\u29CF':'LeftTriangleBar','\u22B4':'ltrie','\u2951':'LeftUpDownVector',
'\u2960':'LeftUpTeeVector','\u21BF':'uharl','\u2958':'LeftUpVectorBar','\u21BC':'lharu',
'\u2952':'LeftVectorBar','\u22DA':'leg','\u2266':'lE','\u2276':'lg','\u2AA1':'LessLess',
'\u2A7D':'les','\u2272':'lsim','\u22D8':'Ll','\u21DA':'lAarr','\u013F':'Lmidot','\u27F5':'xlarr',
'\u27F7':'xharr','\u27F6':'xrarr','\u2199':'swarr','\u2198':'searr','\u21B0':'lsh','\u0141':'Lstrok',
'\u226A':'ll','\u2905':'Map','\u041C':'Mcy','\u205F':'MediumSpace','\u2133':'Mscr','\u2213':'mp',
'\u039C':'Mu','\u040A':'NJcy','\u0143':'Nacute','\u0147':'Ncaron','\u0145':'Ncedil','\u041D':'Ncy',
'\u200B':'ZeroWidthSpace','\n':'NewLine','\u2060':'NoBreak','\xA0':'nbsp','\u2115':'Nopf',
'\u2AEC':'Not','\u2262':'nequiv','\u226D':'NotCupCap','\u2226':'npar','\u2209':'notin','\u2260':'ne',
'\u2204':'nexist','\u226F':'ngt','\u2271':'nge','\u2279':'ntgl','\u2275':'ngsim','\u22EA':'nltri',
'\u22EC':'nltrie','\u226E':'nlt','\u2270':'nle','\u2278':'ntlg','\u2274':'nlsim','\u2280':'npr',
'\u22E0':'nprcue','\u220C':'notni','\u22EB':'nrtri','\u22ED':'nrtrie','\u22E2':'nsqsube',
'\u22E3':'nsqsupe','\u2288':'nsube','\u2281':'nsc','\u22E1':'nsccue','\u2289':'nsupe',
'\u2241':'nsim','\u2244':'nsime','\u2247':'ncong','\u2249':'nap','\u2224':'nmid','\xD1':'Ntilde',
'\u039D':'Nu','\u0152':'OElig','\xD3':'Oacute','\xD4':'Ocirc','\u041E':'Ocy','\u0150':'Odblac',
'\xD2':'Ograve','\u014C':'Omacr','\u03A9':'ohm','\u039F':'Omicron','\u201C':'ldquo','\u2018':'lsquo',
'\u2A54':'Or','\xD8':'Oslash','\xD5':'Otilde','\u2A37':'Otimes','\xD6':'Ouml','\u203E':'oline',
'\u23DE':'OverBrace','\u23B4':'tbrk','\u23DC':'OverParenthesis','\u2202':'part','\u041F':'Pcy',
'\u03A6':'Phi','\u03A0':'Pi','\xB1':'pm','\u2119':'Popf','\u2ABB':'Pr','\u227A':'pr','\u2AAF':'pre',
'\u227C':'prcue','\u227E':'prsim','\u2033':'Prime','\u220F':'prod','\u221D':'prop','\u03A8':'Psi',
'"':'quot','\u211A':'Qopf','\u2910':'RBarr','\xAE':'reg','\u0154':'Racute','\u27EB':'Rang',
'\u21A0':'Rarr','\u2916':'Rarrtl','\u0158':'Rcaron','\u0156':'Rcedil','\u0420':'Rcy','\u211C':'Re',
'\u220B':'ni','\u21CB':'lrhar','\u296F':'duhar','\u03A1':'Rho','\u27E9':'rang','\u2192':'rarr',
'\u21E5':'rarrb','\u21C4':'rlarr','\u2309':'rceil','\u27E7':'robrk','\u295D':'RightDownTeeVector',
'\u21C2':'dharr','\u2955':'RightDownVectorBar','\u230B':'rfloor','\u22A2':'vdash','\u21A6':'map',
'\u295B':'RightTeeVector','\u22B3':'vrtri','\u29D0':'RightTriangleBar','\u22B5':'rtrie',
'\u294F':'RightUpDownVector','\u295C':'RightUpTeeVector','\u21BE':'uharr',
'\u2954':'RightUpVectorBar','\u21C0':'rharu','\u2953':'RightVectorBar','\u211D':'Ropf',
'\u2970':'RoundImplies','\u21DB':'rAarr','\u211B':'Rscr','\u21B1':'rsh','\u29F4':'RuleDelayed',
'\u0429':'SHCHcy','\u0428':'SHcy','\u042C':'SOFTcy','\u015A':'Sacute','\u2ABC':'Sc',
'\u0160':'Scaron','\u015E':'Scedil','\u015C':'Scirc','\u0421':'Scy','\u2191':'uarr','\u03A3':'Sigma',
'\u2218':'compfn','\u221A':'Sqrt','\u25A1':'squ','\u2293':'sqcap','\u228F':'sqsub','\u2291':'sqsube',
'\u2290':'sqsup','\u2292':'sqsupe','\u2294':'sqcup','\u22C6':'Star','\u22D0':'Sub','\u2286':'sube',
'\u227B':'sc','\u2AB0':'sce','\u227D':'sccue','\u227F':'scsim','\u2211':'sum','\u22D1':'Sup',
'\u2283':'sup','\u2287':'supe','\xDE':'THORN','\u2122':'trade','\u040B':'TSHcy','\u0426':'TScy',
'\t':'Tab','\u03A4':'Tau','\u0164':'Tcaron','\u0162':'Tcedil','\u0422':'Tcy','\u2234':'therefore',
'\u0398':'Theta','\u2009':'thinsp','\u223C':'sim','\u2243':'sime','\u2245':'cong','\u2248':'ap',
'\u20DB':'tdot','\u0166':'Tstrok','\xDA':'Uacute','\u219F':'Uarr','\u2949':'Uarrocir',
'\u040E':'Ubrcy','\u016C':'Ubreve','\xDB':'Ucirc','\u0423':'Ucy','\u0170':'Udblac','\xD9':'Ugrave',
'\u016A':'Umacr','_':'lowbar','\u23DF':'UnderBrace','\u23B5':'bbrk','\u23DD':'UnderParenthesis',
'\u22C3':'xcup','\u228E':'uplus','\u0172':'Uogon','\u2912':'UpArrowBar','\u21C5':'udarr',
'\u2195':'varr','\u296E':'udhar','\u22A5':'bot','\u21A5':'mapstoup','\u2196':'nwarr',
'\u2197':'nearr','\u03D2':'Upsi','\u03A5':'Upsilon','\u016E':'Uring','\u0168':'Utilde','\xDC':'Uuml',
'\u22AB':'VDash','\u2AEB':'Vbar','\u0412':'Vcy','\u22A9':'Vdash','\u2AE6':'Vdashl','\u22C1':'Vee',
'\u2016':'Vert','\u2223':'mid','|':'vert','\u2758':'VerticalSeparator','\u2240':'wr',
'\u200A':'hairsp','\u22AA':'Vvdash','\u0174':'Wcirc','\u22C0':'Wedge','\u039E':'Xi','\u042F':'YAcy',
'\u0407':'YIcy','\u042E':'YUcy','\xDD':'Yacute','\u0176':'Ycirc','\u042B':'Ycy','\u0178':'Yuml',
'\u0416':'ZHcy','\u0179':'Zacute','\u017D':'Zcaron','\u0417':'Zcy','\u017B':'Zdot','\u0396':'Zeta',
'\u2128':'Zfr','\u2124':'Zopf','\xE1':'aacute','\u0103':'abreve','\u223E':'ac','\u223F':'acd',
'\xE2':'acirc','\u0430':'acy','\xE6':'aelig','\xE0':'agrave','\u2135':'aleph','\u03B1':'alpha',
'\u0101':'amacr','\u2A3F':'amalg','\u2227':'and','\u2A55':'andand','\u2A5C':'andd',
'\u2A58':'andslope','\u2A5A':'andv','\u2220':'ang','\u29A4':'ange','\u2221':'angmsd',
'\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae',
'\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u221F':'angrt','\u22BE':'angrtvb',
'\u299D':'angrtvbd','\u2222':'angsph','\u237C':'angzarr','\u0105':'aogon','\u2A70':'apE',
'\u2A6F':'apacir','\u224A':'ape','\u224B':'apid','\'':'apos','\xE5':'aring','*':'ast',
'\xE3':'atilde','\xE4':'auml','\u2A11':'awint','\u2AED':'bNot','\u224C':'bcong','\u03F6':'bepsi',
'\u2035':'bprime','\u223D':'bsim','\u22CD':'bsime','\u22BD':'barvee','\u2305':'barwed',
'\u23B6':'bbrktbrk','\u0431':'bcy','\u201E':'bdquo','\u29B0':'bemptyv','\u03B2':'beta',
'\u2136':'beth','\u226C':'twixt','\u25EF':'xcirc','\u2A00':'xodot','\u2A01':'xoplus',
'\u2A02':'xotime','\u2A06':'xsqcup','\u2605':'starf','\u25BD':'xdtri','\u25B3':'xutri',
'\u2A04':'xuplus','\u290D':'rbarr','\u29EB':'lozf','\u25B4':'utrif','\u25BE':'dtrif',
'\u25C2':'ltrif','\u25B8':'rtrif','\u2423':'blank','\u2588':'block','\u2310':'bnot',
'\u22C8':'bowtie','\u2557':'boxDL','\u2554':'boxDR','\u2556':'boxDl','\u2553':'boxDr',
'\u2550':'boxH','\u2566':'boxHD','\u2569':'boxHU','\u2564':'boxHd','\u2567':'boxHu','\u255D':'boxUL',
'\u255A':'boxUR','\u255C':'boxUl','\u2559':'boxUr','\u2551':'boxV','\u256C':'boxVH','\u2563':'boxVL',
'\u2560':'boxVR','\u256B':'boxVh','\u2562':'boxVl','\u255F':'boxVr','\u29C9':'boxbox',
'\u2555':'boxdL','\u2552':'boxdR','\u2510':'boxdl','\u250C':'boxdr','\u2565':'boxhD',
'\u2568':'boxhU','\u252C':'boxhd','\u2534':'boxhu','\u229F':'minusb','\u229E':'plusb',
'\u22A0':'timesb','\u255B':'boxuL','\u2558':'boxuR','\u2518':'boxul','\u2514':'boxur',
'\u2502':'boxv','\u256A':'boxvH','\u2561':'boxvL','\u255E':'boxvR','\u253C':'boxvh','\u2524':'boxvl',
'\u251C':'boxvr','\xA6':'brvbar','\u204F':'bsemi','\\':'bsol','\u29C5':'bsolb','\u27C8':'bsolhsub',
'\u2022':'bull','\u2AAE':'bumpE','\u0107':'cacute','\u2229':'cap','\u2A44':'capand',
'\u2A49':'capbrcup','\u2A4B':'capcap','\u2A47':'capcup','\u2A40':'capdot','\u2041':'caret',
'\u2A4D':'ccaps','\u010D':'ccaron','\xE7':'ccedil','\u0109':'ccirc','\u2A4C':'ccups',
'\u2A50':'ccupssm','\u010B':'cdot','\u29B2':'cemptyv','\xA2':'cent','\u0447':'chcy','\u2713':'check',
'\u03C7':'chi','\u25CB':'cir','\u29C3':'cirE','\u02C6':'circ','\u2257':'cire','\u21BA':'olarr',
'\u21BB':'orarr','\u24C8':'oS','\u229B':'oast','\u229A':'ocir','\u229D':'odash','\u2A10':'cirfnint',
'\u2AEF':'cirmid','\u29C2':'cirscir','\u2663':'clubs',':':'colon',',':'comma','@':'commat',
'\u2201':'comp','\u2A6D':'congdot','\u2117':'copysr','\u21B5':'crarr','\u2717':'cross',
'\u2ACF':'csub','\u2AD1':'csube','\u2AD0':'csup','\u2AD2':'csupe','\u22EF':'ctdot',
'\u2938':'cudarrl','\u2935':'cudarrr','\u22DE':'cuepr','\u22DF':'cuesc','\u21B6':'cularr',
'\u293D':'cularrp','\u222A':'cup','\u2A48':'cupbrcap','\u2A46':'cupcap','\u2A4A':'cupcup',
'\u228D':'cupdot','\u2A45':'cupor','\u21B7':'curarr','\u293C':'curarrm','\u22CE':'cuvee',
'\u22CF':'cuwed','\xA4':'curren','\u2231':'cwint','\u232D':'cylcty','\u2965':'dHar',
'\u2020':'dagger','\u2138':'daleth','\u2010':'dash','\u290F':'rBarr','\u010F':'dcaron',
'\u0434':'dcy','\u21CA':'ddarr','\u2A77':'eDDot','\xB0':'deg','\u03B4':'delta','\u29B1':'demptyv',
'\u297F':'dfisht','\u2666':'diams','\u03DD':'gammad','\u22F2':'disin','\xF7':'div','\u22C7':'divonx',
'\u0452':'djcy','\u231E':'dlcorn','\u230D':'dlcrop','$':'dollar','\u2251':'eDot','\u2238':'minusd',
'\u2214':'plusdo','\u22A1':'sdotb','\u231F':'drcorn','\u230C':'drcrop','\u0455':'dscy',
'\u29F6':'dsol','\u0111':'dstrok','\u22F1':'dtdot','\u25BF':'dtri','\u29A6':'dwangle',
'\u045F':'dzcy','\u27FF':'dzigrarr','\xE9':'eacute','\u2A6E':'easter','\u011B':'ecaron',
'\u2256':'ecir','\xEA':'ecirc','\u2255':'ecolon','\u044D':'ecy','\u0117':'edot','\u2252':'efDot',
'\u2A9A':'eg','\xE8':'egrave','\u2A96':'egs','\u2A98':'egsdot','\u2A99':'el','\u23E7':'elinters',
'\u2113':'ell','\u2A95':'els','\u2A97':'elsdot','\u0113':'emacr','\u2205':'empty','\u2003':'emsp',
'\u014B':'eng','\u2002':'ensp','\u0119':'eogon','\u22D5':'epar','\u29E3':'eparsl','\u2A71':'eplus',
'\u03B5':'epsi','\u03F5':'epsiv','=':'equals','\u225F':'equest','\u2A78':'equivDD',
'\u29E5':'eqvparsl','\u2253':'erDot','\u2971':'erarr','\u212F':'escr','\u03B7':'eta','\xF0':'eth',
'\xEB':'euml','\u20AC':'euro','!':'excl','\u0444':'fcy','\u2640':'female','\uFB03':'ffilig',
'\uFB00':'fflig','\uFB04':'ffllig','\uFB01':'filig','\u266D':'flat','\uFB02':'fllig',
'\u25B1':'fltns','\u0192':'fnof','\u22D4':'fork','\u2AD9':'forkv','\u2A0D':'fpartint',
'\u2044':'frasl','\u2322':'frown','\u2A8C':'gEl','\u01F5':'gacute','\u03B3':'gamma','\u2A86':'gap',
'\u011F':'gbreve','\u011D':'gcirc','\u0433':'gcy','\u0121':'gdot','\u2AA9':'gescc','\u2A80':'gesdot',
'\u2A82':'gesdoto','\u2A84':'gesdotol','\u2A94':'gesles','\u2137':'gimel','\u0453':'gjcy',
'\u2A92':'glE','\u2AA5':'gla','\u2AA4':'glj','\u2269':'gnE','\u2A8A':'gnap','\u2A88':'gne',
'\u22E7':'gnsim','\u210A':'gscr','\u2A8E':'gsime','\u2A90':'gsiml','\u2AA7':'gtcc','\u2A7A':'gtcir',
'\u22D7':'gtdot','\u2995':'gtlPar','\u2A7C':'gtquest','\u2978':'gtrarr','\xBD':'half',
'\u044A':'hardcy','\u2948':'harrcir','\u21AD':'harrw','\u210F':'hbar','\u0125':'hcirc',
'\u2665':'hearts','\u2026':'mldr','\u22B9':'hercon','\u2925':'searhk','\u2926':'swarhk',
'\u21FF':'hoarr','\u223B':'homtht','\u21A9':'larrhk','\u21AA':'rarrhk','\u2015':'horbar',
'\u0127':'hstrok','\u2043':'hybull','\xED':'iacute','\xEE':'icirc','\u0438':'icy','\u0435':'iecy',
'\xA1':'iexcl','\xEC':'igrave','\u2A0C':'qint','\u222D':'tint','\u29DC':'iinfin','\u2129':'iiota',
'\u0133':'ijlig','\u012B':'imacr','\u0131':'imath','\u22B7':'imof','\u01B5':'imped',
'\u2105':'incare','\u221E':'infin','\u29DD':'infintie','\u22BA':'intcal','\u2A17':'intlarhk',
'\u2A3C':'iprod','\u0451':'iocy','\u012F':'iogon','\u03B9':'iota','\xBF':'iquest','\u22F9':'isinE',
'\u22F5':'isindot','\u22F4':'isins','\u22F3':'isinsv','\u0129':'itilde','\u0456':'iukcy',
'\xEF':'iuml','\u0135':'jcirc','\u0439':'jcy','\u0237':'jmath','\u0458':'jsercy','\u0454':'jukcy',
'\u03BA':'kappa','\u03F0':'kappav','\u0137':'kcedil','\u043A':'kcy','\u0138':'kgreen',
'\u0445':'khcy','\u045C':'kjcy','\u291B':'lAtail','\u290E':'lBarr','\u2A8B':'lEg','\u2962':'lHar',
'\u013A':'lacute','\u29B4':'laemptyv','\u03BB':'lambda','\u2991':'langd','\u2A85':'lap',
'\xAB':'laquo','\u291F':'larrbfs','\u291D':'larrfs','\u21AB':'larrlp','\u2939':'larrpl',
'\u2973':'larrsim','\u21A2':'larrtl','\u2AAB':'lat','\u2919':'latail','\u2AAD':'late',
'\u290C':'lbarr','\u2772':'lbbrk','{':'lcub','[':'lsqb','\u298B':'lbrke','\u298F':'lbrksld',
'\u298D':'lbrkslu','\u013E':'lcaron','\u013C':'lcedil','\u043B':'lcy','\u2936':'ldca',
'\u2967':'ldrdhar','\u294B':'ldrushar','\u21B2':'ldsh','\u2264':'le','\u21C7':'llarr',
'\u22CB':'lthree','\u2AA8':'lescc','\u2A7F':'lesdot','\u2A81':'lesdoto','\u2A83':'lesdotor',
'\u2A93':'lesges','\u22D6':'ltdot','\u297C':'lfisht','\u2A91':'lgE','\u296A':'lharul',
'\u2584':'lhblk','\u0459':'ljcy','\u296B':'llhard','\u25FA':'lltri','\u0140':'lmidot',
'\u23B0':'lmoust','\u2268':'lnE','\u2A89':'lnap','\u2A87':'lne','\u22E6':'lnsim','\u27EC':'loang',
'\u21FD':'loarr','\u27FC':'xmap','\u21AC':'rarrlp','\u2985':'lopar','\u2A2D':'loplus',
'\u2A34':'lotimes','\u2217':'lowast','\u25CA':'loz','(':'lpar','\u2993':'lparlt','\u296D':'lrhard',
'\u200E':'lrm','\u22BF':'lrtri','\u2039':'lsaquo','\u2A8D':'lsime','\u2A8F':'lsimg','\u201A':'sbquo',
'\u0142':'lstrok','\u2AA6':'ltcc','\u2A79':'ltcir','\u22C9':'ltimes','\u2976':'ltlarr',
'\u2A7B':'ltquest','\u2996':'ltrPar','\u25C3':'ltri','\u294A':'lurdshar','\u2966':'luruhar',
'\u223A':'mDDot','\xAF':'macr','\u2642':'male','\u2720':'malt','\u25AE':'marker','\u2A29':'mcomma',
'\u043C':'mcy','\u2014':'mdash','\u2127':'mho','\xB5':'micro','\u2AF0':'midcir','\u2212':'minus',
'\u2A2A':'minusdu','\u2ADB':'mlcp','\u22A7':'models','\u03BC':'mu','\u22B8':'mumap','\u21CD':'nlArr',
'\u21CE':'nhArr','\u21CF':'nrArr','\u22AF':'nVDash','\u22AE':'nVdash','\u0144':'nacute',
'\u0149':'napos','\u266E':'natur','\u2A43':'ncap','\u0148':'ncaron','\u0146':'ncedil',
'\u2A42':'ncup','\u043D':'ncy','\u2013':'ndash','\u21D7':'neArr','\u2924':'nearhk','\u2928':'toea',
'\u21AE':'nharr','\u2AF2':'nhpar','\u22FC':'nis','\u22FA':'nisd','\u045A':'njcy','\u219A':'nlarr',
'\u2025':'nldr','\xAC':'not','\u22F7':'notinvb','\u22F6':'notinvc','\u22FE':'notnivb',
'\u22FD':'notnivc','\u2A14':'npolint','\u219B':'nrarr','\u2284':'nsub','\u2285':'nsup',
'\xF1':'ntilde','\u03BD':'nu','#':'num','\u2116':'numero','\u2007':'numsp','\u22AD':'nvDash',
'\u2904':'nvHarr','\u22AC':'nvdash','\u29DE':'nvinfin','\u2902':'nvlArr','\u2903':'nvrArr',
'\u21D6':'nwArr','\u2923':'nwarhk','\u2927':'nwnear','\xF3':'oacute','\xF4':'ocirc','\u043E':'ocy',
'\u0151':'odblac','\u2A38':'odiv','\u29BC':'odsold','\u0153':'oelig','\u29BF':'ofcir',
'\u02DB':'ogon','\xF2':'ograve','\u29C1':'ogt','\u29B5':'ohbar','\u29BE':'olcir','\u29BB':'olcross',
'\u29C0':'olt','\u014D':'omacr','\u03C9':'omega','\u03BF':'omicron','\u29B6':'omid','\u29B7':'opar',
'\u29B9':'operp','\u2228':'or','\u2A5D':'ord','\u2134':'oscr','\xAA':'ordf','\xBA':'ordm',
'\u22B6':'origof','\u2A56':'oror','\u2A57':'orslope','\u2A5B':'orv','\xF8':'oslash','\u2298':'osol',
'\xF5':'otilde','\u2A36':'otimesas','\xF6':'ouml','\u233D':'ovbar','\xB6':'para','\u2AF3':'parsim',
'\u2AFD':'parsl','\u043F':'pcy','%':'percnt','.':'period','\u2030':'permil','\u2031':'pertenk',
'\u03C6':'phi','\u03D5':'phiv','\u260E':'phone','\u03C0':'pi','\u03D6':'piv','\u210E':'planckh',
'+':'plus','\u2A23':'plusacir','\u2A22':'pluscir','\u2A25':'plusdu','\u2A72':'pluse',
'\u2A26':'plussim','\u2A27':'plustwo','\u2A15':'pointint','\xA3':'pound','\u2AB3':'prE',
'\u2AB7':'prap','\u2AB9':'prnap','\u2AB5':'prnE','\u22E8':'prnsim','\u2032':'prime',
'\u232E':'profalar','\u2312':'profline','\u2313':'profsurf','\u22B0':'prurel','\u03C8':'psi',
'\u2008':'puncsp','\u2057':'qprime','\u2A16':'quatint','?':'quest','\u291C':'rAtail','\u2964':'rHar',
'\u0155':'racute','\u29B3':'raemptyv','\u2992':'rangd','\u29A5':'range','\xBB':'raquo',
'\u2975':'rarrap','\u2920':'rarrbfs','\u2933':'rarrc','\u291E':'rarrfs','\u2945':'rarrpl',
'\u2974':'rarrsim','\u21A3':'rarrtl','\u219D':'rarrw','\u291A':'ratail','\u2236':'ratio',
'\u2773':'rbbrk','}':'rcub',']':'rsqb','\u298C':'rbrke','\u298E':'rbrksld','\u2990':'rbrkslu',
'\u0159':'rcaron','\u0157':'rcedil','\u0440':'rcy','\u2937':'rdca','\u2969':'rdldhar',
'\u21B3':'rdsh','\u25AD':'rect','\u297D':'rfisht','\u296C':'rharul','\u03C1':'rho','\u03F1':'rhov',
'\u21C9':'rrarr','\u22CC':'rthree','\u02DA':'ring','\u200F':'rlm','\u23B1':'rmoust','\u2AEE':'rnmid',
'\u27ED':'roang','\u21FE':'roarr','\u2986':'ropar','\u2A2E':'roplus','\u2A35':'rotimes',')':'rpar',
'\u2994':'rpargt','\u2A12':'rppolint','\u203A':'rsaquo','\u22CA':'rtimes','\u25B9':'rtri',
'\u29CE':'rtriltri','\u2968':'ruluhar','\u211E':'rx','\u015B':'sacute','\u2AB4':'scE',
'\u2AB8':'scap','\u0161':'scaron','\u015F':'scedil','\u015D':'scirc','\u2AB6':'scnE',
'\u2ABA':'scnap','\u22E9':'scnsim','\u2A13':'scpolint','\u0441':'scy','\u22C5':'sdot',
'\u2A66':'sdote','\u21D8':'seArr','\xA7':'sect',';':'semi','\u2929':'tosa','\u2736':'sext',
'\u266F':'sharp','\u0449':'shchcy','\u0448':'shcy','\xAD':'shy','\u03C3':'sigma','\u03C2':'sigmaf',
'\u2A6A':'simdot','\u2A9E':'simg','\u2AA0':'simgE','\u2A9D':'siml','\u2A9F':'simlE','\u2246':'simne',
'\u2A24':'simplus','\u2972':'simrarr','\u2A33':'smashp','\u29E4':'smeparsl','\u2323':'smile',
'\u2AAA':'smt','\u2AAC':'smte','\u044C':'softcy','/':'sol','\u29C4':'solb','\u233F':'solbar',
'\u2660':'spades','\u2606':'star','\u2282':'sub','\u2AC5':'subE','\u2ABD':'subdot',
'\u2AC3':'subedot','\u2AC1':'submult','\u2ACB':'subnE','\u228A':'subne','\u2ABF':'subplus',
'\u2979':'subrarr','\u2AC7':'subsim','\u2AD5':'subsub','\u2AD3':'subsup','\u266A':'sung',
'\u2AC6':'supE','\u2ABE':'supdot','\u2AD8':'supdsub','\u2AC4':'supedot','\u27C9':'suphsol',
'\u2AD7':'suphsub','\u297B':'suplarr','\u2AC2':'supmult','\u2ACC':'supnE','\u228B':'supne',
'\u2AC0':'supplus','\u2AC8':'supsim','\u2AD4':'supsub','\u2AD6':'supsup','\u21D9':'swArr',
'\u292A':'swnwar','\xDF':'szlig','\u2316':'target','\u03C4':'tau','\u0165':'tcaron',
'\u0163':'tcedil','\u0442':'tcy','\u2315':'telrec','\u03B8':'theta','\u03D1':'thetav','\xFE':'thorn',
'\xD7':'times','\u2A31':'timesbar','\u2A30':'timesd','\u2336':'topbot','\u2AF1':'topcir',
'\u2ADA':'topfork','\u2034':'tprime','\u25B5':'utri','\u225C':'trie','\u25EC':'tridot',
'\u2A3A':'triminus','\u2A39':'triplus','\u29CD':'trisb','\u2A3B':'tritime','\u23E2':'trpezium',
'\u0446':'tscy','\u045B':'tshcy','\u0167':'tstrok','\u2963':'uHar','\xFA':'uacute','\u045E':'ubrcy',
'\u016D':'ubreve','\xFB':'ucirc','\u0443':'ucy','\u0171':'udblac','\u297E':'ufisht','\xF9':'ugrave',
'\u2580':'uhblk','\u231C':'ulcorn','\u230F':'ulcrop','\u25F8':'ultri','\u016B':'umacr',
'\u0173':'uogon','\u03C5':'upsi','\u21C8':'uuarr','\u231D':'urcorn','\u230E':'urcrop',
'\u016F':'uring','\u25F9':'urtri','\u22F0':'utdot','\u0169':'utilde','\xFC':'uuml',
'\u29A7':'uwangle','\u2AE8':'vBar','\u2AE9':'vBarv','\u299C':'vangrt','\u0432':'vcy',
'\u22BB':'veebar','\u225A':'veeeq','\u22EE':'vellip','\u299A':'vzigzag','\u0175':'wcirc',
'\u2A5F':'wedbar','\u2259':'wedgeq','\u2118':'wp','\u03BE':'xi','\u22FB':'xnis','\xFD':'yacute',
'\u044F':'yacy','\u0177':'ycirc','\u044B':'ycy','\xA5':'yen','\u0457':'yicy','\u044E':'yucy',
'\xFF':'yuml','\u017A':'zacute','\u017E':'zcaron','\u0437':'zcy','\u017C':'zdot','\u03B6':'zeta',
'\u0436':'zhcy','\u21DD':'zigrarr','\u200D':'zwj','\u200C':'zwnj',
};

function toAlphaEntityReference(c) {
  var ent = ALPHA_ENTITY_REFERENCES[c];

  if (ent) {
    return "&".concat(ent, ";");
  }

  return null;
}

/**
 * TODO: doc
 * @param {String} tildes
 * @param {Function} charEscape
 * @param {number} offset
 * @param {String} string
 * @param {Object} ctx
 * @param {Object} opts
 * @private
 */
function escapeTildes(tildes, offset, string, ctx, opts) {
  if (!opts.strikethrough) {
    return tildes;
  }

  if (!opts.strikethrough.optimizeForDoubleTilde) {
    return tildes.replace(/./g, '\\$&');
  } // An unescaped leading or trailing tilde can break a surrounding strike-through.
  // This could be smarter if such context information were caller-supplied.


  var atStart = (!ctx || ctx.atStart) && offset === 0;
  var atEnd = (!ctx || ctx.atEnd) && offset + tildes.length >= string.length;
  var lead = '';
  var mid = tildes;
  var trail = '';

  if (atStart && mid.length > 0) {
    lead = "\\".concat(mid.charAt(0));
    mid = mid.substring(1);
  }

  if (atEnd && mid.length > 0) {
    trail = "\\".concat(mid.charAt(mid.length - 1));
    mid = mid.slice(0, -1);
  }

  if (mid.length === 2) {
    mid = "\\".concat(mid.charAt(0)).concat(mid.substring(1));
  }

  return "".concat(lead).concat(mid).concat(trail);
}

var LINK_ESCAPE_RE = new RegExp("([_*<>[\\]]|".concat(entityAmpersandReStr, ")|(~+)"), 'g');

var ExtWebAutolinkTransformers = /*#__PURE__*/function () {
  function ExtWebAutolinkTransformers(ctx, opts) {
    _classCallCheck$1(this, ExtWebAutolinkTransformers);

    this.ctx = ctx;
    this.opts = opts;
  }
  /* eslint-disable-next-line class-methods-use-this */


  _createClass$1(ExtWebAutolinkTransformers, [{
    key: "keep",
    value: function keep(link, trail) {
      return "".concat(link).concat(trail);
    }
  }, {
    key: "commonmark",
    value: function commonmark(link, trail) {
      // unlike backslash escapes, entity-like sequences are interpreted
      var outLink = link.replace(entityAmpersandsRe, '&amp;');
      var addScheme = this.ctx.scheme ? '' : 'http://'; // Give the trail back to matching

      this.ctx.mctx.skip(-trail.length);
      return "<".concat(addScheme).concat(outLink, ">");
    }
  }, {
    key: "entities",
    value: function entities(link) {
      return "".concat(link).concat(this.ctx.entityEncodedTrail);
    }
  }, {
    key: "breakup",
    value: function breakup(link, trail) {
      this.ctx.unterminatedEntity = false;
      var giveBack = link.length - this.ctx.linkStart.length + trail.length;
      this.ctx.mctx.skip(-giveBack);
      return "".concat(this.ctx.linkStart).concat(this.opts.extAutolink.breaker);
    }
  }, {
    key: "breakafter",
    value: function breakafter(link, trail) {
      this.ctx.unterminatedEntity = false; // Give the trail back to matching

      this.ctx.mctx.skip(-trail.length);
      return "".concat(link).concat(this.opts.extAutolink.breaker);
    }
    /**
     * Escape characters in extended web autolink match according to the callers settings,
     * so that it is interpreted correctly in GFM.
     * @param {String} str Link match portion to be escaped.
     * @private
     */

  }, {
    key: "backslashEscape",
    value: function backslashEscape(str) {
      var _this = this;

      return str.replace(LINK_ESCAPE_RE, function (m, single, tildes, offset, string) {
        if (single) {
          return "\\".concat(single);
        }

        if (tildes) {
          return escapeTildes(tildes, offset, string, _this.ctx, _this.opts);
        }

        return m;
      });
    }
  }]);

  return ExtWebAutolinkTransformers;
}();

var ENT_ENC_RE = /(^;)|([<>])|([()])|([^?!.,:"'])/g;

var ExtWebAutolinkRenderer = /*#__PURE__*/function () {
  function ExtWebAutolinkRenderer(link, trail, ctx, opts) {
    _classCallCheck$1(this, ExtWebAutolinkRenderer);

    this.link = link;
    this.trail = trail;
    this.ctx = ctx;
    this.opts = opts; // See cmark_gfm-004

    this.ctx.wouldConfuseEntity = trail.startsWith(';') && /&[a-z]+$/i.test(link);
  }
  /**
   * Pick an appropriate autolink match transformer based on trailing
   * punctuation and user configuration.
   * @returns {Function} Picked tranformer function.
   * @private
   */


  _createClass$1(ExtWebAutolinkRenderer, [{
    key: "pickTransformer",
    value: function pickTransformer(t) {
      var _this = this;

      if (this.ctx.scheme && this.opts.extAutolink.breakUrl) {
        return t.breakup;
      }

      if (this.ctx.www && this.opts.extAutolink.breakWww) {
        return t.breakup;
      }

      if (!this.ctx.forceDelimiting && !this.ctx.wouldConfuseEntity) {
        this.ctx.backslashEscapedTrail = t.backslashEscape(this.trail);

        if (this.ctx.backslashEscapedTrail === this.trail) {
          return t.keep;
        }
      }

      var allowed = {
        breakup: true,
        breakafter: true
      };
      var considered = {};

      if (this.ctx.scheme || this.opts.extAutolink.allowAddHttpScheme) {
        // see cmark_gfm-002
        allowed.commonmark = !linkForbiddenRe.test(this.link);
      }

      if (!this.ctx.forceDelimiting && !/[~a-z0-9]/i.test(this.trail)) {
        // only consider when there are no chars known to be unconvertible to entity references
        // but delay full evaluation
        considered.entities = function () {
          return _this.tryEntityEncodeTrail();
        };
      }

      for (var i = 0; i < this.opts.extAutolink.allowedTransformations.length; i++) {
        var picked = this.opts.extAutolink.allowedTransformations[i];

        if (allowed[picked]) {
          return t[picked];
        }

        if (considered[picked] && considered[picked]()) {
          return t[picked];
        }
      }

      return t.breakafter;
    }
  }, {
    key: "tryEntityEncodeTrail",
    value: function tryEntityEncodeTrail() {
      var _this2 = this;

      var encodePar = false;
      var success = true;
      var enc = this.trail.replace(ENT_ENC_RE, function (m, semi, angle, par, other) {
        if (semi) {
          return _this2.ctx.wouldConfuseEntity ? toAlphaEntityReference(semi) : semi;
        }

        if (angle) {
          // angle brackets break the link, we must enforce all contextually dependent
          // link characters to be encoded - which is: parentheses
          encodePar = true;
          return toAlphaEntityReference(angle);
        }

        if (par) {
          return encodePar ? toAlphaEntityReference(par) : par;
        }

        if (other) {
          var entref = toAlphaEntityReference(other);

          if (entref) {
            return entref;
          }

          success = false;
        }

        return m;
      });

      if (success) {
        this.ctx.entityEncodedTrail = enc;
      }

      return success;
    }
  }, {
    key: "render",
    value: function render() {
      var t = new ExtWebAutolinkTransformers(this.ctx, this.opts);
      return this.pickTransformer(t).call(t, this.link, this.trail);
    }
  }]);

  return ExtWebAutolinkRenderer;
}();

function escapePipesIfInTable(str) {
  return this.escape.opts.table && this.gfmContext.inTable ? str.replace(/\|/g, '\\|') : str;
}

function wrapPostprocessor(processFn, postProcessFn) {
  return function wrapper() {
    // eslint-disable-next-line prefer-rest-params
    return postProcessFn.call(this, processFn.apply(this, arguments));
  };
}

var defaultOpts$1 = Object.freeze({
  breakUrl: false,
  breakWww: false,
  breaker: '<!-- -->',
  allowedTransformations: ['entities', 'commonmark'],
  allowAddHttpScheme: false,
  inImage: false
}); // true if autolink match should be considered autolink in given matching context

var shouldProcess = function shouldProcess(_ref) {
  var gfmContext = _ref.gfmContext,
      opts = _ref.escape.opts;
  return !gfmContext.inLink && (!gfmContext.inImage || opts.autolink.inImage);
}; // $1: before, $2: linkMatch, $3: linkStart, $4: scheme, $5: www.


var EXT_WEB_AUTOLINK_RE = function () {
  // Standard domain character match
  var MC_SD = "[^".concat(C.space).concat(C.punct, "]");
  var MC_D3 = "(?:".concat(MC_SD, "|[-_])"); // 3rd+ level domain char

  var MC_D12 = "(?:".concat(MC_SD, "|-)"); // 1st and 2nd level domain char
  // see cmark_gfm-003

  var M_D = "(?![-_.<>])(?:(?:".concat(MC_D3, "*\\.)*").concat(MC_D12, "*\\.)?").concat(MC_D12, "*(?!").concat(MC_D3, ")"); // see cmark_gfm-002

  var MC_AFTER_D = '[^ \\t\\n\\r]'; // after-domain char including '<' for our purposes

  var M_URL = autolinkedSchemeReStr;
  var M_WWW = autolinkedWwwReStr; // see cmark_gfm-001

  var M_BEFORE = "(?:\\b|_)(?=".concat(M_URL, ")|(?:^|[").concat(C.space, "*_(]|~+)(?=").concat(M_WWW, ")");
  return new RegExp("(".concat(M_BEFORE, ")(((").concat(M_URL, ")|(").concat(M_WWW, "))").concat(M_D).concat(MC_AFTER_D, "*)"));
}();

var EXT_EMAIL_AUTOLINK_RE = /[-+.\w]+@(?:[-\w]+\.)+[-\w]*[^\W_](?![-@\w])/;
/**
 * Process extended web autolink-like sequence in a plain text input.
 * @param {MatchingContext} mctx matching context.
 * @private
 */

function processExtWebAutolink(mctx) {
  var _mctx$match = _slicedToArray(mctx.match, 6),
      m = _mctx$match[0],
      before = _mctx$match[1],
      linkMatch = _mctx$match[2],
      linkStart = _mctx$match[3],
      scheme = _mctx$match[4],
      www = _mctx$match[5];

  var outBefore = before ? "\\".concat(before) : '';

  if (!shouldProcess(this)) {
    mctx.jump(before.length + linkStart.length);
    return "".concat(outBefore).concat(linkStart);
  }

  var trail = '';
  var linkEnd = linkMatch.search(/[<>]/);
  var link = linkMatch;

  if (linkEnd >= 0) {
    trail = link.substring(linkEnd);
    link = link.substring(0, linkEnd);
  }

  var forceDelimiting = false; // forcefully terminated link can be followed by other links
  // consider only longer trails, as min. match would be like '<a@b.c'

  if (trail.length >= 6) {
    forceDelimiting = EXT_EMAIL_AUTOLINK_RE.test(trail) || EXT_WEB_AUTOLINK_RE.test(trail);
  } // Trailing punctuation and ')'


  linkEnd = link.search(/[?!.,:*_~'";)]+$/i);

  if (linkEnd >= 0) {
    // treat matching ')' as part of the link
    var popen = 0;
    var pclose = 0;

    for (var i = 0; i < link.length; i++) {
      switch (link.charAt(i)) {
        case '(':
          popen++;
          break;

        case ')':
          pclose++;

          if (i >= linkEnd && pclose <= popen) {
            linkEnd = i + 1;
          }

          break;
      }
    }

    trail = link.substring(linkEnd) + trail;
    link = link.substring(0, linkEnd);
  }

  var ctx = {
    mctx: mctx,
    scheme: scheme,
    www: www,
    linkStart: linkStart,
    atEnd: mctx.match.index + m.length >= mctx.match.input.length,
    forceDelimiting: forceDelimiting
  };
  var renderer = new ExtWebAutolinkRenderer(link, trail, ctx, this.escape.opts);
  return "".concat(outBefore).concat(renderer.render());
} // $1: keep


var GFM_EMAIL_UNDERSCORES_RE = /([a-z\d]_+)(?=[a-z\d])|_/gi;

function processExtEmailAutolink(mctx) {
  var _mctx$match2 = _slicedToArray(mctx.match, 1),
      emailMatch = _mctx$match2[0];

  if (!shouldProcess(this)) {
    var emailShred = emailMatch.match(/^.*?@/)[0];
    mctx.jump(emailShred.length);
    return this.escape.escape(emailShred, this.gfmContext, this.metadata);
  } // Thankfuly backlashs escapes are OK within extended email autolinks,
  // since only strictly intraword underscores are safe to keep.


  return emailMatch.replace(GFM_EMAIL_UNDERSCORES_RE, function (m, keep) {
    return keep ? m : "\\".concat(m);
  });
}
/**
 * Apply extended autolink replaces according to escaper's configuration.
 */


function extAutolinkReplace() {
  if (!mergeOpts(this.opts, 'extAutolink', defaultOpts$1)) {
    return;
  }

  this.replacer.addReplacement(EXT_WEB_AUTOLINK_RE, wrapPostprocessor(processExtWebAutolink, escapePipesIfInTable), true);
  this.replacer.addReplacement(EXT_EMAIL_AUTOLINK_RE, processExtEmailAutolink, true);
}

var INLINE_RE = new RegExp(['[*_[\\]`<>]', '\\\\(?=[-!"#$%&\'()*+,./:;<=>?@\\[\\\\\\]^_`{|}~]|$)', entityAmpersandReStr].join('|')); // $1: hard line break marker

var HARD_LINE_BREAK_RE = /([ ]{2})$/;
/**
 * Escape inlines that are necessary to be escaped.
 */

function inlineReplace() {
  this.replacer.addReplacement(INLINE_RE, '\\$&');
  this.replacer.addReplacement(HARD_LINE_BREAK_RE, '$1<!-- spaces -->');
}

var LINK_DESTINATION_SPECIALS_RE = /[()<>]/;

function renderEmptyLinkDestination(output) {
  return output.length > 0 ? output : '<>';
}
/**
 * Escape parentheses and brackets.
 */


function linkDestinationReplace() {
  this.replacer.addReplacement(LINK_DESTINATION_SPECIALS_RE, '\\$&');
  this.postprocessors.unshift(renderEmptyLinkDestination);
}

function processLink(_ref) {
  var _ref2 = _slicedToArray(_ref, 1),
      m = _ref2[0];

  return encodeURIComponent(m);
}
/**
 * Escape parentheses <, > and whitespace either as entites or in URL encoding.
 */


function linkReplace() {
  this.replacer.addReplacement(linkForbiddenRe, processLink);
}

var DOUBLE_Q = '"';
var SINGLE_Q = '\'';
var PAREN = '()';
var defaultOpts$2 = Object.freeze({
  delimiters: [DOUBLE_Q, SINGLE_Q, PAREN],
  alwaysEscapeDelimiters: []
});
var LINK_TITLE_DELIMS_RE = /['"()]/g;
var charDelims = {
  '"': DOUBLE_Q,
  '\'': SINGLE_Q,
  '(': PAREN,
  ')': PAREN
};

var bestDelimiter = function bestDelimiter(str, opts) {
  if (!Array.isArray(opts.delimiters)) {
    return opts.delimiters;
  }

  if (opts.delimiters.length === 1) {
    return opts.delimiters[0];
  }

  var m = str.match(LINK_TITLE_DELIMS_RE);

  if (!m) {
    return opts.delimiters[0];
  }

  var e = {};
  e[DOUBLE_Q] = 0;
  e[SINGLE_Q] = 0;
  e[PAREN] = 0;
  m.forEach(function (c) {
    e[charDelims[c]] += 1;
  });
  opts.alwaysEscapeDelimiters.forEach(function (d) {
    e[DOUBLE_Q] += d === DOUBLE_Q ? 0 : e[d];
    e[SINGLE_Q] += d === SINGLE_Q ? 0 : e[d];
    e[PAREN] += d === PAREN ? 0 : e[d];
  });
  return opts.delimiters.reduce(function (best, d) {
    return e[d] < e[best] ? d : best;
  });
};

function scanDelimiters$1(input) {
  var x = this.metadata;
  var opts = this.escape.opts.linkTitle;
  x.delimiter = bestDelimiter(input, opts);

  if (x.delimiter === PAREN) {
    x.startDelimiter = '(';
    x.endDelimiter = ')';
  } else {
    x.startDelimiter = x.delimiter;
    x.endDelimiter = x.delimiter;
  }

  var escaped = {};
  escaped[x.delimiter] = true;
  opts.alwaysEscapeDelimiters.forEach(function (d) {
    escaped[d] = true;
  });
  this.linkTitleEscapedDelimiters = escaped;
  return input;
}

function processLinkTitleDelim(_ref) {
  var _ref$match = _slicedToArray(_ref.match, 1),
      c = _ref$match[0];

  if (this.linkTitleEscapedDelimiters[charDelims[c]]) {
    return "\\".concat(c);
  }

  return c;
}
/**
 * Escape parentheses.
 */


function linkTitleReplace() {
  if (!mergeOpts(this.opts, 'linkTitle', defaultOpts$2, true)) {
    return;
  }

  this.preprocessors.push(scanDelimiters$1);
  this.replacer.addReplacement(LINK_TITLE_DELIMS_RE, processLinkTitleDelim, true);
}

var defaultOpts$3 = Object.freeze({
  optimizeForDoubleTilde: false
});
var STRIKETHROUGH_RE = /~+/;

function processStrikethrough(_ref) {
  var match = _ref.match;
  return escapeTildes(match[0], match.index, match.input, null, this.escape.opts);
}
/**
 * Apply autolink replaces according to escaper's configuration.
 */


function strikethroughReplace() {
  if (!mergeOpts(this.opts, 'strikethrough', defaultOpts$3)) {
    return;
  }

  this.replacer.addReplacement(STRIKETHROUGH_RE, processStrikethrough, true);
}

var defaultOpts$4 = true;

var TABLE_DELIMITER_ROW_RE = function () {
  var SP = '[ \\t]*';
  var CELL = "".concat(SP, ":?-+:?").concat(SP);
  var P = '[|]';
  var L_OR_BOTH = "".concat(SP, "(?:").concat(P).concat(CELL, ")+").concat(P, "?");
  var R_OR_NONE = "".concat(CELL, "(?=").concat(P, ")(?:").concat(P).concat(CELL, ")*").concat(P, "?");
  return new RegExp("^(?:".concat(L_OR_BOTH, "|").concat(R_OR_NONE, ")").concat(SP, "$"));
}();

function processTableDelimiterRow(_ref) {
  var _ref$match = _slicedToArray(_ref.match, 1),
      delimiterRow = _ref$match[0];

  return delimiterRow.replace(/\|/g, '\\|');
}
/**
 * Escape table delimiter row.
 */


function tableDelimiterRowReplace() {
  if (!mergeOpts(this.opts, 'table', defaultOpts$4)) {
    return;
  }

  this.replacer.addReplacement(TABLE_DELIMITER_ROW_RE, processTableDelimiterRow, true);
}

var PIPE_RE = /\|/;
/**
 * Escape table pipes if in table context.
 */

function tablePipeReplace() {
  if (!this.opts.table) {
    return;
  }

  this.replacer.addReplacement(PIPE_RE, escapePipesIfInTable);
}

var gfmSetupDefault = function gfmSetupDefault(s) {
  return [[codeSpanReplace, s.name === CodeSpanSyntax.name], [extAutolinkReplace, s.inlinesInterpreted && !s.isLink], [strikethroughReplace, s.inlinesInterpreted], [tableDelimiterRowReplace, s.blocksInterpreted], [blockReplace, s.blocksInterpreted], [tablePipeReplace, true], [linkDestinationReplace, s.name === LinkDestinationSyntax.name], [linkTitleReplace, s.name === LinkTitleSyntax.name], [linkReplace, s.isLink], [entityEntityReplace, s.isLink], [entityBackslashReplace, s.inlinesInterpreted], [emphasisNonDelimitersReplace, s.inlinesInterpreted], [inlineReplace, s.inlinesInterpreted]];
};

function applyProcessors(input, processors) {
  var _this = this;

  return processors.reduce(function (str, proc) {
    return proc.call(_this, str);
  }, input);
}

var GfmEscape = /*#__PURE__*/function () {
  /**
   * Construct a new escaper based on the specified context, options and setup definition.
   * The instance is intended to be created once per GFM context and reused.
   * @param {Object} opts Escaping options for escaper setup and runtime.
   * @param {GfmEscape.Syntax} syntax The syntax we are escaping for. See {@link Syntax}.
   * @param {function} setup Callback that returns array of replaces to be applied in the
   *  for the specified syntax. See {@link GfmEscape.defaultSetup}.
   */
  function GfmEscape(opts) {
    var _this = this;

    var syntax = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Syntax.text;
    var setup = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : GfmEscape.defaultSetup;

    _classCallCheck$1(this, GfmEscape);

    this.syntax = syntax;
    this.opts = opts ? _objectSpread2$1({}, opts) : {};
    this.replacer = new UnionReplacer('gm');
    this.preprocessors = [];
    this.postprocessors = [];
    setup(syntax).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          replace = _ref2[0],
          enabled = _ref2[1];

      if (enabled) {
        replace.call(_this);
      }
    });
    this.replacer.compile();
    this.cache = {};
  }

  _createClass$1(GfmEscape, [{
    key: "escape",
    value: function escape(input) {
      var gfmContext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var escapeCtx = {
        escape: this,
        gfmContext: gfmContext,
        metadata: metadata
      };
      var str = applyProcessors.call(escapeCtx, input, this.preprocessors);
      str = this.replacer.replace(str, escapeCtx);
      return applyProcessors.call(escapeCtx, str, this.postprocessors);
    }
  }]);

  return GfmEscape;
}();

GfmEscape.Syntax = Syntax;
GfmEscape.defaultSetup = gfmSetupDefault;

/**
 * Replacement for the most missing Array polyfills.
 */
var arrays = {
  /**
   * Simplified {@link Array#includes} based on {@link Array#indexOf}.
   * @param {Array} arr Array.
   * @param {*} item item to be searched.
   */
  includes: function includes(arr, item) {
    return arr.indexOf(item) >= 0;
  }
};

/**
 * Replacement for the most missing String polyfills.
 */
var strings = {
  /**
   * Simplified {@link String#repeat} based on {@link Array#join}.
   * @param {string} character character to be repeated.
   * @param {number} count count of repeats.
   * @returns {string}
   */
  repeat: function repeat(character, count) {
    return Array(count + 1).join(character);
  }
};

/**
 * Extract semantic values from HTML source.
 */

function urlDecode(param) {
  return decodeURIComponent(param.replace(/\+/g, ' '));
}
/**
 * Get attachment name from URL.
 * @param {string} url the URL to examine.
 * @param {Array} options Turndown Service options.
 * @returns unencoded attachment name or null.
 */


function attachmentNameFromUrl(url, options) {
  if (!url) {
    return null;
  }

  var encodedPath = options.attachmentUrlPatterns.reduce(function (match, regexp) {
    return match || (url.match(regexp) || [null, null])[1];
  }, null);
  return encodedPath && urlDecode(encodedPath);
}
/**
 * Get attachment name from a thumbnail anchor.
 * @param {Element} node the anchor node to examine.
 * @param {Array} options Turndown Service options.
 * @returns unencoded attachment name or null.
 */


function attachmentNameFromThumbnailAnchor(node, options) {
  if (node.classList.contains('thumbnail')) {
    // Redmine thumbnail macro
    return node.firstChild.getAttribute('alt') || null;
  }

  if (arrays.includes(node.getAttributeNames(), 'file-preview-type')) {
    // JIRA thumbnail
    return attachmentNameFromUrl(node.getAttribute('href'), options);
  }

  return null;
}
/**
 * Get code language from a class name.
 * @param {string} className the class examine.
 * @param {Array} options Turndown Service options.
 * @returns code language or null.
 */


function codeLanguageFromClassName(className, options) {
  if (!className) {
    return null;
  }

  return options.codeClassPatterns.reduce(function (match, regexp) {
    return match || (className.match(regexp) || [null, null])[1];
  }, null);
}

var htmlSemantics = {
  attachmentNameFromUrl: attachmentNameFromUrl,
  attachmentNameFromThumbnailAnchor: attachmentNameFromThumbnailAnchor,
  codeLanguageFromClassName: codeLanguageFromClassName
};

/**
 * Handling of Redmine macros encoded as
 * <code>[!]{{</code><code>body encoded as JSON string</code><code>}}</code>
 * Macro delimiters are recognized also in <code> nested in first-level <code>
 * to support some syntax configurations of the generating rich text tweak.
 * Handy for render&convert and WYSIWYG applications.
 * @see https://github.com/orchitech/redmine_reformat/
 */
var TRIPLET_POS_CACHE_KEY = 'redmineMacroTripletPos';

var hasCachedTripletPos = function hasCachedTripletPos(node) {
  return Object.prototype.hasOwnProperty.call(node, TRIPLET_POS_CACHE_KEY);
};

var cachedTripletPos = function cachedTripletPos(node) {
  return node[TRIPLET_POS_CACHE_KEY];
};

var prev = function prev(node) {
  return node && node.previousSibling;
};

var next$1 = function next(node) {
  return node && node.nextSibling;
};

var tripletFillers = [function (node) {
  return [node, next$1(node), next$1(next$1(node))];
}, function (node) {
  return [prev(node), node, next$1(node)];
}, function (node) {
  return [prev(prev(node)), prev(node), node];
}];

var decodeBodyText = function decodeBodyText(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    return undefined;
  }
};

var validDelim = function validDelim(node) {
  var tryChildCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var child = node.firstChild;

  if (child && child.nodeType === 3) {
    return true;
  }

  return tryChildCode && child && child.nodeName === 'CODE' && node.childNodes.length === 1 && validDelim(child, false);
};

var validJsonString = function validJsonString(s) {
  if (s.length < 2 || s.charAt(0) !== '"' || s.charAt(s.length - 1) !== '"') {
    return false;
  }

  return typeof decodeBodyText(s) === 'string';
};

var validBody = function validBody(node) {
  var child = node.firstChild;
  var text = child && child.nodeType === 3 && child.textContent;
  return text && validJsonString(text);
};

var cachePass = function cachePass(node, index) {
  if (!hasCachedTripletPos(node)) {
    return true;
  }

  return cachedTripletPos(node) === index;
};

var codeTripletValidator = [function (n) {
  return cachePass(n, 0) && validDelim(n) && n.textContent.match(/^!?\{\{$/);
}, function (n) {
  return cachePass(n, 1) && validBody(n);
}, function (n) {
  return cachePass(n, 2) && validDelim(n) && n.textContent === '}}';
}];
/**
 * Find macro <code> tag triplet this node is part of at the given position.
 * @param {Node} node node to evaluate
 * @param {number} pos expected position 0-2
 * @returns {array[Node]} or null if there is no such triplet
 */

function findMacroCodeTriplet(node) {
  var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var triplet = tripletFillers[pos](node);

  if (!triplet.every(function (n) {
    return n && n.nodeName === 'CODE';
  })) {
    return null;
  }

  if (triplet.every(function (code, index) {
    return codeTripletValidator[index](code);
  })) {
    triplet.forEach(function (c, index) {
      c[TRIPLET_POS_CACHE_KEY] = index;
    });
    return triplet;
  }

  return null;
}

function isMacroNode(node, pos) {
  if (cachedTripletPos(node) === pos) {
    return true;
  }

  return findMacroCodeTriplet(node, pos) !== null;
}

function isMacroDelim(node) {
  return isMacroNode(node, 0) || isMacroNode(node, 2);
}

function isMacroBody(node) {
  return isMacroNode(node, 1);
}

var htmlEncodedMacro = {
  isMacroBody: isMacroBody,
  isMacroDelim: isMacroDelim,
  findMacroCodeTriplet: findMacroCodeTriplet,
  decodeBodyText: decodeBodyText
};

function renderImage(content, node, options, linkDest, alt, title) {
  var escapers = options.escapers,
      contexts = options.contexts;
  var context = contexts.forNode(node);
  var escapedLinkDest = escapers.escaper('linkDestination').escape(linkDest, context);
  var escapedLinkText = alt ? escapers.escaper('linkTitle').escape(alt, context) : '';
  var titleStr = '';

  if (title) {
    var x = {};
    var escapedLinkTitle = escapers.escaper('linkTitle').escape(title, context, x);
    titleStr = ' '.concat(x.startDelimiter).concat(escapedLinkTitle).concat(x.endDelimiter);
  }

  return "![".concat(escapedLinkText, "](").concat(escapedLinkDest).concat(titleStr, ")");
}

var gfm$1 = {
  renderImage: renderImage
};

function renderMacroArgument(value) {
  // Simple heuristics expecting https://www.redmine.org/issues/33073 to be implemented
  if (value.indexOf(',') >= 0) {
    var qValue = value.replace(/&(?=[a-zA-Z][a-zA-Z\\d]*;|#\\d{1,7};|#[xX][\\da-fA-F]{1,6};)/g, '&amp;').replace(/"/g, '&quot;');
    return "\"".concat(qValue, "\"");
  }

  return value;
}

function padLeft(node) {
  if (node.previousSibling && node.previousSibling.nodeType === 3 && node.previousSibling.textContent.endsWith('!')) {
    return ' ';
  }

  return '';
}

function renderMacro(content, node, options, macro, macroArgs) {
  var macroOpts = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  if (content) {
    throw new Error('Macros accepting block of text not supported');
  }

  var lpad = padLeft(node);
  var renderedArgs = macroArgs.map(function (arg) {
    return renderMacroArgument(arg);
  });
  var renderedOpts = Object.keys(macroOpts).map(function (opt) {
    return (// eslint-disable-next-line implicit-arrow-linebreak
      "".concat(opt, "=").concat(renderMacroArgument(macroOpts[opt]))
    );
  });
  var paramStr = renderedArgs.concat(renderedOpts).join(', ');
  return "".concat(lpad, "{{").concat(macro, "(").concat(paramStr, ")}}");
}

var macro = {
  renderMacro: renderMacro,
  padLeft: padLeft
};

function delimit(content, delimiter) {
  var m = delimiter.match(/^<(\w[-\w]*)(?:\s.*?)?>$/);
  var endDelimiter = m ? "</".concat(m[1], ">") : delimiter;
  return delimiter + content + endDelimiter;
}

var delimiters = {
  delimit: delimit
};

var cmAutolink = GfmEscape.Syntax.cmAutolink;
var rules$2 = new Map();
var keptElements = ['sup', 'sub'];

function blockSep(node) {
  return node.parentNode.nodeName === 'LI' ? '' : '\n';
}

rules$2.set('code', {
  filter: function filter(node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;
    return node.nodeName === 'CODE' && !isCodeBlock;
  },
  replacement: function replacement(content, node, options) {
    var escapers = options.escapers,
        contexts = options.contexts;
    var ctx = contexts.forNode(node);

    if (/\r?\n|\r/.test(content) || contexts.containsGfmMarkup(node)) {
      var _saferContent = ctx.inTable ? content.replace(/\r?\n|\r/g, '<br>') : content;

      return "<code>".concat(_saferContent, "</code>");
    } // Line breaks might have been left in DOM although eaten from content


    var saferContent = node.textContent.replace(/\r?\n|\r/g, ' ');
    var escaped = escapers.escaper('codeSpan').escape(saferContent, ctx);
    return "`".concat(escaped, "`");
  }
}); // although <tt> supports nested formatting, users use it in <code> meaning

rules$2.set('monospaced', {
  filter: 'tt',
  replacement: rules$2.get('code').replacement
});
rules$2.set('cite', {
  filter: 'cite',
  replacement: function replacement(content, node, options) {
    return delimiters.delimit(content, options.citeDelimiter);
  }
});
rules$2.set('underline', {
  filter: function filter(node) {
    return arrays.includes(['U', 'INS'], node.nodeName) || node.nodeName === 'SPAN' && node.style.textDecoration === 'underline';
  },
  replacement: function replacement(content) {
    return "<ins>".concat(content, "</ins>");
  }
});
rules$2.set('font', {
  filter: function filter(node, options) {
    return options.fontColor && node.nodeName === 'FONT' && node.getAttribute('color');
  },
  replacement: function replacement(content, node) {
    var color = node.getAttribute('color');
    return "<span style=\"color:".concat(color, "\">").concat(content, "</span>");
  }
});
rules$2.set('strikethrough', {
  filter: function filter(node) {
    return arrays.includes(['S', 'STRIKE', 'DEL'], node.nodeName) || node.nodeName === 'SPAN' && node.style.textDecoration === 'line-through';
  },
  replacement: function replacement(content, node, options) {
    return delimiters.delimit(content, options.strikethroughDelimiter);
  }
});
rules$2.set('inlineLink', {
  filter: function filter(node, options) {
    return options.linkStyle === 'inlined' && node.nodeName === 'A' && node.getAttribute('href');
  },
  replacement: function replacement(content, node, options) {
    var escapers = options.escapers,
        contexts = options.contexts;
    var context = contexts.forNode(node);
    var x = {};
    var title = '';
    var escapedHref = node.getAttribute('href') ? escapers.escaper('linkDestination').escape(node.getAttribute('href'), context) : '';

    if (node.getAttribute('title')) {
      var escapedTitle = escapers.escaper('linkTitle').escape(node.getAttribute('title'), context, x);
      title = " ".concat(x.startDelimiter).concat(escapedTitle).concat(x.endDelimiter);
    }

    return "[".concat(content, "](").concat(escapedHref).concat(title, ")");
  }
});
rules$2.set('image', {
  filter: function filter(node) {
    return node.nodeName === 'IMG' && node.getAttribute('src');
  },
  replacement: function replacement(content, node, options) {
    var src = node.getAttribute('src');
    var alt = node.getAttribute('alt');
    var title = node.getAttribute('title');
    var linkDest = htmlSemantics.attachmentNameFromUrl(src, options) || src;
    return gfm$1.renderImage(content, node, options, linkDest, alt, title);
  }
});
rules$2.set('imageThumbnail', {
  filter: function filter(node, options) {
    return node.nodeName === 'A' && node.firstChild && node.firstChild.nodeName === 'IMG' && htmlSemantics.attachmentNameFromThumbnailAnchor(node, options);
  },
  replacement: function replacement(content, node, options) {
    var attachmentName = htmlSemantics.attachmentNameFromThumbnailAnchor(node, options);
    var title = node.getAttribute('title') || '';
    var alt = node.firstChild.getAttribute('alt') || '';
    var explicitTitle = title && title !== attachmentName ? title : '';

    if (options.thumbnailMacro) {
      var macroOpts = {};

      if (explicitTitle) {
        macroOpts.title = explicitTitle;
      }

      return macro.renderMacro(null, node, options, 'thumbnail', [attachmentName], macroOpts);
    } // no way to represent thumbnail, falling back to GFM image


    return gfm$1.renderImage(content, node, options, attachmentName, alt, explicitTitle);
  }
});
rules$2.set('cmAutoLink', {
  filter: function filter(node) {
    return node.nodeName === 'A' && node.childNodes && node.childNodes.length === 1 && node.firstChild.nodeType === 3 // Text nodes have nodeType = 3
    && node.getAttribute('href') === node.textContent && cmAutolink.isEncodable(node) && cmAutolink.wouldBeUnaltered(node);
  },
  replacement: function replacement(content, node, options) {
    var escapers = options.escapers,
        contexts = options.contexts;
    var escaped = escapers.escaper('cmAutolink').escape(node.getAttribute('href'), contexts.forNode(node));
    return "<".concat(escaped, ">");
  }
});
rules$2.set('text', {
  filter: '#text',
  replacement: function replacement(content, node, options) {
    var escapers = options.escapers,
        contexts = options.contexts;
    var text = escapers.escaper('text').escape(node.nodeValue, contexts.forNode(node));
    return node.isCode ? text : text.trim();
  }
});
rules$2.set('issue', {
  filter: function filter(node) {
    return node.nodeName === 'A' && node.classList.contains('issue');
  },
  replacement: function replacement(content) {
    return content;
  }
});
rules$2.set('fencedCodeBlock', {
  filter: function filter(node, options) {
    return options.codeBlockStyle === 'fenced' && node.nodeName === 'PRE';
  },
  replacement: function replacement(content, node, options) {
    var sep = blockSep(node);
    var hasSingleChild = node.firstChild && node.childNodes.length === 1;
    var codeNode = hasSingleChild && node.firstChild.nodeName === 'CODE' ? node.firstChild : node;
    var code = codeNode.textContent.replace(/\r?\n$/, '');
    var lang = htmlSemantics.codeLanguageFromClassName(codeNode.className, options) || '';
    var langSep = lang ? ' ' : '';
    var fenceChar = options.fence.charAt(0);
    var fenceLength = options.fence.length;
    var fenceInCodeRegex = new RegExp("^".concat(fenceChar, "{").concat(fenceLength, ",}"), 'gm');
    var match;

    while (match = fenceInCodeRegex.exec(code)) {
      if (match[0].length >= fenceLength) {
        fenceLength = match[0].length + 1;
      }
    }

    var fence = strings.repeat(fenceChar, fenceLength);
    return "".concat(sep, "\n").concat(fence).concat(langSep).concat(lang, "\n").concat(code, "\n").concat(fence, "\n").concat(sep);
  }
});
rules$2.set('list', {
  filter: ['ol', 'ul'],
  replacement: function replacement(content, node, options) {
    var sep = blockSep(node);

    if (node.previousSibling && node.previousSibling.nodeName === node.nodeName) {
      // consecutive list
      return "".concat(sep, "\n").concat(options.listSeparator, "\n").concat(sep).concat(content);
    }

    return "".concat(sep, "\n").concat(content).concat(sep).concat(sep);
  }
});
rules$2.set('listItem', {
  filter: 'li',
  replacement: function replacement(content, node, options) {
    var parent = node.parentNode;
    var marker = options.bulletListMarker;

    if (parent.nodeName === 'OL') {
      var start = parent.getAttribute('start');
      var index = Array.prototype.indexOf.call(parent.children, node);
      marker = "".concat(start ? Number(start) + index : index + 1, ".");
    }

    var space = strings.repeat(' ', Math.max(1, 4 - marker.length));
    var prefix = "".concat(marker).concat(space);
    var indent = strings.repeat(' ', prefix.length);
    var liContent = content.replace(/^\n+/, '') // remove leading newlines
    .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
    .replace(/\n/gm, "\n".concat(indent)); // indent

    var trailNl = node.nextSibling && !/\n$/.test(liContent) ? '\n' : '';
    return "".concat(prefix).concat(liContent).concat(trailNl);
  }
});
rules$2.set('brInGfmTable', {
  filter: function filter(node, options) {
    return node.nodeName === 'BR' && options.contexts.forNode(node).inTable;
  },
  replacement: function replacement() {
    return '<br>';
  }
});
rules$2.set('encodedRedmineMacroBody', {
  filter: function filter(node, options) {
    return options.htmlEncodedRedmineMacros && node.nodeName === 'CODE' && htmlEncodedMacro.isMacroBody(node);
  },
  replacement: function replacement(content, node, options) {
    var escapers = options.escapers,
        contexts = options.contexts;
    var triplet = htmlEncodedMacro.findMacroCodeTriplet(node);
    var lpad = macro.padLeft(triplet[0]);
    var _ref = [triplet[0].textContent, htmlEncodedMacro.decodeBodyText(triplet[1].textContent), triplet[2].textContent],
        opening = _ref[0],
        body = _ref[1],
        closing = _ref[2];
    var inPre = options.preformattedCode && node.parentNode.isCode || node.closest('pre') !== null; // make the encoding transparent to `textContent`

    node.textContent = inPre ? body : body.replace(/[ \t\r\n]+/g, ' ');
    var out = "".concat(lpad).concat(opening).concat(body).concat(closing); // see Redmine's ApplicationHelper.parse_non_pre_blocks()

    return inPre || node.parentNode.isCode ? escapers.escaper('text').escape(out, contexts.forNode(node)) : out;
  },
  transparent: true
});
rules$2.set('encodedRedmineMacroDelim', {
  filter: function filter(node, options) {
    return options.htmlEncodedRedmineMacros && node.nodeName === 'CODE' && htmlEncodedMacro.isMacroDelim(node);
  },
  replacement: function replacement() {
    return '';
  },
  transparent: true
});

var rules_1 = function redmineRules(turndownService) {
  turndownService.keep(keptElements);
  rules$2.forEach(function (value, key) {
    return turndownService.addRule(key, value);
  });
};

var TurndownPluginRedmine = {
  rules: rules_1
};

/**
 * Preconfigured {@link GfmEscape} factory.
 */

var Escapers = /*#__PURE__*/function () {
  function Escapers(opts) {
    _classCallCheck(this, Escapers);

    this.opts = opts;
    this.escapers = {};
  }

  _createClass(Escapers, [{
    key: "escaper",
    value: function escaper(name) {
      // eslint-disable-next-line no-return-assign
      return this.escapers[name] || (this.escapers[name] = new GfmEscape(this.opts, GfmEscape.Syntax[name]));
    }
  }]);

  return Escapers;
}();

var Escapers_1 = Escapers;

/**
 * Contextual information resolver.
 */
var Contexts = /*#__PURE__*/function () {
  function Contexts(rules) {
    _classCallCheck(this, Contexts);

    this.rules = rules;
  }

  _createClass(Contexts, [{
    key: "forNode",
    value: function forNode(node) {
      return {
        inLink: this.inRuleContext(node, 'a', ['inlineLink', 'cmAutoLink']),
        inImage: this.inRuleContext(node, 'img', ['image']),
        inTable: this.inRuleContext(node, 'table', ['table'])
      };
    }
  }, {
    key: "inRuleContext",
    value: function inRuleContext(node, selector, contextRuleKeys) {
      var currentNode = node; // start at the closest element

      while (currentNode != null && currentNode.nodeType !== 1) {
        currentNode = currentNode.parentElement || currentNode.parentNode;
      }

      while (currentNode !== null && currentNode.nodeType === 1 && (currentNode = currentNode.closest(selector)) !== null) {
        var rule = this.rules.forNode(currentNode);

        if (rule && rule.key && contextRuleKeys.indexOf(rule.key) >= 0) {
          return true;
        }

        currentNode = currentNode.parentElement || currentNode.parentNode;
      }

      return false;
    }
  }, {
    key: "containsGfmMarkup",
    value: function containsGfmMarkup(node) {
      var nodeIterator = node.ownerDocument.createNodeIterator(node, 1);
      var n = nodeIterator.nextNode(); // skip root

      while (n = nodeIterator.nextNode()) {
        var r = this.rules.forNode(n);

        if (!r.transparent) {
          return true;
        }
      }

      return false;
    }
  }]);

  return Contexts;
}();

var Contexts_1 = Contexts;

/**
 * An alternative implementation of the default `keep` replacement.
 * Preserves current element, but uses the GFM-rendered subtree content.
 */

/**
 * Shallow keep replacement. Ignores the attributes atm.
 * The default outerHTML approach is chosen for block elements.
 */
function shallowKeepReplacement(content, node) {
  if (node.isBlock) {
    return "\n\n".concat(node.outerHTML, "\n\n");
  }

  var clone = node.cloneNode(false);
  return clone.outerHTML.replace('><', ">".concat(content, "<"));
}

var shallowKeepReplacement_1 = shallowKeepReplacement;

var gfmEscapeOpts = {
  strikethrough: {
    optimizeForDoubleTilde: true
  },
  extAutolink: true,
  table: true
};
var staticConfiguration = {
  gfmEscapeOpts: gfmEscapeOpts,
  headingStyle: 'atx',
  hr: '---',
  // https://www.redmine.org/projects/redmine/wiki/RedmineTextFormattingMarkdown
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  // Redmine's formatting toolbar
  strikethroughDelimiter: '~~',
  keepReplacement: shallowKeepReplacement_1
};
var defaultOptions = {
  fontColor: false,
  attachmentUrlPatterns: [/^\/secure\/attachment\/\d+\/\d+_([^/]+)$/, /^\/attachments\/download\/\d+\/([^/]+)$/],
  codeClassPatterns: [/^(?:language|code)-(\S+)$/, // CommonMark spec and JIRA
  /^(\S+)\s+syntaxhl$/ // Redmine
  ],
  fence: '```',
  listSeparator: '<!-- end list -->',
  citeDelimiter: '<cite>',
  preformattedCode: true,
  htmlEncodedRedmineMacros: true,
  thumbnailMacro: true
};

function decorateRules() {
  this.rules.defaultRule.transparent = true;
}

function applyRuntimeOptions(opts) {
  Object.assign(this.options, opts);
  Object.assign(this.rules.options, opts);
}
/**
 * Redmine Turndown service.
 * - Exposes escapers in options as `escapers`.
 * - Exposes context resolver in options as `contexts`.
 */


var RedmineTurndownService = /*#__PURE__*/function (_PatchedTurndownServi) {
  _inherits(RedmineTurndownService, _PatchedTurndownServi);

  var _super = _createSuper(RedmineTurndownService);

  function RedmineTurndownService() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RedmineTurndownService);

    _this = _super.call(this, _objectSpread2({}, staticConfiguration, {}, defaultOptions, {}, options));
    _this.options.escapers = new Escapers_1(_this.options.gfmEscapeOpts);

    _this.use(turndownPluginGfm_es.tables);

    _this.use(TurndownPluginRedmine.rules);

    decorateRules.call(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(RedmineTurndownService, [{
    key: "turndown",
    value: function turndown(input) {
      applyRuntimeOptions.call(this, {
        contexts: new Contexts_1(this.rules)
      });
      return _get(_getPrototypeOf(RedmineTurndownService.prototype), "turndown", this).call(this, input);
    }
  }]);

  return RedmineTurndownService;
}(PatchedTurndownService_1);

var RedmineTurndownService_1 = RedmineTurndownService;

export default RedmineTurndownService_1;
