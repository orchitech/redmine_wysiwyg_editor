(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('./commonRules'),
      require('./converterUtils'));
  } else {
    var commonRules = (typeof CommonRules !== 'undefined') ? CommonRules : null;
    var utils = (typeof ConverterUtils !== 'undefined') ? ConverterUtils : null;
    root.Converters = factory(commonRules, utils);
  }
}(this, function(CommonRules, ConverterUtils) {
  function Converters() {

    this.utils = new ConverterUtils();
    this.commonRules = new CommonRules(this.utils);
  }

  Converters.prototype.initMarkdown = function(turndownService, projectKey) {
    this.commonRules.resourceLinkRule().forEach(function(x) {
      turndownService.addRule(x.key, x);
    });

    turndownService.addRule('wiki', this.commonRules.wikiLinkRule(projectKey));

    // turndownService.addRule('br', {
    //   // Suppress appending two spaces at the end of the line.
    //   filter: 'br',
    //   replacement: function(content, node) {
    //     return ($(node).closest('table').length > 0) ? ' ' : '\n';
    //   }
    // });
    // }).addRule('div', {
    //   filter: function(node) {
    //     return (node.nodeName === 'DIV') && node.style.cssText.length;
    //   },
    //   replacement: function(content, node) {
    //     return '<div style="' + node.style.cssText + '">\n' + content +
    //       '\n</div>\n';
    //   }
    // }).addRule('p', {
    //   filter: function(node) {
    //     return (node.nodeName === 'P') && node.style.cssText.length;
    //   },
    //   replacement: function(content, node) {
    //     return '<p style="' + node.style.cssText + '">' + content + '</p>\n';
    //   }
    // }).addRule('span', {
    //   filter: function(node) {
    //     return (node.nodeName === 'SPAN') && node.style.cssText.length;
    //   },
    //   replacement: function(content, node) {
    //     return '<span style="' + node.style.cssText + '">' + content + '</span>';
    //   }
    // }).addRule('bold', {
    //   filter: 'mark',
    //   replacement: function(content) {
    //     return '**' + content + '**';
    //   }
    // }).addRule('italic', {
    //   filter: 'q',
    //   replacement: function(content) {
    //     return '_' + content + '_';
    //   }
    // }).addRule('underline', {
    //   filter: function(node) {
    //     var name = node.nodeName;

    //     return (name === 'U') || (name === 'INS') ||
    //       ((name === 'SPAN') && (node.style.textDecoration === 'underline'));
    //   },
    //   replacement: function(content) {
    //     return '<ins>' + content + '</ins>';
    //   }
    // }).addRule('strikethrough', {
    //   filter: function(node) {
    //     var name = node.nodeName;

    //     return (name === 'S') || (name === 'DEL') ||
    //       ((name === 'SPAN') && (node.style.textDecoration === 'line-through'));
    //   },
    //   replacement: function(content) {
    //     return '~~' + content + '~~';
    //   }
    // }).addRule('del', {
    //   filter: 'del',
    //   replacement: function(content) {
    //     return '~~' + content + '~~';
    //   }
    // }).addRule('code', {
    //   filter: ['kbd', 'samp', 'tt', 'var'],
    //   replacement: function(content) {
    //     return '`' + content + '`';
    //   }
    // }).addRule('a', {
    //   filter: function(node) {
    //     var content = node.textContent;
    //     var href = node.getAttribute('href');

    //     return (node.nodeName === 'A') && href &&
    //       ((href === 'mailto:' + content) ||
    //        (/^(http|https|ftp|ftps):/.test(href) &&
    //         ((href === content) || (href === content + '/'))));
    //   },
    //   replacement: function(content, node) {
    //     return self._gluableContent(content, node, ' ');
    //   }
    // }).addRule('table', {
    //   filter: 'table',
    //   replacement: function(content) {
    //     return content;
    //   }
    // }).addRule('pTable', {
    //   // Paragraph in table
    //   filter: function(node) {
    //     return (node.nodeName === 'P') && ($(node).closest('table').length > 0);
    //   },
    //   replacement: function(content) {
    //     return content;
    //   }
    // }).addRule('pre', {
    //   filter: 'pre',
    //   replacement: function(content, node) {
    //     var code = node.dataset.code;
    //     var lang = node.className.match(/language-(\S+)/);

    //     var klass = code ? code :
    //         lang ? self._languageClassName(lang[1]) : null;

    //     var opt = klass ? ' ' + klass : '';

    //     return '~~~' + opt + '\n' + content.replace(/\n?$/, '\n') + '~~~\n\n';
    //   }
    // }).addRule('blockquote', {
    //   filter: 'blockquote',
    //   replacement: function(content) {
    //     return content.trim().replace(/\n\n\n+/g, '\n\n').replace(/^/mg, '> ');
    //   }
    // }).addRule('img', {
    //   filter: 'img',
    //   replacement: function(content, node) {
    //     return (self._htmlTagAllowed && (node.getAttribute('width') ||
    //                                      node.getAttribute('height'))) ?
    //       node.outerHTML :
    //       '![' + node.alt + '](' + self._imageUrl(node.src) + ')';
    //   }
    // }).addRule('block', {
    //   filter: [
    //     'address', 'article', 'aside', 'footer', 'header', 'nav',
    //     'section', 'dl', 'dt', 'figcaption', 'figure', 'label', 'legend',
    //     'option', 'progress', 'textarea', 'dialog', 'summary', 'center'
    //   ],
    //   replacement: function(content) {
    //     return content + '\n\n';
    //   }
    // }).addRule('content', {
    //   filter: [
    //     'hgroup', 'dd', 'main', 'bdi', 'bdo', 'cite', 'data', 'dfn',
    //     'ruby', 'small', 'time', 'audio', 'track', 'video', 'picture', 'caption',
    //     'button', 'datalist', 'fieldset', 'form', 'meter', 'optgroup', 'select',
    //     'details', 'big', 'abbr'
    //   ],
    //   replacement: function(content) {
    //     return content;
    //   }
    // turndownService.addRule('none', {
    //   filter: 'script'
    //   ,
    //   replacement: function(content, node, options) {
    //     console.log('foo')
    //     return '';
    //   }
    // });
    // console.log(turndownService)
    return turndownService;
  };

  Converters.prototype.toTextTextile = function(content, toTextile, $, attachment, projectKey) {
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

        return ((attr.length > 0) && (content.length > 0) &&
                (node.parentNode.nodeName !== 'SPAN')) ?
                utils.gluableContent('%' + attr + content + '%', node, NT) : content;
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

  Converters.prototype.escapeText = function(data, format) {
    return (format === 'textile' ? escapeTextile(data) : escapeMarkdown(data))
      .replace(/\{\{/g, '{$${')
      .replace(/document:/g, 'document$$:')
      .replace(/forum:/g, 'forum$$:')
      .replace(/message:/g, 'message$$:')
      .replace(/news:/g, 'news$$:')
      + '\n\n&nbsp;'; // Append NBSP to suppress 'Nothing to preview'
  };

  Converters.prototype.unescapeHTML = function(data, format) {
    // FIXME: Lost if exists in PRE.
    return (format === 'textile' ? unescapeHtmlTextile(data) : unescapeHtmlMarkdown(data))
    .replace(/\$(.)/g, '$1')
    .replace(/<legend>.+<\/legend>/g, '')
    .replace(/<a name=.+?><\/a>/g, '')
    .replace(/<a href="#(?!note-\d+).+?>.+<\/a>/g, '');
  };

  function escapeTextile(data) {
    return data
      .replace(/&#([1-9][0-9]*);/g, '&$$#$1;')
      .replace(/<code>\n?/g, '<code>')
      .replace(/<code\s+class="(\w+)">\n?/g, '<code class="$$$1">')
      .replace(/<notextile>/g, '<$$notextile><notextile>')
      .replace(/<\/notextile>/g, '</notextile></$$notextile>')
      .replace(/\[(\d+)\]/g, '[$$$1]')
      .replace(/^fn(\d+)\.\s/mg, 'fn$$$1. ');
  }

  function escapeMarkdown(data) {
    return htmlEncodedMacro(data)
      // .replace(/^~~~ *(\w+)([\S\s]+?)~~~$/mg, '~~~\n$1+-*/!?$2~~~')
      // .replace(/^``` *(\w+)([\S\s]+?)```$/mg, '~~~\n$1+-*/!?$2~~~');
  }

  function htmlEncodedMacro(data) {
    // FIXME prevent Redmine macro from executing in editor
    return data;
  }

  function unescapeHtmlTextile(data) {
    return data;
  }

  function unescapeHtmlMarkdown(data) {
    return data.replace(/<pre>(\w+)\+-\*\/!\?([\S\s]+?)<\/pre>/g,
      '<pre data-code="$1">$2</pre>');
  }

  return Converters;
}));
