(function(root, factory) {
  if (typeof exports === 'object') {
    var jsdom = require('jsdom');
    var dom = new jsdom.JSDOM('<!doctype html>');

    module.exports = factory(require('jquery')(dom.window),
                             require('rwe-to-textile'),
                             require('./turndown-service.cjs'),
                             require('./editorUtils'),
                             require('./converters'),
                             {});
  } else {
    var tt = (typeof toTextile !== 'undefined') ? toTextile : null;
    var td = (typeof TurndownService !== 'undefined') ? TurndownService : null;
    var utils = (typeof EditorUtils !== 'undefined') ? EditorUtils : null;
    var converters = (typeof Converters !== 'undefined') ? Converters : null;
    root.RedmineWysiwygEditor = factory($, tt, td, utils, converters, navigator);
  }
}(this, function($, toTextile, TurndownService, EditorUtils, Converters, navigator) {

var utils = EditorUtils ? new EditorUtils() : null;
var converters = Converters ? new Converters() : null;
var turndownService = TurndownService ? new TurndownService() : null;

var RedmineWysiwygEditor = function(jstEditor, previewUrl) {
  this._jstEditor = jstEditor;
  this._previewUrl = previewUrl;
  this._postInit = function() {};

  this._prefix = '/';
  this._format = 'textile';
  this._language = 'en';
  this._i18n = {
    textile: 'Textile',
    markdown: 'Markdown',
    visual: 'Visual editor',
    preview: 'Preview',
    project: 'Project',
    page: 'Page',
    text: 'Text',
    mainPage: 'Main page',
    insertWikiLink: 'Insert Wiki link'
  };

  this._project = {};

  this._attachment = {};
  this._attachmentUploader = function() { return false; };
  this._attachmentUploading = {};

  this._htmlTagAllowed = false;

  this._defaultModeKey = 'redmine-wysiwyg-editor-mode';

  this._iOS = /iP(hone|(o|a)d)/.test(navigator.userAgent);

  this._cache = {};
};

RedmineWysiwygEditor.prototype.setPostInitCallback = function(func) {
  this._postInit = func;
};

RedmineWysiwygEditor.prototype.setPrefixPath = function(path) {
  this._prefix = path;
};

RedmineWysiwygEditor.prototype.setFormat = function(format) {
  this._format = format;
};

RedmineWysiwygEditor.prototype.setLanguage = function(lang) {
  this._language = utils.setLanguage(lang);
};

RedmineWysiwygEditor.prototype.setI18n = function(data) {
  this._i18n = data;
};

RedmineWysiwygEditor.prototype.setAttachments = function(files) {
  var self = this;
  var attachment = {};

  files.forEach(function(file) {
    var id = self._attachment[file.name];

    if (!id || (file.id >= id)) attachment[file.name] = file.id;

    self._attachmentCallback(file.name, file.id);
  });

  self._attachment = attachment;

  if (self._editor) self._updateAttachmentButtonMenu();
};

RedmineWysiwygEditor.prototype.setAttachmentUploader = function(handler) {
  this._attachmentUploader = handler;
};

RedmineWysiwygEditor.prototype.setHtmlTagAllowed = function(isAllowed) {
  this._htmlTagAllowed = isAllowed;
};

RedmineWysiwygEditor.prototype.setProject = function(id, key) {
  this._project = {id: id, key: key};
};

RedmineWysiwygEditor.prototype.setAutocomplete = function(issue, user) {
  this._autocomplete = {issue: issue, user: user};
};

RedmineWysiwygEditor.prototype.init = function(editorSetting) {
  var self = this;

  var container = self._jstEditor.parent();

  if (container.find('.wysiwyg-editor').length > 0) return false;

  var editorHtml = '<div class="wysiwyg-editor"><div></div></div>';

  var previewHtml = '<div class="wysiwyg-editor-preview wiki"></div>';

  var modeTabHtml = '<div class="wysiwyg-editor-tab"><ul>' +
      '<li><a href="#" data-type="text" class="active">' +
      self._i18n[self._format] + '</a></li>' +
      '<li><a href="#" data-type="visual">' +
      self._i18n.visual + '</a></li>' +
      '<li><a href="#" data-type="preview">' +
      self._i18n.preview + '</a></li>' +
      '</ul></div>';

  self._jstEditorTextArea = self._jstEditor.find('textarea');

  self._jstEditorTextArea.after(previewHtml);
  self._jstEditor.after(editorHtml + modeTabHtml);

  self._visualEditor = container.find('.wysiwyg-editor').hide();
  self._preview = container.find('.wysiwyg-editor-preview').hide();
  self._modeTab = container.find('.wysiwyg-editor-tab');

  var jstTabs = container.find('.jstTabs');
  var jstElements = container.find('.jstElements');

  if (jstTabs.length > 0) {
    self._jstElements = jstTabs;
    self._oldPreviewAccess = false;
    self._preview.addClass('wiki-preview');
  } else {
    self._jstElements = jstElements;
    self._oldPreviewAccess = true;
  }

  self._modeTab.on('click', 'li a', function(e) {
    e.preventDefault();
    self._changeMode($(this).data('type'));
  });

  self._defaultMode =
    (('localStorage' in window) && (window.localStorage !== null)) ? {
      get: function() {
        return localStorage.getItem(self._defaultModeKey) || 'text';
      },
      set: function(mode) {
        localStorage.setItem(self._defaultModeKey, mode);
      }
    } : {
      get: function() { return 'text'; },
      set: function() {}
    };

  self._initTinymce(editorSetting);

  return true;
};

RedmineWysiwygEditor.prototype.changeMode = function(mode) {
  var self = this;

  if (!self._editor) return false;

  if ((self._mode === 'visual') && (mode !== 'visual')) self._setTextContent();

  return self._changeMode(mode);
};

RedmineWysiwygEditor.prototype._changeMode = function(mode) {
  var self = this;

  if (!self._editor) return false;

  self._modeTab.find('li a').each(function() {
    if ($(this).data('type') === mode) $(this).addClass('active');
    else $(this).removeClass('active');
  });

  switch (mode) {
  case 'visual':
    self._setVisualContent();
    self._visualEditor.show();

    self._jstElements.hide();
    self._jstEditor.hide();
    self._preview.hide();

    self._mode = mode;
    self._defaultMode.set(mode);
    break;
  case 'preview':
    // Note text content is set by blur event except for iOS.
    if (self._iOS && (self._mode === 'visual')) self._editor.fire('blur');
    self._setPreview();
    self._preview.show();
    self._jstEditor.show();

    self._jstElements.hide();
    self._jstEditorTextArea.hide();
    self._visualEditor.hide();

    self._mode = mode;
    break;
  default:
    // Note text content is set by blur event except for iOS.
    if (self._iOS) self._editor.fire('blur');
    self._jstElements.show();
    self._jstEditorTextArea.show();
    self._jstEditor.show();

    self._visualEditor.hide();
    self._preview.hide();

    self._mode = 'text';
    self._defaultMode.set('text');
    break;
  }

  return true;
};

RedmineWysiwygEditor.prototype.updateVisualEditor = function() {
  var self = this;

  if (!self._editor) return false;

  self._updateAttachmentButtonMenu();

  if (self._mode === 'visual') {
    self._setTextContent();
    self._setVisualContent();
  }

  return true;
};

RedmineWysiwygEditor.prototype.updateVisualContent = function() {
  var self = this;

  if (!self._editor) return false;

  if (self._mode === 'visual') self._setVisualContent();

  return true;
};

RedmineWysiwygEditor.prototype._initTinymce = function(setting) {
  var self = this;

  var style = 'pre { padding: .5em 1em; background: #fafafa; border: 1px solid #e2e2e2; border-radius: 3px; width: auto; white-space: pre-wrap; }' +
      'code { padding: .1em .2em; background-color: rgba(0,0,0,0.04); border-radius: 3px; }' +
      'pre code { padding: 0; background: none; }' +
      'blockquote { color: #6c757d; margin: .5em 0; padding: 0 1em; border-left: 2px solid rgba(0,0,0,0.15); }' +
      'a.issue, a.version, a.attachment, a.changeset, a.source, a.project, a.user { padding: .1em .2em; background-color: rgba(0,0,0,0.6); border-radius: 3px; color: white; text-decoration: none; font-size: 80%; }' +
      'a.version::before { content: "version:"; }' +
      'a.attachment::before { content: "attachment:"; }' +
      'a.project::before { content: "project:"; }' +
      'a.user::before { content: "@"; }' +
      'a.wiki-page { padding: .1em .4em; background-color: rgba(0,0,0,0.05); border-radius: 3px; text-decoration: none; font-size: 95%; }' +
      'span#autocomplete { background-color: #eee; }' +
      'span#autocomplete-delimiter { background-color: #ddd; }' +
      '.rte-autocomplete img.gravatar { margin-right: 5px; }';

  var toolbarControls = function() {
    var button = {};
    var toolbar = self._editor.theme.panel.rootControl.controlIdLookup;

    Object.keys(toolbar).forEach(function(key) {
      var setting = toolbar[key].settings;
      var name = setting.icon;

      if (name) {
        // Note index is not control ID but icon name.
        button[name] = toolbar[key];
      } else if (setting.values && (setting.values[0].text === 'Paragraph')) {
        button['format'] = toolbar[key];
      }
    });

    return button;
  };

  var callback = function(editor) {
    self._control = toolbarControls();

    editor.on('blur', function() {
      self._setTextContent();
      self._enableUpdatingToolbar(false);
    }).on('focus', function() {
      self._updateAttachmentButtonMenu();
      self._enableUpdatingToolbar(true);
    }).on('paste', function(e) {
      self._pasteEventHandler(e);
    }).on('dragover', function(e) {
      e.preventDefault();
    }).on('drop', function(e) {
      self._dropEventHandler(e);
    });

    self._changeMode(self._defaultMode.get());

    self._postInit();
  };

  var setup = function(editor) {
    self._editor = editor;

    var menu = self._attachmentButtonMenu = self._attachmentButtonMenuItems();

    editor.addButton('wiki', {
      type: 'button',
      icon: 'anchor',
      tooltip: self._i18n.insertWikiLink,
      onclick: function() {
        self._wikiLinkDialog();
      }
    });

    editor.addButton('attachment', {
      type: 'menubutton',
      icon: 'newdocument',
      menu: menu,
      onPostRender: function() {
        self._attachmentButton = this;
        this.disabled(menu.length === 0);
      }
    });

    editor.addButton('code', {
      type: 'button',
      icon: 'code',
      tooltip: 'Code',
      onclick: function() {
        editor.execCommand('mceToggleFormat', false, 'code');
      }
    });
  };

  var toolbar = (self._format === 'textile') ?
      'formatselect | bold italic underline strikethrough code forecolor removeformat | link image codesample wiki attachment | bullist numlist blockquote | alignleft aligncenter alignright | indent outdent | hr | table | undo redo | fullscreen' :
      self._htmlTagAllowed ?
      'formatselect | bold italic strikethrough code removeformat | link image codesample wiki attachment | bullist numlist blockquote | alignleft aligncenter alignright | hr | table | undo redo | fullscreen' :
      'formatselect | bold italic strikethrough code removeformat | link image codesample wiki attachment | bullist numlist blockquote | hr | table | undo redo | fullscreen';

  var autocompleteSetting = self._autocomplete ? {
    delimiter: ['#', '@'],
    source: function(query, process, delimiter) {
      if (query.length === 0) return [];

      if (delimiter === '#') {
        $.getJSON(self._autocomplete.issue, {q: query}).done(process);
      } else {
        $.getJSON(self._autocomplete.user, {project: self._project.id, q: query})
          .done(process);
      }
    },
    queryBy: 'label',
    renderDropdown: function() {
      return '<ul class="rte-autocomplete mce-panel mce-floatpanel mce-menu mc-animate mce-menu-align mce-in" style="display: none"></ul>';
    },
    render: function(item) {
      if (this.options.delimiter === '#') {
        return '<li class="mce-menu-item mce-menu-item-normal">' + item.label + '</li>';
      } else {
        return '<li class="mce-menu-item mce-menu-item-normal">' +
          item.avatar + ' ' + item.label + '</li>';
      }
    },
    insert: function(item) {
      if (this.options.delimiter === '#') {
        return '<a class="issue">#' + item.id + '</a>&nbsp;';
      } else {
        return '<a class="user" href="/' + item.id + '" contenteditable="false">' +
          item.label + '</a>&nbsp;';
      }
    }
  } : {};

  var isObjectResizable = (self._format === 'textile') || self._htmlTagAllowed;

  tinymce.init($.extend({
    // Configurable parameters
    language: self._language,
    content_style: style,
    height: Math.max(self._jstEditorTextArea.height(), 200),
    branding: false,
    plugins: 'link image lists hr table textcolor codesample paste mention fullscreen',
    menubar: false,
    toolbar: toolbar,
    toolbar_items_size: 'small',
    browser_spellcheck: true,
    convert_urls: false,
    invalid_styles: {
      'table': 'width height',
      'tr': 'width height',
      'th': 'width height',
      'td': 'width height'
    },
    table_appearance_options: false,
    table_advtab: false,
    table_cell_advtab: false,
    table_row_advtab: false,
    table_default_styles: {},
    codesample_dialog_height: $(window).height() * 0.85,
    codesample_languages: utils.codeLanguages()
  }, setting, {
    // Mandatory parameters
    target: self._visualEditor.find('div')[0],
    init_instance_callback: callback,
    setup: setup,
    indentation : '1em',
    protect: [/<notextile>/g, /<\/notextile>/g],
    invalid_elements: 'fieldset,colgroup',
    object_resizing: isObjectResizable,
    image_dimensions: isObjectResizable,
    mentions: autocompleteSetting
  }));
};

RedmineWysiwygEditor._isImageFile = function(name) {
  return utils.isImageFile(name);
};

RedmineWysiwygEditor.prototype._attachmentButtonMenuItems = function() {
  var self = this;

  var attachment = Object.keys(self._attachment).sort();

  var item = attachment.filter(function(name) {
    return RedmineWysiwygEditor._isImageFile(name);
  }).map(function(name) {
    return {
      icon: 'image',
      text: name,
      onclick: function() {
        self._insertImage(name, self._attachment[name]);
      }
    };
  });

  // Separator
  if (item.length > 0) item.push({text: '|'});

  attachment.forEach(function(name) {
    item.push({
      icon: 'link',
      text: name,
      onclick: function() {
        self._insertAttachment(name);
      }
    });
  });

  return item;
};

RedmineWysiwygEditor.prototype._updateToolbar = function() {
  var self = this;

  // FIXME: Table insertion should also be disabled.
  var TARGETS =
      ['format', 'codesample', 'numlist', 'bullist', 'blockquote', 'hr'];

  var isInTable = function(node) {
    while (node && (node.nodeName !== 'BODY')) {
      if (node.nodeName === 'TD') return true;

      node = node.parentNode;
    }

    return false;
  };

  var ctrl = self._control;
  var disabled = isInTable(self._editor.selection.getNode());

  TARGETS.forEach(function(x) { ctrl[x].disabled(disabled); });
};

RedmineWysiwygEditor.prototype._enableUpdatingToolbar = function(enabled) {
  var self = this;
  var INTERVAL = 1000;

  if (!enabled) {
    clearInterval(self._toolbarIntervalId);
    self._toolbarIntervalId = null;
  } else if (!self._toolbarIntervalId) {
    self._toolbarIntervalId =
      setInterval(function() { self._updateToolbar(); }, INTERVAL);
  }
};

RedmineWysiwygEditor.prototype._updateAttachmentButtonMenu = function() {
  var self = this;
  var button = self._attachmentButton;

  var menu = self._attachmentButtonMenuItems();

  self._attachmentButtonMenu.length = 0;
  menu.forEach(function(file) {
    self._attachmentButtonMenu.push(file);
  });

  // Note this is unofficial solution.
  if (button.menu) {
    button.menu.remove();
    button.menu = null;
  }

  button.disabled(menu.length === 0);
};

RedmineWysiwygEditor._instantImageFileName = function() {
  var date = new Date();

  return date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    '-' +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2) +
    '-' +
    ('00' + date.getMilliseconds()).slice(-3) +
    '.png';
};

RedmineWysiwygEditor._fileClone = function(file, name, option) {
  var clone;

  // Note File constructor is unavailable in Edge and IE.
  try {
    clone = new File([file], name, option);
  } catch (e) {
    return null;
  }

  return clone;
};

RedmineWysiwygEditor.prototype._uploadAttachment = function(file, name) {
  var self = this;

  // Clones File object in order to go through `blob instanceof window.File`
  // in attachments.js. TinyMCE (iframe) may have its own internal class
  // (window.File).
  var clone = RedmineWysiwygEditor._fileClone(file, name, {type: file.type});

  if (clone && self._attachmentUploader(clone)) {
    self._attachmentUploading[name] = true;

    return true;
  } else {
    return false;
  }
};

RedmineWysiwygEditor.prototype._pasteEventHandler = function(e) {
  var self = this;

  var blockEventPropagation = function(event) {
    event.stopPropagation();
    event.preventDefault();
  };

  var pasteImage = function(dataTransferItem) {
    var name = RedmineWysiwygEditor._instantImageFileName();
    var file;

    // Note DataTransferItem is unavailable in Safari and IE.
    try {
      file = dataTransferItem.getAsFile();
    } catch (e) {
      return;
    }

    self._uploadAttachment(file, name);
  };

  var data = e.clipboardData;
  var isImage;

  if (data) {
    isImage = (data.types.length === 1) && (data.types[0] === 'Files') &&
      data.items && (data.items[0].type.indexOf('image') >= 0);

    if (isImage) {
      blockEventPropagation(e);
      pasteImage(data.items[0]);
    } else if (data.types.length === 0) {
      // Do nothing if file is pasted.
      blockEventPropagation(e);
    }
  }
  else {
    // FIXME: Please tell me how to detect image or not in IE...
    isImage = (window.clipboardData.getData('Text') === null);

    if (isImage) {
      // Can not do anything against IE.
      blockEventPropagation(e);
    }
  }
};

RedmineWysiwygEditor.prototype._dropEventHandler = function(e) {
  var self = this;

  e.stopPropagation();
  e.preventDefault();

  // Replaces special characters with '_'
  var fileName = function(name) {
    return name.replace(/["%*:<>?@[\\\]^|]/g, '_');
  };

  Array.prototype.forEach.call(e.dataTransfer.files, function(file) {
    self._uploadAttachment(file, fileName(file.name));
  });
};

RedmineWysiwygEditor.prototype._setVisualContent = function() {
  var self = this;

  var previewData = function(textarea) {
    var params = [$.param($("input[name^='attachments']"))];
    var name = self._oldPreviewAccess ? textarea[0].name : 'text';
    var data = {};

    data[name] = converters.escapeText(textarea[0].value.replace(/\$/g, '$$$$'), self._format);
    params.push($.param(data));

    return params.join('&');
  };

  $.ajax({
    type: 'POST',
    url: self._previewUrl,
    data: previewData(self._jstEditorTextArea),
    success: function(data) {
      self._editor.setContent(converters.unescapeHTML(data, self._format));
    }
  });
};

RedmineWysiwygEditor.prototype._insertImage = function(name, id) {
  var self = this;

  if (!self._editor) return false;

  var url = self._prefix +
      ['attachments', 'download', id, encodeURIComponent(name)].join('/');

  self._editor.insertContent('<br><img src="' + url + '"><br>');
};

RedmineWysiwygEditor.prototype._insertAttachment = function(name) {
  var self = this;

  if (!self._editor) return false;

  self._editor.insertContent(' <a class="attachment">' + name + '</a> ');
};

RedmineWysiwygEditor.prototype._setTextContent = function() {
  var self = this;

  var html = self._editor.getContent();

  var text = (self._format === 'textile') ?
      self._toTextTextile(html) :
      self._toTextMarkdown(html);

  self._jstEditorTextArea.val(text);
};

RedmineWysiwygEditor.prototype._toTextTextile = function(content) {
  return converters.toTextTextile(content, toTextile, $, this._attachment, this._project.key);
};

RedmineWysiwygEditor.prototype._toTextMarkdown = function(content) {
  var self = this;

  if (!self._markdown) {
    self._markdown = converters.initMarkdown(turndownService, this._project.key);
  }
  return self._markdown.turndown(content);
};

RedmineWysiwygEditor.prototype._setPreview = function() {
  var self = this;

  var previewData = function(textarea) {
    var params = [$.param($("input[name^='attachments']"))];

    var name = self._oldPreviewAccess ? textarea[0].name : 'text';

    var data = {};
    data[name] = textarea[0].value + ' ';

    params.push($.param(data));

    return params.join('&');
  };

  self._preview.css('min-height', self._visualEditor.height());

  $.ajax({
    type: 'POST',
    url: self._previewUrl,
    data: previewData(self._jstEditorTextArea),
    success: function(data) {
      self._preview.html(data);
    }
  });
};

RedmineWysiwygEditor.prototype._attachmentCallback = function(name, id) {
  var self = this;

  if (self._attachmentUploading[name]) {
    if (RedmineWysiwygEditor._isImageFile(name)) {
      self._insertImage(name, id);
    } else {
      self._insertAttachment(name);
    }

    self._attachmentUploading[name] = false;
  }
};

RedmineWysiwygEditor.prototype._wikiLinkDialog = function() {
  var self = this;

  var insertLink = function(e) {
    var proj = e.data.project;
    var page = e.data.page;
    var text = e.data.text || (page !== '?') ? page : proj;

    var h = ['projects', proj, 'wiki'];

    if (page !== '?') h.push(encodeURIComponent(page));

    var href = self._prefix + h.join('/');
    var c = '<a class="wiki-page" href="' + href + '">' + text + '</a>';

    self._editor.insertContent(c);
  };

  var refreshDialog = function(e) {
    // TODO: Update just only page list
    self._editor.windowManager.close();
    createDialog(e.target.value());
  };

  var openDialog = function(key) {
    var arg = {
      title: self._i18n.insertWikiLink,
      body: [{
        type: 'listbox',
        name: 'project',
        label: self._i18n.project,
        values: self._cache.wiki.project,
        value: key,
        onselect: refreshDialog
      }, {
        type: 'listbox',
        name: 'page',
        label: self._i18n.page,
        values : self._cache.wiki.page[key]
      }, {
        type: 'textbox',
        name: 'text',
        label: self._i18n.text,
      }],
      onsubmit: insertLink
    };

    self._editor.windowManager.open(arg);
  };

  var createDialog = function(key) {
    if (self._cache.wiki.page[key]) {
      openDialog(key);
    } else {
      var url = self._prefix + 'editor/projects/' + key + '/wikis';

      $.getJSON(url, {}).done(function(data) {
        var p = [{text: self._i18n.mainPage, value: '?'}];

        data.forEach(function(x) {
          p.push({text: x.title, value: x.title});
        });

        self._cache.wiki.page[key] = p;

        openDialog(key);
      });
    }
  };

  if (self._cache.wiki) {
    createDialog(self._project.key || self._cache.wiki.project[0].value);
  } else {
    var url = self._prefix + 'editor/projects';

    $.getJSON(url, {}).done(function(data) {
      var p = data.map(function(x) {
        return {text: x.name, value: x.identifier};
      });

      self._cache.wiki = {project: p, page: {}};

      createDialog(self._project.key || p[0].value);
    });
  }
};

return RedmineWysiwygEditor;
}));
