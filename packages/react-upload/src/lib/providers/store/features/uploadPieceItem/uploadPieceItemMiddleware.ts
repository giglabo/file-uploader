import { Action, Middleware } from 'redux';

import { DataUploadService, MetaUploadService, UploadConfigService } from '../../../services';
import {
  uploadPieceItemCompletedSingle,
  uploadPieceItemFailedSingle,
  uploadPieceItemStartUploadRequest,
  uploadPieceItemTryToUploadByUrl,
} from './uploadPieceItemSlice';
import { selectUploadPieceItemById } from './uploadPieceItemSelectors';
import { selectUploadItemById, UploadItem, uploadItemCompletedSingle, uploadItemFailed, uploadItemUpdated } from '../uploadItem';
import { ErrorCodes, UploadEntityStatusEnum, UploadItemStatusEnum, UploadPieceItemStatusEnum } from '@giglabo/shared';
import { scheduleNewUploadIfNeeded, selectUploadEntityById, uploadFailed } from '../uploadEntity';
import { normalizeRawError } from '../../shared';
import { UploadPieceItem } from './types';

const createFileToUpload = (item: UploadItem, piece: UploadPieceItem): File => {
  if (item.size !== piece.end - piece.start) {
    const blobToUpload = item.file.slice(piece.start, piece.end);
    return new File([blobToUpload], piece.chunkId, {
      type: 'application/octet-stream',
    });
  } else {
    return item.file;
  }
};

