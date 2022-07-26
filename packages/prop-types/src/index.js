import Joi from '@parameter1/joi';

export const { attempt, isSchema: isPropType } = Joi;
export { default as Joi, validate, validateAsync } from '@parameter1/joi';

export class PropTypes {
  /**
   * Creates an alternatives type.
   *
   * @returns {object}
   */
  static alternatives(...args) {
    return Joi.alternatives(...args);
  }

  /**
   * Creates an any type.
   *
   * @returns {object}
   */
  static any(...args) {
    return Joi.any(...args);
  }

  /**
   * Creates an array type.
   *
   * @returns {object}
   */
  static array(...args) {
    return Joi.array(...args);
  }

  /**
   * Creates a boolean type.
   *
   * @returns {object}
   */
  static boolean(...args) {
    return Joi.boolean(...args);
  }

  /**
   * Creates a conditional type.
   *
   * @param {...any} args
   * @returns {object}
   */
  static conditional(...args) {
    return Joi.alternatives().conditional(...args);
  }

  /**
   * Creates a date type.
   *
   * @returns {object}
   */
  static date(...args) {
    return Joi.date(...args);
  }

  /**
   * Creates an email type.
   *
   * @returns {object}
   */
  static email(...args) {
    return Joi.email(...args);
  }

  /**
   * Creates a string type that allows expanded HTML.
   *
   * Tags allowed: 'br', 'a', 'i', 'b', 'em', 'strong', 'del', 's'
   *
   * @returns {object}
   */
  static expandedHtml() {
    return Joi.expandedHtml();
  }

  /**
   * Creates a string type that allows full HTML.
   *
   * @returns {object}
   */
  static fullHtml() {
    return Joi.fullHtml();
  }

  /**
   * Creates a function type.
   *
   * @returns {object}
   */
  static func(...args) {
    return Joi.function(...args);
  }

  /**
   * Creates a hostname type.
   *
   * @returns {object}
   */
  static hostname(...args) {
    return Joi.hostname(...args);
  }

  /**
   * Creates an IP address type.
   *
   * @param {object} options
   * @returns {object}
   */
  static ip(options) {
    return Joi.string().ip(options);
  }

  /**
   * Creates an IPv4 address type.
   *
   * @returns {object}
   */
  static ipv4() {
    return PropTypes.ip({ version: ['ipv4'], cidr: 'forbidden' });
  }

  /**
   * Creates an integer type.
   *
   * @returns {object}
   */
  static integer(...args) {
    return Joi.integer(...args);
  }

  /**
   * Creates a string type that allows limited HTML.
   *
   * Tags allowed: 'i', 'b', 'em', 'strong', 'del', 's'
   *
   * @returns {object}
   */
  static limitedHtml() {
    return Joi.limitedHtml();
  }

  /**
   * Creates a Map object type.
   *
   * @returns {object}
   */
  static mapObject() {
    return Joi.object().instance(Map);
  }

  /**
   * Creates a number type.
   *
   * @returns {object}
   */
  static number(...args) {
    return Joi.number(...args);
  }

  /**
   * Creates an object type.
   *
   * @returns {object}
   */
  static object(...args) {
    return Joi.object(...args);
  }

  /**
   * Creates a MongoDB Object ID type.
   *
   * @returns {object}
   */
  static objectId() {
    return Joi.objectId();
  }

  /**
   * Creates a one-or-many type that always returns an array.
   *
   * @param {PropTypes.any} schema
   * @returns {object}
   */
  static oneOrMany(schema) {
    attempt(schema, PropTypes.propTypeObject().required());
    return PropTypes.alternatives()
      .try(schema, PropTypes.array().items(schema))
      .custom((value) => (Array.isArray(value) ? value : [value]));
  }

  /**
   * Creates a Joi schema object (prop type object)
   *
   * @returns {object}
   */
  static propTypeObject() {
    return Joi.object().schema();
  }

  /**
   * Creates a sequence type.
   *
   * @returns {object}
   */
  static sequence() {
    return Joi.sequence();
  }

  /**
   * Creates a Set object type.
   *
   * @returns {object}
   */
  static setObject() {
    return Joi.object().instance(Set);
  }

  /**
   * Creates a slug type.
   *
   * @returns {object}
   */
  static slug() {
    return Joi.slug();
  }

  /**
   * Creates a string type.
   *
   * @returns {object}
   */
  static string(...args) {
    return Joi.string(...args);
  }

  /**
   * Creates a url type.
   *
   * @returns {object}
   */
  static url() {
    return Joi.url();
  }
}
