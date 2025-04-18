import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  server: {
    logLevel: z.string().optional().default('debug'),
    logFolder: z.string().optional().default('./logs'),
    logFile: z.string().optional().default('demo-nextjs-api.log'),
    logEnableConsole: z.string().optional().default('true'),
    NEXT_DEPLOY_URL: z.string(),
    pathToContent: z.string().optional().default(''),
    authGoogleAnalytics: z.string().optional().default('G-XXXXXXXXXX'),

    // DB
    DATABASE_MIGRATION_FOLDER: z.string(),
    DATABASE_MIGRATION_TABLE: z.string().default('db_migrations'),
    DATABASE_URL: z.string(),
    DB_TYPE: z.string().default('POSTGRES'),
    POSTGRES_DATABASE: z.string().default('postgres'),
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.string().default('5432'),
    POSTGRES_USERNAME: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_USE_SSL: z.string().default('false'),
    GITHUB_URL: z.string().optional().default('/'),
    DOCS_URL: z.string().optional().default('/'),

    // storage
    globalS3ForcePathStyle: z.string().optional(),
    s3Bucket: z.string().default(''),
    s3Endpoint: z.string().optional(),
    s3AccessKeyId: z.string(),
    s3SecretAccessKey: z.string(),
    s3Region: z.string().default('auto'),
    s3Protocol: z.string().default('https'),

    ipRegistryCoUrl: z.string().optional().default('https://api.ipregistry.co'),
    ipRegistryCoKey: z.string().optional().default(''),
  },
  client: {
    // NOTHING
  },
  shared: {
    NEXT_PUBLIC_BASE_URL: z.string().default('/'),
    NEXT_PUBLIC_APP_BASE_URL: z.string(),
    NEXT_PUBLIC_APP_URL: z.string(),
    NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES: z.string().optional().default('/'),
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
    MAX_FILE_SIZE: z.string().optional().default('512'),
    MAX_UPLOAD_SIZE: z.string().optional().default('1024'),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
    NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES: process.env.NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_DEPLOY_URL: process.env.NEXT_DEPLOY_URL,
    GITHUB_URL: process.env.GITHUB_URL,
    DOCS_URL: process.env.DOCS_URL,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE_IN_MB,
    MAX_UPLOAD_SIZE: process.env.MAX_UPLOAD_SIZE_IN_MB,
    NODE_ENV: process.env.NODE_ENV,
    authGoogleAnalytics: process.env.GA_ID,
    logLevel: process.env.LOG_LEVEL,
    logFile: process.env.LOG_FILE,
    logFolder: process.env.LOG_FOLDER,
    logEnableConsole: process.env.LOG_ENABLE_CONSOLE,
    pathToContent: process.env.PATH_TO_CONTENT,

    DATABASE_MIGRATION_FOLDER: process.env.D_DATABASE_MIGRATION_FOLDER,
    DATABASE_MIGRATION_TABLE: process.env.D_DATABASE_MIGRATION_TABLE,
    DATABASE_URL: process.env.D_DATABASE_URL,
    DB_TYPE: process.env.D_DB_TYPE,
    POSTGRES_DATABASE: process.env.D_POSTGRES_DATABASE,
    POSTGRES_HOST: process.env.D_POSTGRES_HOST,
    POSTGRES_PORT: process.env.D_POSTGRES_PORT,
    POSTGRES_USERNAME: process.env.D_POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.D_POSTGRES_PASSWORD,
    POSTGRES_USE_SSL: process.env.D_POSTGRES_USE_SSL,

    // storage
    globalS3ForcePathStyle: process.env.D_GLOBAL_S3_FORCE_PATH_STYLE,
    s3Bucket: process.env.D_S3_BUCKET,
    s3Endpoint: process.env.D_S3_ENDPOINT,
    s3AccessKeyId: process.env.D_S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.D_S3_SECRET_ACCESS_KEY,
    s3Region: process.env.D_S3_REGION,
    s3Protocol: process.env.D_S3_PROTOCOL,

    // ip
    ipRegistryCoUrl: process.env.IP_REGISTRY_CO_URL,
    ipRegistryCoKey: process.env.IP_REGISTRY_CO_KEY,
  },
});