export const createUploadPieceItemMiddleware =
  (metaUploadService: MetaUploadService, uploadConfigService: UploadConfigService, dataUploadService: DataUploadService): Middleware =>
  (store) =>
  (next) =>
  async (action) => {
    next(action);

    const backoffUpload = {
      maxRetries: uploadConfigService.uploadApiRetry(),
      baseDelay: uploadConfigService.uploadApiRetryBackoffDelay(),
    };

    const backoffMetadata = {
      maxRetries: uploadConfigService.metaDataApiRetry(),
      baseDelay: uploadConfigService.metaDataApiRetryBackoffDelay(),
    };

    if (uploadPieceItemFailedSingle.match(action)) {
      const { chunkId } = action.payload;
      const piece = selectUploadPieceItemById(store.getState(), chunkId);
      if (!piece) {
        // TODO error
        return;
      }

      const uploadItem = selectUploadItemById(store.getState(), piece.itemId);
      if (!uploadItem) {
        store.dispatch(
          uploadItemFailed([
            {
              internalId: piece.itemId,
              update: { status: UploadItemStatusEnum.FAILED_INCONSISTENCY },
            },
          ]),
        );
        return;
      }

      store.dispatch(
        uploadItemFailed([
          {
            internalId: piece.itemId,
            update: { status: UploadItemStatusEnum.FAILED },
          },
        ]),
      );
    } else if (uploadPieceItemCompletedSingle.match(action)) {
      const { chunkId } = action.payload;
      const piece = selectUploadPieceItemById(store.getState(), chunkId);
      if (!piece) {
        // TODO error
        return;
      }
      const uploadItem = selectUploadItemById(store.getState(), piece.itemId);
      if (!uploadItem) {
        // TODO error
        return;
      }

      let itemTotal = 0;
      let itemLoaded = 0;
      let allCompleted = true;
      if (
        uploadItem &&
        (uploadItem.status === UploadItemStatusEnum.FAILED ||
          uploadItem.status === UploadItemStatusEnum.FAILED_INCONSISTENCY ||
          uploadItem.status === UploadItemStatusEnum.TERMINATED)
      ) {
        allCompleted = false;
      }

      if (uploadItem?.pieceIds) {
        for (const pieceId of uploadItem.pieceIds) {
          const piece = selectUploadPieceItemById(store.getState(), pieceId);
          if (piece) {
            itemTotal += piece.end - piece.start || 0;
            if (piece.status !== UploadPieceItemStatusEnum.COMPLETED) {
              allCompleted = false;
              itemLoaded += piece.loaded || 0;
            } else {
              itemLoaded += piece.end - piece.start || 0;
            }
          }
        }
      }

      const actions: Action[] = [];
      if (allCompleted) {
        actions.push(
          uploadItemCompletedSingle({
            internalId: uploadItem.internalId,
            update: {
              status: UploadItemStatusEnum.COMPLETED_CHUNKS,
              uploaded: itemLoaded,
            },
          }),
        );
      } else {
        // update progress
        actions.push(
          uploadItemUpdated([
            {
              internalId: uploadItem.internalId,
              update: {
                uploaded: itemLoaded,
              },
            },
          ]),
        );
      }

      actions.push(scheduleNewUploadIfNeeded({ internalUploadId: uploadItem.internalUploadId }));
      for (const a of actions) {
        store.dispatch(a);
      }
    } else if (uploadPieceItemStartUploadRequest.match(action)) {
      const { chunkId } = action.payload;
      const piece = selectUploadPieceItemById(store.getState(), chunkId);
      if (!piece) {
        // TODO error
        return;
      }
      const uploadItem = selectUploadItemById(store.getState(), piece.itemId);
      if (!uploadItem) {
        // TODO error
        return;
      }
      const uploadEntity = selectUploadEntityById(store.getState(), uploadItem.internalUploadId);
      if (!uploadEntity) {
        // TODO error
        return;
      }

      store.dispatch(
        uploadItemUpdated([
          {
            internalId: uploadItem.internalId,
            update: { status: UploadItemStatusEnum.STARTED },
          },
        ]),
      );
      try {
        const uploadUrlResponse = await metaUploadService.retrieveUploadUrl(
          {
            filePkId: uploadItem.pkId,
            uploadPkId: uploadEntity.pkId,
            chunkNumber: piece.chunkNumber,
            hashType: piece.hashType,
            hash: piece.hash,
          },
          backoffMetadata,
        );
        store.dispatch(
          uploadPieceItemTryToUploadByUrl({
            url: uploadUrlResponse.presignedUrl,
            piece,
            item: uploadItem,
          }),
        );
      } catch (err) {
        store.dispatch(
          uploadPieceItemFailedSingle({
            chunkId: piece.chunkId,
            update: {
              status: UploadPieceItemStatusEnum.FAILED,
              errorCode: 'start upload piece failed',
              errorMessage: normalizeRawError(err),
              errorData: err,
            },
          }),
        );
        store.dispatch(
          uploadFailed({
            internalUploadId: uploadItem.internalUploadId,
            update: {
              status: UploadEntityStatusEnum.FAILED,
              error: normalizeRawError(err),
              errorCode: ErrorCodes.INTERNAL_APP_ERROR,
              errorMessage: 'Upload piece start unknown error',
            },
          }),
        );
      }
    } else if (uploadPieceItemTryToUploadByUrl.match(action)) {
      const { url, item, piece } = action.payload;
      const file = createFileToUpload(item, piece);
      const uploadTimeout = uploadConfigService.uploadApiTimeout() * 1000;
      const cb = (_res: { loaded: number; total: number }) => {
        // it is not supported now
      };
      try {
        await dataUploadService.upload(
          { file, chunkNumber: piece.chunkNumber, url, hash: piece.hash, hashType: piece.hashType },
          backoffUpload,
          uploadTimeout,
          cb,
        );

        const total = piece.end - piece.start;
        store.dispatch(
          uploadPieceItemCompletedSingle({
            chunkId: piece.chunkId,
            update: {
              status: UploadPieceItemStatusEnum.COMPLETED,
              total,
              loaded: total,
            },
          }),
        );
      } catch (err: any) {
        store.dispatch(
          uploadPieceItemFailedSingle({
            chunkId: piece.chunkId,
            update: {
              status: UploadPieceItemStatusEnum.FAILED,
              errorCode: 'try to upload piece failed',
              errorMessage: normalizeRawError(err),
              errorData: err,
            },
          }),
        );
        store.dispatch(
          uploadFailed({
            internalUploadId: item.internalUploadId,
            update: {
              status: UploadEntityStatusEnum.FAILED,
              error: normalizeRawError(err),
              errorCode: ErrorCodes.INTERNAL_APP_ERROR,
              errorMessage: 'Upload piece try unknown error',
            },
          }),
        );
      }
    }
  };
