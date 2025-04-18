import { FileService } from './file/file-service';
import { ContentService } from '@/libs/content/content-service';

const initContentService = (): ContentService => {
  return new FileService();
};

export const contentService = initContentService();
