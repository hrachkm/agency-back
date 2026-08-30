import { MigrationInterface, QueryRunner } from "typeorm";

export class SetDefaultValueForPropertyStatus1788045588544 implements MigrationInterface {
    name = 'SetDefaultValueForPropertyStatus1788045588544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "status" SET DEFAULT 'available'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" ALTER COLUMN "status" DROP DEFAULT`);
    }

}
