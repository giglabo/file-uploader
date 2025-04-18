import { LoggerType } from '@giglabo/shared';

export interface LoggerEntity {
  logId: string;
  loggerType: LoggerType;
  loggerCode: string;
  loggerMessage: string;
  data: any;
}

export interface LoggerRequest {
  loggerType: LoggerType;
  loggerCode: string;
  loggerMessage: string;
  data: any;
}

export interface LoggerState {
  entities: { [key: string]: LoggerEntity };
  ids: string[];
  lastLogId: string | null | undefined;
}
