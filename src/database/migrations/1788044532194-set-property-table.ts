import { MigrationInterface, QueryRunner } from "typeorm";

export class SetPropertyTable1788044532194 implements MigrationInterface {
    name = 'SetPropertyTable1788044532194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."properties_status_enum" AS ENUM('available', 'sold', 'rented')`);
        await queryRunner.query(`CREATE TABLE "properties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying(100) NOT NULL, "price" integer NOT NULL, "bedrooms" integer, "square_meters" double precision, "property_type_id" uuid NOT NULL, "seller_id" uuid NOT NULL, "status" "public"."properties_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id")); COMMENT ON COLUMN "properties"."price" IS 'CHECK (price > 0)'`);
        await queryRunner.query(`CREATE INDEX "IDX_9cd2513cd04f57c9967f640b0a" ON "properties" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_21050016bee57be0b28e2c7ad9" ON "properties" ("property_type_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a00b68488b2847f8740f60817e" ON "properties" ("seller_id") `);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_21050016bee57be0b28e2c7ad97" FOREIGN KEY ("property_type_id") REFERENCES "property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "properties" ADD CONSTRAINT "FK_a00b68488b2847f8740f60817ea" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_a00b68488b2847f8740f60817ea"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP CONSTRAINT "FK_21050016bee57be0b28e2c7ad97"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a00b68488b2847f8740f60817e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21050016bee57be0b28e2c7ad9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cd2513cd04f57c9967f640b0a"`);
        await queryRunner.query(`DROP TABLE "properties"`);
        await queryRunner.query(`DROP TYPE "public"."properties_status_enum"`);
    }

}
