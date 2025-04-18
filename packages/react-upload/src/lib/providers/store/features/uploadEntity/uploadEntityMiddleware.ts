import { Action, Middleware } from 'redux';
import { uploadRequest, uploadFailed, uploadUpdate, itemUploaded, scheduleNewUploadIfNeeded } from './uploadEntitySlice';

import { selectUploadEntityById } from './uploadEntitySelectors';
import { LoggerType, UploadEntityStatusEnum, UploadItemStatusEnum, UploadPieceItemStatusEnum } from '@giglabo/shared';
import { CreateUploadResponse, MetaUploadService, UploadConfigService } from '../../../services';
import {
  selectAllUploadItems,
  UpdateUploadItem,
  UploadItem,
  uploadItemCompleted,
  uploadItemCompletedSingle,
  uploadItemMissed,
  uploadItemTerminated,
} from '../uploadItem';
import { addLoggerRequest } from '../logger';
import { chunkId, normalizeRawError } from '../../shared';
import {
  notAvailableStatusesToStartUpload,
  selectUploadPieceItemById,
  UpdateUploadPieceItem,
  UploadPieceItem,
  uploadPieceItemComplete,
  uploadPieceItemMissed,
  uploadPieceItemStartUploadRequest,
} from '../uploadPieceItem';
type InternalIdType = { internalUploadId: string };

const uploadItemTerminationAvailable = (item: UploadItem, ignoreStatuses?: UploadItemStatusEnum[]) => {
  return (
    item.status !== UploadItemStatusEnum.TERMINATED &&
    item.status !== UploadItemStatusEnum.FAILED &&
    (ignoreStatuses ? !ignoreStatuses.includes(item.status) : true)
  );
};

export const NOT_COMPLETED_STATUS = 'not-completed';
export const COMPLETED_STATUS = 'completed';
export const PIECE_MISS_STATUS = 'missing';
export const PIECE_COMPLETED_STATUS = 'complete';

