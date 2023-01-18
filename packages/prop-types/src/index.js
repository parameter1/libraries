import Joi from '@parameter1/joi';

export const { attempt, isSchema: isPropType } = Joi;
export { default as Joi, validate, validateAsync } from '@parameter1/joi';

export class PropTypes {
  /**
   * Creates an alternatives type.
   *
   * @returns {import("joi").AlternativesSchema}
   */
  static alternatives(...args) {
    return Joi.alternatives(...args);
  }

  /**
   * Creates an any type.
   *
   * @returns {import("joi").AnySchema}
   */
  static any(...args) {
    return Joi.any(...args);
  }

  /**
   * Creates an array type.
   *
   * @returns {import("joi").ArraySchema}
   */
  static array(...args) {
    return Joi.array(...args);
  }

  /**
   * Creates a boolean type.
   *
   * @returns {import("joi").BooleanSchema}
   */
  static boolean(...args) {
    return Joi.boolean(...args);
  }

  /**
   * Creates a conditional type.
   *
   * @param {...any} args
   * @returns {import("joi").AlternativesSchema}
   */
  static conditional(...args) {
    return Joi.alternatives().conditional(...args);
  }

  /**
   * Creates a date type.
   *
   * @returns {import("joi").DateSchema}
   */
  static date(...args) {
    return Joi.date(...args);
  }

  /**
   * Creates an email type.
   *
   * @returns {import("joi").StringSchema}
   */
  static email(...args) {
    return Joi.email(...args);
  }

  /**
   * Creates a string type that allows expanded HTML.
   *
   * Tags allowed: 'br', 'a', 'i', 'b', 'em', 'strong', 'del', 's'
   *
   * @returns {import("joi").StringSchema}
   */
  static expandedHtml() {
    return Joi.expandedHtml();
  }

  /**
   * Creates a string type that allows full HTML.
   *
   * @returns {import("joi").StringSchema}
   */
  static fullHtml() {
    return Joi.fullHtml();
  }

  /**
   * Creates a function type.
   *
   * @returns {import("joi").FunctionSchema}
   */
  static func(...args) {
    return Joi.function(...args);
  }

  /**
   * Creates a hostname type.
   *
   * @returns {import("joi").StringSchema}
   */
  static hostname(...args) {
    return Joi.hostname(...args);
  }

  /**
   * Creates an IP address type.
   *
   * @param {object} options
   * @returns {import("joi").StringSchema}
   */
  static ip(options) {
    return Joi.string().ip(options);
  }

  /**
   * Creates an IPv4 address type.
   *
   * @returns {import("joi").StringSchema}
   */
  static ipv4() {
    return PropTypes.ip({ version: ['ipv4'], cidr: 'forbidden' });
  }

  /**
   * Creates an integer type.
   *
   * @returns {import("joi").NumberSchema}
   */
  static integer(...args) {
    return Joi.integer(...args);
  }

  /**
   * Creates a string type that allows limited HTML.
   *
   * Tags allowed: 'i', 'b', 'em', 'strong', 'del', 's'
   *
   * @returns {import("joi").StringSchema}
   */
  static limitedHtml() {
    return Joi.limitedHtml();
  }

  /**
   * Creates a Map object type.
   *
   * @returns {import("joi").ObjectSchema}
   */
  static mapObject() {
    return Joi.object().instance(Map);
  }

  /**
   * Creates a number type.
   *
   * @returns {import("joi").NumberSchema}
   */
  static number(...args) {
    return Joi.number(...args);
  }

  /**
   * Creates an object type.
   *
   * @returns {import("joi").ObjectSchema}
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
   * @returns {import("joi").ObjectSchema}
   */
  static propTypeObject() {
    return Joi.object().schema();
  }

  /**
   * Creates a sequence type.
   *
   * @returns {import("joi").NumberSchema}
   */
  static sequence() {
    return Joi.sequence();
  }

  /**
   * Creates a Set object type.
   *
   * @returns {import("joi").ObjectSchema}
   */
  static setObject() {
    return Joi.object().instance(Set);
  }

  /**
   * Creates a slug type.
   *
   * @returns {import("joi").StringSchema}
   */
  static slug() {
    return Joi.slug();
  }

  /**
   * Creates a string type.
   *
   * @returns {import("joi").StringSchema}
   */
  static string(...args) {
    return Joi.string(...args);
  }

  /**
   * Creates a url type.
   *
   * @returns {import("joi").StringSchema}
   */
  static url() {
    return Joi.url();
  }
}
