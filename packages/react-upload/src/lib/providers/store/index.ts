import { configureStore } from '@reduxjs/toolkit';
import { DataUploadService, MetaUploadService, UploadConfigService } from '../services';
import uploadEntityReducer from './features/uploadEntity/uploadEntitySlice';
import uploadItemReducer from './features/uploadItem/uploadItemSlice';
import uploadPieceItemReducer from './features/uploadPieceItem/uploadPieceItemSlice';
import loggerReducer from './features/logger/loggerSlice';
import { createUploadEntityMiddleware } from './features';
import { createUploadItemMiddleware } from './features/uploadItem';
import { createUploadPieceItemMiddleware } from './features/uploadPieceItem';
import { loggerMiddleware } from './features/logger';
import { createGlobalLoggerMiddleware } from './features/globalLoggerMiddleware';

export * from './features';
export * from './features/uploadItem/types';

export const makeStore = (
  metaUploadService: MetaUploadService,
  uploadConfigService: UploadConfigService,
  dataUploadService: DataUploadService,
) => {
  return configureStore({
    reducer: {
      logger: loggerReducer,
      uploadEntity: uploadEntityReducer,
      uploadItem: uploadItemReducer,
      uploadPieceItem: uploadPieceItemReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(
        createGlobalLoggerMiddleware(),
        createUploadEntityMiddleware(metaUploadService, uploadConfigService),
        createUploadItemMiddleware(metaUploadService, uploadConfigService),
        createUploadPieceItemMiddleware(metaUploadService, uploadConfigService, dataUploadService),
        loggerMiddleware(metaUploadService, uploadConfigService),
      ),
  });
};

export type StoreType = ReturnType<typeof makeStore>;
export type RootState = ReturnType<StoreType['getState']>;
export type AppDispatch = StoreType['dispatch'];
