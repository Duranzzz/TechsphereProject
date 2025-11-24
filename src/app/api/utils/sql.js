import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to execute queries
const sql = async (strings, ...values) => {
  // If called as a tagged template literal
  if (Array.isArray(strings) && strings.raw) {
    const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
    const res = await pool.query(text, values);
    return res.rows;
  }
  // If called as a function (sql(query, params))
  const [query, params] = [strings, values[0]];
  const res = await pool.query(query, params);
  return res.rows;
};

// Transaction helper
sql.transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create a transaction-specific sql function
    const txSql = async (strings, ...values) => {
      if (Array.isArray(strings) && strings.raw) {
        const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
        const res = await client.query(text, values);
        return res.rows;
      }
      const [query, params] = [strings, values[0]];
      const res = await client.query(query, params);
      return res.rows;
    };

    const result = await callback(txSql);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export default sql;
export { sql };