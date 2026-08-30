import { DataSource } from 'typeorm';
import { join } from 'path';

// Carga las variables de entorno directamente desde el archivo .env
import 'dotenv/config';
import { User } from '@/users/entities/user.entity';
import { PropertyType } from '@/property-types/entities/property-types.entity';
import { Property } from '@/properties/entities/properties.entity';

const {
  DATABASE_TYPE,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_DB_NAME,
  DATABASE_LOGGING,
  DATABASE_ENTITIES,
  DATABASE_MIGRATIONS,
} = process.env;

export const AppDataSource = new DataSource({
  type: DATABASE_TYPE as 'postgres',
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT, 10),
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_DB_NAME,
  synchronize: false,
  logging: DATABASE_LOGGING === 'true',
  entities: [User, PropertyType, Property],
  migrations: [join(process.cwd(), DATABASE_MIGRATIONS)],
});
