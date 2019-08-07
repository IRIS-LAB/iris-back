import path from 'path'
import { ConnectionOptions } from 'typeorm'
import config from './config'

export function getTypeOrmConfiguration(): ConnectionOptions {
  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    logging: config.database.logging,
    synchronize: true,
    entities: [
      path.resolve(__dirname, '../../commons', 'objects/business/be/**/*BE.{ts,js}'),
    ],
  }
}
