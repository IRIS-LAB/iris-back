import { Injectable, NestMiddleware } from '@nestjs/common'
import URI from 'urijs'
import { LoggerProvider } from '../providers'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

  constructor(private readonly logger: LoggerProvider) {
  }

  public use(req: any, res: any, next: () => void): any {
    this.logger.info(`verb=${req.method},uri=${new URI(req.url).pathname()},queryParams=${JSON.stringify(req.query)},ip=${req.ip}`)
    next()
    this.logger.info(`statusCode=${res.statusCode}`)
  }
}
