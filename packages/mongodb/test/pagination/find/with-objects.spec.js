import { describe, it } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { findWithObjects, encodeCursor } from '@parameter1/mongodb/pagination';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('pagination/find/with-objects.js', () => {
  it('should throw an error when an ID cannot be extracted from an edge', async () => {
    await expect(findWithObjects([{ foo: 'bar' }]))
      .to.be.rejectedWith(Error, 'Unable to extract a node ID using path node._id');
  });

  it('should sort by ascending node._id by default', async () => {
    const docs = [
      { node: { _id: 3 } },
      { node: { _id: 1 } },
      { node: { _id: 2 } },
    ];
    const { edges } = await findWithObjects(docs);
    expect(edges).to.deep.equal([
      { node: { _id: 1 }, cursor: encodeCursor(1) },
      { node: { _id: 2 }, cursor: encodeCursor(2) },
      { node: { _id: 3 }, cursor: encodeCursor(3) },
    ]);
  });

  it('should sort descending dates', async () => {
    const docs = [
      { node: { _id: 1 }, date: new Date(3) },
      { node: { _id: 3 }, date: new Date(1) },
      { node: { _id: 2 }, date: new Date(2) },
    ];
    const { edges } = await findWithObjects(docs, { sort: [{ field: 'date', order: -1 }] });
    expect(edges).to.deep.equal([
      { node: { _id: 1 }, date: new Date(3), cursor: encodeCursor(1) },
      { node: { _id: 2 }, date: new Date(2), cursor: encodeCursor(2) },
      { node: { _id: 3 }, date: new Date(1), cursor: encodeCursor(3) },
    ]);
  });

  it('should sort ascending dates', async () => {
    const docs = [
      { node: { _id: 1 }, date: new Date(3) },
      { node: { _id: 3 }, date: new Date(1) },
      { node: { _id: 2 }, date: new Date(2) },
    ];
    const { edges } = await findWithObjects(docs, { sort: [{ field: 'date', order: 1 }] });
    expect(edges).to.deep.equal([
      { node: { _id: 3 }, date: new Date(1), cursor: encodeCursor(3) },
      { node: { _id: 2 }, date: new Date(2), cursor: encodeCursor(2) },
      { node: { _id: 1 }, date: new Date(3), cursor: encodeCursor(1) },
    ]);
  });

  it('should sort by descending node._id when specified', async () => {
    const docs = [
      { node: { _id: 3 } },
      { node: { _id: 1 } },
      { node: { _id: 2 } },
    ];
    const { edges } = await findWithObjects(docs, { sort: [{ field: 'node._id', order: -1 }] });
    expect(edges).to.deep.equal([
      { node: { _id: 3 }, cursor: encodeCursor(3) },
      { node: { _id: 2 }, cursor: encodeCursor(2) },
      { node: { _id: 1 }, cursor: encodeCursor(1) },
    ]);
  });

  it('should sort by ascending foo._id when specified', async () => {
    const docs = [
      { foo: { _id: 3 } },
      { foo: { _id: 1 } },
      { foo: { _id: 2 } },
    ];
    const { edges } = await findWithObjects(docs, { idPath: 'foo._id' });
    expect(edges).to.deep.equal([
      { foo: { _id: 1 }, cursor: encodeCursor(1) },
      { foo: { _id: 2 }, cursor: encodeCursor(2) },
      { foo: { _id: 3 }, cursor: encodeCursor(3) },
    ]);
  });

  it('should limit by 1 when specified', async () => {
    const docs = [
      { node: { _id: 3 } },
      { node: { _id: 1 } },
      { node: { _id: 2 } },
    ];
    const { edges } = await findWithObjects(docs, { limit: 1 });
    expect(edges).to.deep.equal([
      { node: { _id: 1 }, cursor: encodeCursor(1) },
    ]);
  });

  it('should limit by 1, in reverse, when a direction of before specified', async () => {
    const docs = [
      { node: { _id: 3 } },
      { node: { _id: 1 } },
      { node: { _id: 2 } },
    ];
    const { edges } = await findWithObjects(docs, { limit: 1, direction: 'BEFORE' });
    expect(edges).to.deep.equal([
      { node: { _id: 3 }, cursor: encodeCursor(3) },
    ]);
  });

  it('should properly collate when sorting', async () => {
    const docs = [
      { name: 'bA', node: { _id: 9 } },
      { name: '10', node: { _id: 3 } },
      { name: 'foo bar', node: { _id: 10 } },
      { name: 'foo   bar   ', node: { _id: 12 } },
      { name: '1', node: { _id: 5 } },
      { name: 'BB', node: { _id: 7 } },
      { name: 'Bb', node: { _id: 1 } },
      { name: 'BA', node: { _id: 2 } },
      { name: 'BA', node: { _id: 12 } },
      { name: 'aB', node: { _id: 4 } },
      { name: 'Ab', node: { _id: 6 } },
      { name: 'Ba', node: { _id: 8 } },
      { name: 'foo, bar', node: { _id: 11 } },
    ];

    const { edges } = await findWithObjects(docs, { sort: [{ field: 'name', order: 1 }], limit: docs.length });
    expect(edges).to.deep.equal([
      { name: '1', node: { _id: 5 }, cursor: 'NQ' },
      { name: '10', node: { _id: 3 }, cursor: 'Mw' },
      { name: 'aB', node: { _id: 4 }, cursor: 'NA' },
      { name: 'Ab', node: { _id: 6 }, cursor: 'Ng' },
      { name: 'BA', node: { _id: 2 }, cursor: 'Mg' },
      { name: 'Ba', node: { _id: 8 }, cursor: 'OA' },
      { name: 'bA', node: { _id: 9 }, cursor: 'OQ' },
      { name: 'BA', node: { _id: 12 }, cursor: 'MTI' },
      { name: 'Bb', node: { _id: 1 }, cursor: 'MQ' },
      { name: 'BB', node: { _id: 7 }, cursor: 'Nw' },
      { name: 'foo bar', node: { _id: 10 }, cursor: 'MTA' },
      { name: 'foo, bar', node: { _id: 11 }, cursor: 'MTE' },
      { name: 'foo   bar   ', node: { _id: 12 }, cursor: 'MTI' },
    ]);
  });
});
