import { createSelector } from '@reduxjs/toolkit';
import { uploadEntityAdapter } from './uploadEntitySlice';
import { RootState } from '../../index';

const selectUploadEntityState = (state: RootState) => state.uploadEntity;

export const {
  selectById: selectUploadEntityById,
  selectEntities: selectUploadEntityEntities,
  selectAll: selectAllUploadEntities,
} = uploadEntityAdapter.getSelectors(selectUploadEntityState);

export const selectUploadEntity = (internalUploadId: string | null | undefined) =>
  createSelector(selectUploadEntityEntities, (entities) => (internalUploadId ? entities[internalUploadId] : null));
