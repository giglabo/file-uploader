import { createSlice, createEntityAdapter, PayloadAction, EntityState } from '@reduxjs/toolkit';
import { UploadItem, UpdateUploadItem, InputUploadFileMetaData } from './types';
import { OutputFileHashProgressData, UploadItemStatusEnum } from '@giglabo/shared';
import { chunkId } from '../../shared';

export const uploadItemAdapter = createEntityAdapter({
  selectId: (item: UploadItem) => item.internalId,
});

const initialState = uploadItemAdapter.getInitialState();

const commonUploadItem = (state: EntityState<UploadItem, string>, action: PayloadAction<UpdateUploadItem[]>) => {
  uploadItemAdapter.updateMany(
    state,
    action.payload.map((x) => ({ id: x.internalId, changes: x.update })),
  );
};
const uploadItemSlice = createSlice({
  name: 'uploadItem',
  initialState,
  reducers: {
    uploadItemRegisterItems: (state, action: PayloadAction<InputUploadFileMetaData[]>) => {
      const entities: UploadItem[] = action.payload.map((item) => ({
        status: UploadItemStatusEnum.REGISTERED,
        file: item.file,
        size: item.file.size,
        name: item.file.name,
        uploaded: 0,
        internalId: item.internalId,
        internalUploadId: item.internalUploadId,
        hash: item.hash,
        hashType: item.type,
        pieceIds: [],
        integrityProcessed: 0,
      }));
      uploadItemAdapter.upsertMany(state, entities);
    },

    uploadItemUpdateIntegrityCheck: (state, action: PayloadAction<OutputFileHashProgressData>) => {
      const { internalId, offset } = action.payload;
      uploadItemAdapter.updateOne(state, {
        id: internalId,
        changes: {
          status: UploadItemStatusEnum.INTEGRITY_CALCULATION,
          integrityProcessed: offset,
        },
      });
    },

    uploadItemAddItems: (state, action: PayloadAction<InputUploadFileMetaData[]>) => {
      const entities: UploadItem[] = action.payload.map((item) => ({
        status: UploadItemStatusEnum.ADDED,
        file: item.file,
        size: item.file.size,
        name: item.file.name,
        uploaded: 0,
        internalId: item.internalId,
        internalUploadId: item.internalUploadId,
        hash: item.hash,
        hashType: item.type,
        integrityProcessed: item.file.size,
        pieceIds: item.chunks.map((chunk) => chunkId(item.internalId, chunk.chunkNumber)),
      }));
      uploadItemAdapter.upsertMany(state, entities);
    },

    uploadItemStarted: commonUploadItem,
    uploadItemFailed: commonUploadItem,
    uploadItemTerminated: commonUploadItem,
    uploadItemCompleted: commonUploadItem,
    uploadItemMissed: commonUploadItem,
    uploadItemUpdated: commonUploadItem,
    uploadItemCompletedSingle: (state, action: PayloadAction<UpdateUploadItem>) => {
      const { internalId, update } = action.payload;
      uploadItemAdapter.updateOne(state, {
        id: internalId,
        changes: update,
      });
    },

    uploadItemClearRequest: (_state, _action: PayloadAction<string | undefined>) => {
      return uploadItemAdapter.getInitialState();
    },
  },
});

export const {
  uploadItemAddItems,
  uploadItemRegisterItems,
  uploadItemUpdateIntegrityCheck,
  uploadItemStarted,
  uploadItemFailed,
  uploadItemTerminated,
  uploadItemCompleted,
  uploadItemMissed,
  uploadItemUpdated,
  uploadItemCompletedSingle,
  uploadItemClearRequest,
} = uploadItemSlice.actions;

export default uploadItemSlice.reducer;
