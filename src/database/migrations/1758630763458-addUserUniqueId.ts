import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserUniqueId1758630763458 implements MigrationInterface {
    name = 'AddUserUniqueId1758630763458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "userId" character varying(20) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userId"`);
    }

}
