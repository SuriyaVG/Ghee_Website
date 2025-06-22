import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function checkPostgresVersion() {
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    const result = await sql`SELECT version()`;
    console.log('PostgreSQL Version:');
    console.log(result[0].version);
    
    await sql.end();
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  }
}

checkPostgresVersion(); 