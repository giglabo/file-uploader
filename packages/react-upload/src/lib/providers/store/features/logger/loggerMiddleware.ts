import { Middleware } from 'redux';
import { addLoggerRequest, addLoggerRequests } from './loggerSlice';
import { LoggerRequest } from './types';
import { format } from 'date-fns';
import { HashCalculator, loggerStrings } from '@giglabo/shared';
import { MetaUploadService, UploadConfigService } from '../../../services';

export const loggerMiddleware =
  (metaUploadService: MetaUploadService, uploadConfigService: UploadConfigService): Middleware =>
  (store) =>
  (next) =>
  async (action) => {
    next(action);

    const backoff = {
      maxRetries: uploadConfigService.metaDataApiRetry(),
      baseDelay: uploadConfigService.metaDataApiRetryBackoffDelay(),
    };
    if (addLoggerRequest.match(action)) {
      const request: LoggerRequest = action.payload;
      store.dispatch(addLoggerRequests([request]));
    } else if (addLoggerRequests.match(action)) {
      const requests: LoggerRequest[] = action.payload;
      if (uploadConfigService.logEnabled()) {
        requests.forEach((req) => {
          if (req.loggerType >= uploadConfigService.logSeverity()) {
            if (uploadConfigService.consoleLogEnabled()) {
              console.log(
                `${format(new Date(), 'dd-MM-yyyy HH:mm:ss.SSS')} ` +
                  `${getLoggerType(req.loggerType)} "${req.loggerCode}" ${req.loggerMessage} ${getData(req.data)}`,
              );
            }
            try {
              metaUploadService.log(req).then();
            } catch (e) {
              console.error(e);
            }
          }
        });
      }
    }
  };

const getData = (data: any) => {
  try {
    return JSON.stringify(data, null, 4);
  } catch (err) {
    return 'cannot serialize';
  }
};

const getLoggerType = (loggerType: number) => {
  return loggerStrings[loggerType] || 'unknown';
};
