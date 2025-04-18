import { Middleware } from 'redux';
import { MetaUploadService, UploadConfigService } from '../../../services';
import { uploadItemCompleted, uploadItemCompletedSingle, uploadItemUpdated } from './uploadItemSlice';
import { selectUploadItemById } from './uploadItemSelectors';
import { uploadPieceItemComplete } from '../uploadPieceItem';
import { ErrorCodes, LoggerType, UploadEntityStatusEnum, UploadItemStatusEnum, UploadPieceItemStatusEnum } from '@giglabo/upload-shared';
import { itemUploaded, selectUploadEntityById, uploadFailed } from '../uploadEntity';
import { addLoggerRequest } from '../logger';
import { normalizeRawError } from '../../shared';

export const createUploadItemMiddleware =
  (metaUploadService: MetaUploadService, uploadConfigService: UploadConfigService): Middleware =>
  (store) =>
  (next) =>
  async (action) => {
    next(action);

    const backoff = {
      maxRetries: uploadConfigService.metaDataApiRetry(),
      baseDelay: uploadConfigService.metaDataApiRetryBackoffDelay(),
    };

    if (uploadItemCompleted.match(action)) {
      const pieceIds =
        action.payload
          .map((x) => selectUploadItemById(store.getState(), x.internalId))
          .filter((x) => !!x)
          .map((x) => x?.pieceIds)
          .flatMap((x) => x) || [];

      store.dispatch(
        uploadPieceItemComplete(
          pieceIds.map((x) => ({
            chunkId: x as string,
            update: { status: UploadPieceItemStatusEnum.COMPLETED },
          })),
        ),
      );
    } else if (uploadItemCompletedSingle.match(action)) {
      const { internalId } = action.payload;
      const uploadItem = selectUploadItemById(store.getState(), internalId);
      if (!uploadItem) {
        store.dispatch(
          uploadFailed({
            internalUploadId: internalId,
            update: {
              status: UploadEntityStatusEnum.FAILED,
              error: `Upload item not found ${internalId}`,
              errorCode: ErrorCodes.INTERNAL_APP_ERROR,
              errorMessage: `Upload item not found ${internalId}`,
            },
          }),
        );
        return;
      }
      const uploadEntity = selectUploadEntityById(store.getState(), uploadItem.internalUploadId);
      if (!uploadEntity) {
        store.dispatch(
          uploadFailed({
            internalUploadId: internalId,
            update: {
              status: UploadEntityStatusEnum.FAILED,
              error: `Upload entity not found ${uploadItem.internalUploadId}`,
              errorCode: ErrorCodes.INTERNAL_APP_ERROR,
              errorMessage: `Upload entity not found ${uploadItem.internalUploadId}`,
            },
          }),
        );
        return;
      }

      store.dispatch(
        addLoggerRequest({
          loggerCode: 'upload',
          loggerMessage: `Before Calling complete upload ${uploadEntity.pkId} => ${uploadItem.pkId}`,
          loggerType: LoggerType.debug,
          data: {},
        }),
      );

      try {
        await metaUploadService.itemUploaded(uploadEntity.pkId as string, uploadItem.pkId as string, backoff);

        store.dispatch(
          uploadItemUpdated([
            {
              internalId: uploadItem.internalId,
              update: {
                status: UploadItemStatusEnum.COMPLETED,
              },
            },
          ]),
        );

        store.dispatch(
          itemUploaded({
            internalUploadId: uploadItem.internalUploadId,
            itemInternalId: uploadItem.internalId,
          }),
        );
      } catch (err: any) {
        store.dispatch(
          uploadFailed({
            internalUploadId: uploadItem.internalUploadId,
            update: {
              status: UploadEntityStatusEnum.FAILED,
              error: normalizeRawError(err),
              errorCode: ErrorCodes.INTERNAL_APP_ERROR,
              errorMessage: 'Complete file unknown error',
            },
          }),
        );
      }
    }
  };
