import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Manually read .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
const databaseUrl = (dbUrlMatch ? dbUrlMatch[1].trim() : process.env.DATABASE_URL).replace(/['"]/g, '');

const pool = new Pool({ connectionString: databaseUrl });

async function run() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT count(*) FROM empleados');
        const count = parseInt(res.rows[0].count);

        if (count === 0) {
            console.log('No employees found. Seeding default employee...');
            await client.query(`
        INSERT INTO empleados (nombre, apellido, email, puesto, activo)
        VALUES ('Vendedor', 'Default', 'vendedor@techsphere.com', 'vendedor', true)
      `);
            console.log('Default employee created.');
        } else {
            console.log(`Found ${count} employees. No action needed.`);
        }
        client.release();
    } catch (err) {
        console.error('Error seeding employees:', err);
    } finally {
        await pool.end();
    }
}

run();
