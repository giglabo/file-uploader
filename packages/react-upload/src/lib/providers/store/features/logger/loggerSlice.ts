import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoggerEntity, LoggerRequest, LoggerState } from './types';
import { v4 as uuidv4 } from 'uuid';

const initialState: LoggerState = {
  entities: {},
  ids: [],
  lastLogId: null,
};

const loggerSlice = createSlice({
  name: 'logger',
  initialState,
  reducers: {
    clearLogger: (_state, _action: PayloadAction<string | undefined>) => {
      return initialState;
    },
    addLoggerRequest: (_state, _action: PayloadAction<LoggerRequest>) => {
      // NOTHING
    },
    addLoggerRequests: (state, action: PayloadAction<LoggerRequest[]>) => {
      const newEntities: { [key: string]: LoggerEntity } = {};
      const newIds: string[] = [];

      action.payload.forEach((request) => {
        const logId = uuidv4();
        newEntities[logId] = {
          logId,
          ...request,
        };
        newIds.push(logId);
      });

      state.entities = { ...state.entities, ...newEntities };
      state.ids = [...state.ids, ...newIds];
      state.lastLogId = newIds[newIds.length - 1];
    },
  },
});

export const { clearLogger, addLoggerRequest, addLoggerRequests } = loggerSlice.actions;
export default loggerSlice.reducer;
