'use strict';

/**
 * Class encapsulating Redmine-specific rich text conversions.
 *
 * This is a stateless version, i.e. there are no metadata mainained between
 * the calls. This means that all eventual metadata needs to be encoded to
 * the produced results while no information is extracted and remmebered.
 * If it turns out a stateful version is needed, refactoring will take place.
 * Some extra methods and constants might also be added, e.g. URL regexps.
 */
class RedmineFormatting {
  /**
   * The constructor will likely need to know the formatting (markdown /
   * textile / common_mark, ...).
   * @param {object} options
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Prepare Redmine rich text before it is sent to standard Redmine renderer
   * (e.g. the preview page) for rendering to HTML.
   *
   * The preprocessing should make sure that special Redmine constructs like
   * macros, wiki links and resource links pass through the Redmine renderer in
   * a form that is suitable for HTML editing.
   * @param {string} redmineText rich text to preprocess
   */
  // eslint-disable-next-line class-methods-use-this
  preprocessTextForWysiwygRendering(redmineText) {
    // macro encode
    // something with Redmine links?
    // something with wiki links?
    return redmineText;
  }

  /**
   * Counterpart of {@link #preprocessTextForWysiwygRendering}, should be
   * called on the Redmine-rendered text before it is actually handed over
   * to the editor.
   * @param {string} redmineHtml
   */
  // eslint-disable-next-line class-methods-use-this
  postprocessHtmlForWysiwyg(redmineHtml) {
    return redmineHtml;
  }

  /**
   * Prepare HTML obtained from HTML editor to a form suitable for converter
   * to richtext, e.g. Turndown.
   * @param {string} wysiwygHtml
   * @return {string|Node} - not yet sure
   */
  // eslint-disable-next-line class-methods-use-this
  preprocessWysiwygHtmlForConversion(wysiwygHtml) {
    return wysiwygHtml;
  }

  /**
   * Counterpart of {@link #preprocessTextForWysiwygRendering} to be called
   * on the rich text obtained from HTML -> text conversion.
   *
   * Not sure if it is going to be needed.
   * @param {string} convertedText
   * @return {string}
   */
  // eslint-disable-next-line class-methods-use-this
  postprocessConvertedText(convertedText) {
    return convertedText;
  }
}

var RedmineFormatting_1 = RedmineFormatting;

module.exports = RedmineFormatting_1;
