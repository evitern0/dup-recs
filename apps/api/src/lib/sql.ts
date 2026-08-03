export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function normalizeQuery(value) {
  return String(value ?? '').trim().toLowerCase();
}

export async function withTransaction(pool, callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function mapDatabaseError(error) {
  const code = error?.code;

  if (code === '23505') {
    return new AppError('resource already exists', 409, 'DB_UNIQUE_VIOLATION');
  }

  if (code === '23503') {
    return new AppError('resource relationship is invalid', 400, 'DB_FOREIGN_KEY_VIOLATION');
  }

  return new AppError('database operation failed', 503, 'DB_OPERATION_FAILED');
}
