import { INestApplication, NestModule, Type } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExceptionFilter } from './filters'
import { getLogger, LoggerProvider, setApplicationContext } from './modules/iris-module'

export async function bootstrapIrisApp(appModule: Type<NestModule>, options?: { port?: number }): Promise<INestApplication> {
  return new Promise(async (resolve, reject) => {
    try {
      const port = (options && options.port) || process.env.NODE_REQUESTPORT || 3000
      const app = await NestFactory.create(appModule, {
        logger: false,
      })
      setApplicationContext(app)

      app.useGlobalFilters(new ExceptionFilter())
      app.useLogger(app.get(LoggerProvider))
      app.listen(port, () => {
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