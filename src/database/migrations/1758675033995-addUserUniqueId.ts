import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserUniqueId1758675033995 implements MigrationInterface {
    name = 'AddUserUniqueId1758675033995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_d72ea127f30e21753c9e229891e" UNIQUE ("userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_d72ea127f30e21753c9e229891e"`);
    }

}
