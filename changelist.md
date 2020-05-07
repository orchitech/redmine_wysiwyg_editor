## turndown-redmine integration

*Turndown-redmine* has been integrated into this project and replaced custom implementation of *Turndown*. *Turndown-redmine* is extending *Turndown* with rules of many missing GFM constructs, some rules have been improved to provide better solution for markdown escaping.

## Reducing editor's code complexity

We have separated text conversion logic to their respective components. First component `EditorUtils` contains editor's utilities, such as setting language or checking image file. Second component, `Converters`, is responsible for text conversion both markdown and textile. This is an extension point described in next paragraph. The idea for this component was to have functions responsible only for text conversion. `ConverterUtils` contains processing methods for `Converters`, such as processing image URL from URL or code language from class name. `CommonRules` contains rules that are used both for turndown and textile. `Languages` is basically enum, it contains code languages for Redmine code blocks.

## Providing extension point for wysiwyg-related markdown escaping

An extension point for wysiwyg editor-related escaping has been provided. Thanks to this change we can easily provide better solution for preserving i.e. Redmine macros (this is yet to be implemented).
* `Converters.prototype.preprocessTextForRendering` - Prepares Redmine rich text before it's sent to standard Redmine renderer.
* `Converters.prototype.postprocessHtml` - Counterpart of `Converters.prototype.preprocessTextForRendering`, should be called on the Redmine-rendered text before it is actually handed over to the editor.
* `Converters.prototype.preprocessHtmlForConversion` - Prepares HTML obtained from editor to suitable form for converter.
* `Converters.prototype.postprocessConvertedText` - Counterpart of `Converters.prototype.preprocessHtmlForConversion`, postprocesses rich text obtained from HTML -> text conversion.

