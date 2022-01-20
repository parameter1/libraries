import { get } from '@parameter1/object-path';
import { isIntrospectionQuery } from './utils/index.js';

const { log } = console;

const setHeader = (http, key, value) => {
  if (http) http.headers.set(key, `${value}`);
};

export default function OperationProfilerPlugin({ enabled = true, logToTerminal = true } = {}) {
  const shouldProfile = (requestContext) => {
    if (!enabled) return false;
    return !isIntrospectionQuery(requestContext);
  };
  return {
    /**
     *
     */
    requestDidStart(rq) {
      let start;
      if (shouldProfile(rq)) start = process.hrtime();
      return {
        willSendResponse(requestContext) {
          if (!shouldProfile(requestContext) || !start) return;
          const { operationName: name, response } = requestContext;
          const { http } = response;
          const [secs, ns] = process.hrtime(start);
          const ms = (secs * 1000) + (ns / 1000000);
          const type = get(requestContext, 'operation.operation');
          if (logToTerminal) log('Apollo Op Profile', { type, name, ms });
          setHeader(http, 'x-profile-time-ms', ms);
        },
      };
    },
  };
}
