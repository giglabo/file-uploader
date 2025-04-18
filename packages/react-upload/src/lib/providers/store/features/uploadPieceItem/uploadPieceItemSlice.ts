import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { UpdateUploadPieceItem, UploadPieceItem, UploadPieceItemInput } from './types';
import { chunkId } from '../../shared';
import { HashType, UploadPieceItemStatusEnum } from '@giglabo/shared';
import { InputUploadFileMetaData } from '../uploadItem';

export const uploadPieceItemAdapter = createEntityAdapter({
  selectId: (item: UploadPieceItem) => item.chunkId,
});

const initialState = uploadPieceItemAdapter.getInitialState();

const commonUploadPieceItemSingle = (state: EntityState<UploadPieceItem, string>, action: PayloadAction<UpdateUploadPieceItem>) => {
  const { chunkId, update } = action.payload;
  uploadPieceItemAdapter.updateOne(state, {
    id: chunkId,
    changes: update,
  });
};

const commonUploadPieceItemMany = (state: EntityState<UploadPieceItem, string>, action: PayloadAction<UpdateUploadPieceItem[]>) => {
  const items = action.payload;
  uploadPieceItemAdapter.updateMany(
    state,
    items.map((x) => ({
      id: x.chunkId,
      changes: x.update,
    })),
  );
};

const uploadPieceItemSlice = createSlice({
  name: 'uploadPieceItem',
  initialState,
  reducers: {
    uploadPieceItemRegisterPieces: (
      state,
      action: PayloadAction<{
        chunkHashType: HashType;
        uploadFilesMetaData: InputUploadFileMetaData[];
      }>,
    ) => {
      const items: UploadPieceItem[] = [];
      action.payload.uploadFilesMetaData.forEach((uploadFileMetaData) => {
        uploadFileMetaData.chunks
          .map((x) => ({
            chunkId: chunkId(uploadFileMetaData.internalId, x.chunkNumber),
            itemId: uploadFileMetaData.internalId,
            internalUploadId: uploadFileMetaData.internalUploadId,
            status: UploadPieceItemStatusEnum.ADDED,
            start: x.start,
            end: x.end,
            chunkNumber: x.chunkNumber,
            hash: x.hash,
            hashType: action.payload.chunkHashType,
          }))
          .forEach((x) => items.push(x));
      });
      uploadPieceItemAdapter.upsertMany(state, items);
    },

    uploadPieceItemComplete: commonUploadPieceItemMany,
    uploadPieceItemMissed: commonUploadPieceItemMany,
    uploadPieceItemTerminated: commonUploadPieceItemMany,

    uploadPieceItemUpdateSingle: commonUploadPieceItemSingle,
    uploadPieceItemFailedSingle: commonUploadPieceItemSingle,
    uploadPieceItemCompletedSingle: commonUploadPieceItemSingle,
    uploadPieceItemStartUploadRequest: commonUploadPieceItemSingle,

    uploadPieceItemClearRequest: (_state, _action: PayloadAction<string | undefined>) => {
      return initialState;
    },

    uploadPieceItemTryToUploadByUrl: (_state, _action: PayloadAction<UploadPieceItemInput>) => {
      // NOTHING
    },
  },
});

export const {
  uploadPieceItemRegisterPieces,
  uploadPieceItemComplete,
  uploadPieceItemMissed,
  uploadPieceItemStartUploadRequest,
  uploadPieceItemFailedSingle,
  uploadPieceItemCompletedSingle,
  uploadPieceItemTerminated,
  uploadPieceItemTryToUploadByUrl,
  uploadPieceItemClearRequest,
} = uploadPieceItemSlice.actions;

export default uploadPieceItemSlice.reducer;
