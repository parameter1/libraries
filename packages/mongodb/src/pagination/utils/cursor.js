import { EJSON } from 'bson';
import base64url from 'base64-url';

export const decodeCursor = (str) => EJSON.parse(base64url.decode(str));

export const encodeCursor = (obj) => base64url.encode(EJSON.stringify(obj));
