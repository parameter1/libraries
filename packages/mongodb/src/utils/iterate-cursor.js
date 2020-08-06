const iterateCursor = async (cursor, cb) => {
  if (await cursor.hasNext()) {
    const doc = await cursor.next();
    await cb(doc);
    await iterateCursor(cursor, cb);
  }
};

module.exports = iterateCursor;
