/**
 * @callback NGramFunction
 * @param {string} value
 * @returns {string[]}
 *
 * @param {number} n The number of ngrams to generate.
 * @returns {NGramFunction}
 */
export function ngram(n) {
  return (value) => {
    const grams = [];
    if (!value) return grams;

    let index = value.length - n + 1;
    if (index < 1) return grams;
    while (index) {
      index -= 1;
      grams[index] = value.slice(index, index + n);
    }
    return grams;
  };
}

export function trigram(value) {
  return ngram(3)(value);
}
