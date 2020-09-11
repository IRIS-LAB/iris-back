import { INestApplication, NestApplicationOptions, NestModule, Type } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExceptionFilter } from './filters'
import { getLogger, LoggerService, setApplicationContext } from './modules/iris-module'

export async function bootstrapIrisApp(appModule: Type<NestModule>, options?: { port?: number, hostname?: string, logger?: NestApplicationOptions['logger'] }): Promise<INestApplication> {
  return new Promise(async (resolve, reject) => {
    try {
      const port = (options && options.port) || process.env.NODE_REQUESTPORT || 3000
      const hostname = (options && options.hostname) || process.env.NODE_REQUESTHOST || 'localhost'
      const app = await NestFactory.create(appModule, {
        logger: options && options.logger !== undefined ? options.logger : (process.env.NODE_ENV === 'production' ? false : console),
      })
      setApplicationContext(app)

      app.useGlobalFilters(new ExceptionFilter())
      app.useLogger(app.get(LoggerService))
      app.listen(port, hostname, () => {
        resolve(app)
      })
    } catch (e) {
      let logger
      try {
        logger = getLogger()
      } catch (e) {
        logger = console
      }
      logger.error('Cannot start server', e)
      reject(e)
    }
  })

}