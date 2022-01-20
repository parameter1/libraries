/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { ObjectId } from 'mongodb';
import Joi from '../src/index.js';

const { ValidationError } = Joi;

describe('types/objectId', () => {
  it('should allow null default values', () => {
    const result = Joi.attempt(undefined, Joi.objectId().default(null));
    expect(result).to.be.null;
  });
  describe('when given an undefined value', () => {
    it('should throw a validation error when required', () => {
      expect(() => {
        Joi.attempt(undefined, Joi.objectId().required());
      }).to.throw(ValidationError, '"value" is required');
    });

    it('should return undefined when not required', () => {
      const result = Joi.attempt(undefined, Joi.objectId());
      expect(result).to.be.undefined;
    });
  });

  describe('when given a null value', () => {
    it('should throw a validation error when allowed and required', () => {
      expect(() => {
        Joi.attempt(null, Joi.objectId().empty(null).required());
      }).to.throw(ValidationError, '"value" is required');
    });
  });

  describe('when given an ObjectId instance', () => {
    it('should return an ObjectId instance', () => {
      const result = Joi.attempt(new ObjectId(), Joi.objectId());
      expect(result).to.be.an.instanceOf(ObjectId);
    });
  });

  describe('when given a hex string that matches the pattern', () => {
    it('should return an ObjectId instance', () => {
      const result = Joi.attempt('53ca8d671784f8066eb2c949', Joi.objectId());
      expect(result).to.be.an.instanceOf(ObjectId);
      expect(`${result}`).to.eq('53ca8d671784f8066eb2c949');
    });
  });

  describe('when given an object with a toString response that matches the pattern', () => {
    it('should return an ObjectId instance', () => {
      const obj = { toString: () => '53ca8d671784f8066eb2c949' };
      const result = Joi.attempt(obj, Joi.objectId());
      expect(result).to.be.an.instanceOf(ObjectId);
      expect(`${result}`).to.eq('53ca8d671784f8066eb2c949');
    });
  });

  describe('when given any other value', () => {
    it('should throw a validation error', () => {
      const values = [{}, [], 1, true, false, NaN, 0, '', '123'];
      values.forEach((value) => {
        expect(() => {
          Joi.attempt(value, Joi.objectId());
        }).to.throw(ValidationError, '"value" must be an ObjectId');
      });
    });
  });
});
