export default {
  webapp: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  database: {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    name: process.env.DATABASE_NAME || 'node_example',
    logging: process.env.DATABASE_LOGGING === 'true',
    user: process.env.DATABASE_USER || '',
    password: process.env.DATABASE_PASSWORD || '',
    minPool: parseInt(process.env.DATABASE_POOL_MIN || '1'),
    maxPool: parseInt(process.env.DATABASE_POOL_MAX || '5')
  }
}
