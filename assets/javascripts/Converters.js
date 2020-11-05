(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('rwe-to-textile'),
      require('turndown-redmine'),
      require('rwe-turndown-plugin-gfm'),
      require('./CommonRules'),
      require('./ConverterUtils'),
      require('./redmine-formatting.cjs'));
  } else {
    var tt = (typeof toTextile !== 'undefined') ? toTextile : null;
    var td = (typeof TurndownRedmine !== 'undefined') ? TurndownRedmine : null;
    var gfm = (typeof turndownPluginGfm !== 'undefined') ? turndownPluginGfm : null;
    var commonRules = (typeof CommonRules !== 'undefined') ? CommonRules : null;
    var utils = (typeof ConverterUtils !== 'undefined') ? ConverterUtils : null;
    var redmineFormatting = (typeof RedmineFormatting !== 'undefined') ? RedmineFormatting : null;

    root.Converters = factory(tt, td, gfm, commonRules, utils, redmineFormatting);
  }
}(this, function(toTextile, TurndownRedmine, turndownPluginGfm, CommonRules, ConverterUtils, RedmineFormatting) {
  function Converters(options) {
    this.options = options;
    this.turndownRedmine = TurndownRedmine ? new TurndownRedmine() : null;
    this.utils = new ConverterUtils();
    this.commonRules = new CommonRules(this.utils);
    this.redmineFormatting = new RedmineFormatting({ format: options.format });
  }

  Converters.prototype.initMarkdown = function(projectKey, htmlTagAllowed) {
    var self = this;
    var rules = self.turndownRedmine.rules.array;

    // TODO FIXME this should be removed when domchristie/turndown-plugin-gfm#5
    // is merged
    self.turndownRedmine.use(turndownPluginGfm.tables);

    self.commonRules.resourceLinkRule().forEach(function(x) {
      self.turndownRedmine.addRule(x.key, x);
    });

    self.turndownRedmine.addRule('wiki', self.commonRules.wikiLinkRule(projectKey));

    self.turndownRedmine.addRule('div', {
      filter: function(node) {
        return node.nodeName === 'DIV' && node.style.cssText.length;
      },
      replacement: function(content, node) {
        return '<div style="' + node.style.cssText + '">\n' + content +
          '\n</div>\n';
      }
    }).addRule('p', {
      filter: function(node) {
        return node.nodeName === 'P' && node.style.cssText.length;
      },
      replacement: function(content, node) {
        return '<p style="' + node.style.cssText + '">' + content + '</p>\n';
      }
    }).addRule('span', {
      filter: function(node) {
        return node.nodeName === 'SPAN' && node.style.cssText.length &&
          ['underline', 'line-through'].indexOf(node.style.textDecoration) < 0;
      },
      replacement: function(content, node) {
        return '<span style="' + node.style.cssText + '">' + content + '</span>';
      }
    }).addRule('bold', {
      filter: 'mark',
      replacement: self.turndownRedmine.options.rules['strong'].replacement,
    }).addRule('italic', {
      filter: 'q',
      replacement: self.turndownRedmine.options.rules['emphasis'].replacement,
    }).addRule('code', {
      filter: ['kbd', 'samp', 'tt', 'var'],
      replacement: rules.filter(function (x) {
        return x.key === 'code';
      })[0].replacement,
    }).addRule('block', {
      filter: [
        'address', 'article', 'aside', 'footer', 'header', 'nav',
        'section', 'dl', 'dt', 'figcaption', 'figure', 'label', 'legend',
        'option', 'progress', 'textarea', 'dialog', 'summary', 'center'
      ],
      replacement: function(content) {
        return content + '\n\n';
      }
    }).addRule('content', {
      filter: [
        'hgroup', 'dd', 'main', 'bdi', 'bdo', 'cite', 'data', 'dfn',
        'ruby', 'small', 'time', 'audio', 'track', 'video', 'picture', 'caption',
        'button', 'datalist', 'fieldset', 'form', 'meter', 'optgroup', 'select',
        'details', 'big', 'abbr'
      ],
      replacement: function(content) {
        return content;
      }
    }).addRule('none', {
      filter: [
        'rp', 'rt', 'rtc', 'wbr', 'area', 'map', 'embed', 'object', 'param',
        'source', 'canvas', 'noscript', 'script', 'input', 'output'
      ],
      replacement: function() {
        return '';
      }
    }).addRule('img', {
      filter: 'img',
      replacement: function(content, node, options) {
        return (htmlTagAllowed && (node.getAttribute('width') ||
          node.getAttribute('height'))) ? node.outerHTML : rules.filter(function (x) {
            return x.key === 'image';
          })[0].replacement(content, node, options);
      }
    });
    return self.turndownRedmine;
  };

  Converters.prototype.toTextTextile = function(content, $, attachment, projectKey) {
    var self = this;
    var utils = self.utils;

    var NT = '<notextile></notextile>';

    var converters = [{
      filter: 'br',
      replacement: function(content) {
        return content + '\n';
      }
    }, {
      // Underline
      filter: function(node) {
        var name = node.nodeName;

        return (name === 'U') ||
          ((name === 'SPAN') && (node.style.textDecoration === 'underline'));
      },
      replacement: function(content, node) {
        return utils.gluableContent('+' + utils.styleAttr(node) + content + '+', node, NT);
      }
    }, {
      // Strike-through
      filter: function(node) {
        var name = node.nodeName;

        return (name === 'S') ||
          ((name === 'SPAN') && (node.style.textDecoration === 'line-through'));
      },
      replacement: function(content, node) {
        return utils.gluableContent('-' + utils.styleAttr(node) + content + '-', node, NT);
      }
    }, {
      // Span
      filter: 'span',
      replacement: function(content, node) {
        // Remove percentage value because RedCloth3 can't parse correctly.
        var attr = utils.styleAttr(node).replace(/\s*\d+%/g, '');
        var classes = utils.classAttr(node);

        if (((attr.length > 0) || (classes.length > 0)) &&
                (content.length > 0) &&
                (node.parentNode.nodeName !== 'SPAN')) {
          return utils.gluableContent('%' + classes + attr + content + '%', node, NT);
        } else {
          return content;
        }
      }
    }, {
      // Bold
      filter: ['strong', 'b', 'mark'],
      replacement: function(content, node) {
        return utils.gluableContent('*' + utils.styleAttr(node) + content + '*', node, NT);
      }
    }, {
      // Italic
      filter: ['em', 'q'],
      replacement: function(content, node) {
        return utils.gluableContent('_' + utils.styleAttr(node) + content + '_', node, NT);
      }
    }, {
      // Image
      filter: 'img',
      replacement: function(content, node) {
        return utils.gluableContent(utils.img(node, attachment), node, ' ');
      }
    }, {
      // Image link
      filter: function(node) {
        return (node.nodeName === 'A') && node.firstChild &&
          (node.firstChild.nodeName === 'IMG');
      },
      replacement: function(content, node) {
        return utils.gluableContent(utils.img(node.firstChild, attachment) + ':' + node.href, node, ' ');
      }
    }, {
      // Anchor
      filter: function(node) {
        return (node.nodeName === 'A') && (node.textContent.length === 0);
      },
      replacement: function() {
        return '';
      }
    }, self.commonRules.wikiLinkRule(projectKey), {
      // Link
      filter: function(node) {
        return (node.nodeName === 'A') && node.getAttribute('href');
      },
      replacement: function(content, node) {
        var href = node.getAttribute('href');

        var isAutoLink = href &&
            ((href === 'mailto:' + content) ||
            (/^(http|https|ftp|ftps):/.test(href) &&
              ((href === content) || (href === content + '/'))));

        if (isAutoLink && !node.title) {
          return utils.gluableContent(content, node, ' ');
        }
        var titlePart = node.title ? ' (' + node.title + ')' : '';
        var c = '"' + content +  titlePart + '":' + href;

        return utils.gluableContent(c, node, NT);
      }
    } , {
      // Abbrev
      filter: 'abbr',
      replacement: function(content, node) {
        return content + '(' + node.title + ')';
      }
    }, {
      // Line
      filter: 'hr',
      replacement: function() {
        return '---';
      }
    }, {
      // Code
      filter: ['code', 'kbd', 'samp', 'tt', 'var'],
      replacement: function(content, node) {
        return (node.parentNode.nodeName === 'PRE') ?
          content : utils.gluableContent('@' + content + '@', node, ' ');
      }
    }, {
      // Preformatted
      filter: 'pre',
      replacement: function(content, node) {
        if (node.firstChild && (node.firstChild.nodeName === 'CODE')) {
          var code = node.firstChild.className;
          var lang = node.className.match(/language-(\S+)/);

          var klass = code ? code :
              lang ? utils.languageClassName(lang[1]) : null;

          var attr = klass ? ' class="' + klass + '"' : '';

          return '\n\n<pre><code' + attr + '>\n' +
            content.replace(/\s?$/, '\n') + '</code></pre>\n\n';
        }
        return '\n\n<pre>\n' + content + '</pre>\n\n';
      }
    }, {
      // Quote
      filter: 'blockquote',
      replacement: function(content) {
        return content.trim().replace(/\n\n\n+/g, '\n\n').replace(/^/mg, '> ');
      }
    }, {
      // Table
      filter: ['table'],
      replacement: function(content, node) {
        var style = utils.styleAttr(node);
        var attr = (style.length > 0) ? 'table' + style + '.\n' : '';

        return attr + content + '\n';
      }
    }, {
      // Table
      filter: ['thead', 'tbody', 'tfoot'],
      replacement: function(content) {
        return content;
      }
    }, {
      // Table
      filter: 'tr',
      replacement: function(content, node) {
        var style = utils.styleAttr(node);
        var attr = (style.length > 0) ? style + '. ' : '';

        return attr + '|' + content + '\n';
      }
    }, {
      // Table
      filter: ['th', 'td'],
      replacement: function(content, node) {
        return utils.tableCellOption(node) + ' ' +
          content.replace(/\n\n+/g, '\n') + ' |';
      }
    }, {
      // Paragraph in table
      filter: function(node) {
        return (node.nodeName === 'P') && ($(node).closest('table').length > 0);
      },
      replacement: function(content) {
        return content;
      }
    }, {
      // Block
      filter: [
        'div', 'address', 'article', 'aside', 'footer', 'header', 'nav',
        'section', 'dl', 'dt', 'figcaption', 'figure', 'label', 'legend',
        'option', 'progress', 'textarea', 'dialog', 'summary', 'center'
      ],
      replacement: function(content) {
        return content + '\n\n';
      }
    }, {
      // Content
      filter: [
        'hgroup', 'dd', 'main', 'bdi', 'bdo', 'cite', 'data', 'dfn',
        'ruby', 'small', 'time', 'audio', 'track', 'video', 'picture', 'caption',
        'button', 'datalist', 'fieldset', 'form', 'meter', 'optgroup', 'select',
        'details', 'big'
      ],
      replacement: function(content) {
        return content;
      }
    }, {
      // None
      filter: [
        'rp', 'rt', 'rtc', 'wbr', 'area', 'map', 'embed', 'object', 'param',
        'source', 'canvas', 'noscript', 'script', 'input', 'output'
      ],
      replacement: function() {
        return '';
      }
    }];
    return toTextile(content, {
      converters: self.commonRules.resourceLinkRule().concat(converters),
      ignorePotentialOlTriggers: true
    });
  };

  Converters.prototype.preprocessTextForRendering = function(data) {
    var self = this;
    // Preprocessing of Redmine rich text before it's sent to standard Redmine
    // renderer (e.g. the preview page) for rendering to HTML will be handled
    // in this method.
    return this.redmineFormatting.preprocessTextForWysiwygRendering(
      (self.options.format === 'textile' ? preprocessTextile(data) : data))
      .replace(/\{\{/g, '{$${')
      .replace(/document:/g, 'document$$:')
      .replace(/forum:/g, 'forum$$:')
      .replace(/message:/g, 'message$$:')
      .replace(/news:/g, 'news$$:')
      + '\n\n&nbsp;'; // Append NBSP to suppress 'Nothing to preview'
  };

  // FIXME: Lost if exists in PRE.
  Converters.prototype.postprocessHtml = function(data) {
    // Postprocessing of Redmine-rendered text before it's handled over
    // to the editor will be handled in this method.
    return this.redmineFormatting.postprocessHtmlForWysiwyg(data)
      .replace(/\$(.)/g, '$1')
      .replace(/<legend>.+<\/legend>/g, '')
      .replace(/<a name=.+?><\/a>/g, '')
      .replace(/<a href="#(?!note-\d+).+?>.+<\/a>/g, '');
  };

  Converters.prototype.preprocessHtmlForConversion = function(html) {
    // Preprocessing of HTML obtained from HTML editor to a form suitable
    // for converter to rich text will be handled in this method.
    return this.redmineFormatting.preprocessWysiwygHtmlForConversion(html);
  }

  Converters.prototype.postprocessConvertedText = function(text) {
    // Postprocessing of rich text obtained from HTML -> text conversion
    // will be handled in this method.
    return this.redmineFormatting.postprocessConvertedText(text);
  }

  Converters.prototype.processHtmlCodeBlock = function(html, document) {
    return this.redmineFormatting.processHtmlCodeBlock(html, document);
  }

  function preprocessTextile(data) {
    return data
      .replace(/&#([1-9][0-9]*);/g, '&$$#$1;')
      .replace(/<code>\n?/g, '<code>')
      .replace(/<code\s+class="(\w+)">\n?/g, '<code class="$$$1">')
      .replace(/<notextile>/g, '<$$notextile><notextile>')
      .replace(/<\/notextile>/g, '</notextile></$$notextile>')
      .replace(/\[(\d+)\]/g, '[$$$1]')
      .replace(/^fn(\d+)\.\s/mg, 'fn$$$1. ');
  }

  return Converters;
}));
