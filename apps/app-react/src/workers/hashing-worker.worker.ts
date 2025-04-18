import { hashWorker } from '@giglabo/hash-worker';

const worker: Worker = self as any;
worker.addEventListener('message', hashWorker);

export {};
