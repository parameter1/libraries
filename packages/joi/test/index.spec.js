/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import Joi from 'joi';
import { describe, it } from 'mocha';
import { expect } from 'chai';

const { ValidationError } = Joi;

describe('Joi', () => {
  describe('string', () => {
    describe('.trim().allow("")', () => {
      const type = Joi.string().trim().allow('');
      it('should return an empty string when given an empty string, regardless of presence', () => {
        const r1 = Joi.attempt('', type);
        expect(r1).to.equal('');
        const r2 = Joi.attempt('', type.required());
        expect(r2).to.equal('');
      });
      it('should return an empty string when given a trimmed empty string, regardless of presence', () => {
        const r1 = Joi.attempt('  ', type);
        expect(r1).to.equal('');
        const r2 = Joi.attempt('  ', type.required());
        expect(r2).to.equal('');
      });
    });
    describe('.trim().allow("").empty("")', () => {
      const type = Joi.string().trim().allow('').empty('');
      it('should return undefined when given an empty string and not set as required', () => {
        const r1 = Joi.attempt('', type);
        expect(r1).to.be.undefined;
        const r2 = Joi.attempt('  ', type);
        expect(r2).to.be.undefined;
      });
      it('should throw an error when given an empty string and set as required', () => {
        expect(() => {
          Joi.attempt('', type.required());
        }).to.throw(ValidationError, '"value" is required');
        expect(() => {
          Joi.attempt('  ', type.required());
        }).to.throw(ValidationError, '"value" is required');
      });
    });
    describe('.allow(null)', () => {
      const type = Joi.string().allow(null);
      it('should return null when given null, regardless of presence', () => {
        const r1 = Joi.attempt(null, type);
        const r2 = Joi.attempt(null, type.required());
        expect(r1).to.be.null;
        expect(r2).to.be.null;
      });
    });
    describe('.empty(null)', () => {
      const type = Joi.string().empty(null);
      it('should return undefined when given null and not set as required', () => {
        const r = Joi.attempt(null, type);
        expect(r).to.be.undefined;
      });
      it('should throw an error when given null and set as required', () => {
        expect(() => {
          Joi.attempt(null, type.required());
        }).to.throw(ValidationError, '"value" is required');
      });
    });
  });
});
