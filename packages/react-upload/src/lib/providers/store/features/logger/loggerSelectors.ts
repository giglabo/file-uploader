import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../index';

export const selectLoggerState = (state: RootState) => state.logger;

export const selectLoggerSimpleData = createSelector(selectLoggerState, (state) => ({
  lastLogId: state.lastLogId,
}));
