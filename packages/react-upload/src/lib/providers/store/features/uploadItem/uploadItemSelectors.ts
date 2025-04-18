import { uploadItemAdapter } from './uploadItemSlice';
import { RootState, selectUploadEntityEntities } from '../../index';
import { createSelector } from '@reduxjs/toolkit';

export const {
  selectById: selectUploadItemById,
  selectIds: selectUploadItemIds,
  selectEntities: selectUploadItemEntities,
  selectAll: selectAllUploadItems,
  selectTotal: selectTotalUploadItems,
} = uploadItemAdapter.getSelectors((state: RootState) => state.uploadItem);

export const selectFilesByUploadId = (internalUploadId: string | null | undefined) =>
  createSelector(selectAllUploadItems, (entities) => {
    if (internalUploadId) {
      return entities.filter((e) => e.internalUploadId === internalUploadId);
    } else {
      return [];
    }
  });
