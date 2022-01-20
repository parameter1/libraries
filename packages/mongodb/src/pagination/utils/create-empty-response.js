export default () => {
  const pageInfo = {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  };
  return {
    edges: [],
    pageInfo,
    totalCount: 0,
  };
};
