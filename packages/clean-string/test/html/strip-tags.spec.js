/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import stripTags from '../../src/html/strip-tags.js';

const html = '<html><body><p><b>Bold <a href="">Link</a></b><i>Italic</i></p><p><em>Hello</em><br><strong>World</strong><br /></p><span><s>Sub</s><del>Strike</del></body></html>';

describe('html/strip-tags', () => {
  it('should trim strings and return default value', () => {
    const values = [null, undefined, '   ', ''];
    values.forEach((value) => {
      expect(stripTags(value)).to.be.null;
      expect(stripTags(value, { defaultValue: '' })).to.equal('');
    });
  });
  it('should return default value when stripped tags result in empty value', () => {
    const result = stripTags('<p>  </p>   ');
    expect(result).to.be.null;
  });
  it('should trim the stripped result', () => {
    const result = stripTags('<p> Foo  Bar </p>   ');
    expect(result).to.equal('Foo  Bar');
  });
  it('should strip all tags', () => {
    const result = stripTags(html);
    expect(result).to.equal('Bold LinkItalicHelloWorldSubStrike');
  });
  it('should strip all tags except allowed tags', () => {
    const result = stripTags(html, { allowedTags: ['i', 'b', 'em', 'strong', 'del', 's'] });
    expect(result).to.equal('<b>Bold Link</b><i>Italic</i><em>Hello</em><strong>World</strong><s>Sub</s><del>Strike</del>');
  });
});
