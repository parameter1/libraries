export function extractFragmentName(fragment) {
  const pattern = /fragment (.*) on/;
  if (typeof fragment === 'string') return fragment.match(pattern)[1];
  if (fragment && fragment.kind && fragment.kind === 'Document') {
    return fragment.loc.source.body.match(pattern)[1];
  }
  return null;
}

export function extractFragmentData(fragment) {
  let spreadFragmentName = '';
  let processedFragment = '';
  if (fragment) {
    const fragmentName = extractFragmentName(fragment);
    if (!fragmentName) throw new Error('Unable to extract a fragment name.');
    processedFragment = fragment;
    spreadFragmentName = `...${fragmentName}`;
  }
  return { processedFragment, spreadFragmentName };
}
