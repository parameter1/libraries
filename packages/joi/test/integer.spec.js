/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import Joi from '../src/index.js';

const { ValidationError } = Joi;

describe('types/integer', () => {
  it('should allow null default values', () => {
    const result = Joi.attempt(undefined, Joi.integer().default(null));
    expect(result).to.be.null;
  });
  describe('when given an undefined value', () => {
    it('should throw a validation error when required', () => {
      expect(() => {
        Joi.attempt(undefined, Joi.integer().required());
      }).to.throw(ValidationError, '"value" is required');
    });

    it('should return undefined when not required', () => {
      const result = Joi.attempt(undefined, Joi.integer());
      expect(result).to.be.undefined;
    });

    it('should return a default value when specified', () => {
      const result = Joi.attempt(undefined, Joi.integer().default(0));
      expect(result).to.eq(0);
    });
  });

  describe('when given a 0 value', () => {
    it('should return 0 and not throw an error when required', () => {
      const r1 = Joi.attempt(0, Joi.integer().required());
      expect(r1).to.eq(0);
      const r2 = Joi.attempt('0', Joi.integer().required());
      expect(r2).to.eq(0);
    });
  });

  describe('when given a integer-like string value', () => {
    it('should return the converted, integer value', () => {
      const r1 = Joi.attempt('2', Joi.integer());
      expect(r1).to.eq(2);
      const r2 = Joi.attempt('-2', Joi.integer());
      expect(r2).to.eq(-2);
    });
  });

  describe('when given a float value', () => {
    it('should throw a validation error', () => {
      expect(() => {
        Joi.attempt(2.7, Joi.integer());
      }).to.throw(ValidationError, '"value" must be an integer');
    });
  });

  describe('when given a float-like string value', () => {
    it('should throw a validation error', () => {
      expect(() => {
        Joi.attempt('2.7', Joi.integer());
      }).to.throw(ValidationError, '"value" must be an integer');
    });
  });

  describe('when given any other value', () => {
    it('should throw a validation error', () => {
      const values = [{}, [], true, false, NaN, 'foo', null];
      values.forEach((value) => {
        expect(() => {
          Joi.attempt(value, Joi.integer());
        }).to.throw(ValidationError, '"value" must be a number');
      });
    });
  });
});
