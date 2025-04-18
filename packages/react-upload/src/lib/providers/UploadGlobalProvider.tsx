'use client';
import { DataUploadService, MetaUploadService, UploadConfigService } from './services';
import { HashCalculator } from '@giglabo/shared';
import { ServicesContext } from './UploadGlobalProviderContext';
import { UploadProvider } from './UploadProvider';

export type UploadGlobalProps = {
  children: React.ReactNode;
  metaUploadService: MetaUploadService;
  uploadConfigService: UploadConfigService;
  dataUploadService: DataUploadService;
  hashCalculator: HashCalculator;
};

export function UploadGlobalProvider({
  children,
  metaUploadService,
  uploadConfigService,
  dataUploadService,
  hashCalculator,
}: UploadGlobalProps) {
  const services = { metaUploadService, uploadConfigService, hashCalculator, dataUploadService };
  return (
    <ServicesContext.Provider value={services}>
      <UploadProvider>{children}</UploadProvider>
    </ServicesContext.Provider>
  );
}
