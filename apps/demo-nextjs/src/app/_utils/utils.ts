import { Metadata, ResolvingMetadata } from 'next';
import { Env } from '@/libs/Env';
import { contentService } from '@/libs/content';
import { merge } from 'lodash';
import { cache } from 'react';
import { logger } from '@/libs/Logger';
import path from 'path';
import fs from 'fs';
import { urlJoin } from '@giglabo/shared';
import { format } from 'date-fns';

export const getPathName = async () => {
  return '/';
};

export const fetchSvg = cache(async (url: string) => {
  if (url === '') {
    return '';
  }
  const fullUrl = urlJoin(Env.NEXT_PUBLIC_APP_URL, url);
  try {
    const response = await fetch(fullUrl);

    const text = await response.text();
    const svg = text.replace(/<\?xml.*\?>/, '');
    return svg;
  } catch (e) {
    logger.warn(e, `File not found ${fullUrl}`);
    return '';
  }
});

export const readSvg = cache(async (file: string) => {
  if (file === '') {
    return '';
  }

  let pathToContent = Env.pathToContent;
  if (Env.NODE_ENV === 'development') {
    pathToContent = path.join(process.cwd(), 'content');
  }
  const svgFilePath = path.join(pathToContent, 'static', file);
  if (!fs.existsSync(svgFilePath) || !fs.statSync(svgFilePath).isFile()) {
    logger.warn(`File not found ${svgFilePath}`);
    return '';
  }

  try {
    const source = fs.readFileSync(svgFilePath);
    const text = source.toString();
    const svg = text.replace(/<\?xml.*\?>/, '');
    return svg;
  } catch (e) {
    logger.warn(e, `Cannot read File ${svgFilePath}`);
    return '';
  }
});

const getLdJson = cache(async (locale: string) => {
  return contentService.ldJson(locale);
});

export const createLdJson = async (locale: string, frontMatter: { [p: string]: any }): Promise<string> => {
  const json = await getLdJson(locale);
  if (json) {
    const url = urlJoin(Env.NEXT_PUBLIC_APP_URL || '/', await getPathName());
    let res = merge(json, { url });
    const description = frontMatter['description'];
    if (description) {
      res = merge(res, { description });
    }

    return JSON.stringify(res);
  }
  return JSON.stringify({});
};

export const adjustMetadata = async (frontMatter: { [p: string]: any }, metadataInput: Metadata) => {
  const url = urlJoin(Env.NEXT_PUBLIC_APP_URL || '/', await getPathName());
  const metadata: Metadata = {
    ...frontMatter,
    ...metadataInput,
    openGraph: {
      url,
    },
    twitter: {
      site: url,
    },
  };
  let title = frontMatter['title'];
  if (title) {
    const titleParts = (metadataInput.title as string)?.split('|');
    if (titleParts && titleParts.length > 1 && titleParts[1]) {
      title = [title, titleParts[1].trim()].join(' | ');
    }
  }

  if (title) {
    metadata.title = title;
    if (metadata.twitter) {
      metadata.twitter.title = title;
    }

    if (metadata.openGraph) {
      metadata.openGraph.title = title;
    }
  }

  const description = frontMatter['description'];
  if (description) {
    if (metadata.twitter) {
      metadata.twitter.description = description;
    }
    if (metadata.openGraph) {
      metadata.openGraph.description = description;
    }
  }
  return metadata;
};

export const createMetadata = async (frontMatter: { [p: string]: any }, parent: ResolvingMetadata) => {
  const url = Env.NEXT_PUBLIC_APP_URL;
  const metadata: Metadata = {
    ...frontMatter,
    openGraph: {
      url,
    },
    twitter: {
      site: url,
    },
  };
  let title = frontMatter['title'];
  if (title) {
    const titleParts = (await parent).title?.absolute?.split('|');
    if (titleParts && titleParts.length > 1 && titleParts[1]) {
      title = [title, titleParts[1].trim()].join(' | ');
    }
  }

  if (title) {
    metadata.title = title;
    if (metadata.twitter) {
      metadata.twitter.title = title;
    }

    if (metadata.openGraph) {
      metadata.openGraph.title = title;
    }
  }

  const description = frontMatter['description'];
  if (description) {
    if (metadata.twitter) {
      metadata.twitter.description = description;
    }
    if (metadata.openGraph) {
      metadata.openGraph.description = description;
    }
  }
  return metadata;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm:ss');
};
