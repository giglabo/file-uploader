import { Metadata } from 'next';

export type ContentItem = {
  sourceType: string;
  url: string;
  fileSource: string;
  locale: string;
  title: string;
  type: string;
  identifier?: string;
  date?: Date;
  data: Record<string, any>;
};

export type MenuItem = {
  name: string;
  identifier: string;
  url: string;
  weight: number;
  enabled: boolean;
};

export type ContentService = {
  name(): string;
  metaData(locale: string): Promise<Metadata | undefined>;
  ldJson(locale: string): Promise<Record<string, any> | undefined>;
};
