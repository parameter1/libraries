/**
 * Given an input of:
  ```
  Map(2) {
    5f4004f85bd077009689e35d => { _id: 5f4004f85bd077009689e35d, fields: null },
    5f400478847bf2008b69ba24 => {
      _id: 5f400478847bf2008b69ba24,
      fields: Set(5) { '_id', 'name', 'slug', 'updatedAt', 'createdAt' }
    }
  }
  ```
 * Will return a map of:
  ```
  Map(2) {
    '' => { ids: [ 5f4004f85bd077009689e35d ], projection: {} },
    '_id|name|slug|updatedAt|createdAt' => {
      ids: [ 5f400478847bf2008b69ba24 ],
      projection: { _id: 1, name: 1, slug: 1, updatedAt: 1, createdAt: 1 }
    }
  }
  ```
 *
 * Given an input of:
  ```
  Map(2) {
    5f4004f85bd077009689e35d => {
      _id: 5f4004f85bd077009689e35d,
      fields: Set(5) { '_id', 'name', 'slug', 'updatedAt', 'createdAt' }
    },
    5f400478847bf2008b69ba24 => {
      _id: 5f400478847bf2008b69ba24,
      fields: Set(5) { '_id', 'name', 'slug', 'updatedAt', 'createdAt' }
    }
  }
  ```
 * Will return a map of:
  ```
  Map(1) {
    '_id|createdAt|name|slug|updatedAt' => {
      ids: [ 5f4004f85bd077009689e35d, 5f400478847bf2008b69ba24 ],
      projection: { _id: 1, name: 1, slug: 1, updatedAt: 1, createdAt: 1 }
    }
  }
  ```
 *
 * @param {Map} idMap
 */
export default (idMap) => {
  const map = new Map();
  idMap.forEach(({ foreignField, value, fields }) => {
    // ensure fields are an array and are sorted.
    const f = (fields ? [...fields] : []).sort();
    const key = `${foreignField}:${f.join('|')}`;
    const projection = f.reduce((p, name) => ({ ...p, [name]: 1 }), {});
    if (!map.has(key)) map.set(key, { foreignField, values: [], projection });
    map.get(key).values.push(value);
  });
  return map;
};
