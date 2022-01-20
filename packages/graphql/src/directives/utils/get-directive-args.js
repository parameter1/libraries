import { getDirective } from '@graphql-tools/utils';

export default function getDirectiveArgs(schema, config, directiveName) {
  const directive = getDirective(schema, config, directiveName);
  return directive && directive[0] ? directive[0] : null;
}
