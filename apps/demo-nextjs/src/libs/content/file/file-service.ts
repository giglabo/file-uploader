import { ContentService } from '@/libs/content/content-service';
import { Env } from '@/libs/Env';
import path from 'path';
import fs from 'fs';
import { Metadata } from 'next';
import { logger } from '@/libs/Logger';

function isNotFile(postFilePath: string) {
  return !fs.existsSync(postFilePath) || !fs.statSync(postFilePath).isFile();
}

export class FileService implements ContentService {
  name(): string {
    return 'file';
  }

  async ldJson(locale: string): Promise<Record<string, any> | undefined> {
    let pathToContent = Env.pathToContent;
    if (Env.NODE_ENV === 'development') {
      pathToContent = path.join(process.cwd(), 'content');
    }
    const postFilePath = path.join(pathToContent, locale, `ldJson.json`);
    if (!fs.existsSync(postFilePath) || !fs.statSync(postFilePath).isFile()) {
      logger.warn(`Not found ${postFilePath}`);
      return undefined;
    }
    const source = fs.readFileSync(postFilePath);
    return JSON.parse(replaceValues(source.toString()));
  }

  async metaData(locale: string): Promise<Metadata | undefined> {
    let pathToContent = Env.pathToContent;
    if (Env.NODE_ENV === 'development') {
      pathToContent = path.join(process.cwd(), 'content');
    }

    const postFilePath = path.join(pathToContent, locale, `metadata.json`);
    if (!fs.existsSync(postFilePath) || !fs.statSync(postFilePath).isFile()) {
      logger.warn(`Not found ${postFilePath}`);
      return undefined;
    }
    const source = fs.readFileSync(postFilePath);
    const v = JSON.parse(replaceValues(source.toString()));
    return v;
  }
}

function replaceValues(input: string): string {
  if (!input) return '/';

  // Replace all occurrences of <HOST_PUBLIC_RSS> with the environment variable
  return input
    .replace(/<HOST_PUBLIC_RSS>/g, Env.NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES || '')
    .replace(/<APP_URL>/g, Env.NEXT_PUBLIC_APP_URL || '')
    .replace(/<APP_BASE_URL>/g, Env.NEXT_PUBLIC_APP_BASE_URL || '');
}
