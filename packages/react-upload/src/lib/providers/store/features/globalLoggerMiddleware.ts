import { Middleware } from 'redux';
import { addLoggerRequest, addLoggerRequests } from './logger';
import { LoggerType } from '@giglabo/shared';

export const createGlobalLoggerMiddleware = (): Middleware => (store) => (next) => async (action) => {
  next(action);

  if (!addLoggerRequest.match(action) && !addLoggerRequests.match(action)) {
    store.dispatch(
      addLoggerRequest({
        loggerCode: 'action',
        loggerMessage: (action as any).type,
        loggerType: LoggerType.debug,
        data: {},
      }),
    );
  }
};
