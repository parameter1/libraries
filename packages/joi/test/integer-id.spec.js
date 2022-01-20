/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import Joi from '../src/index.js';

const { ValidationError } = Joi;

describe('types/integer-id', () => {
  it('should throw a validation error when the id is less than 1', () => {
    const ids = ['0', 0, -1, '-1'];
    ids.forEach((id) => {
      expect(() => {
        Joi.attempt(id, Joi.integerId());
      }).to.throw(ValidationError, '"value" must be greater than or equal to 1');
    });
  });
});
