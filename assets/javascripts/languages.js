(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(this);
  } else {
    root.Languages = factory(this);
  }
}(this, function() {
  function Languages() {
  }

  Languages.prototype.codeLanguages = function(oldPreviewAccess) {
    return oldPreviewAccess ? [
      // CodeRay (Redmine 3)
      { text: 'C', value: 'c', klass: 'c' },
      { text: 'C++', value: 'cpp', klass: 'cpp' },
      { text: 'Clojure', value: 'clojure', klass: 'clojure' },
      { text: 'CSS', value: 'css', klass: 'css' },
      { text: 'Delphi', value: 'delphi', klass: 'delphi' },
      { text: 'Diff', value: 'diff', klass: 'diff' },
      { text: 'ERB', value: 'erb', klass: 'erb' },
      { text: 'Go', value: 'go', klass: 'go' },
      { text: 'Groovy', value: 'groovy', klass: 'groovy' },
      { text: 'Haml', value: 'haml', klass: 'haml' },
      { text: 'HTML', value: 'markup', klass: 'html' },
      { text: 'Java', value: 'java', klass: 'java' },
      { text: 'JavaScript', value: 'javascript', klass: 'javascript' },
      { text: 'JSON', value: 'json', klass: 'json' },
      { text: 'Lua', value: 'lua', klass: 'lua' },
      { text: 'PHP', value: 'php', klass: 'php' },
      { text: 'Python', value: 'python', klass: 'python' },
      { text: 'Ruby', value: 'ruby', klass: 'ruby' },
      { text: 'Sass', value: 'sass', klass: 'sass' },
      { text: 'SQL', value: 'sql', klass: 'sql' },
      { text: 'TaskPaper', value: 'taskpaper', klass: 'taskpaper' },
      { text: 'Text', value: 'text', klass: 'text' },
      { text: 'XML', value: 'xml', klass: 'xml' },
      { text: 'YAML', value: 'yaml', klass: 'yaml' }
    ] : [
      // Rouge (Redmine 4)
      { text: 'C', value: 'c', klass: 'c' },
      { text: 'C++', value: 'cpp', klass: 'cpp' },
      { text: 'C#', value: 'csharp', klass: 'csharp' },
      { text: 'CSS', value: 'css', klass: 'css' },
      { text: 'Diff', value: 'diff', klass: 'diff' },
      { text: 'Go', value: 'go', klass: 'go' },
      { text: 'Groovy', value: 'groovy', klass: 'groovy' },
      { text: 'HTML', value: 'markup', klass: 'html' },
      { text: 'Java', value: 'java', klass: 'java' },
      { text: 'JavaScript', value: 'javascript', klass: 'javascript' },
      { text: 'Objective C', value: 'objc', klass: 'objc' },
      { text: 'Perl', value: 'perl', klass: 'perl' },
      { text: 'PHP', value: 'php', klass: 'php' },
      { text: 'Python', value: 'python', klass: 'python' },
      { text: 'R', value: 'r', klass: 'r' },
      { text: 'Ruby', value: 'ruby', klass: 'ruby' },
      { text: 'Sass', value: 'sass', klass: 'sass' },
      { text: 'Scala', value: 'scala', klass: 'scala' },
      { text: 'Shell', value: 'bash', klass: 'shell' },
      { text: 'SQL', value: 'sql', klass: 'sql' },
      { text: 'Swift', value: 'swift', klass: 'swift' },
      { text: 'XML', value: 'xml', klass: 'xml' },
      { text: 'YAML', value: 'yaml', klass: 'yaml' }
    ];
  };

  return Languages;
}));
