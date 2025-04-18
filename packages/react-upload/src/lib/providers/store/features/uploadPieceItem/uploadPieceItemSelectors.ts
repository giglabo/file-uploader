import { uploadPieceItemAdapter } from './uploadPieceItemSlice';
import { RootState } from '../../index';

export const {
  selectById: selectUploadPieceItemById,
  selectIds: selectUploadPieceItemIds,
  selectEntities: selectUploadPieceItemEntities,
  selectAll: selectAllUploadPieceItems,
  selectTotal: selectTotalUploadPieceItems,
} = uploadPieceItemAdapter.getSelectors<RootState>((state) => state.uploadPieceItem);
