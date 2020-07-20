(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.CommonRules = factory();
  }
}(this, function() {
  function CommonRules(utils) {
    this.utils = utils;
  }

  CommonRules.prototype.wikiLinkRule = function(key) {
    // <a class="wiki-page" href="path/projects/PROJ/wiki/PAGE#ANCHOR">TEXT</a>
    // [[PROJ:PAGE#ANCHOR|TEXT]]
    return {
      filter: function(node) {
        return (node.nodeName === 'A') && node.classList.contains('wiki-page');
      },
      replacement: function(content, node) {
        var href = node.getAttribute('href');

        if (/^#/.test(href)) {
          return (href === content) ?
            ('[[' + href + ']]') :
            ('[[' + href + '|' + content + ']]');
        }

        var m = href.replace(/\?.+$/, '')
            .match(/\/projects\/([\w-]+)\/wiki(?:\/([^,./?;:|]+)(#.+)?)?$/);

        var proj = m[1];
        var page = m[2] ? decodeURIComponent(m[2]) : null;
        var anchor = m[3] ? decodeURIComponent(m[3]) : null;

        var r = [];

        if ((proj !== key) || !page) r.push(proj + ':');
        if (page) r.push(page);
        if (anchor) r.push(anchor);
        if ((page !== content) && (proj !== content)) r.push('|' + content);

        return '[[' + r.join('') + ']]';
      }
    };
  };

  CommonRules.prototype.resourceLinkRule = function() {
    var utils = this.utils;
    return [
      {
        // FIXME this rule is duplicated in turndown-redmine
        key: 'issue',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('issue');
        },
        replacement: function(content, node) {
          return utils.gluableContent(content, node, ' ');
        }
      }, {
        key: 'version',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('version');
        },
        replacement: function(content, node) {
          // FIXME: Does not work with 'sandbox:version:1.0.0'
          return utils.gluableContent('version:' + utils.qq(content), node, ' ');
        }
      }, {
        key: 'attachment',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('attachment');
        },
        replacement: function(content, node) {
          return utils.gluableContent('attachment:' + utils.qq(content), node, ' ');
        }
      }, {
        key: 'changeset',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('changeset');
        },
        replacement: function(content, node) {
          if (/^(\w+:)?(\w+\|)?r[1-9][0-9]*$/.test(content)) {
            return utils.gluableContent(content, node, ' ');
          }
          var m = content.match(/^(\w+:)?(\w+\|)?([0-9a-f]+)$/);

          var p = m[1] || ''; // Project
          var r = m[2] || ''; // Repository

          return utils.gluableContent(p + 'commit:' + r + m[3], node, ' ');
        }
      }, {
        key: 'source',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('source');
        },
        replacement: function(content, node) {
          return utils.gluableContent(content, node, ' ');
        }
      }, {
        key: 'project',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('project');
        },
        replacement: function(content, node) {
          return utils.gluableContent('project:' + utils.qq(content), node, ' ');
        }
      }, {
        key: 'user',
        filter: function(node) {
          return (node.nodeName === 'A') && node.classList.contains('user');
        },
        replacement: function(content, node) {
          var m = node.getAttribute('href').match(/\/(\d+)$/);
          return utils.gluableContent('user#' + m[1], node, ' ');
        }
      }, {
        key: 'note',
        filter: function(node) {
          return (node.nodeName === 'A') &&
            /^#note-\d+/.test(node.getAttribute('href'));
        },
        replacement: function(content, node) {
          return node.getAttribute('href');
        }
      }
    ];
  };

  return CommonRules;
}));
