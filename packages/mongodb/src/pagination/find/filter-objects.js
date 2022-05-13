import sift from 'sift';

export default (docs, query) => docs.filter(sift(query));
