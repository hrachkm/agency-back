const { DataSource } = require('typeorm');
const { Property } = require('./src/properties/entities/properties.entity');
const { User } = require('./src/users/entities/user.entity');
const { PropertyType } = require('./src/property-types/entities/property-types.entity');
require('dotenv').config();

const myDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DB_NAME,
  entities: [Property, User, PropertyType],
});

myDataSource.initialize().then(async () => {
  const properties = await myDataSource.getRepository(Property).find({ withDeleted: true });
  console.log("Todas las propiedades (incluyendo borradas):", properties.map(p => ({ id: p.id, deletedAt: p.deletedAt })));
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});