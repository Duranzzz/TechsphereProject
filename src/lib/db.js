import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const query = async (text, params) => {
    const client = await pool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
};
