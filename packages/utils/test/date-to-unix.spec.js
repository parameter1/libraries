import { describe, it } from 'mocha';
import { expect } from 'chai';
import dateToUnix from '../src/date-to-unix.js';

describe('date-to-unix.js', () => {
  it('should return the correct unix timestamp', async () => {
    const d1 = new Date(1596659930000);
    const d2 = new Date(1596659939999);
    expect(dateToUnix(d1)).to.equal(1596659930);
    expect(dateToUnix(d2)).to.equal(1596659939);
  });
});