export const createUploadEntityMiddleware =
  (metaUploadService: MetaUploadService, uploadConfigService: UploadConfigService): Middleware =>
  (store) =>
  (next) =>
  async (action) => {
    function getItems(internalUploadId: string) {
      return selectAllUploadItems(store.getState()).filter((x) => x.internalUploadId === internalUploadId);
    }

    next(action);

    const backoff = {
      maxRetries: uploadConfigService.metaDataApiRetry(),
      baseDelay: uploadConfigService.metaDataApiRetryBackoffDelay(),
    };

    if (scheduleNewUploadIfNeeded.match(action)) {
      const { internalUploadId } = action.payload;
      const items = getItems(internalUploadId);

      const pieces: UploadPieceItem[] = (
        (items
          .map((x) => x.pieceIds)
          .flatMap((x) => x)
          .filter((x) => !!x) as string[]) || []
      )
        .map((x) => selectUploadPieceItemById(store.getState(), x))
        .filter((x) => !!x);

      const item = pieces.find((x) => !notAvailableStatusesToStartUpload.includes(x.status));
      if (item) {
        store.dispatch(
          uploadPieceItemStartUploadRequest({
            update: {
              status: UploadPieceItemStatusEnum.STARTED,
            },
            chunkId: item.chunkId,
          }),
        );
      }
    } else if (itemUploaded.match(action)) {
      const { internalUploadId, itemInternalId }: { internalUploadId: string; itemInternalId: string } = action.payload;

      const items = getItems(internalUploadId);
      const allItemsUploaded = items.filter((x) => x.status !== UploadItemStatusEnum.COMPLETED)?.length === 0;
      const uploadEntity = selectUploadEntityById(store.getState(), internalUploadId);
      if (!uploadEntity) {
        store.dispatch(
          uploadFailed({
            internalUploadId,
            ignoreItemStatuses: [UploadItemStatusEnum.COMPLETED],
            update: {
              status: UploadEntityStatusEnum.FAILED,
              errorCode: 'not found',
              errorMessage: `upload item not found: ${internalUploadId}`,
            },
          }),
        );
        return;
      }
      store.dispatch(
        addLoggerRequest({
          loggerCode: 'upload',
          loggerMessage: `Checking Complete Uploaded Dataset ${uploadEntity.pkId} ${allItemsUploaded}`,
          loggerType: LoggerType.debug,
          data: {
            items: items.map((x) => {
              return { ...x };
            }),
          },
        }),
      );

      if (allItemsUploaded) {
        store.dispatch(
          addLoggerRequest({
            loggerCode: 'upload',
            loggerMessage: `Before calling Complete Uploaded DS ${uploadEntity.pkId}`,
            loggerType: LoggerType.debug,
            data: {},
          }),
        );
        try {
          await metaUploadService.commit(uploadEntity.pkId as string, backoff);

          store.dispatch(
            addLoggerRequest({
              loggerCode: 'upload',
              loggerMessage: `Result of calling complete Uploaded DS ${uploadEntity.pkId}`,
              loggerType: LoggerType.debug,
              data: {},
            }),
          );

          store.dispatch(
            uploadUpdate({
              internalUploadId,
              update: { status: UploadEntityStatusEnum.COMPLETED },
            }),
          );
        } catch (e: any) {
          store.dispatch(
            uploadFailed({
              internalUploadId,
              ignoreItemStatuses: [UploadItemStatusEnum.COMPLETED],
              update: {
                status: UploadEntityStatusEnum.FAILED,
                errorCode: 'upload',
                errorMessage: normalizeRawError(e),
                errorData: e,
              },
            }),
          );
        }
      }
    } else if (uploadFailed.match(action)) {
      const {
        internalUploadId,
        ignoreItemStatuses,
      }: InternalIdType & {
        ignoreItemStatuses?: UploadItemStatusEnum[];
      } = action.payload;
      const actions: Action[] = [];
      const items = getItems(internalUploadId);
      if (items.length > 0) {
        const values: UpdateUploadItem[] = items
          .map((item) => {
            if (uploadItemTerminationAvailable(item, ignoreItemStatuses)) {
              return {
                internalId: item.internalId,
                update: { status: UploadItemStatusEnum.TERMINATED },
              };
            } else {
              return null;
            }
          })
          .filter((x) => !!x) as UpdateUploadItem[];

        if (values.length) {
          actions.push(uploadItemTerminated(values));
        }
      }

      actions.push(
        addLoggerRequest({
          loggerCode: 'upload',
          loggerMessage: 'upload failed',
          loggerType: LoggerType.error,
          data: { ...action },
        }),
      );
      for (const a of actions) {
        store.dispatch(a);
      }
    } else if (uploadRequest.match(action)) {
      const { internalUploadId }: InternalIdType = action.payload;
      try {
        const state = store.getState();
        const uploadEntity = selectUploadEntityById(state, internalUploadId);

        if (!uploadEntity) {
          throw new Error('Upload entity not found');
        }

        const items = getItems(internalUploadId);

        const result: CreateUploadResponse = await metaUploadService.createUpload(
          internalUploadId,
          items.filter((x) => !!x) as UploadItem[],
          uploadEntity.metaData,
          uploadEntity.force,
          backoff,
        );

        const actions: Action[] = [];

        actions.push(
          uploadUpdate({
            internalUploadId,
            update: {
              pkId: result.uploadId,
              status: UploadEntityStatusEnum.ENRICHED,
            },
          }),
        );

        // process items and pieces

        const filesCompleted: UpdateUploadItem[] = [];
        const piecesCompleted: UpdateUploadPieceItem[] = [];
        const filesMissed: UpdateUploadItem[] = [];
        const piecesMissed: UpdateUploadPieceItem[] = [];

        const pieceIds: string[] =
          (items
            .map((x) => x.pieceIds)
            .flatMap((x) => x)
            .filter((x) => !!x) as string[]) || [];

        const pieceIdsSet = new Set<string>(pieceIds);
        const itemsMap: Record<string, UploadItem> = items.reduce((acc: Record<string, UploadItem>, item) => {
          acc[item.internalId] = item;
          return acc;
        }, {});

        const run = false;
        do {
          let failureFile = false;
          for (const file of result.files) {
            if (!itemsMap[file.relationId]) {
              actions.push(
                uploadFailed({
                  internalUploadId,
                  update: {
                    status: UploadEntityStatusEnum.FAILED,
                    errorCode: 'upload',
                    errorMessage: 'inconsistent state file is missed',
                    errorData: {
                      internalUploadId,
                      internalId: file.relationId,
                    },
                  },
                }),
              );
              failureFile = true;
              break;
            }
            if (failureFile) {
              break;
            }
            let uploaded = 0;
            if (file.status === NOT_COMPLETED_STATUS) {
              let failurePiece = false;
              for (const chunk of file.chunks) {
                const ccId = chunkId(file.relationId, chunk.index);
                if (!pieceIdsSet.has(ccId)) {
                  failurePiece = true;
                  actions.push(
                    uploadFailed({
                      internalUploadId,
                      update: {
                        status: UploadEntityStatusEnum.FAILED,
                        errorCode: 'upload',
                        errorMessage: 'inconsistent state chunk is missing',
                        errorData: {
                          internalUploadId,
                          internalId: file.relationId,
                          chunkNumber: chunk.index,
                        },
                      },
                    }),
                  );
                  break;
                } else {
                  if (chunk.status === PIECE_MISS_STATUS) {
                    piecesMissed.push({
                      chunkId: ccId,
                      update: {
                        status: UploadPieceItemStatusEnum.MISSED,
                      },
                    });
                  } else if (chunk.status === PIECE_COMPLETED_STATUS) {
                    uploaded += chunk.end - chunk.start;
                    piecesCompleted.push({
                      chunkId: ccId,
                      update: {
                        status: UploadPieceItemStatusEnum.COMPLETED,
                      },
                    });
                  }
                }
              }
              if (failurePiece) {
                failureFile = true;
                break;
              }
              if (uploaded === itemsMap[file.relationId]?.size) {
                actions.push(
                  addLoggerRequest({
                    loggerCode: 'upload',
                    loggerMessage: `Schedule Calling complete upload ${uploadEntity.pkId} => ${file.fileId}`,
                    loggerType: LoggerType.debug,
                    data: { uploadId: result.uploadId },
                  }),
                );

                actions.push(
                  uploadItemCompletedSingle({
                    internalId: file.relationId,
                    update: {
                      status: UploadItemStatusEnum.COMPLETED,
                      pkId: file.fileId,
                      uploaded,
                    },
                  }),
                );
              } else {
                // missed
                filesMissed.push({
                  internalId: file.relationId,
                  update: {
                    status: UploadItemStatusEnum.MISSED,
                    pkId: file.fileId,
                    uploaded,
                  },
                });
              }
            } else {
              // completed
              filesCompleted.push({
                internalId: file.relationId,
                update: {
                  status: UploadItemStatusEnum.COMPLETED,
                  pkId: file.fileId,
                  uploaded: itemsMap[file.relationId]?.size || -1,
                },
              });
            }
            if (failureFile) {
              break;
            }
          }
          if (failureFile) {
            break;
          }

          if (filesCompleted.length > 0) {
            actions.push(uploadItemCompleted(filesCompleted));
          }
          if (filesMissed.length > 0) {
            actions.push(uploadItemMissed(filesMissed));
          }
          // processed chunk pieces MISSED
          if (piecesMissed.length > 0) {
            actions.push(uploadPieceItemMissed(piecesMissed));
          }
          // processed chunk pieces COMPLETED
          if (piecesCompleted.length > 0) {
            actions.push(uploadPieceItemComplete(piecesCompleted));
          }

          if (piecesMissed.length > 0) {
            const concurrent = uploadConfigService.uploadApiConcurrent();
            const piecesToUpload = piecesMissed.slice(0, Math.min(concurrent, piecesMissed.length));
            piecesToUpload.forEach((pieceToUpload) => {
              actions.push(
                uploadPieceItemStartUploadRequest({
                  chunkId: pieceToUpload.chunkId,
                  update: { status: UploadPieceItemStatusEnum.STARTED },
                }),
              );
            });
          } else {
            // all files completed
            // just simulate all uploaded
            actions.push(itemUploaded({ internalUploadId, itemInternalId: '' }));
          }

          // logs
          actions.push(
            addLoggerRequest({
              loggerCode: 'upload',
              loggerMessage: 'upload data retrieved',
              loggerType: LoggerType.info,
              data: { uploadId: result.uploadId },
            }),
          );
        } while (run);

        for (const a of actions) {
          store.dispatch(a);
        }
      } catch (error: any) {
        store.dispatch(
          uploadFailed({
            internalUploadId,
            update: {
              status: UploadEntityStatusEnum.FAILED,
              error: normalizeRawError(error),
            },
          }),
        );
      }
    }
  };
