import { neon } from '@neondatabase/serverless';

import fs from 'fs';
import path from 'path';

// Manually read .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
const databaseUrl = (dbUrlMatch ? dbUrlMatch[1].trim() : process.env.DATABASE_URL).replace(/['"]/g, '');

const sql = neon(databaseUrl);

async function run() {
    try {
        console.log('Modifying ventas table...');
        await sql`ALTER TABLE ventas ALTER COLUMN empleado_id DROP NOT NULL`;
        console.log('Success: ventas table modified.');

        console.log('Modifying empleados table...');
        // Check if column exists first to avoid error
        try {
            await sql`ALTER TABLE empleados ADD COLUMN auth_user_id INTEGER REFERENCES auth_users(id)`;
            console.log('Success: empleados table modified.');
        } catch (e) {
            console.log('Column auth_user_id might already exist or error:', e.message);
        }

    } catch (err) {
        console.error('Error executing SQL:', err);
    }
}

run();
