import { cleanHtml } from '@parameter1/clean-string/html';
import { getAsArray } from '@parameter1/object-path';

export default (joi) => ({
  type: 'string',
  base: joi.string().trim(),
  validate(value, helpers) {
    let v = value;
    if (!helpers.schema.$_getRule('html')) {
      // no html rule set. strip all tags
      v = cleanHtml(v, { allowedTags: [], defaultValue: '' });
    }

    if (!helpers.schema.$_getFlag('multiline')) {
      // strip multi-line fields when multiline isn't set
      v = v.replace(/[\r\n]/g, '__NEW-LINE__')
        .split('__NEW-LINE__')
        .map((l) => l.trim())
        .filter((l) => l)
        .join(' ')
        .trim();
    }
    return { value: v };
  },
  rules: {
    html: {
      args: [
        {
          name: 'params',
          assert: joi.object({
            preset: joi.string(),
            tags: joi.array().items(joi.string().trim()).default([]),
          }),
        },
      ],
      method(params) {
        return this.$_addRule({ name: 'html', args: { params } });
      },
      validate(value, helpers, { params }) {
        const tags = getAsArray(params, 'tags');
        return cleanHtml(value, { allowedTags: tags.length ? tags : true });
      },
    },
    multiline: {
      method() {
        return this.$_setFlag('multiline', true);
      },
    },
  },
});
