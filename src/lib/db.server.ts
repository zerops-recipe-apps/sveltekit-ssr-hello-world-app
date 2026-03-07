import pg from 'pg';

const { Pool } = pg;

// Connection pool - shared across all requests in this container.
// Credentials come from run.envVariables in zerops.yaml,
// resolved from the db service's generated variables at deploy time.
export const pool = new Pool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});
