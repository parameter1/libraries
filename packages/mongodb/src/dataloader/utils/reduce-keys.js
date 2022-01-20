/**
 * Given an input of:
  ```
  [
    {
      id: 5f4004f85bd077009689e35d,
      fields: ['_id', 'createdAt', 'name'],
    },
    {
      id: 5f4004f85bd077009689e35d,
      fields: ['_id', 'name', 'slug', 'updatedAt'],
    },
    {
      id: 5f4004f85bd077009689e35d,
      fields: [],
    },
    {
      id: 5f400478847bf2008b69ba24,
      fields: ['_id', 'createdAt', 'name'],
    },
    {
      id: 5f400478847bf2008b69ba24,
      fields: ['_id', 'name', 'slug', 'updatedAt'],
    },
  ]
  ```
 * Will return a map of:
  ```
  {
    '5f4004f85bd077009689e35d': {
      _id: 5f4004f85bd077009689e35d,
      fields: null,
    },
    '5f400478847bf2008b69ba24': {
      _id: 5f400478847bf2008b69ba24,
      fields: Set(5) {'_id', 'name', 'slug', 'updatedAt', 'createdAt'},
    },
  }
  ```
 */
export default (keys) => keys.reduce((map, { foreignField, value, fields }) => {
  const id = `${foreignField}:${value}`;
  if (!map.has(id)) map.set(id, { foreignField, value, fields: new Set() });
  const o = map.get(id);
  if (!fields.length) {
    // if a key requires all fields (e.g. the fields array is empty)
    // force this id to return all fields.
    o.fields = null;
  } else if (o.fields) {
    // merge the current key's fields with any pre-existing fields for the same id.
    o.fields = new Set([...fields, ...o.fields]);
  }
  return map;
}, new Map());
