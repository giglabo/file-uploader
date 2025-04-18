import { MigrationInterface, QueryRunner } from 'typeorm';
import { logger } from '@/libs/Logger';

export class initializeSchema1710133461411 implements MigrationInterface {
  name = 'initializeSchema1710133461411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    logger.info('initializeSchema1710133461411: started');

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "migrations"
        (
          id          integer      not null,
          name        varchar(100) not null,
          hash        varchar(40)  not null,
          executed_at timestamp default CURRENT_TIMESTAMP
        )`);
    await queryRunner.query(`ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY`);

    logger.info('initializeSchema1710133461411: completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "migrations" IF EXISTS');
  }
}
