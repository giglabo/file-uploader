import { cache } from 'react';
import { contentService } from '@/libs/content';

export const getMetadata = cache(async (locale: string) => {
  return contentService.metaData(locale);
});
