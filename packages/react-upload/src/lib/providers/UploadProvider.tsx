'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, StoreType } from './store';
import { useServices } from './UploadGlobalProviderContext';

export type AppStore = StoreType;

export type StoreProviderProps = {
  children: React.ReactNode;
};

export function UploadProvider({ children }: StoreProviderProps) {
  const { metaUploadService, uploadConfigService, dataUploadService } = useServices();

  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore(metaUploadService, uploadConfigService, dataUploadService);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
