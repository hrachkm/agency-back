import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserPasswordCharacters1788036202204 implements MigrationInterface {
    name = 'UpdateUserPasswordCharacters1788036202204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(8) NOT NULL`);
    }

}
