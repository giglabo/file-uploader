import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

module.exports = () => __dirname;

// module.exports = () => __dirname;
