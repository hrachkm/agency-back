import { MigrationInterface, QueryRunner } from "typeorm";

export class SetPropertyTypeTable1788042162133 implements MigrationInterface {
    name = 'SetPropertyTypeTable1788042162133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "property_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_129390b286b9c776438dfa475a8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "property_types"`);
    }

}
