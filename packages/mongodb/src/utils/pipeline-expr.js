import is from '@sindresorhus/is';
import { CleanDocument } from './clean-document.js';

const $ = (path) => `$${path}`;

export default class Expr {
  constructor(expr) {
    this.expr = expr;
  }

  toObject() {
    return this.expr;
  }

  static $addToSet(pathOrExpr, value) {
    const values = CleanDocument.value(is.array(value) ? value : [value]);
    return new Expr({
      $setUnion: [
        { $cond: [{ $isArray: Expr.getInput(pathOrExpr) }, Expr.getInput(pathOrExpr), []] },
        values,
      ],
    });
  }

  static $filter(pathOrExpr, cond) {
    return new Expr({
      $filter: {
        input: {
          $cond: [{ $isArray: Expr.getInput(pathOrExpr) }, Expr.getInput(pathOrExpr), []],
        },
        as: 'v',
        cond,
      },
    });
  }

  static $inc(pathOrExpr, value) {
    return new Expr({ $add: [Expr.getInput(pathOrExpr), value] });
  }

  static $pull(pathOrExpr, cond) {
    return Expr.$filter(pathOrExpr, cond);
  }

  static $mergeArrayObject(pathOrExpr, cond, value) {
    return new Expr({
      $map: {
        input: Expr.getInput(pathOrExpr),
        as: 'v',
        in: {
          $cond: {
            if: cond,
            then: { $mergeObjects: ['$$v', CleanDocument.object(value)] },
            else: '$$v',
          },
        },
      },
    });
  }

  static getInput(pathOrExpr) {
    return pathOrExpr instanceof Expr ? pathOrExpr.toObject() : $(pathOrExpr);
  }
}
