import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppStore } from './UploadProvider';
import { RootState } from './store';

export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
