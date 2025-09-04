import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
	return {
		server: {
			port: parseInt(process.env.PORT) || 3100
		},
		database: {
			type: process.env.DATABASE_TYPE,
			dbName: process.env.DATABASE_DB_NAME,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			port: parseInt(process.env.DATABASE_PORT),
			host: process.env.DATABASE_HOST,
			logging: process.env.DATABASE_LOGGING,
			entities: process.env.DATABASE_ENTITIES,
			migrations: process.env.DATABASE_MIGRATIONS
		},
		apiKey: process.env.API_KEY,
		jwtSecret: process.env.JWT_SECRET,
	}
})