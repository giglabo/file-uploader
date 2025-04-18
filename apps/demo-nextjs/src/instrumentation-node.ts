import { logger } from '@/libs/Logger';
import { app } from '@/libs/backend-logic';
import { Env } from '@/libs/Env';
const a = async () => {
  logger.info(`Instrumentation Node`);

  logger.info(`DB Type creation ${Env.DB_TYPE}`);

  await app.init();
};
a().catch((e) => logger.error(e, 'Cannot register node instrumentation'));
export default a;
