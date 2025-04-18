'use client';
import { createContext, useContext } from 'react';
import { DataUploadService, MetaUploadService, UploadConfigService } from './services';
import { HashCalculator } from '@giglabo/shared';

interface Services {
  metaUploadService: MetaUploadService;
  dataUploadService: DataUploadService;
  uploadConfigService: UploadConfigService;
  hashCalculator: HashCalculator;
}

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return services;
}
