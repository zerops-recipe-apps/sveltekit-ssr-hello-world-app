// Idempotent migration: create greetings table and seed initial row.
// Uses IF NOT EXISTS + ON CONFLICT DO NOTHING so it's safe to run
// multiple times (defense-in-depth alongside zsc execOnce).
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});

async function migrate() {
	const client = await pool.connect();
	try {
		await client.query(`
      CREATE TABLE IF NOT EXISTS greetings (
        id      INTEGER PRIMARY KEY,
        message TEXT    NOT NULL
      )
    `);
		await client.query(`
      INSERT INTO greetings (id, message)
      VALUES (1, 'Hello from Zerops!')
      ON CONFLICT (id) DO NOTHING
    `);
		console.log('Migration completed successfully.');
	} finally {
		client.release();
		await pool.end();
	}
}

migrate().catch((err) => {
	console.error('Migration failed:', err);
	process.exit(1);
});
