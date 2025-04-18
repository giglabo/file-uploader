import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { UploadEntity } from './types';
import { UploadEntityStatusEnum } from '@giglabo/upload-shared';

export const uploadEntityAdapter = createEntityAdapter({
  selectId: (entity: UploadEntity) => entity.id,
});

const initialState = uploadEntityAdapter.getInitialState();

const uploadEntitySlice = createSlice({
  name: 'uploadEntity',
  initialState,
  reducers: {
    uploadClearRequest: (_state, _action: PayloadAction<string | undefined>) => {
      return uploadEntityAdapter.getInitialState();
    },
    itemUploaded: (_state, action) => {
      const { internalUploadId, itemInternalId }: { internalUploadId: string; itemInternalId: string } = action.payload;
      // NO ACTIONS NEEDED
    },
    uploadRegister: (state, action) => {
      const { internalUploadId, metaData, force } = action.payload;
      uploadEntityAdapter.upsertOne(state, {
        uploadItems: [],
        metaData,
        force,
        id: internalUploadId,
        status: UploadEntityStatusEnum.REGISTERED,
      });
    },
    uploadUpdate: (state, action) => {
      const { internalUploadId, update } = action.payload;
      uploadEntityAdapter.updateOne(state, {
        id: internalUploadId,
        changes: update,
      });
    },
    uploadFailed: (state, action) => {
      const { internalUploadId, update } = action.payload;
      uploadEntityAdapter.updateOne(state, {
        id: internalUploadId,
        changes: update,
      });
    },
    uploadRequest: (state, action) => {
      const { internalUploadId } = action.payload;
      uploadEntityAdapter.updateOne(state, {
        id: internalUploadId,
        changes: { status: UploadEntityStatusEnum.UPLOAD_REQUEST },
      });
    },
    scheduleNewUploadIfNeeded: (_state, _action) => {
      // const { internalUploadId } = action.payload;
      // NO ACTIONS NEEDED
    },
    uploadUpdateInternalState: (state, action) => {
      const { internalUploadId, uploadItems } = action.payload;
      uploadEntityAdapter.updateOne(state, {
        id: internalUploadId,
        changes: {
          uploadItems,
          status: UploadEntityStatusEnum.FILES_ADDED,
        },
      });
    },
  },
});

export const {
  uploadClearRequest,
  scheduleNewUploadIfNeeded,
  itemUploaded,
  uploadRegister,
  uploadRequest,
  uploadUpdate,
  uploadFailed,
  uploadUpdateInternalState,
} = uploadEntitySlice.actions;

export default uploadEntitySlice.reducer;
